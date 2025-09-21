import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryMenu from '../components/CategoryMenu';
import CartHeader from '../components/cart/CartHeader';
import CartItemRow from '../components/cart/CartItemRow';
import OrderSummary from '../components/cart/OrderSummary';
import productImage from '../assets/images/Product/prodcut1.png';

const Cart: React.FC = () => {
  type CartItem = {
    id: string;
    title: string;
    image: string;
    price: number;
    compareAt?: number;
    color?: string;
    size?: string;
    qty: number;
  };

  const [items, setItems] = useState<CartItem[]>([
    { id: '1', title: 'Cotton Shirt Black', image: productImage, price: 1200, compareAt: 2000, color: 'Pink', size: 'M', qty: 1 },
    { id: '2', title: 'Cotton Shirt Blue', image: productImage, price: 1000, compareAt: 1800, color: 'Blue', size: 'L', qty: 2 },
  ]);
  const [showCategories, setShowCategories] = useState(false);
  const navigate = useNavigate();

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
    return { subtotal, shipping: 0, discount: 0, total: subtotal };
  }, [items]);

  const updateQty = (id: string, delta: number) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it));
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(it => it.id !== id));

  return (
    <div className="min-h-screen bg-white">
      <Header variant="simple" />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Browse Categories (hidden on mobile) */}
        <div className="relative mb-4 hidden md:block">
          <button onClick={() => setShowCategories(v => !v)} className="inline-flex items-center space-x-2 text-[#2ECC71] font-bold text-sm">
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
            onDeleteAll={() => setItems([])}
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
                shopName="My Shop"
                onIncrease={(id) => updateQty(id, +1)}
                onDecrease={(id) => updateQty(id, -1)}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Proceed to checkout button - positioned below cart items */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate('/checkout')}
              className="w-[140px] h-[26px] bg-[#2ECC71] text-white rounded-[5px] text-[13px] font-bold flex items-center justify-center"
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
            onDeleteAll={() => setItems([])}
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
                  shopName="My Shop"
                  onIncrease={(id) => updateQty(id, +1)}
                  onDecrease={(id) => updateQty(id, -1)}
                  onRemove={removeItem}
                />
              ))}
            </div>

            {/* Right column Order Summary (Frame 1000004160) */}
            <OrderSummary subtotal={totals.subtotal} shipping={totals.shipping} discount={totals.discount} total={totals.total} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;


