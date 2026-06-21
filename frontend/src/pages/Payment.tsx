import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryMenu from '../components/CategoryMenu';
import { useClickOutside } from '../hooks/useClickOutside';
import PaymentOrderSummary from '../components/payment/PaymentOrderSummary';
import PaymentMethodsGrid from '../components/payment/PaymentMethodsGrid';
import PaymentMethodsGridMobile from '../components/payment/PaymentMethodsGridMobile';
import BankTransferDetails from '../components/payment/BankTransferDetails';
import JazzCashDetails from '../components/payment/JazzCashDetails';
import EasypaisaDetails from '../components/payment/EasypaisaDetails';
import CODDetails from '../components/payment/CODDetails';
import { useToast } from '../contexts/ToastContext';
import { commonToasts } from '../utils/toast';
import { useCart } from '../contexts/CartContext';
import { BuyerInfo, fetchBuyerInfoFromApi, loadBuyerInfo } from '../services/checkoutService';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../services/orderService';

const formatPKR = (value: number) => `PKR ${value.toLocaleString()}`;

const PAYMENT_METHOD_MAP: Record<string, string> = {
  'bank-transfer': 'bank_transfer',
  jazzcash: 'jazzcash',
  easypaisa: 'easypaisa',
  cod: 'cod',
};

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { items, totals, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showCategories, setShowCategories] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const browseButtonRef = useRef<HTMLButtonElement | null>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement | null>(null);
  const hasDetails = selectedPaymentMethod === 'bank-transfer' || selectedPaymentMethod === 'jazzcash' || selectedPaymentMethod === 'easypaisa' || selectedPaymentMethod === 'cod';

  useEffect(() => {
    setBuyerInfo(loadBuyerInfo());
  }, [user?.email]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let ignore = false;
    setLoadingAddress(true);
    fetchBuyerInfoFromApi()
      .then((info) => {
        if (!ignore && info) {
          setBuyerInfo(info);
        }
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch buyer info', error);
        }
      })
      .finally(() => {
        if (!ignore) setLoadingAddress(false);
      });
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, user?.email]);

  useClickOutside(() => setShowCategories(false), {
    enabled: showCategories,
    include: [browseButtonRef, categoriesDropdownRef],
    escapeCloses: true,
    eventType: 'mousedown',
  });

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const ensureShippingDetails = () => {
    if (!buyerInfo) {
      showToast({
        type: 'warning',
        title: 'Shipping details missing',
        message: 'Please add your shipping address before placing an order.',
      });
      navigate('/checkout');
      return false;
    }
    return true;
  };

  const handleProceedToPayment = async () => {
    if (!selectedPaymentMethod) {
      showToast(commonToasts.selectPaymentMethod());
      return;
    }
    if (items.length === 0) {
      showToast({
        type: 'warning',
        title: 'Cart is empty',
        message: 'Please add products to your cart before placing an order.',
      });
      navigate('/cart');
      return;
    }
    if (!ensureShippingDetails()) {
      return;
    }
    const missingProduct = items.find((item) => !item.productId);
    if (missingProduct) {
      showToast({
        type: 'warning',
        title: 'Update cart item',
        message: 'Please remove and re-add older cart items before ordering.',
      });
      return;
    }

    const shippingAddress = buyerInfo!;
    const backendPaymentMethod =
      PAYMENT_METHOD_MAP[selectedPaymentMethod] || selectedPaymentMethod;

    setPlacingOrder(true);
    try {
      await createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.qty,
          color: item.color,
          size: item.size,
        })),
        shippingAddress: {
          fullName: shippingAddress.fullName,
          contactNumber: shippingAddress.contactNumber,
          streetAddress: shippingAddress.streetAddress,
          locality: shippingAddress.locality,
          province: shippingAddress.province,
          city: shippingAddress.city,
          area: shippingAddress.area,
          addressNotes: shippingAddress.addressNotes,
        },
        paymentMethod: backendPaymentMethod,
      });
      showToast(commonToasts.orderPlaced());
      clearCart();
      navigate('/my-orders');
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Unable to place order right now.';
      showToast({
        type: 'error',
        title: 'Order failed',
        message,
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className={`px-0 pt-8 ${hasDetails ? 'pb-[90px]' : 'pb-[120px]'}`}>
          <div className="relative mx-auto" style={{ width: 343 }}>
            {!selectedPaymentMethod && (
              <div className="mb-6">
                <PaymentOrderSummary
                  showProceedButton={false}
                  subtotalLabel={`Subtotal (${items.length} items)`}
                  subtotalAmount={formatPKR(totals.subtotal)}
                  shippingAmount={formatPKR(totals.shipping)}
                />
              </div>
            )}
               {selectedPaymentMethod === 'bank-transfer' ? (
                 <div className="space-y-6">
                   <div className="text-[25px] font-medium text-black">Bank Transfer</div>
                   <BankTransferDetails />
                 </div>
               ) : selectedPaymentMethod === 'jazzcash' ? (
                 <div className="space-y-6">
                   <div className="text-[25px] font-medium text-black">Jazz Cash Transfer</div>
                   <JazzCashDetails />
                 </div>
               ) : selectedPaymentMethod === 'easypaisa' ? (
                 <div className="space-y-6">
                   <div className="text-[25px] font-medium text-black">Easypaisa Transfer</div>
                   <EasypaisaDetails />
                 </div>
               ) : selectedPaymentMethod === 'cod' ? (
                 <div className="space-y-6">
                   <div className="text-[25px] font-medium text-black">Cash on Delivery</div>
                   <CODDetails />
                 </div>
               ) : (
                 <PaymentMethodsGridMobile selected={selectedPaymentMethod} onSelect={handlePaymentMethodSelect} />
               )}
          </div>
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <main className={`px-32 pt-8 ${hasDetails ? 'pb-[120px]' : 'pb-[300px]'}`}>
          {/* Browse Categories - Desktop */}
          <div className="relative mb-8">
            <button 
              ref={browseButtonRef}
              onClick={() => setShowCategories(v => !v)} 
              className="inline-flex items-center space-x-2 text-[#2ECC71] font-bold text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Browse Categories</span>
            </button>
            {showCategories && (
              <div className="absolute z-50 mt-2" ref={categoriesDropdownRef}>
                <CategoryMenu />
              </div>
            )}
          </div>
            
          <div className="flex justify-center items-start gap-8 ">
            {/* Payment Methods - Left Side - 4 cards in a row */}
            <div className="flex flex-col gap-8">
              <PaymentMethodsGrid selected={selectedPaymentMethod} onSelect={handlePaymentMethodSelect} />
              {selectedPaymentMethod === 'bank-transfer' && (
                <BankTransferDetails />
              )}
              {selectedPaymentMethod === 'jazzcash' && (
                <JazzCashDetails />
              )}
              {selectedPaymentMethod === 'easypaisa' && (
                <EasypaisaDetails />
              )}
              {selectedPaymentMethod === 'cod' && (
                <CODDetails />
              )}
            </div>
            {/* Order Summary - Right Side */}
            <PaymentOrderSummary
              onProceed={handleProceedToPayment}
              className="w-[437px]"
              subtotalLabel={`Subtotal (${items.length} items)`}
              subtotalAmount={formatPKR(totals.subtotal)}
              shippingAmount={formatPKR(totals.shipping)}
              proceedLabel={placingOrder ? 'Placing order...' : 'Place Order'}
              proceedDisabled={placingOrder || loadingAddress}
            />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Payment;
