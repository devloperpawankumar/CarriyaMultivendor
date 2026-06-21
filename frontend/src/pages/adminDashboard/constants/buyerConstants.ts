// Constants for Admin Buyer Dashboard
// Following the pattern from seller dashboard pages

import { AdminBuyer } from '../../../types/admin';

// Page configuration
export const PAGE_SIZE = 10;
export const DEFAULT_STATUS_FILTER = 'all';

// Status types
export type BuyerStatusFilter = 'all' | 'Active' | 'Pending' | 'Suspended';

// Menu navigation routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  BUYERS: '/admin/buyers',
  SELLERS: '/admin/sellers',
  ORDERS: '/admin/orders',
  PAYMENTS: '/admin/payments',
  SETTINGS: '/admin/settings',
} as const;

// Status badge styles (extracted from inline styles)
export const STATUS_STYLES = {
  Active: {
    bg: '#DCFCE7',
    border: '#B9F8CF',
    color: '#008236',
  },
  Pending: {
    bg: '#FEF9C2',
    border: '#FFF085',
    color: '#A65F00',
  },
  Suspended: {
    bg: '#FFE2E2',
    border: '#FFC9C9',
    color: '#C10007',
  },
  default: {
    bg: '#F3F4F6',
    border: '#E5E7EB',
    color: '#6B7280',
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
  USER_NAME: 'User Name',
  EMAIL: 'Email',
  STATUS: 'Status',
  JOINED_DATE: 'Joined Date',
  ACTIONS: 'Actions',
} as const;

// Action button labels
export const ACTION_LABELS = {
  APPROVE: 'Approve',
  BLOCK: 'Block',
  VIEW: 'View',
} as const;

// Confirmation messages
export const CONFIRMATION_MESSAGES = {
  BLOCK_BUYER: 'Are you sure you want to block this buyer?',
} as const;

// Toast messages
export const TOAST_MESSAGES = {
  BUYER_APPROVED_SUCCESS: 'Buyer approved successfully!',
  BUYER_BLOCKED_SUCCESS: 'Buyer blocked successfully!',
  BUYER_APPROVED_ERROR: 'Failed to approve buyer. Please try again.',
  BUYER_BLOCKED_ERROR: 'Failed to block buyer. Please try again.',
  LOAD_BUYERS_ERROR: 'Failed to load buyers. Please try again.',
} as const;

// Search placeholder
export const SEARCH_PLACEHOLDER = 'Search buyers by name or email...';

