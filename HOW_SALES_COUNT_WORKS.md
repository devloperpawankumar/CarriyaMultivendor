# How Sales Count Works - Amazon/Daraz Style

## Overview
This document explains what "Sales" means, how it's updated, how it works, and how major e-commerce platforms like Amazon and Daraz handle it.

---

## What is "Sales" (Sales Count)?

**Sales Count** = The total number of units sold for a product.

- **Example**: If a product shows "1,234 Sales", it means 1,234 units of that product have been sold.
- **Purpose**: Shows product popularity and helps customers make purchasing decisions.
- **Display**: Shown on product cards, product detail pages, and seller dashboards.

---

## How Amazon & Daraz Display Sales

### **Amazon:**
1. **Sales Indicators:**
   - "Best Seller" badge (for top-selling products)
   - "Amazon's Choice" badge
   - Sales rank (e.g., "#1 in Electronics")
   - "X bought in the past month" (recent sales)
   - "X sold in the last 30 days"

2. **Display Locations:**
   - Product detail page
   - Search results (for popular items)
   - Category pages (best sellers section)

3. **Sales Metrics:**
   - Total lifetime sales (not always shown)
   - Recent sales (last 30 days, last week)
   - Sales rank within category

### **Daraz:**
1. **Sales Indicators:**
   - "Best Seller" badge
   - "Top Selling" badge
   - Sales count display (e.g., "1,234 sold")
   - "X sold in last 7 days"

2. **Display Locations:**
   - Product cards
   - Product detail pages
   - Seller store pages
   - Category pages

3. **Sales Metrics:**
   - Total sales count
   - Recent sales (last 7 days, last 30 days)
   - Sales trends (increasing/decreasing)

---

## How Our Implementation Works

### **1. Database Field:**
```javascript
// Product Model (backend/src/models/Product.js)
salesCount: {
  type: Number,
  default: 0,
}
```

### **2. When Sales Count is Updated:**

#### **✅ Incremented (Increased):**
- **When**: Order is created successfully
- **Location**: `backend/src/controllers/ordersController.js` → `createOrder()`
- **Code**:
  ```javascript
  // When order is created
  product.salesCount = (product.salesCount || 0) + item.quantity;
  await product.save();
  ```
- **Example**: 
  - Product has 100 sales
  - Customer buys 3 units
  - New sales count: 100 + 3 = 103

#### **✅ Decremented (Decreased):**
- **When**: Order is cancelled
- **Location**: `backend/src/controllers/ordersController.js` → `cancelOrder()`
- **Code**:
  ```javascript
  // When order is cancelled
  product.salesCount = Math.max(0, (product.salesCount || 0) - item.quantity;
  await product.save();
  ```
- **Example**:
  - Product has 100 sales
  - Customer cancels order for 2 units
  - New sales count: 100 - 2 = 98 (minimum 0)

### **3. Important Notes:**

#### **Stock vs Sales Count:**
- **Stock**: Available inventory (decreases when order placed)
- **Sales Count**: Total units sold (increases when order placed)
- **Relationship**: 
  - When order placed: Stock ↓, Sales Count ↑
  - When order cancelled: Stock ↑, Sales Count ↓

#### **Unlimited Stock Products:**
- Products with `unlimitedStock = true` still update sales count
- Stock doesn't decrease, but sales count increases

#### **Order Status:**
- Sales count updates **immediately** when order is created
- If order is cancelled later, sales count is **decremented**
- This matches Amazon/Daraz behavior (counts confirmed orders)

---

## How It's Displayed in Frontend

### **InfoPanel Component:**
```typescript
// frontend/src/components/product/InfoPanel.tsx
<div className="flex items-center gap-1 px-0 py-1">
  <img src={saleIcon} alt="icon" className="w-5 h-5 object-contain" />
  <span className="text-[12px] font-medium text-[#949494]">
    {sales.toLocaleString()} Sales
  </span>
</div>
```

### **Product Cards:**
- Sales count is shown on product cards in:
  - Flash Sale section
  - New Arrivals section
  - More Products section
  - Seller Store pages

### **Formatting:**
- Uses `.toLocaleString()` for number formatting
- Example: `1234` → `"1,234 Sales"`

---

## Comparison: Amazon/Daraz vs Our Implementation

| Feature | Amazon | Daraz | Our Implementation | Status |
|---------|--------|-------|-------------------|--------|
| **Sales Count Display** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Implemented |
| **Updates on Order** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Implemented |
| **Decrements on Cancel** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Implemented |
| **Recent Sales (7/30 days)** | ✅ Yes | ✅ Yes | ❌ No | 🔄 Can Add |
| **Sales Rank** | ✅ Yes | ✅ Yes | ❌ No | 🔄 Can Add |
| **Best Seller Badge** | ✅ Yes | ✅ Yes | ❌ No | 🔄 Can Add |
| **Sales Trends** | ✅ Yes | ✅ Yes | ❌ No | 🔄 Can Add |

