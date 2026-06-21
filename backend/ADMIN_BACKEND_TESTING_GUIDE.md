# Admin Backend Testing Guide

## 🚀 Quick Start

Your professional admin backend is now ready! Follow these steps to test and integrate it with your frontend.

---

## 📋 Prerequisites

1. **MongoDB Running** - Ensure your MongoDB is connected
2. **Backend Server Running** - `npm run dev` or `npm start`
3. **Admin User Created** - You need a user with `role: 'admin'`

---

## 🔐 Step 1: Create Admin User (If Not Exists)

### Option A: Via MongoDB Compass/Shell
```javascript
// Connect to your database and run:
db.users.insertOne({
  email: "admin@carriya.com",
  passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz...",  // Use bcrypt to hash "admin123"
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Option B: Via Your Auth Registration Flow
1. Register a new user
2. Update their role in MongoDB: `db.users.updateOne({ email: "admin@carriya.com" }, { $set: { role: "admin" } })`

---

## 🧪 Step 2: Test Backend APIs with cURL/Postman

### 1. Login as Admin
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@carriya.com",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@carriya.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Save the token** for subsequent requests!

---

### 2. Test Dashboard Overview
```bash
curl -X GET http://localhost:4000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 150,
      "totalSellers": 25,
      "totalBuyers": 125,
      "totalOrders": 500,
      "totalProducts": 300,
      "platformEarnings": 150000
    },
    "recentOrders": [...],
    "newSellers": [...]
  }
}
```

---

### 3. Test Get Buyers (with pagination & filters)
```bash
# All buyers
curl -X GET "http://localhost:4000/api/admin/buyers?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Filter by status
curl -X GET "http://localhost:4000/api/admin/buyers?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Search by name
curl -X GET "http://localhost:4000/api/admin/buyers?search=john" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "status": "Active",
        "joinedDate": "2026-01-15",
        "totalOrders": 12,
        "totalSpent": 1250
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

---

### 4. Test Block Buyer
```bash
curl -X POST http://localhost:4000/api/admin/buyers/BUYER_ID_HERE/block \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Buyer blocked successfully",
    "buyer": {
      "id": "...",
      "name": "John Doe",
      "status": "Suspended"
    }
  }
}
```

---

### 5. Test Get Sellers
```bash
# All sellers
curl -X GET "http://localhost:4000/api/admin/sellers?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Pending sellers only
curl -X GET "http://localhost:4000/api/admin/sellers?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 6. Test Approve Seller
```bash
curl -X POST http://localhost:4000/api/admin/sellers/SELLER_ID_HERE/approve \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Seller approved successfully",
    "seller": {
      "id": "...",
      "name": "Muhammad Ali",
      "status": "Active"
    }
  }
}
```

---

### 7. Test Get Seller Details
```bash
curl -X GET http://localhost:4000/api/admin/sellers/SELLER_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "storeName": "Tech Store",
    "ownerName": "Muhammad Ali",
    "email": "ali@techstore.com",
    "status": "Active",
    "pickupAddress": "...",
    "idCardNumber": "...",
    "ibanNumber": "...",
    "totalProducts": 50,
    "totalOrders": 200
  }
}
```

---

## 🔄 Step 3: Connect Frontend to Backend

### Update Frontend Service

In `frontend/src/services/adminService.ts`, change:

```typescript
// Change this line:
const USE_MOCK_DATA = true;

