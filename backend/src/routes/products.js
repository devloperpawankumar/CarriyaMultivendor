import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { 
  createProduct, 
  listSellerProducts, 
  getProduct, 
  updateProduct, 
  deleteProduct,
  listProducts 
} from '../controllers/productsController.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js';
import { getPublicSellerProfile } from '../controllers/sellerSettingsController.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// Use memory storage for direct Cloudinary streaming (matches onboarding flow)
// Increased limit to 100MB to support video uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for videos
});

const router = Router();

const catalogRateLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 120 });
const productDetailRateLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 90 });
const sellerProfileRateLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 60 });

// Public routes - Product catalog for buyers
router.get('/products', catalogRateLimiter, listProducts); // GET /api/products?page=1&category=electronics&search=laptop&sort=newest
router.get('/products/:productId', productDetailRateLimiter, optionalAuth, getProduct); // GET /api/products/:productId or /api/products/:slug
// Public seller profile
router.get('/sellers/:identifier/profile', sellerProfileRateLimiter, getPublicSellerProfile);

// Protected seller routes
router.post(
  '/products',
  requireAuth,
  requireRole('seller'),
  upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 5 }]),
  createProduct
);

router.get('/seller/products', requireAuth, requireRole('seller'), listSellerProducts);
// Seller-specific route to get their own product (including drafts)
router.get('/seller/products/:productId', requireAuth, requireRole('seller'), getProduct);

router.put(
  '/products/:productId',
  requireAuth,
  requireRole('seller'),
  upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 5 }]),
  updateProduct
);

router.delete('/products/:productId', requireAuth, requireRole('seller'), deleteProduct);

// Simple upload endpoint to Cloudinary for immediate client uploads
router.post(
  '/uploads',
  requireAuth,
  requireRole('seller'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: 'No file' });
      
      // Determine resource type based on MIME type
      const isVideo = file.mimetype && file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'auto'; // 'auto' will detect image/video automatically
      
      // With memoryStorage, file.buffer is available; fallback to path if needed
      if (file.buffer) {
        const { configureCloudinary, uploadBufferToCloudinary } = await import('../utils/cloudinary.js');
        configureCloudinary();
        const r = await uploadBufferToCloudinary(file.buffer, 'carriya/products', undefined, resourceType);
        return res.status(201).json({ url: r.secure_url, publicId: r.public_id });
      }
      const url = await uploadToCloudinary(file.path, 'products');
      return res.status(201).json({ url });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
