// User-related types mirrored from backend Mongoose model `User`

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  _id: string;
  email?: string | null;
  phone?: string | null;

  passwordHash?: string | null;
  firstName?: string | null;
  lastName?: string | null;

  role: UserRole;

  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isActive: boolean;

  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

// Payloads used by the frontend when talking to auth endpoints
export interface CreateUserByEmailPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateUserByPhonePayload {
  phone: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginWithEmailPayload {
  email: string;
  password: string;
}

export interface LoginWithPhonePayload {
  phone: string;
  password: string;
}

export interface UpdateProfilePayload {
  firstName?: string | null;
  lastName?: string | null;
}

export interface AuthResponse {
  user: User;
  token: string; // JWT from backend
}


