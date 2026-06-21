import { Router } from 'express';
import {
  getProductReviews,
  getSellerReviews,
  markReviewHelpful,
} from '../controllers/reviewsController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Get reviews for a product (public, no auth required)
router.get('/products/:productId/reviews', optionalAuth, getProductReviews);

// Get reviews for a seller (public, no auth required)
router.get('/sellers/:sellerId/reviews', optionalAuth, getSellerReviews);

// Mark review as helpful (requires auth)
router.post('/reviews/:reviewId/helpful', requireAuth, markReviewHelpful);

export default router;

