import React, { useCallback, useEffect, useState } from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import {
  fetchSellerNotifications,
  markSellerNotificationRead,
  markAllSellerNotificationsRead,
  SellerNotification,
} from '../../../services/notificationService';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Orders', value: 'order' },
  { label: 'Withdrawals', value: 'withdrawal' },
  { label: 'Payouts', value: 'payout' },
  // { label: 'Returns', value: 'return' },
  // { label: 'Reviews', value: 'review' },
  // { label: 'System', value: 'system' },
];

const PAGE_SIZE = 15;

const SellerNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<string>('all');
  const [items, setItems] = useState<SellerNotification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadNotifications = useCallback(
    async (reset = false) => {
      const nextPage = reset ? 1 : page;
      try {
        if (reset) setLoading(true);
        else setLoadingMore(true);

        const data = await fetchSellerNotifications({
          page: nextPage,
          pageSize: PAGE_SIZE,
          type,
        });

        setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
        setPage(data.page);
        setTotalPages(data.totalPages);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Failed to load notifications', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [page, type]
  );

  useEffect(() => {
    loadNotifications(true);
  }, [type, loadNotifications]);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      setPage((prev) => prev + 1);
      loadNotifications(false);
    }
  };

  const handleMarkOne = async (notification: SellerNotification) => {
    if (notification.readAt) {
      handleNavigate(notification);
      return;
    }
    try {
      const res = await markSellerNotificationRead(notification.notificationCode);
      setUnreadCount(res.unreadCount);
      setItems((prev) =>
        prev.map((item) => (item.notificationCode === notification.notificationCode ? res.notification : item))
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    } finally {
      handleNavigate(notification);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllSellerNotificationsRead();
      setUnreadCount(0);
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          readAt: item.readAt || new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  const handleNavigate = (notification: SellerNotification) => {
    if (!notification.actionUrl) return;
    if (notification.actionUrl.startsWith('http')) {
      window.open(notification.actionUrl, '_blank', 'noopener');
    } else {
      navigate(notification.actionUrl);
    }
  };

  const formattedDate = (value: string) =>
    new Date(value).toLocaleString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      <div className="w-full flex justify-center px-4 md:px-0">
        <div className="w-full max-w-4xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-[#111827]">Notifications</h1>
              <p className="text-sm text-[#6b7280]">
                {unreadCount > 0 ? `${unreadCount} unread alerts` : 'You are up to date.'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="px-4 py-2 rounded-full bg-[#2ECC71] text-white text-sm font-semibold shadow hover:bg-[#27AE60]"
                onClick={handleMarkAll}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const isActive = type === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setType(tab.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    isActive ? 'bg-[#2ECC71] text-white' : 'bg-white border border-[#e5e7eb] text-[#374151]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {loading && items.length === 0 && (
              <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 text-center text-[#6b7280]">
                Loading notifications…
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 text-center text-[#6b7280]">
                You currently have no notifications in this category.
              </div>
            )}

            {items.map((notification) => (
              <div
                key={notification.notificationCode}
                className={`border rounded-2xl p-4 md:p-5 shadow-sm flex flex-col gap-2 ${
                  notification.readAt ? 'bg-white border-[#e5e7eb]' : 'bg-[#f0fff7] border-[#bbf7d0]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">
                      {notification.type}
                    </span>
                    <Badge priority={notification.priority || 'info'} />
                  </div>
                  <span className="text-xs text-[#94a3b8]">{formattedDate(notification.createdAt)}</span>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-[#0f172a]">{notification.title}</h3>
                <p className="text-sm text-[#475569]">{notification.message}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {!notification.readAt && (
                    <button
                      type="button"
                      className="text-sm font-semibold text-[#2ECC71] hover:underline"
                      onClick={() => handleMarkOne(notification)}
                    >
                      Mark as read
                    </button>
                  )}
                  {notification.actionUrl && (
                    <button
                      type="button"
                      className="text-sm font-semibold text-[#0ea5e9] hover:underline"
                      onClick={() => handleNavigate(notification)}
                    >
                      View details →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {page < totalPages && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-5 py-2 rounded-full border border-[#d1d5db] text-sm font-semibold text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-60"
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      </div>
    </SellerScaffold>
  );
};

const Badge: React.FC<{ priority: 'info' | 'success' | 'warning' | 'critical' }> = ({ priority }) => {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    info: { bg: 'bg-[#e0f2fe]', text: 'text-[#0369a1]', label: 'Info' },
    success: { bg: 'bg-[#dcfce7]', text: 'text-[#15803d]', label: 'Success' },
    warning: { bg: 'bg-[#fef9c3]', text: 'text-[#a16207]', label: 'Attention' },
    critical: { bg: 'bg-[#fee2e2]', text: 'text-[#b91c1c]', label: 'Important' },
  };
  const preset = styles[priority] || styles.info;
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${preset.bg} ${preset.text}`}>
      {preset.label}
    </span>
  );
};

export default SellerNotificationsPage;



