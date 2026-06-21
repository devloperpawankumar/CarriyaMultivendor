# How Analytics & Reports Work - Amazon/Daraz Style

## Overview
This document explains how analytics and reports are fetched, calculated, and stored in our system, and how major platforms like Amazon and Daraz handle this.

---

## How Our Current Implementation Works

### **1. Real-Time Calculation (Current Approach)**

**Location**: `backend/src/controllers/reportsController.js`

**How It Works:**
- **No Pre-Stored Data**: Analytics are **calculated on-demand** when the seller requests reports
- **Data Source**: Queries the actual database tables (Orders, Products, Reviews, Users)
- **Calculation**: Aggregates data from multiple collections in real-time

**Example Flow:**
```javascript
// When seller requests reports:
1. Query Orders collection for delivered orders in date range
2. Calculate total sales by summing order totals
3. Query Products to find top-selling products
4. Query Orders for refund/return data
5. Query Users for demographics
6. Aggregate all data and return to frontend
```

**Pros:**
- ✅ Always accurate (real-time data)
- ✅ No storage overhead
- ✅ Easy to implement

**Cons:**
- ❌ Slower for large datasets (multiple database queries)
- ❌ Higher database load
- ❌ Can't show historical trends easily

---

## How Amazon & Daraz Handle Analytics

### **Amazon's Approach:**

#### **1. Hybrid System (Pre-Aggregated + Real-Time)**

**Data Storage:**
- **Pre-aggregated metrics** stored in analytics tables
- **Updated incrementally** when events occur (order placed, delivered, cancelled)
- **Real-time queries** for current data
- **Historical snapshots** stored daily/weekly

**Architecture:**
```
Event (Order Placed) 
  → Updates Analytics Tables
    → Daily Aggregation Job
      → Weekly/Monthly Summaries
        → Historical Reports
```

**Key Features:**
1. **Incremental Updates**: When order is delivered, analytics are updated immediately
2. **Pre-aggregated Tables**: 
   - `seller_daily_stats` (sales per day)
   - `seller_product_stats` (product performance)
   - `seller_customer_stats` (demographics)
3. **Background Jobs**: Daily/weekly aggregation jobs
4. **Caching**: Frequently accessed reports are cached

**Example Tables:**
```sql
-- Daily stats (updated incrementally)
seller_daily_stats:
  - seller_id
  - date
  - total_sales
  - order_count
  - refund_count
  - new_customers

-- Product performance (updated on order)
seller_product_stats:
  - seller_id
  - product_id
  - total_sales
  - quantity_sold
  - refund_rate
  - last_updated
```

#### **2. Real-Time Dashboard**
- Current day data: Real-time queries
- Historical data: Pre-aggregated tables
- Trends: Calculated from aggregated data

### **Daraz's Approach:**

**Similar to Amazon:**
- Pre-aggregated analytics tables
- Incremental updates on events
- Daily/weekly aggregation jobs
- Caching for performance

**Key Differences:**
- Simpler aggregation (less complex than Amazon)
- Focus on seller-friendly metrics
- Real-time for current period, aggregated for history

---

## Database Storage Strategies

### **Option 1: Real-Time Calculation (Our Current Approach)**

**How It Works:**
```javascript
// Every time seller requests reports:
const orders = await Order.find({ sellerId, status: 'delivered' });
const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
// No storage, calculated on-the-fly
```

**Storage**: ❌ No analytics tables
**Performance**: ⚠️ Slower for large datasets
**Accuracy**: ✅ Always accurate

### **Option 2: Pre-Aggregated Tables (Amazon/Daraz Style)**

**How It Works:**
```javascript
// When order is delivered:
await SellerDailyStats.updateOne(
  { sellerId, date: today },
  { $inc: { totalSales: order.total, orderCount: 1 } }
);

// When seller requests reports:
const stats = await SellerDailyStats.find({ sellerId, date: { $gte: startDate } });
// Fast query from pre-aggregated data
```

**Storage**: ✅ Analytics tables
**Performance**: ✅ Fast queries
**Accuracy**: ✅ Accurate (updated incrementally)

### **Option 3: Hybrid Approach (Best Practice)**

**How It Works:**
- **Current period** (today, this week): Real-time calculation
- **Historical data** (past months): Pre-aggregated tables
- **Background jobs**: Daily aggregation for historical data

---

## Our Current Implementation Details

### **What We Calculate:**

1. **Total Sales**
   ```javascript
   // Query all delivered orders in date range
   const orders = await Order.find({
     sellerId,
     status: 'delivered',
     createdAt: { $gte: startDate, $lte: endDate }
   });
   const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
   ```

2. **Top Products**
   ```javascript
   // Count sales per product from orders
   const productSalesMap = new Map();
   orders.forEach(order => {
     order.items.forEach(item => {
       productSalesMap.set(item.productId, 
         (productSalesMap.get(item.productId) || 0) + item.quantity
       );
     });
   });
   ```

3. **Refund/Return Rate**
   ```javascript
   // Query cancelled/refunded orders
   const refundedOrders = await Order.countDocuments({
     sellerId,
     status: { $in: ['cancelled', 'refunded'] }
   });
   const refundRate = (refundedOrders / totalOrders) * 100;
   ```

4. **Sales Trend (12 Months)**
   ```javascript
   // Query orders for each month
   for (let month = 0; month < 12; month++) {
     const monthOrders = await Order.find({
       sellerId,
       status: 'delivered',
       createdAt: { $gte: monthStart, $lte: monthEnd }
     });
     // Calculate sales for this month
   }
   ```

