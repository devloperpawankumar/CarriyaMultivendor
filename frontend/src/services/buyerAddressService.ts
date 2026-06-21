import api from './api';

export interface BuyerAddress {
  addressId: string;
  fullName: string;
  contactNumber: string;
  streetAddress: string;
  locality: string;
  province: string;
  city: string;
  area: string;
  addressNotes: string;
  label?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressPayload {
  label?: string;
  fullName: string;
  contactNumber: string;
  streetAddress: string;
  locality: string;
  province: string;
  city: string;
  area: string;
  addressNotes: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayload extends CreateAddressPayload {
  isDefault?: boolean;
}

/**
 * Get all buyer addresses
 */
export async function getBuyerAddresses(): Promise<BuyerAddress[]> {
  return api.get<BuyerAddress[]>('/api/buyer/addresses');
}

/**
 * Create a new address
 */
export async function createBuyerAddress(
  payload: CreateAddressPayload
): Promise<BuyerAddress> {
  return api.post<BuyerAddress>('/api/buyer/addresses', payload);
}

/**
 * Update an address
 */
export async function updateBuyerAddress(
  addressId: string,
  payload: UpdateAddressPayload
): Promise<BuyerAddress> {
  return api.patch<BuyerAddress>(`/api/buyer/addresses/${addressId}`, payload);
}

/**
 * Delete an address
 */
export async function deleteBuyerAddress(addressId: string): Promise<{ success: boolean; message: string }> {
  return api.delete<{ success: boolean; message: string }>(`/api/buyer/addresses/${addressId}`);
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(addressId: string): Promise<BuyerAddress> {
  return api.patch<BuyerAddress>(`/api/buyer/addresses/${addressId}/set-default`);
}


