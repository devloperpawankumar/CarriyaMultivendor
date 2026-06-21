import { randomBytes } from 'crypto';

/**
 * Professional request ID middleware
 * Adds unique request ID to every request for tracking
 * Similar to AWS X-Ray, Google Cloud Trace, etc.
 */
export function requestId(req, res, next) {
  // Generate or use existing request ID
  const requestId = req.headers['x-request-id'] || 
                    req.headers['x-correlation-id'] || 
                    randomBytes(16).toString('hex');
  
  // Attach to request for logging
  req.requestId = requestId;
  res.locals.requestId = requestId; // Also store in res.locals for response helpers
  
  // Add to response headers (professional practice)
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Correlation-ID', requestId);
  
  next();
}

/**
 * Request timing middleware
 * Tracks request processing time
 */
export function requestTiming(req, res, next) {
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end to set header before sending
  res.end = function(chunk, encoding, callback) {
    const duration = Date.now() - startTime;
    // Set header before calling original end
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    // Call original end function
    originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
}

