# Analytics Flow Diagram

## 🔄 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDER LIFECYCLE                              │
└─────────────────────────────────────────────────────────────────┘

1. ORDER CREATED
   ┌──────────────┐
   │   Order      │  Status: "pending"
   │   Created    │
   └──────┬───────┘
          │
          │ (No analytics update yet)
          │
          ▼

2. ORDER DELIVERED
   ┌──────────────┐
   │   Order      │  Status: "delivered"
   │   Delivered  │  deliveredAt: Date
   └──────┬───────┘
          │
          │ ✅ Triggers: updateAnalyticsOnDelivery()
          │
          ├─────────────────────────────────────┐
          │                                     │
          ▼                                     ▼
   ┌──────────────────┐              ┌──────────────────┐
   │ SellerDailyStats │              │SellerProductStats │
   │                  │              │                   │
   │ date: 2024-01-15 │              │ productId: A      │
   │ totalSales: +1000│              │ quantitySold: +1  │
   │ orderCount: +1    │              │ totalSales: +1000  │
   │ newCustomers: +1  │              │ orderCount: +1     │
   └──────────────────┘              └──────────────────┘
          │                                     │
          │                                     │
          └──────────────┬──────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Analytics Updated  │
              │   (Incremental)       │
              └──────────────────────┘


3. ORDER CANCELLED (if already delivered)
   ┌──────────────┐
   │   Order      │  Status: "cancelled"
   │   Cancelled  │
   └──────┬───────┘
          │
          │ ✅ Triggers: updateAnalyticsOnCancellation()
          │
          ├─────────────────────────────────────┐
          │                                     │
          ▼                                     ▼
   ┌──────────────────┐              ┌──────────────────┐
   │ SellerDailyStats │              │SellerProductStats │
   │                  │              │                   │
   │ totalSales: -1000│              │ quantitySold: -1  │
   │ orderCount: -1   │              │ totalSales: -1000 │
   │ refundCount: +1  │              │ refundCount: +1   │
   └──────────────────┘              └──────────────────┘
```

---

## 📊 Reports Query Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              SELLER REQUESTS REPORTS                            │
└─────────────────────────────────────────────────────────────────┘

GET /api/seller/reports?range=30d
          │
          ▼
┌─────────────────────────────────────┐
│   getSellerReports()                │
│   (reportsController.js)            │
└──────────────┬──────────────────────┘
               │
               ├─────────────────────────────────────┐
               │                                     │
               ▼                                     ▼
    ┌──────────────────┐              ┌──────────────────┐
    │ SellerDailyStats │              │SellerProductStats │
    │                  │              │                   │
    │ Fast Query       │              │ Fast Query        │
    │ (Pre-aggregated) │              │ (Pre-aggregated)  │
    └────────┬─────────┘              └────────┬─────────┘
             │                                   │
             │                                   │
             └──────────────┬────────────────────┘
                            │
                            ▼
                 ┌──────────────────┐
                 │  Calculate Totals │
                 │  - Total Sales   │
                 │  - Order Count   │
                 │  - Top Products   │
                 │  - Sales Trend    │
                 └──────────┬────────┘
                            │
                            ▼
                 ┌──────────────────┐
                 │  Return JSON     │
                 │  {               │
                 │    summary: {...}│
                 │    trend: {...}  │
                 │    ...           │
                 │  }               │
                 └──────────────────┘
```

---

## 🔍 What Happens in Each Step

### Step 1: Order Created
- **Analytics**: ❌ No update (order not delivered yet)
- **Reason**: Only delivered orders count toward sales

### Step 2: Order Delivered
- **Function Called**: `updateAnalyticsOnDelivery(order)`
- **SellerDailyStats Update**:
  ```javascript
  {
    sellerId: ObjectId("..."),
    date: ISODate("2024-01-15T00:00:00Z"),  // Date normalized to midnight
    totalSales: 1000,                        // Incremented
    orderCount: 1,                           // Incremented
    newCustomers: 1,                         // If first order from buyer
    customerIds: [ObjectId("buyerId")]      // Track unique customers
  }
  ```
- **SellerProductStats Update** (for each product):
  ```javascript
  {
    sellerId: ObjectId("..."),
    productId: ObjectId("..."),
    totalSales: 1000,        // Incremented
    quantitySold: 1,          // Incremented
    orderCount: 1,            // Incremented
    lastUpdated: Date.now()
  }
  ```

### Step 3: Order Cancelled (if delivered)
- **Function Called**: `updateAnalyticsOnCancellation(order)`
- **SellerDailyStats Update**:
  ```javascript
  {
    totalSales: -1000,        // Decremented
    orderCount: -1,           // Decremented
    refundCount: +1,          // Incremented
    refundAmount: +1000       // Incremented
  }
  ```
- **SellerProductStats Update**:
  ```javascript
  {
    totalSales: -1000,        // Decremented
    quantitySold: -1,         // Decremented
    refundCount: +1,          // Incremented
    orderCount: -1            // Decremented
  }
  ```

---

## 📈 Example: Real-World Scenario

### Day 1: First Order
```
Order #001:
  - Product A: 2 units × PKR 500 = PKR 1000
  - Product B: 1 unit × PKR 300 = PKR 300
  - Total: PKR 1300
  - Status: delivered

Result:
  SellerDailyStats (2024-01-15):
    totalSales: 1300
    orderCount: 1
    newCustomers: 1

  SellerProductStats:
    Product A: { quantitySold: 2, totalSales: 1000 }
    Product B: { quantitySold: 1, totalSales: 300 }
```

### Day 2: Second Order
```
Order #002:
  - Product A: 1 unit × PKR 500 = PKR 500
  - Product C: 3 units × PKR 200 = PKR 600
  - Total: PKR 1100
  - Status: delivered

Result:
  SellerDailyStats (2024-01-16):
    totalSales: 1100
    orderCount: 1
    newCustomers: 0  (same buyer)

  SellerProductStats:
    Product A: { quantitySold: 3, totalSales: 1500 }  // Updated
    Product B: { quantitySold: 1, totalSales: 300 }  // Unchanged
    Product C: { quantitySold: 3, totalSales: 600 } // New
```

### Day 3: Order Cancelled
```
Order #001 cancelled:
  - Refund: PKR 1300

Result:
  SellerDailyStats (2024-01-15):
    totalSales: 0      // 1300 - 1300
    orderCount: 0      // 1 - 1
    refundCount: 1
    refundAmount: 1300

  SellerProductStats:
    Product A: { quantitySold: 1, totalSales: 500, refundCount: 1 }
    Product B: { quantitySold: 0, totalSales: 0, refundCount: 1 }
```

---

## 🎯 Key Points

1. **Incremental Updates**: Each delivery increments, each cancellation decrements
2. **Date Normalization**: All dates stored at midnight (00:00:00) for daily grouping
3. **Unique Constraints**: One record per seller per day (daily stats), one per seller per product (product stats)
4. **Automatic**: No manual intervention needed - updates happen automatically
5. **Fast Queries**: Reports use pre-aggregated data, not raw orders

---

## 🔧 Testing Checklist

- [ ] Create an order
- [ ] Mark order as delivered
- [ ] Check `SellerDailyStats` - should have new entry
- [ ] Check `SellerProductStats` - should have updated entries
- [ ] View reports page - should show data
- [ ] Cancel order (if delivered)
- [ ] Check analytics - should be decremented
- [ ] Run sync check - should be in sync

---

This is the complete flow! 🚀

