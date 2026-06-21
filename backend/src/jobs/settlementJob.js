/**
 * Settlement Processing Job
 * 
 * Daily cron job that:
 * 1. Processes pending settlements (moves pending → available)
 * 2. Sends notifications to sellers when money becomes available
 * 3. Logs settlement activity
 */

import { randomUUID } from 'crypto';
import { processSettlements } from '../utils/settlement.js';
import { sendSettlementAvailableNotification } from '../services/settlementNotifications.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';
import { acquireJobLock, releaseJobLock } from '../services/jobLock.js';
import { SettlementBatch } from '../models/SettlementBatch.js';
import { SellerSettlementStatement } from '../models/SellerSettlementStatement.js';

/**
 * Process settlements and send notifications
 * This is called by the cron job
 */
export async function runSettlementJob() {
  const lockName = 'settlement_cron';
  const lockTtlMs = Number(process.env.SETTLEMENT_JOB_LOCK_TTL_MS || 5 * 60 * 1000);
  let lockAcquired = false;
  let batchDoc = null;
  const batchIdentifier = randomUUID();

  try {
    console.log('[Settlement Job] Starting settlement processing...');
    const startTime = Date.now();

    lockAcquired = await acquireJobLock(lockName, {
      ttlMs: lockTtlMs,
      metadata: { batchId: batchIdentifier, startedAt: new Date() },
    });

    if (!lockAcquired) {
      console.warn('[Settlement Job] Skipping run because another instance is still processing');
      return {
        success: false,
        reason: 'locked',
      };
    }

    batchDoc = await SettlementBatch.create({
      batchId: batchIdentifier,
      status: 'processing',
      startedAt: new Date(),
      metadata: {
        schedule: process.env.SETTLEMENT_CRON_SCHEDULE || '0 2 * * *',
      },
    });

    // Process settlements (moves pending → available)
    const result = await processSettlements();
    const settledOrders = result.settledOrders || [];

    if (result.settledCount === 0 || settledOrders.length === 0) {
      console.log('[Settlement Job] No settlements to process');
      if (batchDoc?._id) {
        await SettlementBatch.findByIdAndUpdate(batchDoc._id, {
          $set: {
            status: 'noop',
            settledOrderCount: 0,
            sellerCount: 0,
            totalSettledAmount: 0,
            completedAt: new Date(),
          },
        });
      }
      return {
        success: true,
        settledCount: 0,
        totalSettled: 0,
        notificationsSent: 0,
      };
    }

    console.log(`[Settlement Job] Processed ${result.settledCount} orders, Total: PKR ${result.totalSettled.toLocaleString()}`);

    // Group the settled orders by seller
    const sellerSettlements = new Map();
    for (const order of settledOrders) {
      if (!order?.sellerId) continue;

      if (!sellerSettlements.has(order.sellerId)) {
        sellerSettlements.set(order.sellerId, {
          orders: [],
          totalAmount: 0,
        });
      }

      const settlement = sellerSettlements.get(order.sellerId);
      settlement.orders.push({
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        amount: order.sellerPayout || 0,
        deliveredAt: order.deliveredAt,
      });
      settlement.totalAmount += order.sellerPayout || 0;
    }

    if (sellerSettlements.size === 0) {
      console.log('[Settlement Job] No seller notifications queued');
      if (batchDoc?._id) {
        await SettlementBatch.findByIdAndUpdate(batchDoc._id, {
          $set: {
            status: 'noop',
            settledOrderCount: result.settledCount,
            sellerCount: 0,
            totalSettledAmount: result.totalSettled,
            completedAt: new Date(),
          },
        });
      }
      return {
        success: true,
        settledCount: result.settledCount,
        totalSettled: result.totalSettled,
        notificationsSent: 0,
      };
    }

    // Fetch seller contact details for the affected sellers
    const sellerObjectIds = [...sellerSettlements.keys()]
      .map((id) => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch {
          console.warn(`[Settlement Job] Invalid sellerId ${id}, skipping notification`);
          sellerSettlements.delete(id);
          return null;
        }
      })
      .filter(Boolean);

    const sellerDocs = await User.find({ _id: { $in: sellerObjectIds } })
      .select('email phone firstName lastName')
      .lean();
    const sellerMap = new Map(sellerDocs.map((doc) => [doc._id.toString(), doc]));

    // Pre-create seller statements for auditability
    const sellerStatements = new Map();
    for (const [sellerId, settlementData] of sellerSettlements) {
      const statementDoc = await SellerSettlementStatement.create({
        batchId: batchDoc?._id,
        batchIdentifier: batchIdentifier,
        sellerId: new mongoose.Types.ObjectId(sellerId),
        orderCount: settlementData.orders.length,
        totalAmount: Math.round(settlementData.totalAmount),
        orders: settlementData.orders,
        notificationStatus: 'pending',
      });
      sellerStatements.set(sellerId, statementDoc);
    }

    // Send notifications to each seller
    let notificationsSent = 0;
    for (const [sellerId, settlementData] of sellerSettlements) {
      try {
        const sellerDoc = sellerMap.get(sellerId);
        if (!sellerDoc) {
          console.warn(`[Settlement Job] Missing seller document for ${sellerId}, skipping notification`);
          continue;
        }

        await sendSettlementAvailableNotification(sellerDoc, {
          totalAmount: Math.round(settlementData.totalAmount),
          orderCount: settlementData.orders.length,
          orders: settlementData.orders,
        });
        const statementDoc = sellerStatements.get(sellerId);
        if (statementDoc) {
          await SellerSettlementStatement.findByIdAndUpdate(statementDoc._id, {
            $set: {
              notificationStatus: 'sent',
              notifiedAt: new Date(),
              notificationError: null,
            },
          });
        }
        notificationsSent++;
        console.log(
          `[Settlement Job] Notification sent to seller ${sellerId} (PKR ${settlementData.totalAmount.toLocaleString()})`
        );
      } catch (error) {
        const statementDoc = sellerStatements.get(sellerId);
        if (statementDoc) {
          await SellerSettlementStatement.findByIdAndUpdate(statementDoc._id, {
            $set: {
              notificationStatus: 'failed',
              notificationError: error.message,
            },
          });
        }
        console.error(`[Settlement Job] Failed to send notification to seller ${sellerId}:`, error.message);
      }
    }

    if (batchDoc?._id) {
      await SettlementBatch.findByIdAndUpdate(batchDoc._id, {
        $set: {
          status: 'completed',
          settledOrderCount: result.settledCount,
          sellerCount: sellerSettlements.size,
          totalSettledAmount: result.totalSettled,
          completedAt: new Date(),
        },
      });
    }

    const duration = Date.now() - startTime;
    console.log(`[Settlement Job] Completed in ${duration}ms`);
    console.log(`[Settlement Job] Summary: ${result.settledCount} orders settled, ${notificationsSent} notifications sent`);

    return {
      success: true,
      settledCount: result.settledCount,
      totalSettled: result.totalSettled,
      notificationsSent,
      duration,
    };
  } catch (error) {
    if (batchDoc?._id) {
      await SettlementBatch.findByIdAndUpdate(batchDoc._id, {
        $set: {
          status: 'failed',
          error: error.message,
          completedAt: new Date(),
        },
      });
    }
    console.error('[Settlement Job] Error:', error);
    throw error;
  } finally {
    if (lockAcquired) {
      await releaseJobLock(lockName);
    }
  }
}

/**
 * Initialize and start the cron job
 * Call this from index.js after MongoDB connection
 */
export function startSettlementCronJob() {
  // Dynamic import to avoid loading in environments where cron might not be needed
  import('node-cron')
    .then((cron) => {
      const schedule = process.env.SETTLEMENT_CRON_SCHEDULE || '*/2 * * * *';
      const timezone = process.env.SETTLEMENT_CRON_TZ;

      cron.default.schedule(
        schedule,
        async () => {
          console.log('[Settlement Job] Cron triggered at', new Date().toISOString());
          try {
            await runSettlementJob();
          } catch (error) {
            console.error('[Settlement Job] Cron job failed:', error);
          }
        },
        timezone ? { timezone } : undefined
      );

      console.log(
        `[Settlement Job] Cron job scheduled: "${schedule}"${timezone ? ` (timezone: ${timezone})` : ''}`
      );
    })
    .catch((error) => {
      console.warn('[Settlement Job] node-cron not installed. Install with: npm install node-cron');
      console.warn('[Settlement Job] Settlements can still be processed manually via runSettlementJob()');
    });
}

