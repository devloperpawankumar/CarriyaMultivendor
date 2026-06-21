// Types mirrored from backend Mongoose model `SellerOnboarding`

export type OnboardingOverallStatus = 'pending' | 'in_progress' | 'completed';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface SellerOnboardingAddress {
  pickupAddress?: string | null;
  pickupProvince?: string | null;
  pickupDistrict?: string | null;
  returnAddress?: string | null;
  returnProvince?: string | null;
  returnDistrict?: string | null;
  sameAsPickup?: boolean;
}

export interface SellerOnboardingBusiness {
  idCardName: string;
  idCardNumber: string;
  idCardFrontUrl: string; // Cloudinary URL
  idCardBackUrl: string;  // Cloudinary URL
  verificationStatus: VerificationStatus;
  verifiedAt?: string | null; // ISO date
}

export interface SellerOnboardingBank {
  accountHolderName: string;
  accountNumber: string;
  ibanNumber?: string | null;
  bankName: string;
  branchCode?: string | null;
  bankDocumentUrl: string; // Cloudinary URL
  verificationStatus: VerificationStatus;
  verifiedAt?: string | null; // ISO date
}

export interface SellerOnboardingBasicInfo {
  firstName?: string | null;
  lastName?: string | null;
  passwordHash?: string | null;
}

export interface SellerOnboarding {
  _id: string;
  userId: string; // ObjectId string referencing User

  currentStep: number; // 1..6

  // Step 1
  phone: string;
  otp?: string | null;
  otpExpiry?: string | null; // ISO date
  isOtpVerified: boolean;

  // Step 2
  basicInfo?: SellerOnboardingBasicInfo | null;

  // Step 3
  email?: string | null;
  isEmailVerified: boolean;

  // Step 4
  address?: SellerOnboardingAddress | null;

  // Step 5
  business?: SellerOnboardingBusiness | null;

  // Step 6
  bank?: SellerOnboardingBank | null;

  status: OnboardingOverallStatus;
  expiresAt?: string | null; // ISO date

  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

// Step payload DTOs your frontend can send to backend
export interface StartOtpPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface SubmitBasicInfoPayload {
  userId: string;
  firstName: string;
  lastName: string;
  password: string; // plaintext password to be hashed by backend
}

export interface SubmitEmailPayload {
  userId: string;
  email: string;
}

export interface VerifyEmailPayload {
  userId: string;
  emailOtp: string;
}

export interface SubmitAddressPayload {
  userId: string;
  address: SellerOnboardingAddress;
}

export interface SubmitBusinessPayload {
  userId: string;
  idCardName: string;
  idCardNumber: string;
  idCardFrontUrl: string;
  idCardBackUrl: string;
}

export interface SubmitBankPayload {
  userId: string;
  accountHolderName: string;
  accountNumber: string;
  ibanNumber?: string;
  bankName: string;
  branchCode?: string;
  bankDocumentUrl: string;
}


