import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeGuestCart,
} from '../controllers/cartController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();

// Cart routes support both authenticated and guest users (Amazon/Daraz style)
router.get('/cart', optionalAuth, getCart);
router.post('/cart', optionalAuth, addToCart);
router.patch('/cart/items/:itemId', optionalAuth, updateCartItem);
router.delete('/cart/items/:itemId', optionalAuth, removeFromCart);
router.delete('/cart', optionalAuth, clearCart);

// Merge guest cart into user cart (requires authentication)
router.post('/cart/merge', requireAuth, mergeGuestCart);

export default router;

