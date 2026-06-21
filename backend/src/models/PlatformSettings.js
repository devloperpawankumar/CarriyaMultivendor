import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    platformCommissionPercent: { type: Number, default: 15, min: 0, max: 100 },
    escrowHoldDays: { type: Number, default: 7, min: 0, max: 60 },
    minimumWithdrawalAmount: { type: Number, default: 5000, min: 0, max: 10000000 },
    autoReleasePayouts: { type: Boolean, default: true },
    manualApprovalRequired: { type: Boolean, default: true },
    notifications: {
      newOrder: { type: Boolean, default: true },
      newSeller: { type: Boolean, default: true },
      paymentRelease: { type: Boolean, default: false },
      dispute: { type: Boolean, default: true },
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Single document model (we always keep exactly one)
export const PlatformSettings =
  mongoose.models.PlatformSettings || mongoose.model('PlatformSettings', platformSettingsSchema);

