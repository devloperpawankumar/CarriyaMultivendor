import mongoose from 'mongoose';

const sellerDailyStatsSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
    refundCount: {
      type: Number,
      default: 0,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    newCustomers: {
      type: Number,
      default: 0,
    },
    // Store unique customer IDs for this day (for new customer calculation)
    customerIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries
sellerDailyStatsSchema.index({ sellerId: 1, date: -1 });
// Unique constraint: one record per seller per day
sellerDailyStatsSchema.index({ sellerId: 1, date: 1 }, { unique: true });

export const SellerDailyStats = mongoose.models.SellerDailyStats || mongoose.model('SellerDailyStats', sellerDailyStatsSchema);

