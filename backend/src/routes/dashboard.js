import { Router } from 'express';
import { getSellerDashboardOverview } from '../controllers/dashboardController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/seller/dashboard - fast overview for seller home
router.get('/seller/dashboard', requireAuth, requireRole('seller'), getSellerDashboardOverview);

export default router;


