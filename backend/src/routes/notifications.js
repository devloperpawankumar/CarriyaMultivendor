import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  getSellerNotifications,
  markSellerNotificationRead,
  markAllSellerNotificationsRead,
} from '../controllers/sellerNotificationsController.js';

const router = Router();

// Important: this router is mounted at `/api`, so middleware MUST be scoped
// or it will block unrelated routes like `/api/auth/login`.
router.use('/seller', requireAuth, requireRole('seller'));

router.get('/seller/notifications', getSellerNotifications);
router.post('/seller/notifications/mark-read', markSellerNotificationRead);
router.post('/seller/notifications/mark-all-read', markAllSellerNotificationsRead);

export default router;




