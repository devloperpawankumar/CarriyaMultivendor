# Admin Panel - Frontend Integration Guide

## ✅ What's Been Done

### Frontend Updates:
1. ✅ **Switched from Mock to Real Backend** - `adminService.ts` now uses real API
2. ✅ **Updated API Response Handling** - Properly handles backend response format
3. ✅ **Error Handling** - Extracts error messages from backend responses
4. ✅ **Buyers Management** - Connected to real backend APIs
5. ✅ **Sellers Management** - Connected to real backend APIs

---

## 🚀 How to Test

### Step 1: Ensure Backend is Running

```bash
cd backend
npm run dev
```

**Verify backend is running:**
- Check terminal for: `Backend listening on http://localhost:4000`
- Check MongoDB connection: `MongoDB connected successfully`

---

### Step 2: Create Admin User (If Not Exists)

Open MongoDB Compass or MongoDB Shell and run:

```javascript
// First, hash your password using bcrypt (in Node.js)
// const bcrypt = require('bcryptjs');
// const hash = await bcrypt.hash('admin123', 10);

db.users.insertOne({
  email: "admin@carriya.com",
  passwordHash: "$2a$10$...", // Replace with actual bcrypt hash
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

**Quick Password Hash Generator:**
```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(console.log);"
```

---

### Step 3: Test Backend API (Optional but Recommended)

```bash
# 1. Login as admin
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@carriya.com", "password": "admin123"}'

# Save the token from response

