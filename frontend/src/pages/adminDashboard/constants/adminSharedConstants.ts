// Shared constants across all admin dashboard pages
// This prevents duplication of common values

// Menu navigation routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  BUYERS: '/admin/buyers',
  SELLERS: '/admin/sellers',
  ORDERS: '/admin/orders',
  PAYMENTS: '/admin/payments',
  SETTINGS: '/admin/settings',
} as const;

// Common UI styling constants
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

// Page configuration
export const PAGE_SIZE = 10;

// Pagination settings
export const PAGINATION = {
  MAX_VISIBLE_PAGES: 5,
  MOBILE_BREAKPOINT: 500, // px
} as const;

