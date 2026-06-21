# Rate Limiting Settings

## Current Implementation

The rate limiting automatically adjusts based on environment:

### Development Mode (`NODE_ENV !== 'production'`)
- **Very lenient limits** for easy testing and development
- Limits reset every **1 minute** (fast testing)
- Higher limits to prevent blocking during development

### Production Mode (`NODE_ENV === 'production'`)
- **Strict limits** for security
- Longer time windows
- Lower limits to prevent abuse

## Rate Limit Configurations

### Authentication Endpoints (Login, Signup, Password Reset)

| Mode | Limit | Window | Notes |
|------|-------|--------|-------|
| **Development** | 50 attempts | 1 minute | Easy to test multiple times |
| **Production** | 5 attempts | 15 minutes | Secure, prevents brute force |

### General API Endpoints

| Mode | Limit | Window | Notes |
|------|-------|--------|-------|
| **Development** | 1000 requests | 1 minute | High limit for development |
| **Production** | 100 requests | 15 minutes | Reasonable for normal usage |

### OTP Requests (Phone/Email Verification)

| Mode | Limit | Window | Notes |
|------|-------|--------|-------|
| **Development** | 20 requests | 1 minute | Easy to test OTP flow |
| **Production** | 3 requests | 15 minutes | Prevents OTP spam |

### Strict Operations (Sensitive actions)

| Mode | Limit | Window | Notes |
|------|-------|--------|-------|
| **Development** | 100 requests | 1 minute | For testing |
| **Production** | 10 requests | 1 hour | Very strict |

## How to Test

### In Development:
- You can make **50 login attempts per minute** without being blocked
- Rate limits reset after **1 minute**
- Perfect for rapid testing and development

### Check Current Environment:
```bash
# Development (no NODE_ENV or NODE_ENV=development)
# Production (NODE_ENV=production)
```

## Switching to Production

When deploying to production:

1. Set environment variable:
   ```bash
   NODE_ENV=production
   ```

2. The rate limits will automatically switch to strict production limits

3. For distributed systems, use `rateLimitRedis.js` instead of `rateLimit.js`

## Custom Limits

To override for specific testing:

1. Set custom environment variable:
   ```env
   RATE_LIMIT_AUTH_MAX=100
   RATE_LIMIT_AUTH_WINDOW=300000  # 5 minutes in milliseconds
   ```

2. Or modify `rateLimit.js` directly for custom limits

