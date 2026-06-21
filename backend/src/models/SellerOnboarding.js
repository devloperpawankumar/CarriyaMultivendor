import mongoose from 'mongoose';

const sellerOnboardingSchema = new mongoose.Schema(
  {
    // 🔗 Linked user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // 🧭 Track progress across steps
    currentStep: {
      type: Number,
      default: 1, // 1: OTP → 2: Basic Info → 3: Email → 4: Address → 5: ID → 6: Bank
    },

    // ✅ Step 1: OTP Verification
    phone: { type: String, required: true, index: true, unique: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    isOtpVerified: { type: Boolean, default: false },

    // ✅ Step 2: Basic Info
    basicInfo: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      passwordHash: { type: String },
    },

    // ✅ Step 3: Email Verification
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    isEmailVerified: { type: Boolean, default: false },

    // ✅ Step 4: Address Setup
    address: {
      pickupAddress: { type: String, trim: true },
      pickupProvince: { type: String, trim: true },
      pickupDistrict: { type: String, trim: true },
      returnAddress: { type: String, trim: true },
      returnProvince: { type: String, trim: true },
      returnDistrict: { type: String, trim: true },
      sameAsPickup: { type: Boolean, default: false },
    },

    // ✅ Step 5: ID (KYC) Verification
    business: {
      idCardName: { type: String, trim: true },
      idCardNumber: { type: String, trim: true, unique: true, sparse: true },
      idCardFrontUrl: { type: String, trim: true }, // Cloudinary URL
      idCardBackUrl: { type: String, trim: true },  // Cloudinary URL
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
      verifiedAt: { type: Date },
    },

    // ✅ Step 6: Bank Verification
    bank: {
      accountHolderName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ibanNumber: { type: String, trim: true },
      bankName: { type: String, trim: true },
      branchCode: { type: String, trim: true },
      bankDocumentUrl: { type: String, trim: true }, // Cloudinary URL
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
      verifiedAt: { type: Date },
    },

    // 🌐 Overall Onboarding Status
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const SellerOnboarding =
  mongoose.models.SellerOnboarding ||
  mongoose.model('SellerOnboarding', sellerOnboardingSchema);
