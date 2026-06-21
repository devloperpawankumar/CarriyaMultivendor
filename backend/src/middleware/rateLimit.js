const stores = new Map();

export function createRateLimiter({
  windowMs = 60 * 1000,
  max = 120,
  message = 'Too many requests, please try again later.',
} = {}) {
  return function rateLimiter(req, res, next) {
    const now = Date.now();
    const key = `${req.ip}:${req.baseUrl}${req.path}`;

    let entry = stores.get(key);
    if (!entry || entry.expires <= now) {
      entry = { count: 0, expires: now + windowMs };
    }

    entry.count += 1;
    stores.set(key, entry);

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.expires - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: message,
      });
    }

    next();
  };
}

// Simple in-memory rate limiter (use Redis for production)
// For production, use express-rate-limit with Redis store

const requestStore = new Map();

// Clean up old entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestStore.entries()) {
    if (value.resetAt < now) {
      requestStore.delete(key);
    }
  }
}, 15 * 60 * 1000);

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Rate limiting middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Error message when limit exceeded
 * @param {boolean} options.skipSuccessfulRequests - Don't count successful requests
 * @param {boolean} options.perUser - Track per user (email/phone) instead of IP (requires req.body.email or req.body.phone)
 */
export function rateLimit(options = {}) {
  const {
    windowMs = isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000, // Dev: 1 min, Prod: 15 minutes
    max = isDevelopment ? 1000 : 100, // Dev: 1000, Prod: 100 requests per window
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    perUser = false,
  } = options;

  return (req, res, next) => {
    // Skip rate limiting for health checks
    if (req.path === '/health') {
      return next();
    }

    // Determine rate limit key
    let key;
    if (perUser) {
      // Track per user (email or phone from request body)
      const identifier = req.body?.email || req.body?.phone || req.body?.userId;
      if (identifier) {
        // Normalize identifier (lowercase email, remove non-digits from phone)
        const normalized = identifier.includes('@') 
          ? identifier.toLowerCase().trim()
          : identifier.replace(/\D/g, '');
        key = `user:${normalized}:${req.path}`;
      } else {
        // Fallback to IP if no identifier found
        key = `${req.ip}_${req.path}`;
      }
    } else {
      // Track per IP address (default)
      key = `${req.ip}_${req.path}`;
    }

    const now = Date.now();
    const resetAt = now + windowMs;

    let record = requestStore.get(key);

    if (!record || record.resetAt < now) {
      // New window or expired
      record = {
        count: 0,
        resetAt,
      };
    }

    record.count++;

    if (record.count > max) {
      requestStore.set(key, record);
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: message,
        retryAfter,
      });
    }

    requestStore.set(key, record);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.resetAt).toISOString());

    // Track response for skipSuccessfulRequests
    if (skipSuccessfulRequests) {
      const originalSend = res.send;
      res.send = function (body) {
        const statusCode = res.statusCode;
        if (statusCode >= 200 && statusCode < 400) {
          record.count = Math.max(0, record.count - 1);
          requestStore.set(key, record);
        }
        return originalSend.call(this, body);
      };
    }

    next();
  };
}

// Pre-configured rate limiters
// Development: Very lenient (for easy testing) - resets every 1 minute
// Production: Strict (secure) - normal time windows
export const authRateLimit = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000, // Dev: 1 min, Prod: 15 minutes
  max: isDevelopment ? 50 : 5, // Dev: 50 attempts per minute, Prod: 5 per 15 minutes
  message: 'Too many authentication attempts, please try again later',
  perUser: true, // ✅ Track per user account (email/phone), not IP
  skipSuccessfulRequests: true, // Don't count successful logins
});

export const apiRateLimit = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000, // Dev: 1 min, Prod: 15 minutes
  max: isDevelopment ? 1000 : 100, // Dev: 1000 requests per minute, Prod: 100 per 15 minutes
  message: 'Too many API requests, please try again later',
  perUser: false, // Keep per IP for general API calls
});

export const strictRateLimit = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 60 * 60 * 1000, // Dev: 1 min, Prod: 1 hour
  max: isDevelopment ? 100 : 10, // Dev: 100 requests per minute, Prod: 10 per hour
  message: 'Rate limit exceeded, please try again later',
});
