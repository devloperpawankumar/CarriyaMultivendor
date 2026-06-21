import api from './api';

export interface SellerSettings {
  _id?: string; // Deprecated - removed for security (Daraz/Amazon style)
  sellerId?: string; // Deprecated - removed for security, use sellerCode instead (Daraz/Amazon style)
  sellerCode?: string; // Public identifier (Daraz/Amazon style)
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  storeBanner?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  shippingSettings?: {
    freeShippingThreshold?: number;
    defaultShippingCost?: number;
    estimatedDeliveryDays?: number;
    shippingZones?: Array<{
      zone: string;
      cost: number;
    }>;
  };
  notifications?: {
    emailNotifications?: boolean;
    orderNotifications?: boolean;
    productNotifications?: boolean;
    marketingEmails?: boolean;
  };
  storeTheme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSellerSettingsPayload {
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  storeBanner?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  shippingSettings?: {
    freeShippingThreshold?: number;
    defaultShippingCost?: number;
    estimatedDeliveryDays?: number;
    shippingZones?: Array<{
      zone: string;
      cost: number;
    }>;
  };
  notifications?: {
    emailNotifications?: boolean;
    orderNotifications?: boolean;
    productNotifications?: boolean;
    marketingEmails?: boolean;
  };
  storeTheme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export interface UploadImageResponse {
  url: string;
  publicId: string;
}

/**
 * Get seller settings
 */
export async function getSellerSettings(): Promise<SellerSettings> {
  return api.get<SellerSettings>('/api/seller/settings');
}

/**
 * Update seller settings
 */
export async function updateSellerSettings(
  payload: UpdateSellerSettingsPayload
): Promise<SellerSettings> {
  return api.patch<SellerSettings>('/api/seller/settings', payload);
}

/**
 * Upload store logo
 */
export async function uploadStoreLogo(file: File): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('logo', file);
  return api.post<UploadImageResponse>('/api/seller/settings/upload-logo', formData);
}

/**
 * Upload store banner
 */
export async function uploadStoreBanner(file: File): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('banner', file);
  return api.post<UploadImageResponse>('/api/seller/settings/upload-banner', formData);
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  storeName: string;
}

export interface UpdatePersonalInfoPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  storeName?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ShippingInfo {
  pickupAddress: string;
  pickupProvince: string;
  pickupDistrict: string;
  returnAddress: string;
  returnProvince: string;
  returnDistrict: string;
  sameAsPickup: boolean;
}

export interface UpdateShippingInfoPayload {
  pickupAddress?: string;
  pickupProvince?: string;
  pickupDistrict?: string;
  returnAddress?: string;
  returnProvince?: string;
  returnDistrict?: string;
  sameAsPickup?: boolean;
}

/**
 * Get seller personal information
 */
export async function getPersonalInfo(): Promise<PersonalInfo> {
  return api.get<PersonalInfo>('/api/seller/personal-info');
}

/**
 * Update seller personal information
 */
export async function updatePersonalInfo(
  payload: UpdatePersonalInfoPayload
): Promise<PersonalInfo> {
  return api.patch<PersonalInfo>('/api/seller/personal-info', payload);
}

/**
 * Get seller shipping/address information
 */
export async function getShippingInfo(): Promise<ShippingInfo> {
  return api.get<ShippingInfo>('/api/seller/shipping-info');
}

/**
 * Update seller shipping/address information
 */
export async function updateShippingInfo(
  payload: UpdateShippingInfoPayload
): Promise<ShippingInfo> {
  return api.patch<ShippingInfo>('/api/seller/shipping-info', payload);
}

// Public profile for store page (no auth)
export type PublicSellerProfile = {
  sellerCode?: string; // Public seller code (Daraz/Amazon style) - replaces raw sellerId
  storeSlug?: string;
  storeName: string;
  storeDescription?: string;
  storeLogo?: string;
  storeBanner?: string;
  isActive?: boolean;
  sellerName?: string;
  // Note: sellerId removed from public API (Daraz/Amazon style - only public codes exposed)
};

export async function getPublicSellerProfile(identifier: string): Promise<PublicSellerProfile> {
  return api.get<PublicSellerProfile>(`/api/sellers/${identifier}/profile`);
}

