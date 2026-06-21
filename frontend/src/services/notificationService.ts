import api from './api';

export type SellerNotification = {
  // Note: Raw database ID removed - use notificationCode as public identifier (Daraz/Amazon style)
  notificationCode: string;
  type: 'order' | 'withdrawal' | 'payout' | 'return' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  meta?: Record<string, unknown>;
  priority?: 'info' | 'success' | 'warning' | 'critical';
  readAt?: string | null;
  createdAt: string;
};

export type SellerNotificationResponse = {
  items: SellerNotification[];
  unreadCount: number;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

type FetchNotificationOptions = {
  page?: number;
  pageSize?: number;
  type?: string;
};

export async function fetchSellerNotifications(options: FetchNotificationOptions = {}) {
  const params = new URLSearchParams();
  if (options.page) {
    params.set('page', String(options.page));
  }
  if (options.pageSize) {
    params.set('pageSize', String(options.pageSize));
  }
  if (options.type && options.type !== 'all') {
    params.set('type', options.type);
  }
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return api.get<SellerNotificationResponse>(`/api/seller/notifications${suffix}`);
}

export async function markSellerNotificationRead(notificationId: string) {
  return api.post<{ notification: SellerNotification; unreadCount: number }>(
    '/api/seller/notifications/mark-read',
    { notificationId }
  );
}

export async function markAllSellerNotificationsRead() {
  return api.post<{ updated: number; unreadCount: number }>(
    '/api/seller/notifications/mark-all-read'
  );
}



