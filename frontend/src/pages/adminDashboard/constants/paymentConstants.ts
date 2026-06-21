// Constants for Admin Payments Dashboard
import { ADMIN_ROUTES, UI_STYLES, PAGE_SIZE, PAGINATION } from './adminSharedConstants';

// Re-export shared constants
export { ADMIN_ROUTES, UI_STYLES, PAGE_SIZE, PAGINATION };

// Escrow status badge styles
export const ESCROW_STATUS_STYLES = {
  'In Escrow': {
    bg: '#F3E8FF',
    color: '#7C3AED',
    border: '#E9D5FF',
  },
  Released: {
    bg: '#DCFCE7',
    color: '#008236',
    border: '#B9F8CF',
  },
  Refunded: {
    bg: '#FEE2E2',
    color: '#DC2626',
    border: '#FECACA',
  },
  default: {
    bg: '#F3F4F6',
    color: '#6B7280',
    border: '#E5E7EB',
  },
} as const;

// Table columns
export const TABLE_COLUMNS = {
  ORDER_ID: 'Order ID',
  SELLER: 'Seller',
  AMOUNT: 'Amount',
  ESCROW_STATUS: 'Escrow Status',
  DAYS_HELD: 'Days Held',
  ACTION: 'Action',
} as const;

// Action labels
export const ACTION_LABELS = {
  RELEASE_PAYMENT: 'Release',
  VIEW_TRANSACTION: 'View Transaction',
} as const;

// Search placeholder
export const SEARCH_PLACEHOLDER = 'Search by order ID or seller...';

// Confirmation messages
export const CONFIRMATION_MESSAGES = {
  RELEASE_PAYMENT: 'Are you sure you want to release this payment?',
} as const;

// Toast messages
export const TOAST_MESSAGES = {
  PAYMENT_RELEASED_SUCCESS: 'Payment released successfully!',
  PAYMENT_RELEASED_ERROR: 'Failed to release payment. Please try again.',
  LOAD_PAYMENTS_ERROR: 'Failed to load payments. Please try again.',
} as const;

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
  NO_PAYMENTS: 'No payments found',
  NO_SEARCH_RESULTS: 'No payments found matching your search.',
} as const;

// Modal text
export const MODAL_TEXT = {
  TITLE: 'Release Payment',
  CONFIRM: 'Yes, Release',
  CANCEL: 'Cancel',
} as const;

