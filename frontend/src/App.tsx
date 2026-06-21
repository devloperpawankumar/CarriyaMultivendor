import React, { Suspense, lazy, useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/routes/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import ToastContainer from './components/common/ToastContainer';

// Import test utilities in development
if (process.env.NODE_ENV === 'development') {
  import('./utils/testReduxSetup');
}

const Home = lazy(() => import('./pages/Home'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const CheckoutReview = lazy(() => import('./pages/CheckoutReview'));
const Payment = lazy(() => import('./pages/Payment'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const SellerSignup = lazy(() => import('./pages/SellerSignup'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const BuyerEmailVerification = lazy(() => import('./pages/BuyerEmailVerification'));
const BuyerPhoneVerification = lazy(() => import('./pages/BuyerPhoneVerification'));
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
const ManageReports = lazy(() => import('./pages/sellerDashboard/manageReports'));
const SellerSettings = lazy(() => import('./pages/sellerDashboard/settings/Settings'));
const AddProduct = lazy(() => import('./pages/sellerDashboard/manageProducts/AddProduct'));
const MyProducts = lazy(() => import('./pages/sellerDashboard/manageProducts/MyProducts'));
const EditDraft = lazy(() => import('./pages/sellerDashboard/manageProducts/EditDraft'));
const LowStock = lazy(() => import('./pages/sellerDashboard/manageProducts/LowStock'));
const RestockProduct = lazy(() => import('./pages/sellerDashboard/manageProducts/RestockProduct'));
const BlogPage = lazy(() => import('./pages/blogpage/BlogPage'));
const AboutUs = lazy(() => import('./pages/aboutus/AboutUs'));
const PrivacyPolicy = lazy(() => import('./pages/privacypolicy/PrivacyPolicy'));
const ReturnRefundPolicy = lazy(() => import('./pages/returnRefundPolicy/ReturnRefundPolicy'));
const ReturnRefundForm = lazy(() => import('./pages/returnRefundPolicy/ReturnRefundForm'));
const ContactUs = lazy(() => import('./pages/contactUs/ContactUs'));
const HelpSupport = lazy(() => import('./pages/helpSupport/HelpSupport'));
const SellerStore = lazy(() => import('./pages/SellerStore'));
const SellerNotificationsPage = lazy(
  () => import('./pages/sellerDashboard/notifications/SellerNotifications')
);
const MyOrders = lazy(() => import('./pages/MyOrders'));
const ManageAccount = lazy(() => import('./pages/ManageAccount'));
const AdminDashboard = lazy(() => import('./pages/adminDashboard'));
const AdminSellerDetails = lazy(() => import('./pages/adminDashboard/SellerDetails'));
const AdminBuyerDetails = lazy(() => import('./pages/adminDashboard/BuyerDetails'));
const AdminDashboardSettings = lazy(() => import('./pages/adminDashboard/AdminDashboardSettings'));
const AdminDashboardBuyers = lazy(() => import('./pages/adminDashboard/AdminDashboardBuyers'));
const AdminDashboardSellers = lazy(() => import('./pages/adminDashboard/AdminDashboardSellers'));
const AdminDashboardOrders = lazy(() => import('./pages/adminDashboard/AdminDashboardOrders'));
const AdminDashboardPayments = lazy(() => import('./pages/adminDashboard/AdminDashboardPayments'));
const AdminLogin = lazy(() => import('./pages/adminDashboard/AdminLogin'));

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <div className="App">
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <ScrollToTop />
              <ToastContainer />
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:productSlug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout/review"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <CheckoutReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-account"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <ManageAccount />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/seller-signup" element={<SellerSignup />} />
            <Route path="/email-verification" element={<EmailVerification />} />
            <Route path="/buyer-email-verification" element={<BuyerEmailVerification />} />
            <Route path="/buyer-phone-verification" element={<BuyerPhoneVerification />} />
            <Route path="/whatsapp-otp-verification" element={<WhatsAppOTPVerification />} />
            <Route path="/email-verification-page" element={<EmailVerificationPage />} />
            <Route path="/seller-address-setup" element={<SellerAddressSetup />} />
            <Route path="/business-setup" element={<BusinessSetup />} />
            <Route path="/bank-verification" element={<BankVerification />} />
            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/manage-products"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <ManageProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/manage-products/add-product"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/manage-products/edit/:productId"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/manage-products/my-products"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <MyProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/manage-products/edit-draft"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <EditDraft />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/manage-products/low-stock"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <LowStock />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/manage-products/restock/:productId"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <RestockProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/manage-orders/:status?/:orderId?"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <ManageOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/manage-payments"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <ManagePayments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/manage-reports"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <ManageReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/settings"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/settings/:tab"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerSettings />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* *******************Admin protected routes**************************** */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
                  <AdminDashboardSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
                  <AdminDashboardOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
                  <AdminDashboardPayments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sellers"
              element={
                <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
                  <AdminDashboardSellers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sellers/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
                  <AdminSellerDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/buyers"
              element={
                <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
                  <AdminDashboardBuyers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/buyers/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
                  <AdminBuyerDetails />
                </ProtectedRoute>
              }
            />

                      {/* *******************Admin protected routes**************************** */}

             {/* <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sellers/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSellerDetails />
                </ProtectedRoute>
              }
            /> */}

                  {/* *******************Admin protected routes**************************** */}


            <Route path="/blog" element={<BlogPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/return-refund-policy" element={<ReturnRefundPolicy />} />
            <Route path="/return-refund-form" element={<ReturnRefundForm />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/help-support" element={<HelpSupport />} />
            <Route
              path="/seller/notifications"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerNotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/seller/:sellerSlug" element={<SellerStore />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
            </Suspense>
          </div>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
