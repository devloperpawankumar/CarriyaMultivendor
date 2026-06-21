import { CartItem, CartTotals } from '../types/cart';
import api from './api';

const STORAGE_KEY = 'carriya_cart_v1';

// ==================== LocalStorage Functions (Offline Fallback) ====================

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Failed to save cart to localStorage:', error);
  }
}

export function computeTotals(items: CartItem[]): CartTotals {
  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const shipping = 0;
  const discount = 0;
  const total = subtotal - discount + shipping;
  return { subtotal, shipping, discount, total };
}

// ==================== API Types ====================

export type ApiCartItem = {
  id: string; // Cart item ID (for update/delete operations)
  productId: string; // Public product identifier (slug) - Amazon/Daraz style, not raw ObjectId
  title: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  thumbnailUrl?: string;
  slug?: string; // Product slug (redundant with productId but kept for reference)
  stock?: number;
  unlimitedStock?: boolean;
  subtotal: number;
  shopName?: string;
};

export type ApiCartResponse = {
  items: ApiCartItem[];
  total: number;
  itemCount: number;
  updatedAt: string;
};

export type AddToCartResponse = {
  success: boolean;
  item: {
    id: string;
    productId: string;
    quantity: number;
    price: number;
  };
  cartTotal: number;
  itemCount: number;
};

export type UpdateCartResponse = {
  success: boolean;
  cartTotal: number;
  itemCount: number;
};

// ==================== API Functions (Amazon/Daraz Style) ====================

/**
 * Fetch cart from server (supports both authenticated and guest users)
 */
export async function fetchCart(): Promise<ApiCartResponse> {
  try {
    const response = await api.get<ApiCartResponse>('/api/cart');
    return response;
  } catch (error: any) {
    // If offline or error, fallback to localStorage
    if (error.response?.status === 0 || !navigator.onLine) {
      const localCart = loadCart();
      // Convert local cart to API format
      return {
        items: localCart.map(item => ({
          id: item.id,
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.qty,
          color: item.color,
          size: item.size,
          thumbnailUrl: item.image,
          subtotal: item.price * item.qty,
          shopName: item.shopName, // Preserve shopName from localStorage
        })),
        total: computeTotals(localCart).total,
        itemCount: localCart.reduce((sum, item) => sum + item.qty, 0),
        updatedAt: new Date().toISOString(),
      };
    }
    throw error;
  }
}

/**
 * Add item to cart via API
 */
export async function addToCartAPI(
  productId: string,
  quantity: number = 1,
  color?: string,
  size?: string
): Promise<AddToCartResponse> {
  try {
    const response = await api.post<AddToCartResponse>('/api/cart', {
      productId,
      quantity,
      color,
      size,
    });
    return response;
  } catch (error: any) {
    // If offline, we'll handle in CartContext
    throw error;
  }
}

/**
 * Update cart item quantity via API
 */
export async function updateCartItemAPI(
  itemId: string,
  quantity: number
): Promise<UpdateCartResponse> {
  try {
    const response = await api.patch<UpdateCartResponse>(`/api/cart/items/${itemId}`, {
      quantity,
    });
    return response;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Remove item from cart via API
 */
export async function removeCartItemAPI(itemId: string): Promise<UpdateCartResponse> {
  try {
    const response = await api.delete<UpdateCartResponse>(`/api/cart/items/${itemId}`);
    return response;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Clear cart via API
 */
export async function clearCartAPI(): Promise<{ success: boolean }> {
  try {
    const response = await api.delete<{ success: boolean }>('/api/cart');
    return response;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Merge guest cart into user cart (called on login)
 */
export async function mergeGuestCartAPI(): Promise<{
  success: boolean;
  merged: boolean;
  itemCount?: number;
  total?: number;
  message?: string;
}> {
  try {
    const response = await api.post<{
      success: boolean;
      merged: boolean;
      itemCount?: number;
      total?: number;
      message?: string;
    }>('/api/cart/merge');
    return response;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Convert API cart item to local cart item format
 */
export function apiCartItemToLocal(apiItem: ApiCartItem): CartItem {
  return {
    id: apiItem.id,
    productId: apiItem.productId,
    title: apiItem.title,
    image: apiItem.thumbnailUrl || '',
    price: apiItem.price,
    qty: apiItem.quantity,
    color: apiItem.color,
    size: apiItem.size,
    shopName: apiItem.shopName,
  };
}


