# Redis Setup for Production Rate Limiting

## Why Redis for Rate Limiting?

Big platforms (Daraz, Amazon, Netflix, GitHub) use Redis because:
- ✅ **Distributed**: Works across multiple servers
- ✅ **Fast**: Sub-millisecond response times
- ✅ **Persistent**: Limits survive server restarts
- ✅ **Scalable**: Handles millions of requests/second
- ✅ **Industry Standard**: Used by all major platforms

## Installation

### Option 1: Install Redis Locally (Development)
```bash
# Windows (using Chocolatey)
choco install redis-64

# Mac
brew install redis

# Linux (Ubuntu/Debian)
sudo apt-get install redis-server

# Start Redis
redis-server
```

### Option 2: Use Redis Cloud (Free Tier Available)
1. Sign up at https://redis.com/try-free/
2. Create a free database
3. Get connection URL

### Option 3: Docker (Recommended for Development)
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

## Environment Variables

Add to your `.env` file:
```env
# Redis Configuration (Optional - falls back to memory if not set)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Or use a connection URL
# REDIS_URL=redis://localhost:6379
# REDIS_URL=rediss://user:password@host:port (SSL)
```

## Installation Commands

```bash
cd backend
npm install ioredis rate-limiter-flexible
```

## How It Works

1. **Without Redis**: Uses in-memory fallback (current behavior)
2. **With Redis**: Uses distributed rate limiting (production-ready)

The code automatically detects Redis and falls back gracefully if unavailable.

## Benefits Over Current Implementation

| Feature | Current (In-Memory) | Redis (Production) |
|---------|-------------------|-------------------|
| Multiple Servers | ❌ Each server has own limit | ✅ Shared across all servers |
| Server Restart | ❌ Limits reset | ✅ Limits persist |
| Performance | ✅ Fast | ✅ Faster (optimized) |
| Scalability | ❌ Limited | ✅ Unlimited |
| Accuracy | ⚠️ Fixed window | ✅ Sliding window |

## Production Checklist

- [ ] Install Redis server
- [ ] Install npm packages: `npm install ioredis rate-limiter-flexible`
- [ ] Set environment variables
- [ ] Test with Redis connected
- [ ] Monitor Redis connection in production
- [ ] Set up Redis persistence (RDB or AOF)
- [ ] Configure Redis clustering (if needed)

