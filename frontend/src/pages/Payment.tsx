import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryMenu from '../components/CategoryMenu';
import PaymentOrderSummary from '../components/payment/PaymentOrderSummary';
import PaymentMethodsGrid from '../components/payment/PaymentMethodsGrid';
import PaymentMethodsGridMobile from '../components/payment/PaymentMethodsGridMobile';
import BankTransferDetails from '../components/payment/BankTransferDetails';
import JazzCashDetails from '../components/payment/JazzCashDetails';
import EasypaisaDetails from '../components/payment/EasypaisaDetails';
import CODDetails from '../components/payment/CODDetails';

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showCategories, setShowCategories] = useState(false);
  const hasDetails = selectedPaymentMethod === 'bank-transfer' || selectedPaymentMethod === 'jazzcash' || selectedPaymentMethod === 'easypaisa' || selectedPaymentMethod === 'cod';

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleProceedToPayment = () => {
    if (selectedPaymentMethod) {
      console.log('Processing payment with method:', selectedPaymentMethod);
      alert('Payment processed successfully!');
      navigate('/');
    } else {
      alert('Please select a payment method');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className={`px-0 pt-8 ${hasDetails ? 'pb-[80px]' : 'pb-[120px]'}`}>
          <div className="relative mx-auto" style={{ width: 343 }}>
            {!selectedPaymentMethod && (
              <div className="mb-6">
                <PaymentOrderSummary showProceedButton={false} />
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
              onClick={() => setShowCategories(v => !v)} 
              className="inline-flex items-center space-x-2 text-[#2ECC71] font-bold text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Browse Categories</span>
            </button>
            {showCategories && (
              <div className="absolute z-50 mt-2">
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
            <PaymentOrderSummary onProceed={handleProceedToPayment} className="w-[437px] h-[253px]" />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Payment;
