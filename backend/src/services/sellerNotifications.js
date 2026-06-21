import { SellerNotification } from '../models/SellerNotification.js';

const clampLimit = (value, fallback = 10, max = 50) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(max, Math.max(1, Math.floor(parsed)));
};

const NOTIFICATION_RETENTION_DAYS = Number(process.env.SELLER_NOTIFICATION_RETENTION_DAYS || 7);
const NOTIFICATION_RETENTION_MS = NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export async function createSellerNotification({
  sellerId,
  type = 'system',
  title,
  message,
  actionUrl,
  meta = {},
  priority = 'info',
}) {
  if (!sellerId || !title || !message) return null;

  try {
    const doc = await SellerNotification.create({
      sellerId,
      type,
      title,
      message,
      actionUrl,
      meta,
      priority,
    });
    pruneExpiredNotifications().catch((err) => {
      console.error('Failed to prune seller notifications', err);
    });
    return doc.toJSON();
  } catch (error) {
    console.error('Failed to create seller notification', error);
    return null;
  }
}

export async function fetchSellerNotifications({ sellerId, limit = 10 }) {
  if (!sellerId) return { items: [], unreadCount: 0 };
  const safeLimit = clampLimit(limit);

  const [items, unreadCount] = await Promise.all([
    SellerNotification.find({ sellerId })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean(),
    SellerNotification.countDocuments({ sellerId, readAt: null }),
  ]);

  return {
    items: items.map(mapNotification),
    unreadCount,
  };
}

export async function markNotificationAsRead({ sellerId, notificationId }) {
  if (!sellerId || !notificationId) return null;

  const notification = await SellerNotification.findOneAndUpdate(
    { _id: notificationId, sellerId },
    { $set: { readAt: new Date() } },
    { new: true }
  ).lean();

  return notification ? mapNotification(notification) : null;
}

export async function markAllNotificationsAsRead({ sellerId }) {
  if (!sellerId) return 0;
  const result = await SellerNotification.updateMany(
    { sellerId, readAt: null },
    { $set: { readAt: new Date() } }
  );
  return result.modifiedCount || 0;
}

function mapNotification(doc = {}) {
  return {
    id: doc._id?.toString() || doc.id,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    actionUrl: doc.actionUrl,
    meta: doc.meta,
    priority: doc.priority,
    readAt: doc.readAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function pruneExpiredNotifications() {
  if (!Number.isFinite(NOTIFICATION_RETENTION_MS) || NOTIFICATION_RETENTION_MS <= 0) {
    return;
  }
  const cutoff = new Date(Date.now() - NOTIFICATION_RETENTION_MS);
  await SellerNotification.deleteMany({ createdAt: { $lt: cutoff } });
}





