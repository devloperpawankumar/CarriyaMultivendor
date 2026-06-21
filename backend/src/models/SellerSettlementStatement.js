import mongoose from 'mongoose';

const orderSummarySchema = new mongoose.Schema(
  {
    orderId: String,
    orderNumber: String,
    amount: Number,
    deliveredAt: Date,
  },
  { _id: false }
);

const sellerSettlementStatementSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SettlementBatch',
      index: true,
      required: true,
    },
    batchIdentifier: {
      type: String,
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    orders: {
      type: [orderSummarySchema],
      default: [],
    },
    notificationStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    notifiedAt: {
      type: Date,
    },
    notificationError: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

sellerSettlementStatementSchema.index({ sellerId: 1, batchIdentifier: 1 }, { unique: true });

export const SellerSettlementStatement =
  mongoose.models.SellerSettlementStatement ||
  mongoose.model('SellerSettlementStatement', sellerSettlementStatementSchema);


