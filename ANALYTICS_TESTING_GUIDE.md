# Analytics Testing Guide

## How SellerDailyStats and SellerProductStats Work

### 📊 Overview

These are **pre-aggregated analytics tables** (like Amazon/Daraz) that store calculated data for fast reporting. Instead of querying all orders every time, we store daily summaries and product summaries.

---

## 🔄 Data Flow

### 1. **When Order is Delivered** → Analytics Updated Automatically

```
Order Status: "delivered"
    ↓
updateAnalyticsOnDelivery() is called
    ↓
Updates SellerDailyStats (for that day)
    ↓
Updates SellerProductStats (for each product in order)
```

### 2. **When Order is Cancelled/Refunded** → Analytics Decremented

```
Order Status: "cancelled" or "refunded"
    ↓
updateAnalyticsOnCancellation() is called
    ↓
Decrements SellerDailyStats (removes from that day)
    ↓
Decrements SellerProductStats (removes from each product)
```

### 3. **When Reports are Requested** → Fast Query from Analytics

```
Seller requests reports
    ↓
Query SellerDailyStats (fast!)
    ↓
Query SellerProductStats (fast!)
    ↓
Return data (no need to calculate from orders)
```

---

## 🧪 Testing Flow

### Step 1: Check Current Analytics Data

**Option A: Using the test script (EASIEST - Recommended)**

```bash
# Navigate to backend directory
cd backend

# View analytics for a specific seller
node scripts/test-analytics.mjs YOUR_SELLER_ID view

# Check if analytics are in sync with orders
node scripts/test-analytics.mjs YOUR_SELLER_ID sync

# Backfill analytics from existing orders
node scripts/test-analytics.mjs YOUR_SELLER_ID backfill
```

**Option B: Using the test utility**

```bash
# Make sure MongoDB is connected
cd backend

# View analytics for a specific seller
node -e "import('./src/utils/testAnalytics.js').then(m => m.viewAnalytics('YOUR_SELLER_ID'))"
```

**Option B: Using MongoDB directly**

```javascript
// Connect to MongoDB
use your_database_name

// View daily stats
db.sellerdailystats.find({ sellerId: ObjectId("YOUR_SELLER_ID") }).sort({ date: -1 }).limit(5)

// View product stats
db.sellerproductstats.find({ sellerId: ObjectId("YOUR_SELLER_ID") }).sort({ quantitySold: -1 }).limit(5)
```

### Step 2: Create a Test Order

1. **As a buyer**, create an order with products from the seller
2. **As a seller/admin**, mark the order as "delivered"
3. **Check analytics** - they should update automatically!

### Step 3: Verify Analytics Update

After marking order as delivered:

```bash
# Check analytics again (using script)
node scripts/test-analytics.mjs YOUR_SELLER_ID view

# Or using utility
node -e "import('./src/utils/testAnalytics.js').then(m => m.viewAnalytics('YOUR_SELLER_ID'))"
```

You should see:
- ✅ New entry in `SellerDailyStats` for today
- ✅ Updated entries in `SellerProductStats` for products in the order

### Step 4: Test Reports Endpoint

```bash
# Make API request (as seller)
curl -X GET "http://localhost:4000/api/seller/reports?range=30d" \
  -H "Cookie: token=YOUR_SELLER_TOKEN"
```

Or test in browser:
1. Login as seller
2. Go to Seller Dashboard → Manage Reports
3. Check if data appears

---

## 📋 Complete Testing Scenario

### Scenario: Test Full Analytics Flow

1. **Initial State Check**
   ```bash
   node -e "import('./src/utils/testAnalytics.js').then(m => m.viewAnalytics('SELLER_ID'))"
   ```
   - Should show empty or existing analytics

2. **Create Test Order**
   - Login as buyer
   - Add products to cart
   - Place order
   - Note the order number

3. **Mark Order as Delivered**
   - Login as seller/admin
   - Go to Orders page
   - Find the order
   - Change status to "delivered"

4. **Check Analytics Updated**
   ```bash
   node -e "import('./src/utils/testAnalytics.js').then(m => m.viewAnalytics('SELLER_ID'))"
   ```
   - Should see new daily stats entry
   - Should see product stats updated

5. **Check Reports Page**
   - Go to Seller Dashboard → Manage Reports
   - Should see:
     - Total sales updated
     - Best selling product
     - Sales trend chart with data
     - Top products table

6. **Test Cancellation (Optional)**
   - Cancel the order
   - Check analytics again
   - Should see values decremented

---

## 🔍 Understanding the Data Structure

### SellerDailyStats Schema

```javascript
{
  sellerId: ObjectId,        // Which seller
  date: Date,               // Which day (YYYY-MM-DD, time set to 00:00:00)
  totalSales: Number,       // Total sales for that day
  orderCount: Number,       // Number of orders that day
  refundCount: Number,      // Number of refunds that day
  refundAmount: Number,      // Total refund amount
  newCustomers: Number,      // New customers that day
  customerIds: [ObjectId]   // Unique customer IDs (for tracking)
}
```

