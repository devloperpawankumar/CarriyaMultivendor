import mongoose from 'mongoose';

const sellerProductStatsSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    quantitySold: {
      type: Number,
      default: 0,
    },
    refundCount: {
      type: Number,
      default: 0,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast queries
sellerProductStatsSchema.index({ sellerId: 1, totalSales: -1 });
sellerProductStatsSchema.index({ sellerId: 1, productId: 1 }, { unique: true });
sellerProductStatsSchema.index({ sellerId: 1, quantitySold: -1 });

export const SellerProductStats = mongoose.models.SellerProductStats || mongoose.model('SellerProductStats', sellerProductStatsSchema);

