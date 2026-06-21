import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BuyerOrder, fetchBuyerOrders } from '../services/orderService';
import { submitReview } from '../services/reviewService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const sampleImage = require('../assets/images/Product/prodcut1.png');

const formatCurrency = (value?: number) => `PKR ${Number(value || 0).toLocaleString()}`;
const formatText = (value?: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ') : '';
const formatDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MyOrders: React.FC = () => {
  const { showToast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [productRating, setProductRating] = useState<number>(0);
  const [productHoverRating, setProductHoverRating] = useState<number>(0);
  const [productReviewText, setProductReviewText] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrder | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const reviewSectionRef = useRef<HTMLDivElement | null>(null);

  const loadOrders = useCallback(async () => {
    // Don't load orders if user is not authenticated
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetchBuyerOrders({ pageSize: 10 });
      setOrders(response.items || []);
    } catch (err: any) {
      console.error(err);
      // Only show error if it's not a 401 (unauthorized) - that means user logged out
      if (err?.response?.status !== 401) {
        setError('Unable to load your orders right now. Please try again later.');
        showToast({
          type: 'error',
          title: 'Unable to load orders',
          message: 'Please try again later.',
        });
      } else {
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    // Wait for auth to finish loading before attempting to load orders
    if (!authLoading) {
      loadOrders();
    }
  }, [authLoading, loadOrders]);

  useEffect(() => {
    if (!showReview) return;
    const target = reviewSectionRef.current;
    if (!target) return;

    if (window.innerWidth >= 768) {
      const headerOffsetPx = 100;
      const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffsetPx;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    } else {
      try {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {
        /* ignore */
      }
    }
  }, [showReview]);

  const handleWriteReview = (order: BuyerOrder) => {
    // Only allow review if order is delivered
    if (order.status !== 'delivered') {
      showToast({
        type: 'info',
        title: 'Order not delivered',
        message: 'You can only review orders that have been delivered.',
      });
      return;
    }

    // Check if already reviewed
    if (order.hasReview) {
      showToast({
        type: 'info',
        title: 'Already reviewed',
        message: 'You have already submitted a review for this order.',
      });
      return;
    }

    setSelectedOrder(order);
    setProductRating(0);
    setProductHoverRating(0);
    setProductReviewText('');
    setShowReview(true);
  };

  const handleCloseReview = () => {
    setShowReview(false);
    setSelectedOrder(null);
    setProductRating(0);
    setProductHoverRating(0);
    setProductReviewText('');
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder) return;

    // Validate product rating (required)
    if (productRating < 1 || productRating > 5) {
      showToast({
        type: 'error',
        title: 'Rating required',
        message: 'Please rate the product (1-5 stars) before submitting.',
      });
      return;
    }

    setSubmittingReview(true);
    try {
      await submitReview(selectedOrder.orderNumber, {
        productRating,
        productReview: productReviewText.trim() || undefined,
      });

      showToast({
        type: 'success',
        title: 'Review submitted',
        message: 'Thank you for your review! It will help other customers make informed decisions.',
      });

      // Reload orders to get updated hasReview field
      await loadOrders();

      // Close review form
      handleCloseReview();
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      const message = err?.response?.data?.message || err?.message || 'Unable to submit review right now.';
      showToast({
        type: 'error',
        title: 'Failed to submit review',
        message,
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const totalQuantity = (order: BuyerOrder) =>
    order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const mainItem = (order: BuyerOrder) => order.items[0];

  const renderVariantText = (order: BuyerOrder) => {
    const item = mainItem(order);
    const parts = [];
    if (item?.color) parts.push(`${item.color} color`);
    if (item?.size) parts.push(`${item.size} Size`);
    return parts.join(' , ');
  };

  const renderOrders = () => {
    // Show loading state while checking authentication
    if (authLoading || (loading && isAuthenticated)) {
      return <p className="text-gray-600">Loading your orders...</p>;
    }

    // Show login prompt for guest users
    if (!isAuthenticated) {
      return (
        <div className="text-center py-16 border border-dashed border-[#B8B1B1] rounded-[25px] bg-white">
          <p className="text-lg font-semibold text-gray-800">Please log in to view your orders</p>
          <p className="text-sm text-gray-500 mt-2 mb-4">
            You need to be logged in to see your order history and track your purchases.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2 bg-[#2ECC71] text-white rounded-lg font-semibold hover:bg-[#27AE60] transition-colors"
          >
            Log In
          </Link>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p className="font-semibold">We couldn't load your orders</p>
          <p className="text-sm mt-2">{error}</p>
          <button
            type="button"
            onClick={loadOrders}
            className="mt-3 text-sm font-medium text-[#2ECC71]"
          >
            Try again
          </button>
        </div>
      );
    }
    if (!orders.length) {
      return (
        <div className="text-center py-16 border border-dashed border-[#B8B1B1] rounded-[25px] bg-white">
          <p className="text-lg font-semibold text-gray-800">You have no orders yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Any purchases you make will show up here so you can track their progress.
          </p>
        </div>
      );
    }

    return orders.map((order) => {
      
      const item = mainItem(order);
      // console.log("item:" ,item);
      const qtyLabel = `Qty ${totalQuantity(order)}`;
      const variantText = renderVariantText(order);
      const priceText = formatCurrency(order.total);
      const showDiscount = order.discount > 0;

      const isCancelled = order.status === 'cancelled';
      const cancellationReason = order.cancellationReason || 'Order cancelled by seller';
      const cancellationNote = order.cancellationNote;
      const cancellationDateText = order.cancelledAt ? formatDateTime(order.cancelledAt) : '';

      return (
        <div key={order.orderNumber} className="mb-8">
          <div className="hidden md:block w-[1225px] h-[278px] border border-[#B8B1B1] rounded-[12px] bg-white relative">
            <div className="absolute left-[28.5px] top-[24px] w-[300px] h-[21px]">
        
              <span className="text-[14px] font-bold text-[#767676]" style={{ fontFamily: 'Lato', lineHeight: '1.5em' }}>
                {order.storeName || item?.title || order.orderNumber} &gt;
              
              </span>
            </div>
            <div className="absolute left-[1134px] top-[107px] w-[80px] h-[30px]">
              <span className="text-[20px] font-medium text-black" style={{ fontFamily: 'Lato', lineHeight: '1.5em' }}>
                {qtyLabel}
              </span>
            </div>
            <div className="absolute left-0 top-[61px] w-[1225px] h-[1px] bg-[#B8B1B1]" />
            <div className="absolute left-[31px] top-[78.5px] w-[96px] h-[96px] bg-gray-200 rounded-[4px] overflow-hidden">
              <img
                src={item?.thumbnailUrl || sampleImage}
                alt={item?.title || 'Product'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute left-[156px] top-[81px] w-[400px] h-[26px]">
              <h3 className="text-[20px] font-medium text-[#2ECC71]" style={{ fontFamily: 'Roboto', lineHeight: '1.3em' }}>
                {item?.title || 'Product name'}
              </h3>
            </div>
            <div className="absolute left-[160.5px] top-[122px] w-[300px] h-[16px]">
              <p className="text-[12px] font-normal text-[#949494]" style={{ fontFamily: 'Roboto', lineHeight: '1.3em' }}>
                {variantText || order.orderNumber}
              </p>
            </div>
            <div className="absolute left-[523px] top-[90px] w-[120px]">
              <span className="text-[20px] font-bold text-black" style={{ fontFamily: 'Roboto', lineHeight: '1.3em' }}>
                {priceText}
              </span>
            </div>
            {showDiscount && (
              <div className="absolute left-[519px] top-[122px] w-[150px] h-[30px]">
                <span className="text-[20px] font-normal text-[#787A80] line-through" style={{ fontFamily: 'Lato', lineHeight: '1.5em' }}>
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
            )}
            {/* Status + payment + inline cancelled message (Amazon/Daraz-style) */}
            <div className="absolute left-[747px] top-[90px] w-[280px]">
              <span className="block text-[19px] font-bold text-[#2ECC71]" style={{ fontFamily: 'Roboto', lineHeight: '1.3em' }}>
                {formatText(order.status)}
              </span>
              <span className="block text-[20px] font-normal text-[#787A80] mt-1" style={{ fontFamily: 'Roboto', lineHeight: '1.5em' }}>
                {formatText(order.paymentStatus)}
              </span>
              {isCancelled && (
                <div className="mt-2 text-[12px] text-red-600 leading-snug">
                  <div className="font-semibold">
                    Cancelled {cancellationDateText ? `on ${cancellationDateText}` : ''}
                  </div>
                  <div className="mt-0.5">
                    <span className="font-semibold">Reason:</span> {cancellationReason}
                  </div>
                  {/* {cancellationNote && (
                    <div className="mt-0.5">
                      <span className="font-semibold">Seller note:</span> {cancellationNote}
                    </div>
                  )}
                  <div className="mt-1 text-[11px] text-red-500">
                    You won’t be charged for this order. If you paid online, refunds process automatically.
                  </div> */}
                </div>
              )}
            </div>
            {order.status === 'delivered' && !order.hasReview && !isCancelled && (
              <button
                type="button"
                onClick={() => handleWriteReview(order)}
                className="absolute left-[425px] top-[193px] w-[540px] h-[55px] bg-[#2ECC71] rounded-[10px] flex items-center justify-center hover:bg-[#27AE60] transition-colors"
              >
                <span className="text-[30px] font-medium text-white" style={{ fontFamily: 'Roboto', lineHeight: '1.171875em' }}>
                  Write your review
                </span>
              </button>
            )}
            {order.status === 'delivered' && order.hasReview && !isCancelled && (
              <div className="absolute left-[425px] top-[193px] w-[540px] h-[55px] bg-gray-100 rounded-[10px] flex items-center justify-center">
                <span className="text-[30px] font-medium text-gray-500" style={{ fontFamily: 'Roboto', lineHeight: '1.171875em' }}>
                  Review submitted
                </span>
              </div>
            )}
          </div>

          <div className="md:hidden mt-4">
            <div className="rounded-2xl border border-[#B8B1B1] bg-white shadow-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold text-[#767676]">{order.storeName || item?.title || order.orderNumber} &gt;</span>
                <span className="text-base font-medium">{qtyLabel}</span>
              </div>
              <div className="h-px bg-[#B8B1B1]" />
              <div className="p-4 flex items-start gap-3">
                <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={item?.thumbnailUrl || sampleImage}
                    alt={item?.title || 'Product'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[18px] font-medium text-[#2ECC71] truncate">{item?.title || 'Product name'}</h3>
                  <p className="text-xs text-[#949494] mt-1">{variantText || order.orderNumber}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold">{priceText}</div>
                      {showDiscount && (
                        <div className="text-sm text-[#787A80] line-through -mt-0.5">
                          {formatCurrency(order.subtotal)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-[#2ECC71]">{formatText(order.status)}</div>
                      <div className="text-sm text-[#787A80] -mt-0.5">{formatText(order.paymentStatus)}</div>
                    </div>
                  </div>
                </div>
              </div>
              {order.status === 'delivered' && !order.hasReview && !isCancelled && (
                <div className="p-4">
                  <button
                    type="button"
                    onClick={() => handleWriteReview(order)}
                    className="w-full h-12 bg-[#2ECC71] text-white rounded-xl text-lg font-semibold hover:bg-[#27AE60] transition-colors"
                  >
                    Write your review
                  </button>
                </div>
              )}
              {order.status === 'delivered' && order.hasReview && !isCancelled && (
                <div className="p-4">
                  <div className="w-full h-12 bg-gray-100 text-gray-500 rounded-xl text-lg font-semibold flex items-center justify-center">
                    Review submitted
                  </div>
                </div>
              )}
            </div>
              {isCancelled && (
                <div className="px-4 pb-4 pt-1 text-[11px] text-red-600 leading-snug">
                  <div className="font-semibold">
                    Cancelled {cancellationDateText ? `on ${cancellationDateText}` : ''}
                  </div>
                  <div className="mt-0.5">
                    <span className="font-semibold">Reason:</span> {cancellationReason}
                  </div>
                  {/* {cancellationNote && (
                    <div className="mt-0.5">
                      <span className="font-semibold">Seller note:</span> {cancellationNote}
                    </div>
                  )}
                  <div className="mt-0.5 text-[10px] text-red-500">
                    You won’t be charged for this order. Refunds for prepaid orders happen automatically.
                  </div> */}
                </div>
              )}
          </div>
          </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header variant="full" />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <h1 className="md:text-[40px] text-[20px] font-semibold text-black mb-[36px]">Orders details</h1>

        {renderOrders()}

        {showReview && selectedOrder && (
          <div ref={reviewSectionRef} className="hidden md:block relative mt-8 w-[1225px] bg-white border border-[#2ECC71] rounded-[10px] p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-[69px] h-[69px] rounded-full bg-[#2ECC71] flex items-center justify-center flex-shrink-0">
                <svg width="37" height="46" viewBox="0 0 37 46" fill="none">
                  <path d="M18.5 0C23.56 0 27.67 4.11 27.67 9.17C27.67 14.23 23.56 18.33 18.5 18.33C13.44 18.33 9.33 14.23 9.33 9.17C9.33 4.11 13.44 0 18.5 0Z" fill="#101820" />
                  <path d="M0 46C0 36.52 8.52 28 18.5 28C28.48 28 37 36.52 37 46" fill="#101820" />
                </svg>
              </div>
              <div>
                <div className="text-[25px] font-semibold text-black" style={{ fontFamily: 'Roboto', lineHeight: '1.171875em' }}>
                  {selectedOrder.shippingAddress.fullName || 'Account Name'}
                </div>
                <div className="text-[10px] font-medium text-black" style={{ fontFamily: 'Roboto', lineHeight: '1.171875em' }}>
                  You are posting a review for {selectedOrder.orderNumber}
                </div>
              </div>
            </div>

            {/* Product Rating Section */}
            <div className="mb-6">
              <div className="text-[18px] font-semibold text-black mb-3" style={{ fontFamily: 'Roboto' }}>
                Rate the Product *
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex" style={{ gap: '12px' }}>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starIndex = i + 1;
                    const active = (productHoverRating || productRating) >= starIndex;
                    return (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Rate product ${starIndex} star${starIndex > 1 ? 's' : ''}`}
                        onMouseEnter={() => setProductHoverRating(starIndex)}
                        onMouseLeave={() => setProductHoverRating(0)}
                        onClick={() => setProductRating(starIndex)}
                        className="p-0 m-0 bg-transparent border-0 cursor-pointer"
                        style={{ width: '40px', height: '36px' }}
                      >
                        <svg width="40" height="36" viewBox="0 0 60 55">
                          <path
                            d="M30 3l7.9 16 17.6 2.6-12.7 12.1 3 17.5L30 42.9 13.2 51.2l3-17.5L3.5 21.6 21.1 19 30 3z"
                            fill={active ? '#2ECC71' : '#FFFFFF'}
                            stroke={active ? '#2ECC71' : '#949494'}
                            strokeWidth="1"
                          />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                className="w-full h-[120px] rounded-[10px] bg-white"
                style={{ boxShadow: '2px 3px 4px 0px rgba(46, 204, 113, 0.25)', border: '1px solid #E2E0E0' }}
              >
                <textarea
                  value={productReviewText}
                  onChange={(e) => setProductReviewText(e.target.value)}
                  placeholder="Write your product review (optional)"
                  className="w-full h-full p-4 text-[16px] text-[#949494] outline-none resize-none rounded-[10px]"
                  style={{ fontFamily: 'Roboto', lineHeight: '1.5em' }}
                />
              </div>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={handleCloseReview}
                disabled={submittingReview}
                className="px-6 h-12 rounded-lg border border-gray-300 text-gray-700 text-base font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submittingReview || productRating < 1}
                className="px-6 h-12 rounded-lg bg-[#2ECC71] text-white text-base font-semibold hover:bg-[#27AE60] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}

        {showReview && selectedOrder && (
          <div className="md:hidden mt-4 rounded-2xl border border-[#2ECC71] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-[52px] h-[52px] rounded-full bg-[#2ECC71] flex items-center justify-center flex-shrink-0">
                <svg width="28" height="36" viewBox="0 0 37 46" fill="none">
                  <path d="M18.5 0C23.56 0 27.67 4.11 27.67 9.17C27.67 14.23 23.56 18.33 18.5 18.33C13.44 18.33 9.33 14.23 9.33 9.17C9.33 4.11 13.44 0 18.5 0Z" fill="#101820" />
                  <path d="M0 46C0 36.52 8.52 28 18.5 28C28.48 28 37 36.52 37 46" fill="#101820" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold">{selectedOrder.shippingAddress.fullName || 'Account Name'}</div>
                <div className="text-[10px] text-black/80">Review for {selectedOrder.orderNumber}</div>
              </div>
            </div>

            {/* Product Rating */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-black mb-2">Rate the Product *</div>
              <div className="flex items-center gap-2 mb-2">
                {Array.from({ length: 5 }).map((_, i) => {
                  const starIndex = i + 1;
                  const active = (productHoverRating || productRating) >= starIndex;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Rate product ${starIndex} star${starIndex > 1 ? 's' : ''}`}
                      onMouseEnter={() => setProductHoverRating(starIndex)}
                      onMouseLeave={() => setProductHoverRating(0)}
                      onClick={() => setProductRating(starIndex)}
                      className="p-0 m-0 bg-transparent border-0 cursor-pointer"
                      style={{ width: '32px', height: '30px' }}
                    >
                      <svg width="32" height="30" viewBox="0 0 60 55">
                        <path
                          d="M30 3l7.9 16 17.6 2.6-12.7 12.1 3 17.5L30 42.9 13.2 51.2l3-17.5L3.5 21.6 21.1 19 30 3z"
                          fill={active ? '#2ECC71' : '#FFFFFF'}
                          stroke={active ? '#2ECC71' : '#949494'}
                          strokeWidth="1"
                        />
                      </svg>
                    </button>
                  );
                })}
              </div>
              <textarea
                value={productReviewText}
                onChange={(e) => setProductReviewText(e.target.value)}
                placeholder="Write your product review (optional)"
                className="w-full h-24 rounded-xl border border-[#E2E0E0] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] px-4 py-3 text-sm text-[#949494] outline-none"
                style={{ fontFamily: 'Roboto' }}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseReview}
                disabled={submittingReview}
                className="px-4 h-10 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submittingReview || productRating < 1}
                className="px-4 h-10 rounded-lg bg-[#2ECC71] text-white text-sm font-semibold disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyOrders;