**Example:**
```javascript
{
  sellerId: ObjectId("..."),
  date: ISODate("2024-01-15T00:00:00Z"),
  totalSales: 5000,
  orderCount: 3,
  refundCount: 0,
  newCustomers: 2
}
```

### SellerProductStats Schema

```javascript
{
  sellerId: ObjectId,        // Which seller
  productId: ObjectId,       // Which product
  totalSales: Number,        // Total sales amount for this product
  quantitySold: Number,      // Total quantity sold
  refundCount: Number,       // Number of refunds for this product
  orderCount: Number,         // Number of orders containing this product
  lastUpdated: Date          // When last updated
}
```

**Example:**
```javascript
{
  sellerId: ObjectId("..."),
  productId: ObjectId("..."),
  totalSales: 15000,
  quantitySold: 10,
  refundCount: 1,
  orderCount: 5
}
```

---

## 🐛 Troubleshooting

### Problem: Analytics not updating

**Check:**
1. Is order status actually "delivered"?
2. Check backend console for errors
3. Verify `updateAnalyticsOnDelivery` is being called

**Solution:**
```bash
# Check if function is called
# Look for logs: "Error updating analytics on delivery"
```

### Problem: Reports showing empty data

**Check:**
1. Are there any delivered orders?
2. Are analytics tables populated?
3. Check browser console for API errors

**Solution:**
```bash
# Run backfill to populate from existing orders
node -e "import('./src/utils/backfillAnalytics.js').then(m => m.backfillSellerAnalytics('SELLER_ID'))"
```

### Problem: Analytics out of sync

**Check sync:**
```bash
node -e "import('./src/utils/testAnalytics.js').then(m => m.checkAnalyticsSync('SELLER_ID'))"
```

**Fix:**
- Run backfill utility
- Or wait for new orders to update automatically

---

## 📝 Key Points

1. **Automatic Updates**: Analytics update automatically when orders are delivered/cancelled
2. **Fast Queries**: Reports use pre-aggregated data (fast!)
3. **Fallback**: If analytics empty, system calculates from orders (slower but works)
4. **Incremental**: Each order delivery increments the stats
5. **Decremental**: Cancellations decrement the stats

---

## 🚀 Quick Test Commands

**Using the test script (EASIEST):**

```bash
# View analytics for seller
node scripts/test-analytics.mjs SELLER_ID view

# Check if analytics are in sync
node scripts/test-analytics.mjs SELLER_ID sync

# Backfill analytics from existing orders
node scripts/test-analytics.mjs SELLER_ID backfill
```

**Using utilities directly:**

```bash
# View analytics for seller
node -e "import('./src/utils/testAnalytics.js').then(m => m.viewAnalytics('SELLER_ID'))"

# Check if analytics are in sync
node -e "import('./src/utils/testAnalytics.js').then(m => m.checkAnalyticsSync('SELLER_ID'))"

# Backfill analytics from existing orders
node -e "import('./src/utils/backfillAnalytics.js').then(m => m.backfillSellerAnalytics('SELLER_ID'))"
```

---

## 💡 Best Practices

1. **For New Sellers**: Analytics will populate automatically as orders are delivered
2. **For Existing Sellers**: Run backfill once to populate from historical orders
3. **Monitoring**: Use `checkAnalyticsSync` periodically to ensure data integrity
4. **Testing**: Always test with a real order flow (create → deliver → check)

---

## 📊 Example: Complete Flow

```
Day 1:
  - Seller has 0 analytics data
  - Buyer places order for Product A (PKR 1000)
  - Seller marks order as "delivered"
  
  Result:
    SellerDailyStats: {
      date: 2024-01-15,
      totalSales: 1000,
      orderCount: 1
    }
    SellerProductStats: {
      productId: Product A,
      quantitySold: 1,
      totalSales: 1000
    }

Day 2:
  - Buyer places another order for Product A (PKR 1000) and Product B (PKR 500)
  - Seller marks order as "delivered"
  
  Result:
    SellerDailyStats: {
      date: 2024-01-16,
      totalSales: 1500,
      orderCount: 1
    }
    SellerProductStats: [
      { productId: Product A, quantitySold: 2, totalSales: 2000 },
      { productId: Product B, quantitySold: 1, totalSales: 500 }
    ]

Reports Page:
  - Total Sales: PKR 2.5K (1000 + 1500)
  - Best Selling: Product A (2 sold)
  - Sales Trend: Shows 1000 for Jan 15, 1500 for Jan 16
```

---

This is how Amazon/Daraz handle analytics - pre-aggregated tables for fast reporting! 🚀

