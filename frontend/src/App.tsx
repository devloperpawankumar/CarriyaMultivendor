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
const Favorites = lazy(() => import('./pages/Favorites'));
const SellerDashboard = lazy(() => import('./pages/sellerDashboard'));
const ManageProducts = lazy(() => import('./pages/sellerDashboard/manageProducts/ManageProducts'));
const ManageOrders = lazy(() => import('./pages/sellerDashboard/manageOrders'));
const ManagePayments = lazy(() => import('./pages/sellerDashboard/managePayments/ManagePayments'));
const ManageReports = lazy(() => import('./pages/sellerDashboard/ManageReports'));
const SellerSettings = lazy(() => import('./pages/sellerDashboard/Settings'));
const AddProduct = lazy(() => import('./pages/sellerDashboard/manageProducts/AddProduct'));
const MyProducts = lazy(() => import('./pages/sellerDashboard/manageProducts/MyProducts'));
const EditDraft = lazy(() => import('./pages/sellerDashboard/manageProducts/EditDraft'));
const LowStock = lazy(() => import('./pages/sellerDashboard/manageProducts/LowStock'));
const RestockProduct = lazy(() => import('./pages/sellerDashboard/manageProducts/RestockProduct'));

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
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/seller-signup" element={<SellerSignup />} />
            <Route path="/email-verification" element={<EmailVerification />} />
            <Route path="/whatsapp-otp-verification" element={<WhatsAppOTPVerification />} />
            <Route path="/email-verification-page" element={<EmailVerificationPage />} />
            <Route path="/seller-address-setup" element={<SellerAddressSetup />} />
            <Route path="/business-setup" element={<BusinessSetup />} />
            <Route path="/bank-verification" element={<BankVerification />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/manage-products" element={<ManageProducts />} />
            <Route path="/seller/manage-products/add-product" element={<AddProduct />} />
            <Route path="/seller/manage-products/my-products" element={<MyProducts />} />
            <Route path="/seller/manage-products/edit-draft" element={<EditDraft />} />
            <Route path="/seller/manage-products/low-stock" element={<LowStock />} />
            <Route path="/seller/manage-products/restock-product/:productId" element={<RestockProduct />} />
            <Route path="/seller/manage-orders" element={<ManageOrders />} />
            <Route path="/seller/manage-payments" element={<ManagePayments />} />
            <Route path="/seller/manage-reports" element={<ManageReports />} />
            <Route path="/seller/settings" element={<SellerSettings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </CartProvider>
  );
}

export default App;
