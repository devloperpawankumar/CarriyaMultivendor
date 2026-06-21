import api from './api';
import type {
  SubmitBasicInfoPayload,
  SubmitEmailPayload,
  SubmitAddressPayload,
  SubmitBusinessPayload,
  SubmitBankPayload,
  SellerOnboarding,
} from '../types/onboarding';

// Start or fetch onboarding by phone (after OTP is requested client-side)
export async function startOnboarding(payload: { phone: string }) {
  return api.post<SellerOnboarding>('/api/auth/seller/onboarding/start', payload);
}

// Generic upsert (legacy compatibility)
export async function upsertOnboarding(payload: any) {
  return api.post<SellerOnboarding>('/api/auth/seller/onboarding/upsert', payload);
}

export async function completeOnboarding(payload: { phone: string }) {
  return api.post('/api/auth/seller/onboarding/complete', payload);
}

// Step-specific calls
export async function submitBasicInfo(payload: SubmitBasicInfoPayload) {
  return api.post<SellerOnboarding>('/api/auth/seller/onboarding/submit-basic-info', payload);
}

export async function submitEmail(payload: SubmitEmailPayload) {
  return api.post<SellerOnboarding>('/api/auth/seller/onboarding/submit-email', payload);
}

export async function submitAddress(payload: SubmitAddressPayload) {
  return api.post<SellerOnboarding>('/api/auth/seller/onboarding/submit-address', payload);
}

export async function submitBusiness(payload: SubmitBusinessPayload) {
  return api.post<SellerOnboarding>('/api/auth/seller/onboarding/submit-business', payload);
}

export async function submitBank(payload: SubmitBankPayload) {
  return api.post<SellerOnboarding>('/api/auth/seller/onboarding/submit-bank', payload);
}

export async function getOnboardingStatus(userId: string) {
  return api.get<{ exists: boolean; currentStep: number; status: 'pending' | 'in_progress' | 'completed'; steps: any }>(`/api/seller/onboarding-status?userId=${encodeURIComponent(userId)}`);
}

export async function getOnboardingStatusByPhone(phone: string) {
  return api.get<{ exists: boolean; userId?: string; status?: string; currentStep?: number; steps?: any; completed?: boolean }>(`/api/seller/onboarding-status-by-phone?phone=${encodeURIComponent(phone)}`);
}

 

export async function uploadIdImagesAPI(front: File, back: File, apiBase?: string) {
  const API_BASE = apiBase || (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || 'http://localhost:4000';
  const form = new FormData();
  form.append('frontIdImage', front);
  form.append('backIdImage', back);
  const res = await fetch(`${API_BASE}/api/auth/seller/onboarding/upload-id`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to upload images');
  return res.json();
}

export async function uploadSingleImageAPI(file: File, apiBase?: string) {
  const API_BASE = apiBase || (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || 'http://localhost:4000';
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${API_BASE}/api/auth/seller/onboarding/upload-image`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to upload image');
  return res.json();
}

 


