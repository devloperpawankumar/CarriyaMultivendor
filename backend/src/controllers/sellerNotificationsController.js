import mongoose from 'mongoose';
import { SellerNotification } from '../models/SellerNotification.js';
import { httpError } from '../middleware/errors.js';

const clampLimit = (value, fallback = 10, max = 50) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(max, Math.max(1, Math.floor(parsed)));
};

const clampPage = (value, fallback = 1) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.max(1, Math.floor(parsed));
};

function mapNotification(doc = {}) {
  // Generate notificationCode on-the-fly if missing (for backward compatibility)
  let notificationCode = doc.notificationCode;
  if (!notificationCode && doc._id) {
    // Generate a code from _id for existing notifications without code
    const timestamp = doc.createdAt ? new Date(doc.createdAt).getTime().toString(36).toUpperCase() : Date.now().toString(36).toUpperCase();
    const idHash = doc._id.toString().slice(-8).toUpperCase();
    notificationCode = `NOTIF-${timestamp}-${idHash}`;
  }
  
  return {
    // Note: Raw database ID removed - use notificationCode as public identifier (Daraz/Amazon style)
    notificationCode: notificationCode || undefined,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    actionUrl: doc.actionUrl || undefined,
    meta: doc.meta || {},
    priority: doc.priority || 'info',
    readAt: doc.readAt || undefined,
    createdAt: doc.createdAt,
  };
}

export async function getSellerNotifications(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const page = clampPage(req.query.page, 1);
    const pageSize = clampLimit(req.query.pageSize, 15, 50);
    const type = req.query.type && req.query.type !== 'all' ? req.query.type : null;

    const query = { sellerId };
    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * pageSize;

    const [items, total, unreadCount] = await Promise.all([
      SellerNotification.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      SellerNotification.countDocuments(query),
      SellerNotification.countDocuments({ sellerId, readAt: null }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    res.json({
      items: items.map(mapNotification),
      unreadCount,
      page,
      pageSize,
      total,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error) {
    next(error);
  }
}

export async function markSellerNotificationRead(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const { notificationId } = req.body || {}; // Can be notificationCode or ObjectId
    if (!notificationId) {
      return next(httpError(400, 'notificationId is required'));
    }

    // Find by notificationCode or ObjectId (support both for backward compatibility)
    let query;
    if (mongoose.Types.ObjectId.isValid(notificationId) && notificationId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: notificationId, sellerId };
    } else {
      query = { notificationCode: notificationId, sellerId };
    }

    const doc = await SellerNotification.findOneAndUpdate(
      query,
      { $set: { readAt: new Date() } },
      { new: true }
    ).lean();

    if (!doc) {
      return next(httpError(404, 'Notification not found'));
    }

    const unreadCount = await SellerNotification.countDocuments({ sellerId, readAt: null });

    res.json({
      notification: mapNotification(doc),
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllSellerNotificationsRead(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const result = await SellerNotification.updateMany(
      { sellerId, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.json({
      updated: result.modifiedCount || 0,
      unreadCount: 0,
    });
  } catch (error) {
    next(error);
  }
}




