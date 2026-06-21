// Utility functions for Admin Orders Dashboard
import { ORDER_STATUS_STYLES, ESCROW_STATUS_STYLES } from '../constants/orderConstants';
import { getStatusStyle as getStyle } from './adminSharedUtils';

export * from './adminSharedUtils';

/**
 * Get order status badge style
 * @param status - The order status
 * @returns Style object with background, border, and color
 */
export const getOrderStatusStyle = (status: string) => {
  return getStyle(status, ORDER_STATUS_STYLES);
};

/**
 * Get escrow status badge style
 * @param status - The escrow status
 * @returns Style object with background, border, and color
 */
export const getEscrowStatusStyle = (status: string) => {
  return getStyle(status, ESCROW_STATUS_STYLES);
};

/**
 * Build query parameters for orders API request
 * @param currentPage - Current page number
 * @param pageSize - Number of items per page
 * @param searchQuery - Search query string
 * @returns Query parameters object
 */
export const buildOrdersQueryParams = (
  currentPage: number,
  pageSize: number,
  searchQuery: string
) => {
  return {
    page: currentPage,
    pageSize: pageSize,
    search: searchQuery || undefined,
  };
};