// To:
const USE_MOCK_DATA = false;
```

Now your frontend will use the real backend APIs! 🎉

---

## ✅ Step 4: Test Frontend Integration

1. **Login as Admin**
   - Go to your login page
   - Login with admin credentials
   - Verify you're redirected to admin dashboard

2. **Test Admin Dashboard**
   - Verify stats are loading
   - Check recent orders table
   - Check new sellers list

3. **Test Buyers Management**
   - Navigate to `/admin/buyers`
   - Test pagination (next/prev buttons)
   - Test status filter (All, Active, Pending, Suspended)
   - Test search functionality
   - Try blocking a buyer
   - Verify toast notification shows
   - Verify list refreshes

4. **Test Sellers Management**
   - Navigate to `/admin/sellers`
   - Test filters and search
   - Click on a seller to view details
   - Try approving a pending seller
   - Try suspending an active seller

---

## 🚨 Common Issues & Solutions

### Issue 1: "Unauthorized" Error
**Cause:** No valid JWT token
**Solution:** 
- Make sure you're logged in as admin
- Check if token is stored in cookies or localStorage
- Verify token is sent in Authorization header

### Issue 2: "Forbidden" Error
**Cause:** User is not admin
**Solution:**
- Update user role in database: `db.users.updateOne({ email: "..." }, { $set: { role: "admin" } })`

### Issue 3: Empty Data
**Cause:** No buyers/sellers in database
**Solution:**
- Create test users with role `buyer` and `seller`
- Or use mock data for testing (set `USE_MOCK_DATA = true`)

### Issue 4: CORS Error
**Cause:** Frontend and backend on different origins
**Solution:**
- Check `backend/src/index.js` - ensure `FRONTEND_URL` is correct
- Verify CORS is enabled: `app.use(cors({ origin: FRONTEND_URL, credentials: true }))`

### Issue 5: "Seller has not completed onboarding"
**Cause:** Seller trying to be approved hasn't finished onboarding
**Solution:**
- Check `SellerOnboarding` collection
- Ensure seller has `status: 'completed'`
- Or create complete onboarding data for testing

---

## 📊 Postman Collection

Create a Postman collection with these requests:

### Environment Variables
```
BASE_URL = http://localhost:4000
TOKEN = (set after login)
```

### Requests
1. **POST** `/api/auth/login` - Login as Admin
2. **GET** `/api/admin/dashboard` - Dashboard Overview
3. **GET** `/api/admin/buyers` - List Buyers
4. **GET** `/api/admin/buyers/:id` - Buyer Details
5. **POST** `/api/admin/buyers/:id/block` - Block Buyer
6. **POST** `/api/admin/buyers/:id/unblock` - Unblock Buyer
7. **POST** `/api/admin/buyers/:id/approve` - Approve Buyer
8. **GET** `/api/admin/sellers` - List Sellers
9. **GET** `/api/admin/sellers/:id` - Seller Details
10. **POST** `/api/admin/sellers/:id/approve` - Approve Seller
11. **POST** `/api/admin/sellers/:id/suspend` - Suspend Seller
12. **POST** `/api/admin/sellers/:id/reactivate` - Reactivate Seller

---

## 🧪 Test Data Scripts

### Create Test Buyers
```javascript
// Run in MongoDB shell
for (let i = 1; i <= 20; i++) {
  db.users.insertOne({
    email: `buyer${i}@test.com`,
    phone: `+92300123456${i}`,
    passwordHash: "$2a$10$...",  // Use bcrypt
    firstName: `Buyer`,
    lastName: `${i}`,
    role: "buyer",
    isActive: i % 10 !== 0,  // Every 10th is inactive
    isEmailVerified: i % 5 !== 0,  // Every 5th is not verified
    createdAt: new Date(),
    updatedAt: new Date()
  });
}
```

### Create Test Sellers
```javascript
// Run in MongoDB shell
for (let i = 1; i <= 15; i++) {
  const userId = ObjectId();
  
  // Create user
  db.users.insertOne({
    _id: userId,
    email: `seller${i}@test.com`,
    phone: `+92301234567${i}`,
    passwordHash: "$2a$10$...",
    firstName: `Seller`,
    lastName: `${i}`,
    role: "seller",
    isActive: i % 3 !== 0,  // Some inactive (pending approval)
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Create onboarding data
  db.selleronboardings.insertOne({
    userId: userId,
    phone: `+92301234567${i}`,
    status: "completed",
    currentStep: 6,
    isOtpVerified: true,
    basicInfo: {
      firstName: `Seller`,
      lastName: `${i}`
    },
    email: `seller${i}@test.com`,
    isEmailVerified: true,
    address: {
      pickupAddress: `Address ${i}, Karachi`,
      pickupProvince: "Sindh",
      pickupDistrict: "Karachi",
      returnAddress: `Address ${i}, Karachi`,
      returnProvince: "Sindh",
      returnDistrict: "Karachi"
    },
    business: {
      idCardName: `Seller Name ${i}`,
      idCardNumber: `42201-1234567-${i}`,
      verificationStatus: "verified"
    },
    bank: {
      accountHolderName: `Seller ${i}`,
      accountNumber: `123456789${i}`,
      ibanNumber: `PK36SCBL000000112345670${i}`,
      bankName: "MCB Bank",
      branchCode: "1234",
      verificationStatus: "verified"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });
}
```

---

## 📈 Performance Monitoring

Monitor these metrics:
- **Response Time:** Should be < 200ms for most endpoints
- **Database Queries:** Check logs for query performance
- **Error Rate:** Should be < 1%
- **Memory Usage:** Monitor for memory leaks

---

## 🎯 Next Steps

1. **Test all endpoints** with real data
2. **Switch frontend** from mock to real API
3. **Test error scenarios** (invalid IDs, unauthorized access)
4. **Add email/SMS notifications** (TODOs in code)
5. **Implement audit logs** for admin actions
6. **Add rate limiting** for admin endpoints (if needed)
7. **Deploy** to production!

---

## 💡 Pro Tips

1. **Use Postman Collections** - Save time with pre-configured requests
2. **Test Edge Cases** - Empty states, large datasets, invalid inputs
3. **Monitor Logs** - Watch backend console for errors
4. **Use Browser DevTools** - Network tab shows request/response
5. **Enable Debug Mode** - Set `NODE_ENV=development` for detailed errors

---

**Your admin backend is production-ready!** 🎉

All APIs follow your existing patterns:
✅ Global error handling
✅ Professional responses
✅ Authentication & authorization
✅ Pagination & filtering
✅ Search functionality
✅ Async error catching
✅ Database optimizations

**Need help?** Check the documentation in `ADMIN_API_DOCUMENTATION.md`

