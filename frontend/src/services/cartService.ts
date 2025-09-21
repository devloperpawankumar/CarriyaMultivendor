import { CartItem, CartTotals } from '../types/cart';

const STORAGE_KEY = 'carriya_cart_v1';

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function computeTotals(items: CartItem[]): CartTotals {
  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const shipping = 0;
  const discount = 0;
  const total = subtotal - discount + shipping;
  return { subtotal, shipping, discount, total };
}


