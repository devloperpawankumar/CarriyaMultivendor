import React, { useEffect, useMemo, useState } from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import pickupIcon from '../../../assets/images/Seller/pickupTrackOrder.png';
import shippingIcon from '../../../assets/images/Seller/ShippingTrackOrder.png';
import deliveredIcon from '../../../assets/images/Seller/DeliverdTrackOrder.png';
import TruckIcon from '../../../assets/images/Seller/ProcessingSeller.png';
import { fetchLeopardsTracking, TrackingEvent, TrackingTimeline } from '../../../services/leopardsTracking';

interface TrackOrderPageProps {
  orderId?: string;
  trackingNumber?: string;
  onBack?: () => void;
}

const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  orderId = "B12345K",
  trackingNumber,
  onBack,
}) => {
  const [timeline, setTimeline] = useState<TrackingTimeline | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackingRef = trackingNumber || orderId;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchLeopardsTracking(trackingRef)
      .then((data) => {
        if (!isMounted) return;
        setTimeline(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Leopards tracking error', err);
        setError('Unable to fetch live tracking. Showing the latest available updates.');
        setTimeline(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [trackingRef]);

  const events: TrackingEvent[] = useMemo(() => {
    if (timeline && timeline.events.length > 0) {
      return timeline.events;
    }
    return [];
  }, [timeline]);

  const currentIndex = events.findIndex((event) => event.isCurrent);
  const progressPercent =
    events.length > 1 && currentIndex >= 0 ? Math.min(100, (currentIndex / (events.length - 1)) * 100) : 25;

  const statusIcons = [pickupIcon, shippingIcon, deliveredIcon];

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      <div className="w-full px-2 sm:px-4 lg:px-8">
        {/* Header Section - Mobile Responsive */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col gap-2 sm:gap-4">
            {/* Title, Date, and Breadcrumb */}
            <div className="flex-1">
              <h1 className="text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-black mb-2 sm:mb-3 lg:mb-4">Track Order</h1>
              <div className="bg-green-50 rounded-[15px] sm:rounded-[20px] lg:rounded-[25px] inline-block px-3 sm:px-4 py-1.5 sm:py-2 mb-1 sm:mb-2">
                <p className="text-[16px] sm:text-[20px] lg:text-[25px] font-medium text-black">Today, 01-09-2025</p>
              </div>
              <p className="text-[14px] sm:text-[16px] lg:text-[20px] font-medium text-gray-500">Manage Orders &gt; See Order &gt; Track order</p>
            </div>
          </div>
        </div>

        {/* Track Order Content - Mobile Responsive */}
        <div className="flex justify-center">
          {/* Delivery Status Card - Mobile Optimized */}
          <div className="bg-white rounded-[15px] sm:rounded-[20px] lg:rounded-[25px] px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-12 shadow-sm w-full max-w-[808px] min-h-[400px] sm:min-h-[500px] lg:min-h-[551px]">
            {/* Header Section - Mobile Responsive */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <h2 className="text-[20px] sm:text-[28px] lg:text-[34px] font-semibold text-black mb-1 sm:mb-2">Delivery Status</h2>
              <p className="text-[16px] sm:text-[20px] lg:text-[25px] font-semibold text-green-500">
                {trackingNumber ? `Tracking #${trackingNumber}` : `Order #${orderId}`}
              </p>
            </div>

            {/* Progress Bar Section - Mobile Optimized */}
            <div className="mb-6 sm:mb-8">
              {/* Progress Bar Container with Truck Icon */}
                <div className="w-full h-[30px] sm:h-[35px] bg-gray-200 rounded-[45px] relative mb-4 sm:mb-6">
                  <div
                    className="h-[26px] sm:h-[31px] bg-gradient-to-r from-green-400 to-green-500 rounded-[45px] shadow-lg transition-all duration-300"
                    style={{ width: `${progressPercent || 15}%` }}
                  />
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center w-[50px] h-[50px] sm:w-[55px] sm:h-[55px] lg:w-[61px] lg:h-[61px] bg-white rounded-full shadow-lg border-2 border-green-500 transition-all duration-300"
                    style={{ left: `${progressPercent}%`, marginLeft: '-25px' }}
                  >
                    <img src={TruckIcon} alt="Truck" className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] lg:w-[40px] lg:h-[40px]" />
                  </div>
                </div>
              
              {/* Progress Labels with Icons */}
              <div className="flex justify-between px-1 sm:px-4">
                <div className="flex flex-col items-center">
                  <img src={pickupIcon} alt="Pickup" className="w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] lg:w-[58px] lg:h-[58px] mb-2" />
                  <span className="text-[12px] sm:text-[16px] lg:text-[25px] font-medium text-black text-center">Pickup</span>
                </div>
                <div className="flex flex-col items-center">
                  <img src={shippingIcon} alt="Shipping" className="w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] lg:w-[58px] lg:h-[58px] mb-2" />
                  <span className="text-[12px] sm:text-[16px] lg:text-[25px] font-medium text-black text-center">Shipping</span>
                </div>
                <div className="flex flex-col items-center">
                  <img src={deliveredIcon} alt="Delivered" className="w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] lg:w-[58px] lg:h-[58px] mb-2" />
                  <span className="text-[12px] sm:text-[16px] lg:text-[25px] font-medium text-black text-center">Delivered</span>
                </div>
              </div>
            </div>

            {/* Timeline Section - Mobile Optimized */}
            <div className="space-y-4 sm:space-y-5">
              {loading && <p className="text-sm text-gray-500">Loading latest tracking events…</p>}
              {!loading && events.length === 0 && (
                <p className="text-sm text-gray-500">No tracking updates yet. Please check back shortly.</p>
              )}
              {events.map((event) => (
                <div
                  key={`${event.code}-${event.timestamp}`}
                  className={`rounded-[12px] p-4 sm:p-5 border-l-4 ${
                    event.isCurrent ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <p
                        className={`text-[14px] sm:text-[16px] lg:text-[15px] ${
                          event.isCurrent ? 'font-bold text-black' : 'font-medium text-gray-700'
                        } leading-relaxed`}
                      >
                        {event.message}
                        {event.location ? <span className="text-gray-500"> • {event.location}</span> : null}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <p
                        className={`text-[12px] sm:text-[14px] lg:text-[15px] ${
                          event.isCurrent ? 'font-bold text-green-600' : 'font-medium text-gray-500'
                        } bg-white px-3 py-1 rounded-full`}
                      >
                        {new Date(event.timestamp).toLocaleString('en-PK', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {timeline?.source === 'fallback' && (
              <div className="mt-6 rounded-[12px] border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                Leopards API credentials are not configured yet. Showing smart fallback data so sellers can preview the
                tracking UI. Once you add `REACT_APP_LEOPARDS_*` env variables, live tracking will appear automatically.
              </div>
            )}
            {error && (
              <div className="mt-6 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </SellerScaffold>
  );
};

export default TrackOrderPage;