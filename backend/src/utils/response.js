/**
 * Professional API response helpers
 * Standardizes response format like Amazon, Daraz, etc.
 */

/**
 * Success response wrapper
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export function successResponse(res, data, statusCode = 200) {
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  
  // Add request ID if available
  if (res.locals.requestId) {
    response.requestId = res.locals.requestId;
  }
  
  return res.status(statusCode).json(response);
}

/**
 * Error response wrapper (for manual error responses)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} fieldErrors - Optional field-specific errors
 */
export function errorResponse(res, message, statusCode = 400, fieldErrors = null) {
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };
  
  if (fieldErrors) {
    response.fieldErrors = fieldErrors;
  }
  
  if (res.locals.requestId) {
    response.requestId = res.locals.requestId;
  }
  
  return res.status(statusCode).json(response);
}

