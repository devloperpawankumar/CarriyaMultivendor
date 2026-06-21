import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    // Order reference
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },

    // Product reference
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },

    // Seller reference
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Buyer reference
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Buyer information (snapshot at time of review)
    buyerName: {
      type: String,
      required: true,
    },

    // Product rating (required)
    productRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },

    // Product review text (optional)
    productReview: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    // Order item information (snapshot)
    orderItem: {
      title: String,
      color: String,
      size: String,
      quantity: Number,
    },

    // Review status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true,
    },

    // Helpfulness voting
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Users who marked as helpful (to prevent duplicate votes)
    helpfulUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],

    // Admin notes
    adminNotes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ buyerId: 1, orderId: 1 });
reviewSchema.index({ productId: 1, productRating: 1 });

// Ensure one review per order (unique constraint)
reviewSchema.index({ orderId: 1 }, { unique: true });

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

