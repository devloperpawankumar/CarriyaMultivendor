import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchSellerNotifications,
  markAllSellerNotificationsRead,
  markSellerNotificationRead,
  SellerNotification,
} from '../../services/notificationService';

type SellerNotificationBellProps = {
  variant?: 'desktop' | 'mobile';
  className?: string;
  // appearance 'green' is used for the floating green bell (right mini bar)
  appearance?: 'default' | 'green';
};

const POLL_INTERVAL_MS = 60 * 1000;
const BELL_PAGE_SIZE = 12;

const SellerNotificationBell: React.FC<SellerNotificationBellProps> = ({
  variant = 'desktop',
  className = '',
  appearance = 'default',
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SellerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchData();
    const interval = window.setInterval(fetchData, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchSellerNotifications({ page: 1, pageSize: BELL_PAGE_SIZE });
      setItems(data.items);
      setUnreadCount(data.unreadCount);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to fetch seller notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleMarkOne = async (notification: SellerNotification) => {
    if (!notification || notification.readAt) {
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

  const handleNavigate = (notification: SellerNotification) => {
    if (notification.actionUrl) {
      if (notification.actionUrl.startsWith('http')) {
        window.open(notification.actionUrl, '_blank', 'noopener');
      } else {
        navigate(notification.actionUrl);
      }
      setOpen(false);
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

  const sizeClasses =
    variant === 'mobile' ? 'w-9 h-9 text-sm' : 'w-11 h-11 text-base';

  const appearanceClasses =
    appearance === 'green'
      ? 'bg-[#2ECC71] text-white shadow-lg hover:bg-[#27AE60]'
      : 'bg-white border border-[#d1d5db] text-[#1f2937] shadow-sm hover:shadow';

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label="Notifications"
        className={`relative inline-flex items-center justify-center rounded-full transition ${sizeClasses} ${appearanceClasses}`}
        onClick={handleToggle}
      >
        <BellIcon appearance={appearance} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#2ECC71] text-white text-[10px] font-semibold rounded-full px-1.5 py-[1px]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Dim the background so underlying content doesn't visually mix with the panel */}
          <div
            className="fixed inset-0 bg-black/10 z-[9998]"
            onClick={() => setOpen(false)}
          />

          {/* Floating notification panel above all content */}
          <div className="fixed right-6 top-20 w-[320px] bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] z-[9999]">
            <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#111827]">Notifications</p>
                <p className="text-xs text-[#6b7280]">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="text-xs font-semibold text-[#2ECC71] hover:underline"
                  onClick={handleMarkAll}
                >
                  Mark all
                </button>
              )}
            </div>

            <div className="max-h-[340px] overflow-y-auto divide-y divide-[#f3f4f6]">
              {loading && items.length === 0 && (
                <div className="px-4 py-6 text-sm text-[#6b7280]">Loading...</div>
              )}
              {!loading && items.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-[#6b7280]">
                  No notifications yet.
                </div>
              )}
              {items.map((notification) => (
                <button
                  key={notification.notificationCode}
                  type="button"
                  onClick={() => handleMarkOne(notification)}
                  className={`w-full text-left px-4 py-3 focus:outline-none transition ${
                    notification.readAt ? 'bg-white' : 'bg-[#f0fff7]'
                  } hover:bg-[#f9fafb]`}
                >
                  <p className="text-sm font-semibold text-[#0f172a]">
                    {notification.title}
                  </p>
                  <p className="text-xs text-[#475569] mt-1 line-clamp-3">
                    {notification.message}
                  </p>
                  <p className="text-[11px] text-[#94a3b8] mt-2">
                    {new Date(notification.createdAt).toLocaleString('en-PK', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </button>
              ))}
            </div>
            <div className="border-t border-[#f3f4f6] px-4 py-2 text-center">
              <Link
                to="/seller/notifications"
                className="text-sm font-semibold text-[#2ECC71] hover:underline"
                onClick={() => setOpen(false)}
              >
                View all notifications {hasMore ? '→' : ''}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

type BellIconProps = {
  appearance?: 'default' | 'green';
};

const BellIcon: React.FC<BellIconProps> = ({ appearance = 'default' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={`w-5 h-5 ${
      appearance === 'green' ? 'text-white' : 'text-[#1f2937]'
    }`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 1 0-12 0v.75a8.967 8.967 0 0 1-2.311 6.022c1.733.64 3.561 1.085 5.454 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
    />
  </svg>
);

export default SellerNotificationBell;



