import React from 'react';
import { useNavigate } from 'react-router-dom';
import SellerNotificationBadge from './SellerNotificationBadge';

type RightMiniBarProps = {
  topIconSrc?: string;
  bottomIconSrc?: string;
};

const RightMiniBar: React.FC<RightMiniBarProps> = ({ topIconSrc, bottomIconSrc }) => {
  const navigate = useNavigate();

  const handleTopClick = () => {
    navigate('/seller/notifications');
  };

  return (
    <div
      className="flex flex-col items-center h-full sticky top-0"
      style={{ width: 122, height: '100vh' }}
    >
      <div className="w-full h-full bg-white flex flex-col items-center justify-start pt-10 gap-6">
        {topIconSrc && (
          <button
            type="button"
            onClick={handleTopClick}
            className="relative inline-flex items-center justify-center"
          >
            <img src={topIconSrc} alt="notifications" style={{ width: 50, height: 50 }} />
            {/* Small unread badge, only visible when there are new notifications */}
            <SellerNotificationBadge className="absolute -top-1 -right-1" />
          </button>
        )}
        {bottomIconSrc && <img src={bottomIconSrc} alt="icon" style={{ width: 50, height: 50 }} />}
      </div>
    </div>
  );
};

export default RightMiniBar;