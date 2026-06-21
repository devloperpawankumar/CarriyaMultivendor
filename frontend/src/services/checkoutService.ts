
import api from './api';

const STORAGE_NAMESPACE = 'carriya_checkout_buyer';

function buildStorageKey(userId?: string | null) {
  return userId ? `${STORAGE_NAMESPACE}_${userId}` : `${STORAGE_NAMESPACE}_guest`;
}

let currentStorageKey = buildStorageKey();

export type BuyerInfo = {
  fullName: string;
  contactNumber: string;
  streetAddress: string;
  locality: string;
  province: string;
  city: string;
  area: string;
  addressNotes: string;
};


export function setBuyerStorageContext(userId?: string | null) {
  currentStorageKey = buildStorageKey(userId);
}

export function clearBuyerInfoStorage() {
  try {
    localStorage.removeItem(currentStorageKey);
  } catch {
    // ignore
  }
}

export function loadBuyerInfo(): BuyerInfo | null {
  try {
    const raw = localStorage.getItem(currentStorageKey);
    return raw ? (JSON.parse(raw) as BuyerInfo) : null;
  } catch {
    return null;
  }
}

export function saveBuyerInfo(info: BuyerInfo): void {
  localStorage.setItem(currentStorageKey, JSON.stringify(info));
}

export const emptyBuyerInfo: BuyerInfo = {
  fullName: '',
  contactNumber: '',
  streetAddress: '',
  locality: '',
  province: '',
  city: '',
  area: '',
  addressNotes: '',
};

type BuyerAddressRecord = BuyerInfo & {
  // Note: Raw database IDs (_id, userId) removed from public API (Daraz/Amazon style)
  label?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function mapRecordToBuyerInfo(record?: BuyerAddressRecord | null): BuyerInfo | null {
  if (!record) return null;
  return {
    fullName: record.fullName || '',
    contactNumber: record.contactNumber || '',
    streetAddress: record.streetAddress || '',
    locality: record.locality || '',
    province: record.province || '',
    city: record.city || '',
    area: record.area || '',
    addressNotes: record.addressNotes || '',
  };
}

export async function fetchBuyerInfoFromApi(): Promise<BuyerInfo | null> {
  try {
    const record = await api.get<BuyerAddressRecord | null>('/api/buyer/shipping-address');
    return mapRecordToBuyerInfo(record);
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      return null;
    }
    throw error;
  }
}

export async function saveBuyerInfoToApi(info: BuyerInfo): Promise<BuyerInfo> {
  const payload = {
    ...info,
  };
  const record = await api.put<BuyerAddressRecord>('/api/buyer/shipping-address', payload);
  return mapRecordToBuyerInfo(record) ?? info;
}


