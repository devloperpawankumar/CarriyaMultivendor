import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  getSellerSettings,
  updateSellerSettings,
  uploadStoreLogo,
  uploadStoreBanner,
  getPersonalInfo,
  updatePersonalInfo,
  getShippingInfo,
  updateShippingInfo,
} from '../controllers/sellerSettingsController.js';
import multer from 'multer';

// Use memory storage for Cloudinary uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

const router = Router();

// All routes require authentication and seller role
// Important: this router is mounted at `/api`, so middleware MUST be scoped
// or it will block unrelated routes like `/api/auth/login`.
router.use('/seller', requireAuth, requireRole('seller'));

// GET /api/seller/settings - Get seller settings
router.get('/seller/settings', getSellerSettings);

// PATCH /api/seller/settings - Update seller settings
router.patch('/seller/settings', updateSellerSettings);

// POST /api/seller/settings/upload-logo - Upload store logo
router.post('/seller/settings/upload-logo', upload.single('logo'), uploadStoreLogo);

// POST /api/seller/settings/upload-banner - Upload store banner
router.post('/seller/settings/upload-banner', upload.single('banner'), uploadStoreBanner);

// GET /api/seller/personal-info - Get personal information
router.get('/seller/personal-info', getPersonalInfo);

// PATCH /api/seller/personal-info - Update personal information
router.patch('/seller/personal-info', updatePersonalInfo);

// GET /api/seller/shipping-info - Get shipping/address information
router.get('/seller/shipping-info', getShippingInfo);

// PATCH /api/seller/shipping-info - Update shipping/address information
router.patch('/seller/shipping-info', updateShippingInfo);

export default router;

