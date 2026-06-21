/**
 * Admin Routes
 * Professional admin panel routes with proper authentication & authorization
 */

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  // Dashboard
  getDashboardOverview,
  
  // Buyers Management
  getBuyers,
  getBuyerDetails,
  blockBuyer,
  unblockBuyer,
  approveBuyer,
  
  // Sellers Management
  getSellers,
  getSellerDetails,
  approveSeller,
  suspendSeller,
  reactivateSeller,
  // Platform Settings
  getAdminSettings,
  updateAdminSettings,
  // Orders / Payments
  getAdminOrders,
  getAdminPayments,
  releaseAdminPayment,
} from '../controllers/adminController.js';

const router = Router();

// ============================================
// MIDDLEWARE: All routes require admin role
// ============================================
// Important: this router is mounted at `/api`, so middleware MUST be scoped
// or it will block unrelated routes like `/api/auth/login`.
router.use('/admin', requireAuth, requireRole('admin'));

// ============================================
// DASHBOARD
// ============================================

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard overview with stats
 * @access  Admin only
 */
router.get('/admin/dashboard', getDashboardOverview);

// ============================================
// BUYERS MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/buyers
 * @desc    Get paginated list of buyers with filters
 * @query   page, pageSize, status (active|pending|suspended), search
 * @access  Admin only
 */
router.get('/admin/buyers', getBuyers);

/**
 * @route   GET /api/admin/buyers/:id
 * @desc    Get single buyer details
 * @access  Admin only
 */
router.get('/admin/buyers/:id', getBuyerDetails);

/**
 * @route   POST /api/admin/buyers/:id/block
 * @desc    Block a buyer account
 * @access  Admin only
 */
router.post('/admin/buyers/:id/block', blockBuyer);

/**
 * @route   POST /api/admin/buyers/:id/unblock
 * @desc    Unblock a buyer account
 * @access  Admin only
 */
router.post('/admin/buyers/:id/unblock', unblockBuyer);

/**
 * @route   POST /api/admin/buyers/:id/approve
 * @desc    Approve a pending buyer
 * @access  Admin only
 */
router.post('/admin/buyers/:id/approve', approveBuyer);

// ============================================
// SELLERS MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/sellers
 * @desc    Get paginated list of sellers with filters
 * @query   page, pageSize, status (active|pending|suspended), search
 * @access  Admin only
 */
router.get('/admin/sellers', getSellers);

/**
 * @route   GET /api/admin/sellers/:id
 * @desc    Get single seller details with onboarding info
 * @access  Admin only
 */
router.get('/admin/sellers/:id', getSellerDetails);

/**
 * @route   POST /api/admin/sellers/:id/approve
 * @desc    Approve a pending seller
 * @access  Admin only
 */
router.post('/admin/sellers/:id/approve', approveSeller);

/**
 * @route   POST /api/admin/sellers/:id/suspend
 * @desc    Suspend a seller account
 * @body    reason (optional)
 * @access  Admin only
 */
router.post('/admin/sellers/:id/suspend', suspendSeller);

/**
 * @route   POST /api/admin/sellers/:id/reactivate
 * @desc    Reactivate a suspended seller
 * @access  Admin only
 */
router.post('/admin/sellers/:id/reactivate', reactivateSeller);

// ============================================
// PLATFORM SETTINGS
// ============================================

/**
 * @route   GET /api/admin/settings
 * @desc    Get platform settings
 * @access  Admin only
 */
router.get('/admin/settings', getAdminSettings);

/**
 * @route   PATCH /api/admin/settings
 * @desc    Update platform settings (partial)
 * @access  Admin only
 */
router.patch('/admin/settings', updateAdminSettings);

// ============================================
// ORDERS / PAYMENTS
// ============================================

/**
 * @route   GET /api/admin/orders
 * @desc    Admin orders list (filters supported)
 * @query   page, pageSize, search, status, escrowStatus, sellerId
 * @access  Admin only
 */
router.get('/admin/orders', getAdminOrders);

/**
 * @route   GET /api/admin/payments
 * @desc    Admin payments list (derived from orders/settlement)
 * @query   page, pageSize, search, escrowStatus, sellerId
 * @access  Admin only
 */
router.get('/admin/payments', getAdminPayments);

/**
 * @route   POST /api/admin/payments/:paymentId/release
 * @desc    Release seller payout from escrow
 * @access  Admin only
 */
router.post('/admin/payments/:paymentId/release', releaseAdminPayment);

export default router;