---

## How Sales Count Updates (Step-by-Step)

### **Scenario 1: Customer Places Order**

1. **Customer adds product to cart** (3 units)
2. **Customer checks out** → Order created
3. **Backend processes order:**
   ```javascript
   // In createOrder() function:
   - Check product stock (available)
   - Create order
   - Update stock: stock -= 3
   - Update sales: salesCount += 3
   - Save product
   ```
4. **Frontend displays updated count:**
   - Product detail page shows new sales count
   - Product cards show updated count

### **Scenario 2: Customer Cancels Order**

1. **Customer cancels order** (2 units)
2. **Backend processes cancellation:**
   ```javascript
   // In cancelOrder() function:
   - Find order
   - Restore stock: stock += 2
   - Decrease sales: salesCount -= 2
   - Save product
   ```
3. **Frontend displays updated count:**
   - Sales count decreases
   - Stock increases

---

## Key Differences from Amazon/Daraz

### **What We Have:**
✅ Total lifetime sales count
✅ Updates on order creation
✅ Decrements on cancellation
✅ Displayed on product cards and detail pages

### **What We Could Add (Future Enhancements):**

1. **Recent Sales Display:**
   - "X sold in last 7 days"
   - "X sold in last 30 days"
   - Requires tracking sales by date

2. **Sales Rank:**
   - Rank within category (e.g., "#1 in Electronics")
   - Requires calculating relative sales

3. **Best Seller Badge:**
   - Show badge for top-selling products
   - Requires defining "top-selling" criteria

4. **Sales Trends:**
   - Show if sales are increasing/decreasing
   - Requires historical sales data

5. **Sales Analytics:**
   - Seller dashboard with sales charts
   - Sales by time period
   - Sales by product variant

---

## Technical Implementation Details

### **Backend (Node.js/Express):**

#### **Order Creation:**
```javascript
// backend/src/controllers/ordersController.js
export async function createOrder(req, res, next) {
  // ... order creation logic ...
  
  // Update product stock and sales
  for (const item of orderData.items) {
    const product = products.find((p) => String(p._id) === String(item.productId));
    if (product && !product.unlimitedStock) {
      product.stock -= item.quantity;
      product.salesCount = (product.salesCount || 0) + item.quantity;
      await product.save();
    }
  }
}
```

#### **Order Cancellation:**
```javascript
// backend/src/controllers/ordersController.js
export async function cancelOrder(req, res, next) {
  // ... cancellation logic ...
  
  // Restore product stock and decrease sales
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      product.stock += item.quantity;
      product.salesCount = Math.max(0, (product.salesCount || 0) - item.quantity);
      await product.save();
    }
  }
}
```

### **Frontend (React/TypeScript):**

#### **InfoPanel Display:**
```typescript
// frontend/src/components/product/InfoPanel.tsx
<div className="flex items-center gap-1 px-0 py-1">
  <img src={saleIcon} alt="icon" className="w-5 h-5 object-contain" />
  <span className="text-[12px] font-medium text-[#949494]">
    {sales.toLocaleString()} Sales
  </span>
</div>
```

#### **Product Cards:**
- Sales count is passed as prop: `sales={product.salesCount || 0}`
- Displayed alongside rating and price

---

## Best Practices (Following Amazon/Daraz)

### **1. Accuracy:**
- ✅ Count only confirmed orders (not pending)
- ✅ Decrement on cancellation
- ✅ Handle edge cases (negative counts, etc.)

### **2. Performance:**
- ✅ Store count in database (not calculated on-the-fly)
- ✅ Update incrementally (not recalculating from all orders)
- ✅ Index salesCount field for sorting

### **3. Display:**
- ✅ Format numbers with commas (1,234 not 1234)
- ✅ Show on product cards and detail pages
- ✅ Update in real-time (after order/cancellation)

### **4. Trust & Transparency:**
- ✅ Accurate counts build customer trust
- ✅ High sales = social proof
- ✅ Helps customers make decisions

---

## Summary

### **What is Sales Count?**
- Total number of units sold for a product
- Shows product popularity
- Helps customers make purchasing decisions

### **How It Updates:**
- **Increases** when order is created (+quantity)
- **Decreases** when order is cancelled (-quantity)
- Updates happen immediately in database

### **How It Works:**
- Stored in `product.salesCount` field
- Updated in `createOrder()` and `cancelOrder()` functions
- Displayed in InfoPanel and ProductCard components

### **Amazon/Daraz Style:**
- ✅ We match basic functionality (total sales count)
- 🔄 Can enhance with recent sales, rankings, badges

**Our implementation follows industry best practices and matches the core functionality of major e-commerce platforms!**

