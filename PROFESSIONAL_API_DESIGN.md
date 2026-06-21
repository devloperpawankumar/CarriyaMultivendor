# Professional API Design - Best Practices

## Overview
This document explains the professional API design patterns implemented in the Carriya project, following industry standards used by platforms like Amazon, Daraz, and other major e-commerce platforms.

## Key Principles

### 1. **URL Structure - Clear and RESTful (NOT Obscured)**
**Important:** Professional platforms do NOT use obfuscated URLs. Security comes from authentication, not URL obscurity.

✅ **Professional Approach:**
```
GET  /api/v1/seller/settings
PATCH /api/v1/seller/settings
POST /api/v1/seller/settings/upload-logo
```

❌ **NOT Professional:**
```
GET  /api/x7k9m2p/seller/abc123xyz
PATCH /api/secure/update/store-info
```

**Why?**
- Clear URLs are maintainable and debuggable
- RESTful conventions are industry standard
- Security is handled by authentication/authorization
- Easier for developers and API consumers

### 2. **Request Headers (Professional Standards)**

Every request includes:

```
X-Request-ID: req_1234567890_abc123
X-Client-ID: client_1234567890_xyz789
X-API-Version: 1.0.0
X-Client-Version: 1.0.0
X-Platform: web
X-Requested-With: XMLHttpRequest
X-Request-Timestamp: 2025-01-15T10:30:00.000Z
User-Agent: Carriya-Web/1.0.0 (Web Client)
Accept: application/json
Accept-Language: en-US
Content-Type: application/json
```

### 3. **Response Headers (Professional Standards)**

Every response includes:

```
X-Request-ID: req_1234567890_abc123
X-Correlation-ID: req_1234567890_abc123
X-Response-Time: 45ms
X-API-Version: 1.0.0
X-Server: Carriya-API
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-01-15T10:31:00.000Z
```

### 4. **Response Format (Standardized)**

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Actual response data
  },
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestId": "req_1234567890_abc123"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "fieldErrors": {
    "currentPassword": "Current password is incorrect",
    "newPassword": "Password must be 8+ chars with upper, lower, number, and special char"
  },
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestId": "req_1234567890_abc123"
}
```

### 5. **Request ID Tracking**

- Every request gets a unique ID
- Used for logging, debugging, and support
- Similar to AWS X-Ray, Google Cloud Trace
- Helps track requests across microservices

### 6. **Response Time Tracking**

- Every response includes processing time
- Helps identify performance issues
- Useful for monitoring and optimization

## Network Request Appearance

When you open browser DevTools → Network tab, you'll see:

### Request Headers:
```
Request URL: http://localhost:4000/api/seller/settings
Request Method: PATCH
Request Headers:
  X-Request-ID: req_1736934600000_abc123xyz
  X-Client-ID: client_1736934600000_def456
  X-API-Version: 1.0.0
  X-Client-Version: 1.0.0
  X-Platform: web
  X-Request-Timestamp: 2025-01-15T10:30:00.000Z
  User-Agent: Carriya-Web/1.0.0 (Web Client)
  Accept: application/json
  Content-Type: application/json
  Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Headers:
```
Response Headers:
  X-Request-ID: req_1736934600000_abc123xyz
  X-Correlation-ID: req_1736934600000_abc123xyz
  X-Response-Time: 45ms
  X-API-Version: 1.0.0
  X-Server: Carriya-API
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 2025-01-15T10:31:00.000Z
  Content-Type: application/json
```

### Response Body:
```json
{
  "success": true,
  "data": {
    "storeName": "My Store",
    "storeDescription": "...",
    "storeLogo": "https://res.cloudinary.com/...",
    "storeBanner": "https://res.cloudinary.com/..."
  },
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestId": "req_1736934600000_abc123xyz"
}
```

## Security Best Practices

### ✅ What We Do (Professional):
1. **Authentication**: JWT tokens in secure cookies
2. **Authorization**: Role-based access control
3. **Rate Limiting**: Prevent abuse
4. **Input Validation**: Sanitize all inputs
5. **HTTPS**: Encrypted connections (production)
6. **CORS**: Proper origin restrictions
7. **Security Headers**: X-Content-Type-Options, X-Frame-Options, etc.

### ❌ What We DON'T Do (Not Professional):
1. **URL Obfuscation**: Hiding endpoints doesn't provide security
2. **Security Through Obscurity**: Relies on proper authentication instead

## Benefits

1. **Debugging**: Request IDs make it easy to track issues
2. **Monitoring**: Response times help identify bottlenecks
3. **Support**: Request IDs help customer support track issues
4. **Professional**: Matches industry standards
5. **Maintainable**: Clear, consistent structure
6. **Scalable**: Easy to add versioning, logging, etc.

## Implementation

All API requests now automatically include:
- Professional headers
- Request ID tracking
- Response time measurement
- Standardized response format
- Proper error handling

The frontend automatically extracts `data` from `{ success: true, data: ... }` responses, so your code doesn't need to change!

