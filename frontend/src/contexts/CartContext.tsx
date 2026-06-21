import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { CartItem, CartTotals } from '../types/cart';
import {
  loadCart,
  saveCart,
  computeTotals,
  fetchCart,
  addToCartAPI,
  updateCartItemAPI,
  removeCartItemAPI,
  clearCartAPI,
  mergeGuestCartAPI,
  apiCartItemToLocal,
} from '../services/cartService';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  totals: CartTotals;
  loading: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
  refreshCart: () => Promise<void>;
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
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => loadCart());
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const syncInProgressRef = useRef(false);
  const lastUserRef = useRef<string | null>(null);

  // Convert API cart to local format and update state
  const updateCartFromAPI = useCallback((apiCart: { items: any[] }) => {
    const localItems = apiCart.items.map(apiCartItemToLocal);
    setItems(localItems);
    saveCart(localItems); // Sync to localStorage
  }, []);

  // Fetch cart from API (Amazon/Daraz style - server-first)
  const refreshCart = useCallback(async () => {
    if (syncInProgressRef.current) return;
    
    syncInProgressRef.current = true;
    try {
      const apiCart = await fetchCart();
      updateCartFromAPI(apiCart);
    } catch (error: any) {
      // If offline or error, use localStorage fallback
      console.warn('Failed to fetch cart from API, using localStorage:', error);
      const localCart = loadCart();
      setItems(localCart);
    } finally {
      syncInProgressRef.current = false;
    }
  }, [updateCartFromAPI]);

  // Load cart on mount and when auth state changes
  useEffect(() => {
    let mounted = true;

    const initializeCart = async () => {
      setLoading(true);
      
      // First, load from localStorage for instant UI
      const localCart = loadCart();
      if (localCart.length > 0) {
        setItems(localCart);
      }

      try {
        // Then sync with server
        await refreshCart();
      } catch (error) {
        console.warn('Cart initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeCart();

    return () => {
      mounted = false;
    };
  }, []); // Only run on mount

  // Merge guest cart when user logs in (Amazon/Daraz style)
  useEffect(() => {
    const currentUserId = user?.email || null;
    const previousUserId = lastUserRef.current;

    // User just logged in (was null/guest, now has user)
    if (!previousUserId && currentUserId && isAuthenticated) {
      const mergeCart = async () => {
        try {
          const result = await mergeGuestCartAPI();
          if (result.merged) {
            // Refresh cart after merge
            await refreshCart();
          }
        } catch (error) {
          console.warn('Failed to merge guest cart:', error);
          // Still refresh to get user cart
          await refreshCart();
        }
      };

      mergeCart();
    }

    // Update last user ref
    lastUserRef.current = currentUserId;
  }, [user, isAuthenticated, refreshCart]);

  // Remove item (with API sync) - defined first to avoid circular dependency
  const removeItem = useCallback(async (id: string) => {
    // Optimistic update - get item before removing
    let itemToRemove: CartItem | undefined;
    setItems(prevItems => {
      itemToRemove = prevItems.find(item => item.id === id);
      return prevItems.filter(item => item.id !== id);
    });

    // Sync with API
    try {
      await removeCartItemAPI(id);
      await refreshCart();
    } catch (error: any) {
      if (!navigator.onLine || error.response?.status === 0) {
        setItems(prevItems => {
          saveCart(prevItems);
          return prevItems;
        });
      } else {
        // Revert on error
        if (itemToRemove) {
          setItems(prevItems => [...prevItems, itemToRemove!]);
        }
        await refreshCart();
        throw error;
      }
    }
  }, [refreshCart]);

  // Update quantity (with API sync)
  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    // Optimistic update
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, qty: quantity } : item
      )
    );

    // Sync with API
    try {
      await updateCartItemAPI(id, quantity);
      await refreshCart();
    } catch (error: any) {
      if (!navigator.onLine || error.response?.status === 0) {
        setItems(prevItems => {
          const updated = prevItems.map(item =>
            item.id === id ? { ...item, qty: quantity } : item
          );
          saveCart(updated);
          return updated;
        });
      } else {
        await refreshCart();
        throw error;
      }
    }
  }, [refreshCart, removeItem]);

  // Add item to cart (with API sync)
  const addItem = useCallback(async (newItem: Omit<CartItem, 'id'>) => {
    // Optimistic update
    setItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.productId === newItem.productId &&
                item.color === newItem.color &&
                item.size === newItem.size
      );
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === existingItem.id
            ? { ...item, qty: item.qty + newItem.qty }
            : item
        );
      } else {
        const tempId = `temp_${Date.now()}_${Math.random()}`;
        const tempItem: CartItem = { ...newItem, id: tempId };
        return [...prevItems, tempItem];
      }
    });

    // Sync with API
    try {
      await addToCartAPI(
        newItem.productId,
        newItem.qty,
        newItem.color,
        newItem.size
      );
      // Refresh cart to get server state
      await refreshCart();
    } catch (error: any) {
      // If offline, keep optimistic update and save to localStorage
      if (!navigator.onLine || error.response?.status === 0) {
        setItems(prevItems => {
          saveCart(prevItems);
          return prevItems;
        });
      } else {
        // Revert on error
        await refreshCart();
        throw error;
      }
    }
  }, [refreshCart]);

  // Clear cart (with API sync)
  const clearCart = useCallback(async () => {
    // Optimistic update
    setItems([]);

    // Sync with API
    try {
      await clearCartAPI();
      await refreshCart();
    } catch (error: any) {
      if (!navigator.onLine || error.response?.status === 0) {
        saveCart([]);
      } else {
        await refreshCart();
        throw error;
      }
    }
  }, [refreshCart]);

  // Save to localStorage whenever items change (but not on initial mount)
  useEffect(() => {
    if (isInitialized) {
      saveCart(items);
    }
  }, [items, isInitialized]);

  const getItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.qty, 0);
  }, [items]);

  const totals = computeTotals(items);

  const value: CartContextType = {
    items,
    totals,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
