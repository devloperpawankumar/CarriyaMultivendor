import React, { useState, useRef, useEffect } from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import arrowIcon from "../../../assets/images/Seller/_ (3).png";

export interface OrderDetails {
  id: string;
  customerName: string;
  address: string;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;
  shippingCharges: string;
  productName: string;
  unitPrice: string;
  quantity: number;
  platformCommission: string;
  discount: string;
  sellerPayout: string;
  productImage?: string;
}

interface OrderDetailsPageProps {
  orderDetails: OrderDetails | null;
  onUpdateStatus?: () => void;
  onTrackOrder?: () => void;
  showTrackOrder?: boolean;
}

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({
  orderDetails,
  onUpdateStatus,
  onTrackOrder,
  showTrackOrder = true,
}) => {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTrackDropdownOpen, setIsTrackDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const trackDropdownRef = useRef<HTMLDivElement>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (trackDropdownRef.current && !trackDropdownRef.current.contains(event.target as Node)) {
        setIsTrackDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const statusOptions = [
    { number: 1, label: 'Update Status' },
    { number: 2, label: 'In Progress' },
    { number: 3, label: 'Packed' },
    { number: 4, label: 'On the Way' },
    { number: 5, label: 'Delivered' }
  ];

  const handleStatusSelect = (status: string) => {
    console.log('Status updated to:', status);
    setIsStatusDropdownOpen(false);
    if (onUpdateStatus) {
      onUpdateStatus();
    }
  };

  if (!orderDetails) {
    return (
      <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
        <div className="w-full">
          <div className="text-center py-8">
            <p className="text-gray-500">No order details available</p>
          </div>
        </div>
      </SellerScaffold>
    );
  }

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      <div className="w-full px-2 sm:px-0">
        {/* Header Section with Action Buttons */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 lg:gap-0">
            {/* Left side - Title, Date, and Breadcrumb grouped together */}
            <div className="flex-1">
              <h1 className="text-[28px] sm:text-[32px] lg:text-[40px] font-bold text-black mb-3 sm:mb-4">Manage orders</h1>
              <div className="bg-green-50 rounded-[20px] sm:rounded-[25px] inline-block px-3 sm:px-4 py-2 mb-2">
                <p className="text-[18px] sm:text-[22px] lg:text-[25px] font-medium text-black">Today, 01-09-2025</p>
              </div>
              <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-medium text-gray-500">Manage Orders &gt; See Order</p>
            </div>
            
            {/* Right side - Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
              {/* Track Order Button */}
              {showTrackOrder && (
                <button
                  onClick={onTrackOrder}
                  className="bg-green-500 text-white px-4 sm:px-6 py-3 rounded-[15px] sm:rounded-[20px] text-[16px] sm:text-[18px] lg:text-[20px] font-bold hover:bg-green-600 active:bg-green-700 transition-all duration-200 flex gap-2 w-full sm:w-auto touch-manipulation"
                >
                  Track Order
                </button>
              )}
              
              {/* Update Status Button with Dropdown */}
              <div className="relative w-full sm:w-auto" ref={statusDropdownRef}>
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="bg-green-500 text-white px-4 sm:px-6 py-3 rounded-[15px] sm:rounded-[20px] text-[16px] sm:text-[10px] lg:text-[20px] font-bold hover:bg-green-600 active:bg-green-700 transition-all duration-200 flex items-center justify-between w-full sm:min-w-[200px] lg:min-w-[220px] h-[50px] sm:h-[55px] touch-manipulation"
                >
                  <span>Update Status</span>
                  <span className="text-[10px] sm:text-[22px] lg:text-[25px] font-semibold">
                    <img src={arrowIcon} alt="arrow" className="w-3 sm:w-4" />
                  </span>
                </button>
                
                {/* Dropdown Menu - Opens inside the button area */}
                {isStatusDropdownOpen && (
                  <div className="absolute top-0 right-0 w-full sm:w-[200px] lg:w-[220px] bg-green-500 border border-gray-300 rounded-[15px] sm:rounded-[20px] shadow-lg z-50">
                    <div className="p-0">
                      {/* Header - Update Status with arrow - Clickable to close */}
                      <button
                        onClick={() => setIsStatusDropdownOpen(false)}
                        className="w-full flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/20 hover:bg-green-600 transition-colors"
                      >
                        <span className="text-white text-[16px] sm:text-[18px] lg:text-[20px] font-bold">Update Status</span>
                        <span className="text-white text-[20px] sm:text-[22px] lg:text-[25px] font-semibold">
                          <img src={arrowIcon} alt="arrow" className="w-3 sm:w-4" />
                        </span>
                      </button>
                      
                      {/* Options */}
                      <div className="px-2 sm:px-3 py-1">
                        {statusOptions.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleStatusSelect(option.label)}
                            className="w-full text-left text-white text-[16px] sm:text-[18px] lg:text-[20px] font-medium px-2 py-2 sm:py-1.5 hover:bg-green-600 active:bg-green-700 rounded-lg transition-all duration-200 flex items-center gap-2 touch-manipulation"
                          >
                            <span className="text-[14px] sm:text-[15px] lg:text-[16px] font-bold">{option.number}.</span>
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Customer Details Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-[16px] sm:text-[18px] lg:text-[20px] font-bold text-black">Customers Details :</h3>
              
              {/* Customer Details Card */}
              <div className="bg-white border-2 border-gray-200 rounded-[15px] sm:rounded-[20px] p-3 sm:p-4 shadow-sm">
                <div className="space-y-3 sm:space-y-4">
                  {/* Customer Name */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200 gap-1 sm:gap-0">
                    <span className="text-[12px] sm:text-[13px] lg:text-[15px] font-semibold text-black">Customers Name :</span>
                    <span className="text-[11px] sm:text-[12px] font-medium text-black">{orderDetails.customerName}</span>
                  </div>
                  
                  {/* Address */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start py-2 border-b border-gray-200 gap-1 sm:gap-0">
                    <span className="text-[12px] sm:text-[13px] lg:text-[15px] font-semibold text-black">Address :</span>
                    <span className="text-[11px] sm:text-[12px] font-medium text-black text-left sm:text-right">
                      {orderDetails.address}
                    </span>
                  </div>
                  
                  {/* Payment Method */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200 gap-1 sm:gap-0">
                    <span className="text-[12px] sm:text-[13px] lg:text-[15px] font-semibold text-black">Payment Method :</span>
                    <span className="text-[11px] sm:text-[12px] font-medium text-black">{orderDetails.paymentMethod}</span>
                  </div>
                  
                  {/* Payment Status */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1 sm:gap-0">
                    <span className="text-[12px] sm:text-[13px] lg:text-[15px] font-semibold text-black">Payment Status</span>
                    <span className="text-[11px] sm:text-[12px] font-medium text-black">{orderDetails.paymentStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-[16px] sm:text-[18px] lg:text-[20px] font-bold text-black">Order Summary</h3>
              
              {/* Order Summary Card */}
              <div className="bg-white border-2 border-gray-200 rounded-[15px] sm:rounded-[20px] p-3 sm:p-4 shadow-sm">
                <div className="space-y-3 sm:space-y-4">
                  {/* Order ID */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200 gap-1 sm:gap-0">
                    <span className="text-[12px] sm:text-[13px] lg:text-[15px] font-semibold text-black">Order ID :</span>
                    <span className="text-[11px] sm:text-[12px] font-medium text-black break-all">{orderDetails.id}</span>
                  </div>
                  
                  {/* Shipping Charges */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200 gap-1 sm:gap-0">
                    <span className="text-[12px] sm:text-[13px] lg:text-[15px] font-semibold text-black">Shipping Charges :</span>
                    <span className="text-[11px] sm:text-[12px] font-medium text-black">{orderDetails.shippingCharges}</span>
                  </div>
                  
                  {/* Order Date */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200 gap-1 sm:gap-0">
                    <span className="text-[12px] sm:text-[13px] lg:text-[15px] font-semibold text-black">Order Date :</span>
                    <span className="text-[11px] sm:text-[12px] font-medium text-black">{orderDetails.orderDate}</span>
                  </div>
                  
                  {/* Product Name */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start py-2 gap-1 sm:gap-0">
                    <span className="text-[12px] sm:text-[13px] lg:text-[15px] font-semibold text-black">Product Name</span>
                    <span className="text-[11px] sm:text-[12px] font-medium text-black text-left sm:text-right">
                      {orderDetails.productName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Table */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-[16px] sm:text-[18px] lg:text-[20px] font-bold text-black">Product Details :</h3>
            
            {/* Mobile Card Layout */}
            <div className="block lg:hidden">
              <div className="bg-white border-2 border-gray-200 rounded-[15px] p-4 shadow-sm space-y-4">
                {/* Product Name */}
                <div className="flex justify-between items-start py-2 border-b border-gray-200">
                  <span className="text-[12px] font-semibold text-black">Product:</span>
                  <span className="text-[11px] font-medium text-gray-500 text-right max-w-[200px]">
                    {orderDetails.productName}
                  </span>
                </div>
                
                {/* Unit Price */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-[12px] font-semibold text-black">Unit Price:</span>
                  <span className="text-[11px] font-medium text-gray-500">{orderDetails.unitPrice}</span>
                </div>
                
                {/* Quantity */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-[12px] font-semibold text-black">QTY:</span>
                  <span className="text-[11px] font-medium text-gray-500">{orderDetails.quantity}</span>
                </div>
                
                {/* Platform Commission */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-[12px] font-semibold text-black">Platform Commission:</span>
                  <span className="text-[11px] font-medium text-gray-500">{orderDetails.platformCommission}</span>
                </div>
                
                {/* Discount */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-[12px] font-semibold text-black">Discount:</span>
                  <span className="text-[11px] font-medium text-gray-500">{orderDetails.discount}</span>
                </div>
                
                {/* Seller Payout */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-[12px] font-semibold text-black">Seller Payout:</span>
                  <span className="text-[11px] font-medium text-green-500 font-bold">{orderDetails.sellerPayout}</span>
                </div>
              </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block">
              <div className="bg-white border-2 border-gray-200 rounded-[20px] p-4 shadow-sm overflow-x-auto">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 py-2 border-b border-gray-200 text-center">
                  <div className="text-[15px] font-semibold text-black">Product</div>
                  <div className="text-[15px] font-semibold text-black">Unit Price</div>
                  <div className="text-[15px] font-semibold text-black">QTY</div>
                  <div className="text-[15px] font-semibold text-black">Platform Commission</div>
                  <div className="text-[15px] font-semibold text-black">Discount</div>
                  <div className="text-[15px] font-semibold text-black">Seller Payout</div>
                </div>
                
                {/* Table Row */}
                <div className="grid grid-cols-6 gap-4 py-4 text-center">
                  <div className="text-[13px] font-medium text-gray-500">
                    {orderDetails.productName}
                  </div>
                  <div className="text-[13px] font-medium text-gray-500">
                    {orderDetails.unitPrice}
                  </div>
                  <div className="text-[13px] font-medium text-gray-500">
                    {orderDetails.quantity}
                  </div>
                  <div className="text-[13px] font-medium text-gray-500">
                    {orderDetails.platformCommission}
                  </div>
                  <div className="text-[13px] font-medium text-gray-500">
                    {orderDetails.discount}
                  </div>
                  <div className="text-[13px] font-medium text-green-500 font-bold">
                    {orderDetails.sellerPayout}
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

export default OrderDetailsPage;
