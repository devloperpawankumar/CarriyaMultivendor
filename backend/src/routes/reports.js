import { Router } from 'express';
import { getSellerReports } from '../controllers/reportsController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Get seller reports and analytics
router.get('/seller/reports', requireAuth, requireRole('seller'), getSellerReports);

export default router;

