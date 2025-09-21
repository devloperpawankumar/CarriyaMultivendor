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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </CartProvider>
  );
}

export default App;
