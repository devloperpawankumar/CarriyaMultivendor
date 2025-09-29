import React from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import pickupIcon from '../../../assets/images/Seller/pickupTrackOrder.png';
import shippingIcon from '../../../assets/images/Seller/ShippingTrackOrder.png';
import deliveredIcon from '../../../assets/images/Seller/DeliverdTrackOrder.png';
import TruckIcon from '../../../assets/images/Seller/ProcessingSeller.png';

interface TrackOrderPageProps {
  orderId?: string;
  onBack?: () => void;
}

const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  orderId = "B12345K",
  onBack,
}) => {
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
              <p className="text-[16px] sm:text-[20px] lg:text-[25px] font-semibold text-green-500">Order #{orderId}</p>
            </div>

            {/* Progress Bar Section - Mobile Optimized */}
            <div className="mb-6 sm:mb-8">
              {/* Progress Bar Container with Truck Icon */}
              <div className="w-full h-[30px] sm:h-[35px] bg-gray-200 rounded-[45px] relative mb-4 sm:mb-6">
                <div 
                  className="h-[26px] sm:h-[31px] bg-gradient-to-r from-green-400 to-green-500 rounded-[45px] shadow-lg"
                  style={{ width: '75%' }}
                />
                {/* Truck Icon on Progress Bar */}
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center w-[50px] h-[50px] sm:w-[55px] sm:h-[55px] lg:w-[61px] lg:h-[61px] bg-white rounded-full shadow-lg border-2 border-green-500"
                  style={{ left: '75%', marginLeft: '-25px' }}
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

                 {/* Step 4: Package is delivering to customer (Active) - BOLD TEXT FIRST */}
              <div className="bg-green-50 rounded-[12px] p-4 sm:p-5 border-l-4 border-green-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <p className="text-[14px] sm:text-[16px] lg:text-[15px] font-bold text-black leading-relaxed">
                      Package is delivering to customer
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-[12px] sm:text-[14px] lg:text-[15px] font-bold text-green-600 bg-white px-3 py-1 rounded-full">
                      03 Sep 2025, 02:00
                    </p>
                  </div>
                </div>
              </div>

             {/* Step 3: Package has arrived the courier facility */}
             <div className="bg-gray-50 rounded-[12px] p-4 sm:p-5 border-l-4 border-gray-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <p className="text-[14px] sm:text-[16px] lg:text-[15px] font-medium text-gray-700 leading-relaxed">
                      Package has arrived the courier facility
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-[12px] sm:text-[14px] lg:text-[15px] font-medium text-gray-500 bg-white px-3 py-1 rounded-full">
                      03 Sep 2025, 01:00
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Package has left the courier facility */}
              <div className="bg-gray-50 rounded-[12px] p-4 sm:p-5 border-l-4 border-gray-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <p className="text-[14px] sm:text-[16px] lg:text-[15px] font-medium text-gray-700 leading-relaxed">
                      Package has left the courier facility
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-[12px] sm:text-[14px] lg:text-[15px] font-medium text-gray-500 bg-white px-3 py-1 rounded-full">
                      03 Sep 2025, 12:00
                    </p>
                  </div>
                </div>
              </div>

             
  {/* Step 1: Order details shared with the courier */}
  <div className="bg-gray-50 rounded-[12px] p-4 sm:p-5 border-l-4 border-gray-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <p className="text-[14px] sm:text-[16px] lg:text-[15px] font-medium text-gray-700 leading-relaxed">
                      Order details shared with the courier
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-[12px] sm:text-[14px] lg:text-[15px] font-medium text-gray-500 bg-white px-3 py-1 rounded-full">
                      02 Sep 2025, 10:00
                    </p>
                  </div>
                </div>
              </div>
             
            </div>
          </div>
        </div>
      </div>
    </SellerScaffold>
  );
};

export default TrackOrderPage;