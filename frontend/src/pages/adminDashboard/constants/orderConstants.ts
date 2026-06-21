// Constants for Admin Orders Dashboard
import { ADMIN_ROUTES, UI_STYLES, PAGE_SIZE, PAGINATION } from './adminSharedConstants';

// Re-export shared constants
export { ADMIN_ROUTES, UI_STYLES, PAGE_SIZE, PAGINATION };

// Order status badge styles
export const ORDER_STATUS_STYLES = {
  Completed: {
    bg: '#DCFCE7',
    color: '#008236',
    border: '#B9F8CF',
  },
  Paid: {
    bg: '#DBEAFE',
    color: '#1D4ED8',
    border: '#BFDBFE',
  },
  Pending: {
    bg: '#FEF9C2',
    color: '#A65F00',
    border: '#FFF085',
  },
  Cancelled: {
    bg: '#FFE2E2',
    color: '#C10007',
    border: '#FFC9C9',
  },
  default: {
    bg: '#F3F4F6',
    color: '#6B7280',
    border: '#E5E7EB',
  },
} as const;

// Escrow status badge styles
export const ESCROW_STATUS_STYLES = {
  Completed: {
    bg: '#DCFCE7',
    color: '#008236',
    border: '#B9F8CF',
  },
  'In Escrow': {
    bg: '#F3E8FF',
    color: '#7C3AED',
    border: '#E9D5FF',
  },
  Released: {
    bg: '#DBEAFE',
    color: '#1D4ED8',
    border: '#BFDBFE',
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
  BUYER: 'Buyer',
  SELLER: 'Seller',
  AMOUNT: 'Amount',
  STATUS: 'Status',
  ESCROW_STATUS: 'Escrow Status',
  ACTION: 'Action',
} as const;

// Action labels
export const ACTION_LABELS = {
  VIEW_DETAILS: 'View Details',
} as const;

// Search placeholder
export const SEARCH_PLACEHOLDER = 'Search by order ID, buyer, or seller...';

// Toast messages
export const TOAST_MESSAGES = {
  LOAD_ORDERS_ERROR: 'Failed to load orders. Please try again.',
} as const;

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
  NO_ORDERS: 'No orders found',
  NO_SEARCH_RESULTS: 'No orders found matching your search.',
} as const;

