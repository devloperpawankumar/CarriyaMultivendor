import mongoose from 'mongoose';

const settlementBatchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'noop', 'failed'],
      default: 'processing',
      index: true,
    },
    settledOrderCount: {
      type: Number,
      default: 0,
    },
    sellerCount: {
      type: Number,
      default: 0,
    },
    totalSettledAmount: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    error: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const SettlementBatch =
  mongoose.models.SettlementBatch || mongoose.model('SettlementBatch', settlementBatchSchema);


