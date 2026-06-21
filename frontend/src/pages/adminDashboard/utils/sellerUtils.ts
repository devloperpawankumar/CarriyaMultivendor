// Utility functions for Admin Seller Dashboard
// Following patterns from buyerUtils.ts

import { AdminSeller } from '../../../types/admin';
import { STATUS_STYLES } from '../constants/sellerConstants';

/**
 * Get status badge style based on seller status
 * @param status - The seller status
 * @returns Style object with background, border, color, and width
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
  singular: string = 'seller', 
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
export const buildSellersQueryParams = (
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
 * Determine if seller can be approved
 * @param seller - The seller object
 * @returns True if seller can be approved
 */
export const canApproveSeller = (seller: AdminSeller): boolean => {
  return seller.status === 'Pending';
};

/**
 * Determine if seller can be suspended
 * @param seller - The seller object
 * @returns True if seller can be suspended
 */
export const canSuspendSeller = (seller: AdminSeller): boolean => {
  return seller.status === 'Active';
};

/**
 * Format commission percentage
 * @param commission - Commission value
 * @returns Formatted commission string
 */
export const formatCommission = (commission: number): string => {
  return `${commission}%`;
};

/**
 * Generate page numbers array for pagination
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param maxVisible - Maximum visible page numbers
 * @returns Array of page numbers to display
 */
export const generatePageNumbers = (
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): number[] => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  // Show first maxVisible pages by default
  return Array.from({ length: maxVisible }, (_, i) => i + 1);
};

/**
 * Check if ellipsis should be shown after page numbers
 * @param totalPages - Total number of pages
 * @param maxVisible - Maximum visible page numbers
 * @returns True if ellipsis should be shown
 */
export const shouldShowEllipsis = (
  totalPages: number,
  maxVisible: number = 5
): boolean => {
  return totalPages > maxVisible;
};

/**
 * Format pagination range text
 * @param currentPage - Current page number
 * @param pageSize - Number of items per page
 * @param total - Total number of items
 * @returns Formatted range text (e.g., "Showing 1 to 10 of 100 results")
 */
export const formatPaginationRange = (
  currentPage: number,
  pageSize: number,
  total: number
): string => {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);
  return `Showing ${start} to ${end} of ${total} results`;
};