5. **Demographics**
   ```javascript
   // Get buyer data from orders
   const buyerIds = [...new Set(orders.map(o => o.buyerId))];
   const buyers = await User.find({ _id: { $in: buyerIds } });
   // Calculate gender split, locations, etc.
   ```

### **Performance Considerations:**

**Current Issues:**
- Multiple database queries per report request
- No caching
- Recalculates everything each time
- Can be slow for sellers with many orders

**Optimization Opportunities:**
- Add analytics tables
- Implement incremental updates
- Add caching layer
- Background aggregation jobs

---

## Recommended Implementation (Amazon/Daraz Style)

### **Step 1: Create Analytics Models**

```javascript
// backend/src/models/SellerDailyStats.js
const sellerDailyStatsSchema = new mongoose.Schema({
  sellerId: { type: ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true, index: true },
  totalSales: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  refundCount: { type: Number, default: 0 },
  newCustomers: { type: Number, default: 0 },
}, { timestamps: true });

// Compound index for fast queries
sellerDailyStatsSchema.index({ sellerId: 1, date: -1 });
```

```javascript
// backend/src/models/SellerProductStats.js
const sellerProductStatsSchema = new mongoose.Schema({
  sellerId: { type: ObjectId, ref: 'User', required: true, index: true },
  productId: { type: ObjectId, ref: 'Product', required: true, index: true },
  totalSales: { type: Number, default: 0 },
  quantitySold: { type: Number, default: 0 },
  refundCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

sellerProductStatsSchema.index({ sellerId: 1, totalSales: -1 });
```

### **Step 2: Incremental Updates**

```javascript
// When order is delivered (in ordersController.js)
export async function updateOrderStatus(req, res, next) {
  // ... update order status ...
  
  if (newStatus === 'delivered') {
    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await SellerDailyStats.updateOne(
      { sellerId: order.sellerId, date: today },
      { 
        $inc: { 
          totalSales: order.total,
          orderCount: 1 
        } 
      },
      { upsert: true }
    );
    
    // Update product stats
    for (const item of order.items) {
      await SellerProductStats.updateOne(
        { sellerId: order.sellerId, productId: item.productId },
        {
          $inc: {
            totalSales: item.price * item.quantity,
            quantitySold: item.quantity
          }
        },
        { upsert: true }
      );
    }
  }
}
```

### **Step 3: Query Pre-Aggregated Data**

```javascript
// In reportsController.js
export async function getSellerReports(req, res, next) {
  const sellerId = req.user?.id;
  
  // Fast query from pre-aggregated data
  const dailyStats = await SellerDailyStats.find({
    sellerId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
  
  // Calculate totals from aggregated data
  const totalSales = dailyStats.reduce((sum, stat) => sum + stat.totalSales, 0);
  
  // Get top products from pre-aggregated stats
  const topProducts = await SellerProductStats.find({ sellerId })
    .sort({ totalSales: -1 })
    .limit(10)
    .populate('productId', 'title');
}
```

### **Step 4: Background Aggregation Job**

```javascript
// Daily job to aggregate data (can use node-cron)
import cron from 'node-cron';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  // Aggregate previous day's data
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  // Calculate and store daily aggregates
  // This ensures data is always available even if incremental updates fail
});
```

---

## Comparison: Current vs Recommended

| Aspect | Current (Real-Time) | Recommended (Pre-Aggregated) |
|--------|---------------------|------------------------------|
| **Storage** | ❌ No analytics tables | ✅ Analytics tables |
| **Speed** | ⚠️ Slower (multiple queries) | ✅ Fast (single query) |
| **Accuracy** | ✅ Always accurate | ✅ Accurate (incremental updates) |
| **Scalability** | ❌ Poor (slows with data growth) | ✅ Excellent (constant speed) |
| **Complexity** | ✅ Simple | ⚠️ More complex |
| **Real-Time** | ✅ Yes | ⚠️ Near real-time (updated on events) |

---

## Best Practices (Following Amazon/Daraz)

### **1. Incremental Updates**
- Update analytics when events occur (order delivered, cancelled, etc.)
- Don't recalculate everything each time

### **2. Pre-Aggregated Tables**
- Store daily/weekly/monthly summaries
- Fast queries for historical data

### **3. Background Jobs**
- Daily aggregation jobs
- Weekly/monthly summaries
- Data cleanup and optimization

### **4. Caching**
- Cache frequently accessed reports
- Invalidate cache on updates
- Use Redis or similar

### **5. Real-Time for Current Period**
- Current day: Real-time calculation
- Historical: Pre-aggregated data
- Best of both worlds

---

## Summary

### **Our Current System:**
- ✅ **Real-time calculation** from actual database
- ✅ **Always accurate**
- ⚠️ **Can be slow** for large datasets
- ❌ **No pre-stored analytics**

### **Amazon/Daraz System:**
- ✅ **Pre-aggregated tables** (fast queries)
- ✅ **Incremental updates** (accurate)
- ✅ **Background jobs** (daily aggregation)
- ✅ **Caching** (performance)
- ✅ **Hybrid approach** (real-time + aggregated)

### **Recommendation:**
For production, implement **pre-aggregated analytics tables** with **incremental updates** to match Amazon/Daraz performance and scalability.

---

## Next Steps

1. **Create Analytics Models** (SellerDailyStats, SellerProductStats)
2. **Add Incremental Updates** (update on order events)
3. **Modify Reports Controller** (query aggregated data)
4. **Add Background Jobs** (daily aggregation)
5. **Add Caching** (Redis or in-memory cache)

This will make reports **fast, scalable, and production-ready** like Amazon/Daraz!

