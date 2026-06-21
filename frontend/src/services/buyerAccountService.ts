import api from './api';

export interface BuyerAccountInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface UpdateBuyerAccountPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/**
 * Get buyer account information
 */
export async function getBuyerAccount(): Promise<BuyerAccountInfo> {
  return api.get<BuyerAccountInfo>('/api/buyer/account');
}

/**
 * Update buyer account information
 */
export async function updateBuyerAccount(
  payload: UpdateBuyerAccountPayload
): Promise<BuyerAccountInfo> {
  return api.patch<BuyerAccountInfo>('/api/buyer/account', payload);
}

/**
 * Change buyer password
 */
export async function changeBuyerPassword(
  payload: ChangePasswordPayload
): Promise<{ success: boolean; message: string }> {
  return api.patch<{ success: boolean; message: string }>('/api/buyer/change-password', payload);
}


