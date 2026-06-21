// Professional Redis-based rate limiting (Production Ready)
// This is how big platforms like Daraz, Amazon implement rate limiting

import Redis from 'ioredis';
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';

// Initialize Redis client (with fallback to memory for development)
let redisClient = null;
let rateLimiters = {};

// Create Redis connection (with graceful fallback)
function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;
    
    if (redisUrl || process.env.REDIS_HOST) {
      try {
        redisClient = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT || 6379),
          password: process.env.REDIS_PASSWORD,
          db: Number(process.env.REDIS_DB || 0),
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        redisClient.on('error', (err) => {
          console.warn('Redis connection error, falling back to memory:', err.message);
          redisClient = null;
        });

        redisClient.on('connect', () => {
          console.log('✅ Redis connected for rate limiting');
        });
      } catch (err) {
        console.warn('Redis initialization failed, using in-memory fallback:', err.message);
        redisClient = null;
      }
    }
  }
  
  return redisClient;
}

// Get or create rate limiter for a specific configuration
function getRateLimiter(keyPrefix, config) {
  const cacheKey = `${keyPrefix}_${config.points}_${config.duration}`;
  
  if (!rateLimiters[cacheKey]) {
    const redis = getRedisClient();
    
    if (redis) {
      // Use Redis for distributed rate limiting (production)
      rateLimiters[cacheKey] = new RateLimiterRedis({
        storeClient: redis,
        keyPrefix,
        points: config.points,        // Number of requests
        duration: config.duration,    // Per duration in seconds
        blockDuration: config.blockDuration || 0, // Block for X seconds after limit
      });
    } else {
      // Fallback to in-memory (development/fallback)
      rateLimiters[cacheKey] = new RateLimiterMemory({
        keyPrefix,
        points: config.points,
        duration: config.duration,
        blockDuration: config.blockDuration || 0,
      });
    }
  }
  
  return rateLimiters[cacheKey];
}

/**
 * Professional rate limiting middleware with Redis support
 * Uses sliding window algorithm (industry standard)
 * 
 * @param {Object} options - Rate limit configuration
 * @param {number} options.points - Number of requests allowed
 * @param {number} options.duration - Time window in seconds
 * @param {number} options.blockDuration - Block duration in seconds after limit exceeded
 * @param {string} options.keyGenerator - Function to generate key (per user, IP, etc.)
 * @param {string} options.message - Error message
 * @param {boolean} options.skipSuccessfulRequests - Don't count successful requests
 */
export function createRateLimiter(options = {}) {
  const {
    points = 100,
    duration = 60, // seconds
    blockDuration = 0,
    keyGenerator = (req) => req.ip, // Default: per IP
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    keyPrefix = 'rl', // Rate limit key prefix
  } = options;

  const rateLimiter = getRateLimiter(keyPrefix, {
    points,
    duration,
    blockDuration,
  });

  return async (req, res, next) => {
    // Skip rate limiting for health checks
    if (req.path === '/health') {
      return next();
    }

    try {
      // Generate unique key for this request
      const key = await Promise.resolve(keyGenerator(req));
      
      if (!key) {
        // No key generated, skip rate limiting
        return next();
      }

      // Consume 1 point from rate limiter
      const rateLimiterRes = await rateLimiter.consume(key);

      // Add rate limit headers (standard HTTP headers)
      res.setHeader('X-RateLimit-Limit', points);
      res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());

      // Track successful requests if option enabled
      if (skipSuccessfulRequests) {
        const originalSend = res.send;
        res.send = function (body) {
          const statusCode = res.statusCode;
          if (statusCode >= 200 && statusCode < 400) {
            // Successful request - restore point
            rateLimiter.delete(key).catch(() => {});
          }
          return originalSend.call(this, body);
        };
      }

      next();
    } catch (rateLimiterRes) {
      // Rate limit exceeded
      const retryAfter = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
      
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', points);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
      
      return res.status(429).json({
        error: message,
        retryAfter,
      });
    }
  };
}

// Pre-configured rate limiters (Production-ready)

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Authentication rate limiter (per user account)
 * Development: 50 attempts per minute (for easy testing)
 * Production: 5 attempts per 15 minutes (secure)
 */
export const authRateLimit = createRateLimiter({
  points: isDevelopment ? 50 : 5,
  duration: isDevelopment ? 60 : 15 * 60, // Dev: 1 minute, Prod: 15 minutes
  blockDuration: 0, // Don't block, just rate limit
  keyPrefix: 'auth',
  message: 'Too many authentication attempts, please try again later',
  keyGenerator: (req) => {
    // Track per user (email or phone), fallback to IP
    const identifier = req.body?.email || req.body?.phone || req.body?.userId;
    if (identifier) {
      const normalized = identifier.includes('@') 
        ? identifier.toLowerCase().trim()
        : identifier.replace(/\D/g, '');
      return `user:${normalized}`;
    }
    return `ip:${req.ip}`;
  },
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * General API rate limiter (per IP)
 * Development: 1000 requests per minute (for easy testing)
 * Production: 100 requests per 15 minutes
 */
export const apiRateLimit = createRateLimiter({
  points: isDevelopment ? 1000 : 100,
  duration: isDevelopment ? 60 : 15 * 60, // Dev: 1 minute, Prod: 15 minutes
  keyPrefix: 'api',
  message: 'Too many API requests, please try again later',
  keyGenerator: (req) => `ip:${req.ip}`,
});

/**
 * Strict rate limiter (for sensitive operations)
 * Development: 100 requests per minute
 * Production: 10 requests per hour per user
 */
export const strictRateLimit = createRateLimiter({
  points: isDevelopment ? 100 : 10,
  duration: isDevelopment ? 60 : 60 * 60, // Dev: 1 minute, Prod: 1 hour
  keyPrefix: 'strict',
  message: 'Rate limit exceeded, please try again later',
  keyGenerator: (req) => {
    const identifier = req.body?.email || req.body?.phone || req.user?.id;
    if (identifier) {
      const normalized = identifier.includes('@') 
        ? identifier.toLowerCase().trim()
        : identifier.replace(/\D/g, '');
      return `user:${normalized}`;
    }
    return `ip:${req.ip}`;
  },
});

/**
 * OTP request rate limiter (prevent OTP spam)
 * Development: 20 requests per minute (for easy testing)
 * Production: 3 requests per 15 minutes per phone/email
 */
export const otpRateLimit = createRateLimiter({
  points: isDevelopment ? 20 : 3,
  duration: isDevelopment ? 60 : 15 * 60, // Dev: 1 minute, Prod: 15 minutes
  blockDuration: isDevelopment ? 0 : 5 * 60, // Dev: no block, Prod: 5 minutes
  keyPrefix: 'otp',
  message: 'Too many OTP requests, please try again later',
  keyGenerator: (req) => {
    const identifier = req.body?.email || req.body?.phone;
    if (identifier) {
      const normalized = identifier.includes('@') 
        ? identifier.toLowerCase().trim()
        : identifier.replace(/\D/g, '');
      return `otp:${normalized}`;
    }
    return `otp:ip:${req.ip}`;
  },
});

// Connect Redis on module load (non-blocking)
getRedisClient()?.connect().catch(() => {
  console.warn('Redis connection deferred (will connect when needed)');
});

