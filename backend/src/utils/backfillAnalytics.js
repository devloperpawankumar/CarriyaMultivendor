import { Order } from '../models/Order.js';
import { SellerDailyStats } from '../models/SellerDailyStats.js';
import { SellerProductStats } from '../models/SellerProductStats.js';
import mongoose from 'mongoose';

/**
 * Backfill analytics for a seller from existing orders
 * This is useful when migrating to the new analytics system
 */
export async function backfillSellerAnalytics(sellerId) {
  try {
    console.log(`Starting analytics backfill for seller: ${sellerId}`);

    // Get all delivered orders for this seller
    const deliveredOrders = await Order.find({
      sellerId,
      status: 'delivered',
    }).lean();

    console.log(`Found ${deliveredOrders.length} delivered orders`);

    // Group orders by date
    const dailyStatsMap = new Map();
    const productStatsMap = new Map();

    for (const order of deliveredOrders) {
      const orderDate = order.deliveredAt || order.createdAt;
      const statsDate = new Date(orderDate);
      statsDate.setHours(0, 0, 0, 0);

      // Update daily stats
      const dateKey = statsDate.toISOString().split('T')[0];
      if (!dailyStatsMap.has(dateKey)) {
        dailyStatsMap.set(dateKey, {
          sellerId,
          date: statsDate,
          totalSales: 0,
          orderCount: 0,
          refundCount: 0,
          refundAmount: 0,
          newCustomers: 0,
          customerIds: new Set(),
        });
      }

      const dailyStat = dailyStatsMap.get(dateKey);
      dailyStat.totalSales += order.total || 0;
      dailyStat.orderCount += 1;
      dailyStat.customerIds.add(order.buyerId.toString());

      // Update product stats
      for (const item of order.items || []) {
        if (item.productId) {
          const productId = item.productId.toString();
          if (!productStatsMap.has(productId)) {
            productStatsMap.set(productId, {
              sellerId,
              productId: new mongoose.Types.ObjectId(productId),
              totalSales: 0,
              quantitySold: 0,
              refundCount: 0,
              orderCount: 0,
            });
          }

          const productStat = productStatsMap.get(productId);
          productStat.totalSales += (item.price || 0) * (item.quantity || 0);
          productStat.quantitySold += item.quantity || 0;
          productStat.orderCount += 1;
        }
      }
    }

    // Calculate new customers per day
    for (const [dateKey, dailyStat] of dailyStatsMap.entries()) {
      const statsDate = dailyStat.date;
      
      for (const buyerId of dailyStat.customerIds) {
        // Check if this buyer ordered before this date
        const previousOrders = await Order.countDocuments({
          sellerId,
          buyerId: new mongoose.Types.ObjectId(buyerId),
          deliveredAt: { $lt: statsDate },
        });

        if (previousOrders === 0) {
          dailyStat.newCustomers += 1;
        }
      }

      // Convert Set to Array for MongoDB
      dailyStat.customerIds = Array.from(dailyStat.customerIds).map(
        id => new mongoose.Types.ObjectId(id)
      );
    }

    // Get refunded orders
    const refundedOrders = await Order.find({
      sellerId,
      status: { $in: ['cancelled', 'refunded'] },
    }).lean();

    console.log(`Found ${refundedOrders.length} refunded orders`);

    // Update daily stats with refunds
    for (const order of refundedOrders) {
      const orderDate = order.deliveredAt || order.createdAt || order.createdAt;
      const statsDate = new Date(orderDate);
      statsDate.setHours(0, 0, 0, 0);
      const dateKey = statsDate.toISOString().split('T')[0];

      if (dailyStatsMap.has(dateKey)) {
        const dailyStat = dailyStatsMap.get(dateKey);
        dailyStat.refundCount += 1;
        dailyStat.refundAmount += order.total || 0;
        dailyStat.totalSales = Math.max(0, dailyStat.totalSales - (order.total || 0));
        dailyStat.orderCount = Math.max(0, dailyStat.orderCount - 1);
      }

      // Update product stats with refunds
      for (const item of order.items || []) {
        if (item.productId) {
          const productId = item.productId.toString();
          if (productStatsMap.has(productId)) {
            const productStat = productStatsMap.get(productId);
            productStat.refundCount += 1;
            productStat.totalSales = Math.max(0, productStat.totalSales - ((item.price || 0) * (item.quantity || 0)));
            productStat.quantitySold = Math.max(0, productStat.quantitySold - (item.quantity || 0));
            productStat.orderCount = Math.max(0, productStat.orderCount - 1);
          }
        }
      }
    }

    // Bulk insert/update daily stats
    const dailyStatsArray = Array.from(dailyStatsMap.values());
    let dailyStatsInserted = 0;
    for (const stat of dailyStatsArray) {
      await SellerDailyStats.findOneAndUpdate(
        { sellerId: stat.sellerId, date: stat.date },
        stat,
        { upsert: true }
      );
      dailyStatsInserted += 1;
    }

    // Bulk insert/update product stats
    const productStatsArray = Array.from(productStatsMap.values());
    let productStatsInserted = 0;
    for (const stat of productStatsArray) {
      await SellerProductStats.findOneAndUpdate(
        { sellerId: stat.sellerId, productId: stat.productId },
        stat,
        { upsert: true }
      );
      productStatsInserted += 1;
    }

    console.log(`Backfill complete: ${dailyStatsInserted} daily stats, ${productStatsInserted} product stats`);
    
    return {
      success: true,
      dailyStats: dailyStatsInserted,
      productStats: productStatsInserted,
    };
  } catch (error) {
    console.error('Error backfilling analytics:', error);
    throw error;
  }
}

/**
 * Backfill analytics for all sellers
 */
export async function backfillAllSellersAnalytics() {
  try {
    const { Order } = await import('../models/Order.js');
    
    // Get all unique seller IDs from orders
    const sellers = await Order.distinct('sellerId');
    
    console.log(`Found ${sellers.length} sellers to backfill`);
    
    const results = [];
    for (const sellerId of sellers) {
      try {
        const result = await backfillSellerAnalytics(sellerId);
        results.push({ sellerId, ...result });
      } catch (error) {
        console.error(`Error backfilling seller ${sellerId}:`, error);
        results.push({ sellerId, success: false, error: error.message });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error backfilling all sellers:', error);
    throw error;
  }
}

