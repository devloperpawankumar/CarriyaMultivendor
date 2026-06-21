// Utility functions for Admin Buyer Dashboard
// Following patterns from seller dashboard pages

import { AdminBuyer } from '../../../types/admin';
import { STATUS_STYLES } from '../constants/buyerConstants';

/**
 * Get status badge style based on buyer status
 * @param status - The buyer status
 * @returns Style object with background, border, and color
 */
export const getStatusStyle = (status: string) => {
  if (status in STATUS_STYLES) {
    return STATUS_STYLES[status as keyof typeof STATUS_STYLES];
  }
  return STATUS_STYLES.default;
};

/**
 * Format total count text with proper pluralization
 * @param count - The total count
 * @param singular - Singular form of the word
 * @param plural - Plural form of the word (optional, defaults to singular + 's')
 * @returns Formatted count text
 */
export const formatCountText = (
  count: number, 
  singular: string = 'buyer', 
  plural?: string
): string => {
  const pluralForm = plural || `${singular}s`;
  return `${count} total ${count === 1 ? singular : pluralForm}`;
};

/**
 * Calculate pagination information
 * @param total - Total number of items
 * @param pageSize - Number of items per page
 * @param currentPage - Current page number
 * @returns Pagination information
 */
export const calculatePagination = (
  total: number,
  pageSize: number,
  currentPage: number
) => {
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);
  
  return {
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
  };
};

/**
 * Build query parameters for API request
 * @param currentPage - Current page number
 * @param pageSize - Number of items per page
 * @param statusFilter - Status filter value
 * @param searchQuery - Search query string
 * @returns Query parameters object
 */
export const buildBuyersQueryParams = (
  currentPage: number,
  pageSize: number,
  statusFilter: string,
  searchQuery: string
) => {
  return {
    page: currentPage,
    pageSize: pageSize,
    status: statusFilter === 'all' ? undefined : (statusFilter.toLowerCase() as any),
    search: searchQuery || undefined,
  };
};

/**
 * Determine if buyer can be approved
 * @param buyer - The buyer object
 * @returns True if buyer can be approved
 */
export const canApproveBuyer = (buyer: AdminBuyer): boolean => {
  return buyer.status === 'Pending';
};

/**
 * Determine if buyer can be blocked
 * @param buyer - The buyer object
 * @returns True if buyer can be blocked
 */
export const canBlockBuyer = (buyer: AdminBuyer): boolean => {
  return buyer.status === 'Active';
};

