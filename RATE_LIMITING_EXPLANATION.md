# Rate Limiting Explanation

## Current Implementation

### How It Works:
The rate limiting is currently based on:
- **IP Address** (`req.ip`) - Your internet connection's IP
- **Endpoint Path** (`req.path`) - Which API endpoint you're hitting

### Rate Limit Settings:
- **Authentication endpoints** (login, signup, password reset): **5 attempts per 15 minutes**
- **General API endpoints**: 100 requests per 15 minutes

### What This Means:

1. **Per IP Address (NOT per user account)**
   - ✅ Multiple tabs in same browser = Same IP = Share limit
   - ✅ Multiple devices on same WiFi = Same IP = Share limit
   - ✅ Office/home network = Multiple users share same IP = Share limit

2. **Per Endpoint**
   - Each endpoint has its own counter
   - Login attempts tracked separately from signup attempts
   - But all use the same IP address

3. **Your Error Message:**
   - `retryAfter: 722` means **722 seconds** (≈12 minutes) until the limit resets
   - You've exceeded **5 login attempts in 15 minutes** from your IP address

## Example Scenarios:

### Scenario 1: Same Device, Multiple Tabs
```
You open 3 tabs and try to login 2 times each = 6 attempts
Result: ❌ Rate limited (exceeded 5 attempts)
```

### Scenario 2: Same Network (WiFi)
```
Your friend on same WiFi tries to login 3 times
You try to login 3 times
Total = 6 attempts from same IP
Result: ❌ Both of you rate limited
```

### Scenario 3: Different Networks
```
You login from home WiFi (IP: 192.168.1.5) - 3 attempts ✅
Your friend logs in from their WiFi (IP: 192.168.2.3) - 3 attempts ✅
Result: ✅ Both work (different IPs)
```

## Problems with Current Approach:

1. **❌ Shared IP Issues**: Users on same network can block each other
2. **❌ Not User-Specific**: Legitimate users can't retry after someone else's failed attempts
3. **❌ Development Issues**: Multiple tabs = hits limit faster during testing

## Professional Solution:

For production, rate limiting should be **per user account** (email/phone), not per IP address. This prevents:
- Legitimate users from being blocked by others
- Network-wide blocks
- Issues during development/testing