# 2. Test buyers endpoint
curl -X GET "http://localhost:4000/api/admin/buyers?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 0,
    "page": 1,
    "pageSize": 10,
    "totalPages": 0
  }
}
```

---

### Step 4: Start Frontend

```bash
cd frontend
npm start
```

---

### Step 5: Test Admin Login

1. Navigate to your login page
2. Login with admin credentials:
   - Email: `admin@carriya.com`
   - Password: `admin123`
3. Verify you're redirected to admin dashboard

---

### Step 6: Test Buyers Management

1. **Navigate to Buyers Page:**
   - Go to `/admin/buyers` or click "Buyers" in sidebar

2. **Test List Display:**
   - ✅ Should load buyers from database
   - ✅ Shows "No buyers found" if empty (this is normal if no buyers exist)
   - ✅ Loading spinner shows while fetching

3. **Test Filters:**
   - ✅ Click "All" - shows all buyers
   - ✅ Click "Active" - shows only active buyers
   - ✅ Click "Pending" - shows only pending buyers
   - ✅ Click "Suspended" - shows only suspended buyers

4. **Test Search:**
   - ✅ Type in search box
   - ✅ Results update after typing
   - ✅ Shows "No buyers found" if no matches

5. **Test Actions:**
   - ✅ Click "Block" on an active buyer
   - ✅ Toast notification appears
   - ✅ List refreshes automatically
   - ✅ Buyer status changes to "Suspended"
   - ✅ Click "Unblock" to revert

6. **Test Pagination:**
   - ✅ Previous/Next buttons work
   - ✅ Page numbers update correctly
   - ✅ Shows correct items per page

---

### Step 7: Test Sellers Management

1. **Navigate to Sellers Page:**
   - Go to `/admin/sellers` or click "Sellers" in sidebar

2. **Test List Display:**
   - ✅ Should load sellers from database
   - ✅ Shows "No sellers found" if empty

3. **Test Filters:**
   - ✅ All / Active / Pending / Suspended filters work

4. **Test Actions:**
   - ✅ Click on a seller row to view details
   - ✅ Details modal shows seller information
   - ✅ ID card images display (if uploaded)
   - ✅ Bank document displays (if uploaded)
   - ✅ Click "Approve" for pending sellers
   - ✅ Click "Suspend" for active sellers
   - ✅ Toast notifications appear
   - ✅ List refreshes after actions

---

## 🔍 What to Look For

### **Console Logs (Browser DevTools)**

**Good Signs:**
```
[API] GET /api/admin/buyers { requestId: "...", responseId: "...", status: 200 }
```

**Bad Signs:**
```
Failed to fetch buyers: Error: Unauthorized
Failed to fetch buyers: Error: HTTP 403
CORS error
```

---

### **Network Tab (Browser DevTools)**

Check these requests:

1. **GET `/api/admin/buyers`**
   - Status: 200 OK
   - Response: `{ success: true, data: { items: [...], total: X } }`

2. **POST `/api/admin/buyers/:id/block`**
   - Status: 200 OK
   - Response: `{ success: true, data: { message: "Buyer blocked successfully" } }`

3. **GET `/api/admin/sellers`**
   - Status: 200 OK
   - Response: `{ success: true, data: { items: [...], total: X } }`

---

## 🚨 Common Issues & Solutions

### Issue 1: "Unauthorized" or "Forbidden" Error

**Symptoms:**
- Can't access admin pages
- API returns 401 or 403

**Solutions:**
1. Make sure you're logged in as admin
2. Check user role in database:
   ```javascript
   db.users.findOne({ email: "admin@carriya.com" })
   // Should have: role: "admin"
   ```
3. Update role if needed:
   ```javascript
   db.users.updateOne(
     { email: "admin@carriya.com" },
     { $set: { role: "admin" } }
   )
   ```

---

### Issue 2: Empty Buyers/Sellers List

**Symptoms:**
- Page shows "No buyers found" or "No sellers found"
- Total count is 0

**This is NORMAL if:**
- Your database is empty
- No users have registered yet

**Solutions:**
1. Create test buyers:
   ```javascript
   db.users.insertOne({
     email: "buyer1@test.com",
     phone: "+923001234567",
     passwordHash: "$2a$10$...",
     firstName: "Test",
     lastName: "Buyer",
     role: "buyer",
     isActive: true,
     isEmailVerified: true,
     createdAt: new Date(),
     updatedAt: new Date()
   });
   ```

2. Create test sellers:
   ```javascript
   const sellerId = new ObjectId();
   
   // Create user
   db.users.insertOne({
     _id: sellerId,
     email: "seller1@test.com",
     phone: "+923011234567",
     passwordHash: "$2a$10$...",
     firstName: "Test",
     lastName: "Seller",
     role: "seller",
     isActive: false, // Pending approval
     isEmailVerified: true,
     createdAt: new Date(),
     updatedAt: new Date()
   });
   
   // Create onboarding data
   db.selleronboardings.insertOne({
     userId: sellerId,
     phone: "+923011234567",
     status: "completed",
     currentStep: 6,
     isOtpVerified: true,
     basicInfo: {
       firstName: "Test",
       lastName: "Seller"
     },
     email: "seller1@test.com",
     isEmailVerified: true,
     address: {
       pickupAddress: "123 Test St, Karachi",
       pickupProvince: "Sindh",
       pickupDistrict: "Karachi",
       returnAddress: "123 Test St, Karachi",
       returnProvince: "Sindh",
       returnDistrict: "Karachi"
     },
     business: {
       idCardName: "Test Seller",
       idCardNumber: "42201-1234567-1",
       verificationStatus: "verified"
     },
     bank: {
       accountHolderName: "Test Seller",
       accountNumber: "1234567890",
       ibanNumber: "PK36SCBL0000001123456701",
       bankName: "MCB Bank",
       branchCode: "1234",
       verificationStatus: "verified"
     },
     createdAt: new Date(),
     updatedAt: new Date()
   });
   ```

---

### Issue 3: CORS Error

**Symptoms:**
```
Access to fetch at 'http://localhost:4000/api/admin/buyers' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solutions:**
1. Check backend `FRONTEND_URL`:
   ```javascript
   // backend/src/index.js
   const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
   ```

2. Check `.env` file in backend:
   ```
   FRONTEND_URL=http://localhost:3000
   ```

3. Restart backend server

---

### Issue 4: Actions Not Working (Block/Approve)

**Symptoms:**
- Click "Block" but nothing happens
- Toast shows error message

**Solutions:**
1. Check browser console for error message
2. Check if buyer/seller exists:
   ```javascript
   db.users.findOne({ _id: ObjectId("BUYER_ID_HERE") })
   ```
