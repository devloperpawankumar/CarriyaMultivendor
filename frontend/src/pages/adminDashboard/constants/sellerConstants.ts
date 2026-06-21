// Constants for Admin Seller Dashboard
// Following the same pattern as buyerConstants.ts

import { AdminSeller } from '../../../types/admin';

// Page configuration
export const PAGE_SIZE = 10;
export const DEFAULT_STATUS_FILTER = 'all';

// Status types
export type SellerStatusFilter = 'all' | 'Active' | 'Pending' | 'Suspended';

// Menu navigation routes (shared with buyers - could be extracted to common)
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  BUYERS: '/admin/buyers',
  SELLERS: '/admin/sellers',
  ORDERS: '/admin/orders',
  PAYMENTS: '/admin/payments',
  SETTINGS: '/admin/settings',
} as const;

// Status badge styles with fixed widths for seller statuses
export const STATUS_STYLES = {
  Active: {
    bg: '#DCFCE7',
    border: '#B9F8CF',
    color: '#008236',
    width: 63.466,
  },
  Pending: {
    bg: '#FEF9C2',
    border: '#FFF085',
    color: '#A65F00',
    width: 76.165,
  },
  Suspended: {
    bg: '#FFE2E2',
    border: '#FFC9C9',
    color: '#C10007',
    width: 94.389,
  },
  default: {
    bg: '#F3F4F6',
    border: '#E5E7EB',
    color: '#6B7280',
    width: 70,
  },
} as const;

// UI styling constants
export const UI_STYLES = {
  // Border widths
  BORDER_WIDTH: 0.909,
  
  // Font family
  FONT_FAMILY: 'Arimo, sans-serif',
  
  // Table dimensions
  TABLE_HEADER_HEIGHT: 56.42,
  TABLE_ROW_HEIGHT: 70.71,
  TABLE_MIN_WIDTH: 768,
  
  // Badge dimensions
  BADGE_HEIGHT: 29.801,
  BADGE_BORDER_WIDTH: 0.909,
  BADGE_MARGIN_LEFT: 11.99,
  
  // Button dimensions
  BUTTON_HEIGHT: 37.813,
  BUTTON_FONT_SIZE: 14,
  
  // Spacing
  CELL_MARGIN_LEFT: 23.99,
  
  // Search bar
  SEARCH_BAR_HEIGHT: 41.8,
  SEARCH_BAR_MAX_WIDTH: 539,
  SEARCH_BAR_BORDER_RADIUS: 10,
  
  // Card
  CARD_BORDER_RADIUS: 10,
} as const;

// Table column labels
export const TABLE_COLUMNS = {
  STORE_NAME: 'Store Name',
  OWNER_NAME: 'Owner Name',
  SELLER_STATUS: 'Seller Status',
  EMAIL: 'Email',
  COMMISSION: 'Commission %',
  ACTION: 'Action',
} as const;

// Action button labels
export const ACTION_LABELS = {
  VIEW_PROFILE: 'View Profile',
  APPROVE: 'Approve',
  SUSPEND: 'Suspend',
} as const;

// Confirmation messages
export const CONFIRMATION_MESSAGES = {
  APPROVE_SELLER: 'Are you sure you want to approve this seller?',
  SUSPEND_SELLER: 'Are you sure you want to suspend this seller?',
} as const;

// Toast messages
export const TOAST_MESSAGES = {
  SELLER_APPROVED_SUCCESS: 'Seller approved successfully!',
  SELLER_SUSPENDED_SUCCESS: 'Seller suspended successfully!',
  SELLER_APPROVED_ERROR: 'Failed to approve seller. Please try again.',
  SELLER_SUSPENDED_ERROR: 'Failed to suspend seller. Please try again.',
  LOAD_SELLERS_ERROR: 'Failed to load sellers. Please try again.',
} as const;

// Search placeholder
export const SEARCH_PLACEHOLDER = 'Search sellers by name or email...';

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
  NO_SELLERS: 'No sellers found',
  NO_SEARCH_RESULTS: 'No sellers found matching your search.',
} as const;

// Pagination settings
export const PAGINATION = {
  MAX_VISIBLE_PAGES: 5,
  MOBILE_BREAKPOINT: 500, // px - for showing page indicator vs page numbers
} as const;

