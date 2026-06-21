import api from './api';

export interface BuyerSignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface BuyerSignupResponse {
  success: boolean;
  message: string;
  userId: string;
  email: string;
  phone: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
  userId: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  };
}

export interface RequestPhoneOtpData {
  phone: string;
  userId: string;
}

export interface VerifyPhoneOtpData {
  phone: string;
  code: string;
  userId: string;
}

export interface VerifyPhoneOtpResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  };
}

// Buyer signup with email/phone validation
export const buyerSignup = async (data: BuyerSignupData): Promise<BuyerSignupResponse> => {
  const response = await api.post<BuyerSignupResponse>('/api/auth/buyer/signup', data);
  return response;
};

// Verify buyer email OTP
export const verifyBuyerEmailOtp = async (data: VerifyEmailData): Promise<VerifyEmailResponse> => {
  const response = await api.post<VerifyEmailResponse>('/api/auth/buyer/verify-email', data);
  return response;
};

// Resend buyer email OTP
export const resendBuyerEmailOtp = async (email: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<{ success: boolean; message: string }>('/api/auth/buyer/request-otp', { email });
  return response;
};

// Check if email already exists
export const checkEmailExists = async (email: string): Promise<{ exists: boolean }> => {
  const response = await api.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
  return response as { exists: boolean };
};

// Check if phone already exists
export const checkPhoneExists = async (phone: string): Promise<{ exists: boolean }> => {
  const response = await api.get(`/api/auth/check-phone?phone=${encodeURIComponent(phone)}`);
  return response as { exists: boolean };
};

// Request SMS OTP for buyer phone verification
export const requestBuyerPhoneOtp = async (data: RequestPhoneOtpData): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<{ success: boolean; message: string }>('/api/auth/buyer/request-phone-otp', data);
  return response;
};

// Verify buyer phone OTP
export const verifyBuyerPhoneOtp = async (data: VerifyPhoneOtpData): Promise<VerifyPhoneOtpResponse> => {
  const response = await api.post<VerifyPhoneOtpResponse>('/api/auth/buyer/verify-phone-otp', data);
  return response;
};

// Resend buyer phone OTP
export const resendBuyerPhoneOtp = async (phone: string, userId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<{ success: boolean; message: string }>('/api/auth/buyer/resend-phone-otp', { phone, userId });
  return response;
};

// Google Sign-In: send Google ID token to backend and receive session cookie
export interface GoogleBuyerAuthResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: string;
    isEmailVerified?: boolean;
  };
}

export const googleBuyerSignIn = async (idToken: string): Promise<GoogleBuyerAuthResponse> => {
  return await api.post<GoogleBuyerAuthResponse>('/api/auth/buyer/google', { idToken });
};