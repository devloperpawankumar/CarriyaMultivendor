import { Router } from 'express';
import {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  getSellerOrdersOverview,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getSellerOrderStats,
  submitReview,
  checkOrderReview,
} from '../controllers/ordersController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Create new order (buyer)
router.post('/orders', requireAuth, createOrder);

// Get buyer's orders
router.get('/orders', requireAuth, getBuyerOrders);

// Get seller's orders (list only)
router.get('/seller/orders', requireAuth, requireRole('seller'), getSellerOrders);

// Combined list + stats for seller dashboard
router.get('/seller/orders/overview', requireAuth, requireRole('seller'), getSellerOrdersOverview);

// Get seller order stats (legacy)
router.get('/seller/orders/stats', requireAuth, requireRole('seller'), getSellerOrderStats);

// Get single order
router.get('/orders/:orderId', requireAuth, getOrder);

// Update order status (seller/admin)
router.patch('/orders/:orderId/status', requireAuth, requireRole('seller', 'admin'), updateOrderStatus);

// Cancel order (buyer)
router.post('/orders/:orderId/cancel', requireAuth, cancelOrder);

// Review endpoints
router.post('/orders/:orderId/review', requireAuth, submitReview);
router.get('/orders/:orderId/review', requireAuth, checkOrderReview);

export default router;

