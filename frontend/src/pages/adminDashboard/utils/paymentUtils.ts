// Utility functions for Admin Payments Dashboard
import { AdminPayment } from '../../../types/admin';
import { ESCROW_STATUS_STYLES } from '../constants/paymentConstants';
import { getStatusStyle as getStyle } from './adminSharedUtils';

export * from './adminSharedUtils';

/**
 * Get escrow status badge style
 * @param status - The escrow status
 * @returns Style object with background, border, and color
 */
export const getEscrowStatusStyle = (status: string) => {
  return getStyle(status, ESCROW_STATUS_STYLES);
};

/**
 * Build query parameters for payments API request
 * @param currentPage - Current page number
 * @param pageSize - Number of items per page
 * @param searchQuery - Search query string
 * @returns Query parameters object
 */
export const buildPaymentsQueryParams = (
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

/**
 * Check if payment can be released
 * @param payment - The payment object
 * @returns True if payment can be released
 */
export const canReleasePayment = (payment: AdminPayment): boolean => {
  return payment.escrowStatus === 'In Escrow';
};

/**
 * Format days held text
 * @param days - Number of days
 * @returns Formatted days text
 */
export const formatDaysHeld = (days: number): string => {
  if (days === 0) return '-';
  return `${days} ${days === 1 ? 'day' : 'days'}`;
};

