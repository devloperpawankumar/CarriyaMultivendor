import { Router } from 'express';
import { 
  getBalanceOverview, 
  getPaymentsOverview,
  getEarnings, 
  getWithdrawals, 
  createWithdrawal,
  getAllWithdrawals,
  updateWithdrawalStatus
} from '../controllers/paymentsController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

const overviewRateLimit = rateLimit({
  windowMs: 30 * 1000,
  max: 12,
  perUser: true,
  message: 'Too many balance overview requests. Please slow down.',
});

const withdrawalReadRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  perUser: true,
  message: 'Too many withdrawal history requests. Please try again shortly.',
});

const withdrawalAttemptRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  perUser: true,
  message: 'Too many withdrawal attempts. Please wait before trying again.',
  skipSuccessfulRequests: false,
});

// Seller endpoints
// GET /api/payments/balance-overview
router.get('/payments/balance-overview', requireAuth, getBalanceOverview);

// GET /api/payments/overview (aggregate)
router.get('/payments/overview', requireAuth, overviewRateLimit, getPaymentsOverview);

// GET /api/payments/earnings
router.get('/payments/earnings', requireAuth, getEarnings);

// GET /api/payments/withdrawals
router.get('/payments/withdrawals', requireAuth, withdrawalReadRateLimit, getWithdrawals);

// POST /api/payments/withdrawals
router.post('/payments/withdrawals', requireAuth, withdrawalAttemptRateLimit, createWithdrawal);

// Admin endpoints for managing withdrawals
// GET /api/admin/withdrawals?status=pending&page=1&pageSize=20
router.get('/admin/withdrawals', requireAuth, requireRole('admin'), getAllWithdrawals);

// PATCH /api/admin/withdrawals/:requestId/status
router.patch('/admin/withdrawals/:requestId/status', requireAuth, requireRole('admin'), updateWithdrawalStatus);

export default router;