3. For sellers, ensure onboarding is completed:
   ```javascript
   db.selleronboardings.findOne({ userId: ObjectId("SELLER_ID_HERE") })
   // Should have: status: "completed"
   ```

---

### Issue 5: "Seller has not completed onboarding"

**Symptoms:**
- Can't approve seller
- Error message in toast

**Solution:**
Update seller onboarding status:
```javascript
db.selleronboardings.updateOne(
  { userId: ObjectId("SELLER_ID_HERE") },
  { $set: { status: "completed", currentStep: 6 } }
)
```

---

## 📊 Backend Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": {
    // Your data here
  },
  "timestamp": "2026-01-22T...",
  "requestId": "req_..."
}
```

The frontend `api.ts` automatically extracts the `data` field, so you don't need to worry about it!

---

## ✅ Quick Verification Checklist

### Before Testing:
- [ ] Backend server is running (port 4000)
- [ ] MongoDB is connected
- [ ] Admin user exists with `role: "admin"`
- [ ] Frontend is running (port 3000)

### During Testing:
- [ ] Can login as admin
- [ ] Can access admin dashboard
- [ ] Buyers page loads (shows empty or data)
- [ ] Sellers page loads (shows empty or data)
- [ ] Filters work correctly
- [ ] Search works correctly
- [ ] Pagination works correctly
- [ ] Block/Unblock actions work
- [ ] Approve/Suspend actions work
- [ ] Toast notifications appear
- [ ] Lists refresh after actions
- [ ] Mobile view works (test on phone)

---

## 🎯 Test Data Script (Quick Setup)

Run this in MongoDB to create test data:

```javascript
// Create 5 test buyers
for (let i = 1; i <= 5; i++) {
  db.users.insertOne({
    email: `buyer${i}@test.com`,
    phone: `+92300123456${i}`,
    passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz",
    firstName: `Buyer`,
    lastName: `${i}`,
    role: "buyer",
    isActive: i % 2 === 0, // Some active, some suspended
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

// Create 5 test sellers
for (let i = 1; i <= 5; i++) {
  const sellerId = new ObjectId();
  
  db.users.insertOne({
    _id: sellerId,
    email: `seller${i}@test.com`,
    phone: `+92301234567${i}`,
    passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz",
    firstName: `Seller`,
    lastName: `${i}`,
    role: "seller",
    isActive: i > 2, // First 2 pending, rest active
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  db.selleronboardings.insertOne({
    userId: sellerId,
    phone: `+92301234567${i}`,
    status: "completed",
    currentStep: 6,
    isOtpVerified: true,
    basicInfo: { firstName: `Seller`, lastName: `${i}` },
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
      idCardName: `Seller ${i}`,
      idCardNumber: `42201-123456${i}-${i}`,
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

print("✅ Created 5 test buyers and 5 test sellers");
```

---

## 🎉 Success Indicators

### You'll know it's working when:
1. ✅ Admin can login successfully
2. ✅ Buyers page shows list from database
3. ✅ Block button changes buyer status
4. ✅ Toast notifications appear with success messages
5. ✅ List refreshes automatically after actions
6. ✅ Sellers page shows seller details
7. ✅ Approve button activates pending sellers
8. ✅ No console errors in browser DevTools
9. ✅ Network tab shows 200 OK responses
10. ✅ Mobile view works correctly

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check backend terminal for errors
3. Check Network tab in DevTools
4. Verify MongoDB has data
5. Verify admin user exists and has correct role

---

**Your admin panel is now connected to the real backend!** 🎉

All API calls are live:
- ✅ GET /api/admin/buyers
- ✅ POST /api/admin/buyers/:id/block
- ✅ POST /api/admin/buyers/:id/unblock
- ✅ POST /api/admin/buyers/:id/approve
- ✅ GET /api/admin/sellers
- ✅ GET /api/admin/sellers/:id
- ✅ POST /api/admin/sellers/:id/approve
- ✅ POST /api/admin/sellers/:id/suspend
- ✅ POST /api/admin/sellers/:id/reactivate

