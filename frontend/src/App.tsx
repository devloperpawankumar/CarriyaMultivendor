import React, { Suspense, lazy } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';

const Home = lazy(() => import('./pages/Home'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const CheckoutReview = lazy(() => import('./pages/CheckoutReview'));
const Payment = lazy(() => import('./pages/Payment'));
const Signup = lazy(() => import('./pages/Signup'));
const SellerSignup = lazy(() => import('./pages/SellerSignup'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const WhatsAppOTPVerification = lazy(() => import('./pages/WhatsAppOTPVerification'));
const EmailVerificationPage = lazy(() => import('./pages/EmailVerificationPage'));
const SellerAddressSetup = lazy(() => import('./pages/SellerAddressSetup'));
const BusinessSetup = lazy(() => import('./pages/BusinessSetup'));
const BankVerification = lazy(() => import('./pages/BankVerification'));

function App() {
  return (
    <CartProvider>
      <div className="App">
        <Suspense fallback={<div className="p-8">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/review" element={<CheckoutReview />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/seller-signup" element={<SellerSignup />} />
            <Route path="/email-verification" element={<EmailVerification />} />
            <Route path="/whatsapp-otp-verification" element={<WhatsAppOTPVerification />} />
            <Route path="/email-verification-page" element={<EmailVerificationPage />} />
            <Route path="/seller-address-setup" element={<SellerAddressSetup />} />
            <Route path="/business-setup" element={<BusinessSetup />} />
            <Route path="/bank-verification" element={<BankVerification />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </CartProvider>
  );
}

export default App;
