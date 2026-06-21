// Shared utility functions across all admin dashboard pages

/**
 * Format total count text with proper pluralization
 * @param count - The total count
 * @param singular - Singular form of the word
 * @param plural - Plural form of the word (optional, defaults to singular + 's')
 * @returns Formatted count text
 */
export const formatCountText = (
  count: number, 
  singular: string, 
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

/**
 * Format currency amount
 * @param amount - Amount value
 * @param currency - Currency symbol (default: 'RS')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'RS'): string => {
  return `${currency} ${amount.toFixed(2)}`;
};

/**
 * Get status badge style from styles object
 * @param status - The status value
 * @param stylesMap - Map of status to style objects
 * @returns Style object with background, border, and color
 */
export const getStatusStyle = <T extends Record<string, any>>(
  status: string,
  stylesMap: T
): T[keyof T] => {
  if (status in stylesMap) {
    return stylesMap[status as keyof T];
  }
  return stylesMap.default;
};

