/**
 * Professional API headers middleware
 * Adds standard headers like Amazon, Daraz, etc. use
 */
export function apiHeaders(req, res, next) {
  // API Version (professional practice)
  res.setHeader('X-API-Version', process.env.API_VERSION || '1.0.0');
  
  // Server identification
  res.setHeader('X-Server', 'Carriya-API');
  
  // Content security
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // CORS headers (if needed)
  if (req.headers.origin) {
    res.setHeader('Access-Control-Expose-Headers', 'X-Request-ID, X-Response-Time, X-API-Version, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');
  }
  
  // Cache control for API responses
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
}

