# 🧪 Mock Data Testing Guide

## Quick Start

The Admin Sellers Dashboard is now configured with **mock data** for testing! You can test all features without needing the backend API.

---

## ✅ What's Working Right Now

All features are fully functional with mock data:

- ✅ **22 sample sellers** loaded
- ✅ **Pagination** (Previous/Next, page numbers)
- ✅ **Search** (by store name, owner name, or email)
- ✅ **Status filtering** (Active, Pending, Suspended)
- ✅ **Loading states** (with 800ms simulated delay)
- ✅ **View Profile** navigation

---

## 🎯 How to Test

### 1. **View All Sellers**
Just navigate to the Admin Sellers page - you'll see 22 mock sellers loaded automatically!

### 2. **Test Pagination**
- Click "Next" to see page 2 (sellers 11-20)
- Click "Previous" to go back
- Click page numbers to jump to specific pages
- Each page shows 10 sellers by default

### 3. **Test Search**
Try searching for:
- `tech` - finds "Tech Store" and "Electronics Plus"
- `john` - finds "John Merchant"
- `@beauty.com` - finds "Amanda Glow"
- `fashion` - finds "Fashion Hub"

### 4. **Test Status Badges**
The sellers have different statuses with color-coded badges:
- **Green** = Active (majority of sellers)
- **Yellow** = Pending (some sellers)
- **Red** = Suspended (a few sellers)

### 5. **Test View Profile**
Click any "View Profile" button - it will navigate to `/admin/sellers/{id}`

---

## 🔧 Configuration

### Toggle Mock Data On/Off

Open `frontend/src/services/adminService.ts` and find this line:

```typescript
// 🧪 MOCK DATA - Set to true to use mock data for testing
const USE_MOCK_DATA = true;
```

**To use mock data (for testing):**
```typescript
const USE_MOCK_DATA = true;  // ✅ Currently enabled
```

**To use real API (when backend is ready):**
```typescript
const USE_MOCK_DATA = false;  // Switch to real API
```

---

## 📊 Mock Data Overview

### Total Sellers: 22

**By Status:**
- Active: 15 sellers
- Pending: 5 sellers
- Suspended: 2 sellers

**Sample Sellers:**
1. Tech Store - John Merchant (15% commission)
2. Fashion Hub - Sarah Style (12% commission)
3. Book World - Mike Reader (10% commission)
4. Sports Gear Pro - Tom Athlete (18% commission)
5. ... and 18 more!

**Commission Range:** 10% - 20%

---

## 🎨 Testing Checklist

Use this checklist to test all features:

### Basic Features
- [ ] Page loads without errors
- [ ] Table displays with all columns
- [ ] All 22 sellers are available
- [ ] Loading spinner shows briefly

### Pagination
- [ ] First page shows sellers 1-10
- [ ] "Previous" button is disabled on page 1
- [ ] "Next" button works
- [ ] Page numbers are clickable
- [ ] Last page shows correctly
- [ ] "Showing X to Y of Z results" updates correctly

### Search
- [ ] Search bar accepts input
- [ ] Search filters results in real-time
- [ ] Empty search shows all sellers
- [ ] "No sellers found" shows when no matches
- [ ] Pagination resets to page 1 on search

### Status Badges
- [ ] Active badge is green
- [ ] Pending badge is yellow
- [ ] Suspended badge is red
- [ ] Badge colors match design

### Interactions
- [ ] "View Profile" buttons are clickable
- [ ] Clicking navigates to seller detail page
- [ ] Hover effects work on buttons

### Performance
- [ ] Page loads quickly
- [ ] Search responds smoothly
- [ ] Pagination is instant
- [ ] No console errors

---

## 🐛 Debugging

### Check Console Logs

When using mock data, you'll see these logs:

```
🧪 Using MOCK data for sellers
🧪 Mock Data: { page: 1, pageSize: 10, status: undefined, search: "", total: 22, itemsCount: 10 }
```

This confirms mock data is active!

### If You See Errors

1. **"Failed to load sellers"** → Check that `USE_MOCK_DATA = true`
2. **No data showing** → Open DevTools Console and check for errors
3. **Search not working** → Make sure you're typing in the search box
4. **Pagination not working** → Check console for JavaScript errors

---

## 🔄 How Mock Data Works

The mock data simulates a real backend API:

1. **Simulated Network Delay**: 800ms delay to mimic real API calls
2. **Filtering**: Supports status filtering (active/pending/suspended)
3. **Searching**: Case-insensitive search across multiple fields
4. **Pagination**: Properly slices data based on page and pageSize
5. **Total Count**: Returns accurate total for filtered results

### Example Mock Response

```json
{
  "items": [
    {
      "id": "seller_001",
      "storeName": "Tech Store",
      "ownerName": "John Merchant",
      "email": "john@techstore.com",
      "status": "Active",
      "commission": 15
    }
    // ... more sellers
  ],
  "total": 22,
  "page": 1,
  "pageSize": 10
}
```

---

## 🚀 When Backend is Ready

### Step 1: Switch to Real API
```typescript
// In adminService.ts
const USE_MOCK_DATA = false;  // Change this to false
```

### Step 2: Implement Backend Endpoint
Your backend needs to implement:
```
GET /api/admin/sellers?page=1&pageSize=10&status=active&search=tech
```

See `ADMIN_SELLERS_API_SPEC.md` for full API documentation.

### Step 3: Test Integration
1. Start your backend server
2. Switch `USE_MOCK_DATA = false`
3. Refresh the admin sellers page
4. Verify real data loads correctly

---

## 💡 Tips

### Adding More Mock Data
To add more sellers to test with larger datasets:

1. Open `adminService.ts`
2. Find the `MOCK_SELLERS_DATA` array
3. Add more seller objects following the same format:

```typescript
{
  id: 'seller_023',
  storeName: 'New Store',
  ownerName: 'New Owner',
  email: 'new@store.com',
  status: 'Active',
  commission: 15,
  createdAt: '2024-02-06T10:00:00Z',
}
```

### Testing Edge Cases
- **Empty Results**: Search for "xyz123" to test "No sellers found"
- **Single Page**: Reduce mock data to < 10 items to test single page
- **Many Pages**: Add 100+ mock sellers to test pagination with many pages
- **All Statuses**: Filter by different statuses to see each badge color

---

## 📖 Related Documentation

- `ADMIN_SELLERS_API_SPEC.md` - Backend API requirements
- `ADMIN_SELLERS_IMPROVEMENTS.md` - Complete feature list
- `mockSellerData.ts` - Advanced mock data generator

---

## ✨ Summary

You're all set to test! The Admin Sellers Dashboard is fully functional with:
- ✅ 22 realistic mock sellers
- ✅ Full pagination (3 pages)
- ✅ Working search
- ✅ Status filtering ready
- ✅ Color-coded badges
- ✅ Loading states

**Just open the Admin Sellers page and start testing!** 🎉

To switch to the real backend later, simply change:
```typescript
const USE_MOCK_DATA = false;
```

Happy testing! 🚀

