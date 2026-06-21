import React, { useState, useRef, useEffect } from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import arrowIcon from "../../../assets/images/Seller/_ (3).png";
import type { CancelOrderPayload, OrderDetails, SellerOrderStatus } from './types/orderTypes';

type SellerOrderDetailsPageProps = {
  orderDetails: OrderDetails | null;
  onUpdateStatus?: (status: string) => void;
  onTrackOrder?: () => void;
  showTrackOrder?: boolean;
  onAcceptOrder?: () => void;
  onCancelOrder?: (payload: CancelOrderPayload) => void;
  decisionLoading?: boolean;
};

const OrderDetailsPage = ({
  orderDetails,
  onUpdateStatus,
  onTrackOrder,
  showTrackOrder = true,
  onAcceptOrder,
  onCancelOrder,
  decisionLoading = false,
}: SellerOrderDetailsPageProps) => {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTrackDropdownOpen, setIsTrackDropdownOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Out of stock');
  const [cancelNote, setCancelNote] = useState('');
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

  // Status flow matching backend: pending → confirmed → processing → shipped → delivered
  // This matches Daraz/Amazon standard e-commerce flow
  const allStatusOptions = [
    { label: 'Confirm Order', value: 'confirmed', description: 'Accept and confirm the order', buttonLabel: 'Confirm Order' },
    { label: 'Processing', value: 'processing', description: 'Order is being prepared and packed', buttonLabel: 'Start Processing' },
    { label: 'Shipped', value: 'shipped', description: 'Order has been shipped with tracking', buttonLabel: 'Mark as Shipped' },
    { label: 'Delivered', value: 'delivered', description: 'Order delivered to customer', buttonLabel: 'Mark as Delivered' },
  ];

  // Backend status transitions (matching backend/src/controllers/ordersController.js)
  const STATUS_TRANSITIONS: Record<SellerOrderStatus, SellerOrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
    refunded: [],
  };

  // Get available next statuses based on current status
  const getAvailableStatusOptions = () => {
    const currentStatus = orderDetails?.sellerStatus || 'pending';
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
    
    // Filter out cancelled (handled separately) and return only valid next statuses
    return allStatusOptions.filter(option => 
      allowedTransitions.includes(option.value as SellerOrderStatus)
    );
  };

  const availableStatusOptions = getAvailableStatusOptions();
  
  // Get the next status (for single button display - Daraz/Amazon style)
  const nextStatusOption = availableStatusOptions.length === 1 ? availableStatusOptions[0] : null;

  const cancelReasons = [
    'Out of stock',
    'Buyer requested cancellation',
    'Incorrect price or content',
    'Cannot fulfill shipping timeline',
    'Other',
  ];

  // Status badge labels matching dropdown labels for consistency
  const statusBadgeMeta: Record<
    SellerOrderStatus | 'default',
    { label: string; classes: string }
  > = {
    pending: {
      label: 'Awaiting Confirmation',
      classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    },
    confirmed: {
      label: 'Confirmed',
      classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    processing: {
      label: 'Processing',
      classes: 'bg-blue-100 text-blue-800 border border-blue-200',
    },
    shipped: {
      label: 'Shipped',
      classes: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    },
    delivered: {
      label: 'Delivered',
      classes: 'bg-green-200 text-green-900 border border-green-300',
    },
    cancelled: {
      label: 'Canceled',
      classes: 'bg-red-100 text-red-800 border border-red-200',
    },
    refunded: {
      label: 'Returned',
      classes: 'bg-orange-100 text-orange-800 border border-orange-200',
    },
    default: {
      label: 'Status pending',
      classes: 'bg-gray-100 text-gray-700 border border-gray-200',
    },
  };

  const currentStatusMeta =
    statusBadgeMeta[(orderDetails?.sellerStatus || 'default') as SellerOrderStatus | 'default'];

  const statusLocked = Boolean(orderDetails?.statusUpdateLocked);
  const statusLockedReason =
    orderDetails?.statusLockedReason ||
    'Order locked after delivery confirmation and payout release. Contact support for changes.';

  const handleStatusSelect = (statusValue: string) => {
    if (statusLocked) {
      setIsStatusDropdownOpen(false);
      return;
    }
    
    // Validate that this is a valid transition
    const currentStatus = orderDetails?.sellerStatus || 'pending';
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
    
    if (!allowedTransitions.includes(statusValue as SellerOrderStatus)) {
      console.log('Invalid status transition:', currentStatus, '→', statusValue);
      setIsStatusDropdownOpen(false);
      return;
    }
    
    console.log('Status updated to:', statusValue, 'from:', currentStatus);
    setIsStatusDropdownOpen(false);
    if (onUpdateStatus) {
      onUpdateStatus(statusValue);
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
                <p className="text-[18px] sm:text-[22px] lg:text-[24px] font-medium text-black">
                  Today, {new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-medium text-gray-500">Manage Orders &gt; See Order</p>
            </div>
            
            {/* Right side - Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full lg:w-auto">
              {currentStatusMeta && (
                <div
                  className={`${currentStatusMeta.classes} rounded-[10px] px-3 py-2 text-sm font-semibold text-center`}
                >
                  {currentStatusMeta.label}
                </div>
              )}
              {/* Track Order Button */}
              {showTrackOrder && (
                <button
                  onClick={onTrackOrder}
                  className="bg-green-500 text-white px-4 sm:px-4 py-3 rounded-[15px] sm:rounded-[20px] text-[16px] sm:text-[18px] lg:text-[20px] font-bold hover:bg-green-600 active:bg-green-700 transition-all duration-200 flex gap-2 w-full sm:w-auto touch-manipulation"
                >
                  Track Order
                </button>
              )}
              
              {/* Update Status - Daraz/Amazon Style: Single button when one option, dropdown when multiple */}
              {!statusLocked && availableStatusOptions.length > 0 && (
                <div className="relative w-full sm:w-auto" ref={statusDropdownRef}>
                  {/* Single Action Button (Daraz/Amazon style) - when only one next status */}
                  {nextStatusOption ? (
                    <button
                      onClick={() => handleStatusSelect(nextStatusOption.value)}
                      disabled={decisionLoading}
                      className="bg-green-500 text-white px-4 sm:px-6 py-3 rounded-[15px] sm:rounded-[20px] text-[16px] sm:text-[18px] lg:text-[20px] font-bold hover:bg-green-600 active:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {nextStatusOption.buttonLabel || nextStatusOption.label}
                    </button>
                  ) : (
                    /* Dropdown - when multiple next statuses (rare case) */
                    <>
                      <button
                        onClick={() => {
                          setIsStatusDropdownOpen(!isStatusDropdownOpen);
                        }}
                        disabled={decisionLoading}
                        className="px-4 sm:px-6 py-3 rounded-[15px] sm:rounded-[20px] text-[16px] sm:text-[18px] lg:text-[20px] font-bold transition-all duration-200 flex items-center justify-between w-full sm:min-w-[200px] lg:min-w-[220px] h-[50px] sm:h-[55px] touch-manipulation bg-green-500 text-white hover:bg-green-600 active:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span>Update Status</span>
                        <span className="text-[10px] sm:text-[22px] lg:text-[25px] font-semibold">
                          <img src={arrowIcon} alt="arrow" className="w-3 sm:w-3" />
                        </span>
                      </button>
                      
                      {/* Dropdown Menu */}
                      {isStatusDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-full sm:w-[200px] lg:w-[220px] bg-green-500 border border-gray-300 rounded-[15px] sm:rounded-[20px] shadow-lg z-50">
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
                            
                            {/* Options - Only show valid next statuses based on current status */}
                            <div className="px-2 sm:px-3 py-1">
                              {availableStatusOptions.map((option, index) => (
                                <button
                                  key={option.value}
                                  onClick={() => handleStatusSelect(option.value)}
                                  className="w-full text-left text-white text-[16px] sm:text-[18px] lg:text-[20px] font-medium px-2 py-2 sm:py-1.5 hover:bg-green-600 active:bg-green-700 rounded-lg transition-all duration-200 flex items-start gap-2 touch-manipulation"
                                >
                                  <span className="text-[14px] sm:text-[15px] lg:text-[16px] font-bold mt-0.5">{index + 1}.</span>
                                  <div className="flex-1">
                                    <div className="font-semibold">{option.label}</div>
                                    {option.description && (
                                      <div className="text-[12px] sm:text-[13px] text-white/80 mt-0.5">{option.description}</div>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {/* Locked Status Message */}
              {statusLocked && (
                <div className="w-full sm:w-auto">
                  <div className="bg-gray-300 text-gray-600 px-4 sm:px-6 py-3 rounded-[15px] sm:rounded-[20px] text-[16px] sm:text-[18px] lg:text-[20px] font-bold cursor-not-allowed flex items-center justify-center w-full sm:w-auto whitespace-nowrap">
                    Status Locked
                  </div>
                  <p className="mt-2 text-xs text-gray-600 max-w-[220px]">
                    
                  </p>
                </div>
              )}
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
                    <span className="text-[11px] sm:text-[12px] font-medium text-black break-all">
                      {orderDetails.orderNumber || orderDetails.id}
                    </span>
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

          {/* Accept and Cancel Buttons */}
          {((orderDetails?.canAccept && onAcceptOrder) || (orderDetails?.canCancel && onCancelOrder)) && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
              {orderDetails?.canAccept && onAcceptOrder && (
                <button
                  onClick={() => onAcceptOrder?.()}
                  disabled={decisionLoading}
                  className="bg-green-500 text-white px-6 sm:px-8 py-3 rounded-[15px] sm:rounded-[20px] text-[16px] sm:text-[18px] lg:text-[20px] font-bold hover:bg-green-600 active:bg-green-700 transition-all duration-200 w-full sm:w-auto touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {decisionLoading ? 'Updating…' : 'Accept'}
                </button>
              )}
              
              {orderDetails?.canCancel && onCancelOrder && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={decisionLoading}
                  className="bg-red-500 text-white px-6 sm:px-8 py-3 rounded-[15px] sm:rounded-[20px] text-[16px] sm:text-[18px] lg:text-[20px] font-bold hover:bg-red-600 active:bg-red-700 transition-all duration-200 w-full sm:w-auto touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post-decision guidance cards */}
      {orderDetails?.sellerStatus === 'confirmed' && (
        <div className="px-2 sm:px-0">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-4 flex flex-col gap-2">
            <p className="text-blue-900 font-semibold text-base sm:text-lg">Order confirmed</p>
            <p className="text-sm sm:text-base text-blue-800">
              Prepare the parcel, print the packing slip, and add a tracking number once the courier picks it up. Buyers
              see the updated status as soon as you share tracking details.
            </p>
          </div>
        </div>
      )}
      {orderDetails?.sellerStatus === 'processing' && (
        <div className="px-2 sm:px-0">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-4 flex flex-col gap-2">
            <p className="text-indigo-900 font-semibold text-base sm:text-lg">Shipment in progress</p>
            <p className="text-sm sm:text-base text-indigo-800">
              Keep the tracking information updated. Once the carrier marks it delivered, the order will move to the
              Completed tab automatically.
            </p>
          </div>
        </div>
      )}
      {showCancelModal && orderDetails?.canCancel && onCancelOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-black">Cancel order</h3>
                <p className="text-sm text-gray-500">Select a reason so we can notify the buyer properly.</p>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-semibold"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cancelReasons.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedReason === reason ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-800">{reason}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Add note (optional)</label>
              <textarea
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Share any detail that helps the buyer understand the cancellation."
                disabled={decisionLoading}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelNote('');
                  setSelectedReason(cancelReasons[0]);
                }}
                className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                disabled={decisionLoading}
              >
                Keep order
              </button>
              <button
                onClick={() => {
                  onCancelOrder?.({
                    reason: selectedReason,
                    note: cancelNote.trim() || undefined,
                  });
                  setShowCancelModal(false);
                  setCancelNote('');
                  setSelectedReason(cancelReasons[0]);
                }}
                disabled={decisionLoading}
                className="px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {decisionLoading ? 'Cancelling…' : 'Confirm cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SellerScaffold>
  );
};

export default OrderDetailsPage;
export type OrderDetailsPageProps = SellerOrderDetailsPageProps;
