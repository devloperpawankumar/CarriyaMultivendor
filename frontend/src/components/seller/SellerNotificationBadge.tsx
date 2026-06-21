import React, { useEffect, useState } from 'react';
import { fetchSellerNotifications } from '../../services/notificationService';

type SellerNotificationBadgeProps = {
  className?: string;
};

const POLL_INTERVAL_MS = 60 * 1000;

const SellerNotificationBadge: React.FC<SellerNotificationBadgeProps> = ({ className = '' }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await fetchSellerNotifications({ page: 1, pageSize: 1 });
        if (isMounted) {
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        // Fail silently; badge is non-critical
        console.error('Failed to load seller notification badge', error);
      }
    };

    load();
    const interval = window.setInterval(load, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  if (!unreadCount || unreadCount <= 0) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-[#FF3B30] text-white text-[10px] font-semibold px-1.5 py-[1px] ${className}`}
    >
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
};

export default SellerNotificationBadge;


