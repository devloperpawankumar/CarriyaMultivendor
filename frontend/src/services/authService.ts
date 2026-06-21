import api from './api';

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface LoginResponse {
  // Note: Raw database ID removed from public API (Daraz/Amazon style - security best practice)
  // Backend uses user ID from JWT token internally, frontend doesn't need it
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

export async function requestSellerOtp(phone: string) {
  return api.post('/api/auth/seller/request-otp', { phone });
}

export async function verifySellerOtp(phone: string, code: string) {
  return api.post('/api/auth/seller/verify-otp', { phone, code });
}

export async function checkPhoneExists(phone: string): Promise<{ exists: boolean }> {
  return api.get(`/api/auth/check-phone?phone=${encodeURIComponent(phone)}`);
}

export async function buyerSignup(payload: { firstName: string; lastName: string; email: string; password: string; phone: string; }) {
  return api.post('/api/auth/signup', payload);
}

export async function buyerLogin(payload: { email: string; password: string; rememberMe?: boolean; }) {
  return api.post<LoginResponse>('/api/auth/login', payload);
}

export async function requestPasswordResetEmail(email: string, userType?: 'buyer' | 'seller') {
  return api.post<{ success: boolean }>('/api/auth/password/forgot', { email, userType });
}

export async function resetPasswordWithToken(payload: { token: string; newPassword: string; confirmPassword: string; }) {
  return api.post<{ success: boolean }>('/api/auth/password/reset', payload);
}

// Get current authenticated user
export async function getCurrentUser(): Promise<LoginResponse | null> {
  try {
    return await api.get<LoginResponse>('/api/auth/me');
  } catch {
    return null;
  }
}

// Logout user
export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout');
  } catch {
    // Ignore errors on logout
  } finally {
    // Clear local storage
    localStorage.removeItem('user');
  }
}


