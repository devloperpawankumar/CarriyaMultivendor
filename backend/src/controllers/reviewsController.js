import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { httpError } from '../middleware/errors.js';
import mongoose from 'mongoose';

// Get reviews for a product
export async function getProductReviews(req, res, next) {
  try {
    const { productId } = req.params;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const rating = req.query.rating ? Number(req.query.rating) : null;

    // Find product by ID or slug (support both)
    let product = null;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    } else {
      // Try to find by slug (only published active products for public access)
      product = await Product.findOne({ 
        isPublished: true,
        status: 'active',
        $or: [
          { slug: productId },
          { slugHistory: productId }
        ]
      });
    }

    if (!product) {
      return next(httpError(404, 'Product not found'));
    }

    const actualProductId = product._id;

    // Build query
    const query = {
      productId: actualProductId,
      status: 'approved', // Only show approved reviews
    };

    if (rating && rating >= 1 && rating <= 5) {
      query.productRating = rating;
    }

    // Get total count
    const total = await Review.countDocuments(query);

    // Get reviews
    const reviews = await Review.find(query)
      .populate('buyerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get product slug for public identifier
    const productSlug = product.slug || product._id.toString();

    res.json({
      success: true,
      reviews: reviews.map((review) => ({
        // Note: Review ID removed from public API (Daraz/Amazon style - reviews don't have public IDs)
        // Product ID replaced with slug (public identifier)
        productSlug: productSlug,
        productRating: review.productRating,
        productReview: review.productReview || undefined,
        buyer: {
          name: review.buyerName || 'Anonymous',
          // Note: buyer.id removed from public API (privacy - buyer IDs should never be exposed)
        },
        orderItem: review.orderItem || undefined,
        helpfulCount: review.helpfulCount || 0,
        createdAt: review.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error('Error fetching product reviews:', e);
    next(e);
  }
}

// Get reviews for a seller
export async function getSellerReviews(req, res, next) {
  try {
    const { sellerId } = req.params;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const rating = req.query.rating ? Number(req.query.rating) : null;

    // Validate sellerId
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return next(httpError(400, 'Invalid seller ID'));
    }

    // Build query
    const query = {
      sellerId: new mongoose.Types.ObjectId(sellerId),
      status: 'approved', // Only show approved reviews
    };

    if (rating && rating >= 1 && rating <= 5) {
      query.productRating = rating;
    }

    // Get total count
    const total = await Review.countDocuments(query);

    // Get reviews
    const reviews = await Review.find(query)
      .populate('productId', 'title slug thumbnailUrl')
      .populate('buyerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      reviews: reviews.map((review) => ({
        // Note: Review ID removed from public API (Daraz/Amazon style - reviews don't have public IDs)
        // Product ID replaced with slug (public identifier)
        productSlug: review.productId?.slug || review.productId?._id?.toString() || undefined,
        product: review.productId ? {
          title: review.productId.title,
          slug: review.productId.slug,
          thumbnailUrl: review.productId.thumbnailUrl,
        } : null,
        productRating: review.productRating,
        productReview: review.productReview,
        buyer: {
          name: review.buyerName || 'Anonymous',
          // Note: buyer.id removed from public API (privacy - buyer IDs should never be exposed)
        },
        helpfulCount: review.helpfulCount || 0,
        createdAt: review.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    next(e);
  }
}

// Mark review as helpful
export async function markReviewHelpful(req, res, next) {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(httpError(401, 'Unauthorized'));
    }

    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return next(httpError(400, 'Invalid review ID'));
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const reviewObjectId = new mongoose.Types.ObjectId(reviewId);

    // Find review
    const review = await Review.findById(reviewObjectId);
    if (!review) {
      return next(httpError(404, 'Review not found'));
    }

    // Check if user already marked as helpful
    const alreadyHelpful = review.helpfulUsers?.some(
      (id) => id.toString() === userId
    );

    if (alreadyHelpful) {
      // Remove helpful vote
      review.helpfulUsers = review.helpfulUsers.filter(
        (id) => id.toString() !== userId
      );
      review.helpfulCount = Math.max(0, (review.helpfulCount || 0) - 1);
    } else {
      // Add helpful vote
      if (!review.helpfulUsers) {
        review.helpfulUsers = [];
      }
      review.helpfulUsers.push(userObjectId);
      review.helpfulCount = (review.helpfulCount || 0) + 1;
    }

    await review.save();

    res.json({
      success: true,
      helpful: !alreadyHelpful,
      helpfulCount: review.helpfulCount,
    });
  } catch (e) {
    next(e);
  }
}

