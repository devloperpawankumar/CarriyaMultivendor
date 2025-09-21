import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, CartTotals } from '../types/cart';
import { loadCart, saveCart, computeTotals } from '../services/cartService';

interface CartContextType {
  items: CartItem[];
  totals: CartTotals;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadCart();
    setItems(savedCart);
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    const id = `${newItem.title}-${newItem.color || 'default'}-${newItem.size || 'default'}`;
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === id
            ? { ...item, qty: item.qty + newItem.qty }
            : item
        );
      } else {
        return [...prevItems, { ...newItem, id }];
      }
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, qty: quantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.qty, 0);
  };

  const totals = computeTotals(items);

  const value: CartContextType = {
    items,
    totals,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
