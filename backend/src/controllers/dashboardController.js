import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { SellerDailyStats } from '../models/SellerDailyStats.js';
import { calculateSellerBalance, calculateSettlement } from '../utils/settlement.js';
import { httpError } from '../middleware/errors.js';

const DASHBOARD_CACHE_TTL_MS = 30 * 1000; // 30 seconds
const dashboardCache = new Map();

export async function getSellerDashboardOverview(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const cacheEntry = dashboardCache.get(sellerId);
    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return res.json(cacheEntry.payload);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    const [
      todayStats,
      pendingCount,
      confirmedCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      refundedCount,
      totalOrders,
      todaysDeliveredOrders,
      balance,
    ] = await Promise.all([
      SellerDailyStats.findOne({ sellerId: sellerObjectId, date: today }).lean(),
      Order.countDocuments({ sellerId, status: 'pending' }),
      Order.countDocuments({ sellerId, status: 'confirmed' }),
      Order.countDocuments({ sellerId, status: 'processing' }),
      Order.countDocuments({ sellerId, status: 'shipped' }),
      Order.countDocuments({ sellerId, status: 'delivered' }),
      Order.countDocuments({ sellerId, status: 'cancelled' }),
      Order.countDocuments({ sellerId, status: 'refunded' }),
      Order.countDocuments({ sellerId }),
      Order.find({
        sellerId: sellerObjectId,
        status: 'delivered',
        paymentStatus: 'paid',
        deliveredAt: { $gte: today, $lt: tomorrow },
      })
        .select('subtotal total paymentMethod settlement deliveredAt status paymentStatus')
        .lean(),
      calculateSellerBalance(sellerId),
    ]);

    const stats = {
      newOrders: (pendingCount || 0) + (confirmedCount || 0),
      processing: (processingCount || 0) + (shippedCount || 0),
      completed: deliveredCount || 0,
      canceled: (cancelledCount || 0) + (refundedCount || 0),
    };

    const todaysOrdersArray = Array.isArray(todaysDeliveredOrders) ? todaysDeliveredOrders : [];

    const netMeta = todaysOrdersArray.reduce(
      (acc, orderDoc) => {
        const settlement =
          orderDoc?.settlement && typeof orderDoc.settlement?.sellerPayout === 'number'
            ? orderDoc.settlement
            : calculateSettlement(orderDoc);

        const sellerPayout = Number(settlement?.sellerPayout) || 0;
        const commissionAmount = [
          settlement?.commissionAmount,
          settlement?.paymentGatewayFee,
          settlement?.codFee,
        ]
          .map((value) => Number(value) || 0)
          .reduce((sum, value) => sum + value, 0);

        acc.net += sellerPayout;
        acc.commission += commissionAmount;
        return acc;
      },
      { net: 0, commission: 0 }
    );

    const payload = {
      metrics: {
        todaySales: Number(todayStats?.totalSales || 0),
        todayNetSales: Math.round(netMeta.net),
        todayCommission: Math.round(netMeta.commission),
        totalOrders: totalOrders || 0,
        pendingOrders: stats.newOrders,
        walletBalance: Number(balance?.currentWalletBalance || 0),
      },
      breakdown: {
        orders: stats,
      },
      lastUpdated: new Date().toISOString(),
    };

    dashboardCache.set(sellerId, {
      payload,
      expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS,
    });

    res.json(payload);
  } catch (e) {
    next(e);
  }
}



