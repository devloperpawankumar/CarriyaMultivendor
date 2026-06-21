import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryMenu from '../components/CategoryMenu';
import CartHeader from '../components/cart/CartHeader';
import CartItemRow from '../components/cart/CartItemRow';
import OrderSummary from '../components/cart/OrderSummary';
import { useCart } from '../contexts/CartContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { useToast } from '../contexts/ToastContext';

const Cart: React.FC = () => {
  const { items, totals, updateQuantity, removeItem, clearCart } = useCart();
  const { showToast } = useToast();
  const [showCategories, setShowCategories] = useState(false);
  const browseButtonRef = useRef<HTMLButtonElement | null>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Error handler for cart operations (Amazon/Daraz style - stock issues are warnings, not errors)
  const handleCartError = (error: any) => {
    const backendMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          'Operation failed. Please try again.';
    const lowerMessage = backendMessage.toLowerCase();
    
    // Stock-related issues should be warnings (informational), not errors
    if (lowerMessage.includes('insufficient stock') || 
        lowerMessage.includes('stock') || 
        lowerMessage.includes('available')) {
      showToast({ 
        type: 'warning', 
        title: 'Stock Limit', 
        message: backendMessage 
      });
    } else if (lowerMessage.includes('not available') || 
               lowerMessage.includes('unavailable')) {
      showToast({ 
        type: 'warning', 
        title: 'Product Unavailable', 
        message: backendMessage 
      });
    } else {
      // Real errors (network issues, server errors, etc.)
      showToast({ 
        type: 'error', 
        title: 'Error', 
        message: backendMessage 
      });
    }
  };

  useClickOutside(() => setShowCategories(false), {
    enabled: showCategories,
    include: [browseButtonRef, categoriesDropdownRef],
    escapeCloses: true,
    eventType: 'mousedown',
  });

  return (
    <div className="min-h-screen bg-white">
      <Header variant="simple" />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Browse Categories (hidden on mobile) */}
        <div className="relative mb-4 hidden md:block">
          <button ref={browseButtonRef} onClick={() => setShowCategories(v => !v)} className="inline-flex items-center space-x-2 text-[#2ECC71] font-bold text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4 6h18M4 12h18M4 18h18" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Browse Categories</span>
          </button>
          {showCategories && (
            <div className="absolute z-50 mt-2" ref={categoriesDropdownRef}>
              <CategoryMenu />
            </div>
          )}
        </div>

        {/* Mobile Layout: Order Summary first, then cart items */}
        <div className="md:hidden space-y-4">
          {/* Order Summary at top for mobile */}
          <OrderSummary subtotal={totals.subtotal} shipping={totals.shipping} discount={totals.discount} total={totals.total} />
          
          {/* Cart Header for mobile */}
          <CartHeader
            count={items.length}
            onSelectAll={() => {
              // Example: no-op now; integrate with selection state later
            }}
            onDeleteAll={() => clearCart().catch(handleCartError)}
          />

          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((it) => (
              <CartItemRow
                key={it.id}
                id={it.id}
                title={it.title}
                image={it.image}
                price={it.price}
                compareAt={it.compareAt}
                color={it.color}
                size={it.size}
                qty={it.qty}
                shopName={it.shopName || "Store"}
                onIncrease={(id) => updateQuantity(id, it.qty + 1).catch(handleCartError)}
                onDecrease={(id) => updateQuantity(id, it.qty - 1).catch(handleCartError)}
                onRemove={(id) => removeItem(id).catch(handleCartError)}
              />
            ))}
          </div>

          {/* Proceed to checkout button - positioned below cart items */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate('/checkout')}
              className="w-[170px] h-[35px] bg-[#2ECC71] text-white rounded-[5px] text-[15px] font-bold flex items-center justify-center"
            >
              Proceed to checkout
            </button>
          </div>
        </div>

        {/* Desktop Layout: Cart Header, then items and order summary side by side */}
        <div className="hidden md:block">
          <CartHeader
            count={items.length}
            onSelectAll={() => {
              // Example: no-op now; integrate with selection state later
            }}
            onDeleteAll={() => clearCart().catch(handleCartError)}
          />

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left column fixed width 793 for items list */}
            <div className="flex-1 max-w-[793px] space-y-4">
              {items.map((it) => (
                <CartItemRow
                  key={it.id}
                  id={it.id}
                  title={it.title}
                  image={it.image}
                  price={it.price}
                  compareAt={it.compareAt}
                  color={it.color}
                  size={it.size}
                  qty={it.qty}
                  shopName={it.shopName || "Store"}
                  onIncrease={(id) => updateQuantity(id, it.qty + 1).catch(handleCartError)}
                  onDecrease={(id) => updateQuantity(id, it.qty - 1).catch(handleCartError)}
                  onRemove={(id) => removeItem(id).catch(handleCartError)}
                />
              ))}
            </div>

            {/* Right column Order Summary  */}
            <OrderSummary subtotal={totals.subtotal} shipping={totals.shipping} discount={totals.discount} total={totals.total} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;