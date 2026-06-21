import mongoose from 'mongoose';

const buyerAddressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    label: { type: String, trim: true, maxlength: 100 },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    contactNumber: { type: String, required: true, trim: true, maxlength: 30 },
    streetAddress: { type: String, required: true, trim: true, maxlength: 200 },
    locality: { type: String, required: true, trim: true, maxlength: 150 },
    province: { type: String, required: true, trim: true, maxlength: 100 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    area: { type: String, required: true, trim: true, maxlength: 120 },
    addressNotes: { type: String, trim: true, maxlength: 250 },
    isDefault: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

buyerAddressSchema.index({ userId: 1, isDefault: 1 });

export const BuyerAddress =
  mongoose.models.BuyerAddress || mongoose.model('BuyerAddress', buyerAddressSchema);


