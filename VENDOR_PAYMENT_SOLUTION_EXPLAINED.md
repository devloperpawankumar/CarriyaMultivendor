# Vendor Payment Solution - Complete Guide

## What is a Vendor Payment Solution?

A **Vendor Payment Solution** (also called Seller Payment System or Marketplace Settlement) is how an e-commerce platform pays sellers/vendors for their sales. It's the complete system that handles:

1. **Payment Collection** - Platform collects money from customers
2. **Commission Calculation** - Platform deducts its fees/commission
3. **Escrow/Holding Period** - Money held for a period (for returns/refunds)
4. **Settlement** - Platform pays sellers after holding period
5. **Withdrawal System** - Sellers can withdraw their earnings

---

## How Major Platforms Work (Daraz & Amazon)

### 🛒 **Daraz (Pakistan/Asia)**

**Payment Flow:**
1. Customer pays → Money goes to Daraz's account
2. Order delivered → Daraz holds money for **7-14 days** (escrow period)
3. After holding period → Money moves to seller's "Available Balance"
4. Seller requests withdrawal → Daraz transfers to seller's bank account
5. Settlement cycle: **Weekly or Bi-weekly**

**Commission Structure:**
- **Commission Rate**: 5-15% (varies by category)
- **Payment Gateway Fee**: 2-3% (deducted separately)
- **COD Fee**: Additional fee for Cash on Delivery orders
- **Shipping Fee**: May be shared or fully paid by seller

**Example:**
```
Order Total: PKR 10,000
Platform Commission (10%): PKR 1,000
Payment Gateway Fee (2%): PKR 200
Seller Payout: PKR 8,800
```

**Features:**
- ✅ Escrow period (7-14 days)
- ✅ Commission calculation per order
- ✅ Multiple withdrawal methods (Bank, JazzCash, Easypaisa)
- ✅ Minimum withdrawal amount (e.g., PKR 5,000)
- ✅ Withdrawal processing time (2-5 business days)
- ✅ Detailed earnings breakdown
- ✅ Invoice generation

---

### 🌐 **Amazon (Global)**

**Payment Flow:**
1. Customer pays → Money goes to Amazon's account
2. Order shipped → Amazon holds money
3. Order delivered → Money moves to seller's account after **14 days**
4. Settlement cycle: **Every 14 days** (bi-weekly)
5. Automatic transfer to seller's bank account

**Commission Structure:**
- **Referral Fee**: 6-45% (varies by category)
- **FBA Fees**: If using Amazon fulfillment
- **Payment Processing Fee**: Included in referral fee
- **Storage Fees**: Monthly charges

**Example:**
```
Order Total: $100
Referral Fee (15%): $15
FBA Fee: $5
Seller Payout: $80
```

**Features:**
- ✅ 14-day escrow period
- ✅ Automatic settlement (no manual withdrawal)
- ✅ Category-based commission rates
- ✅ Detailed financial reports
- ✅ Tax document generation (1099 forms)
- ✅ Multi-currency support

---

## Your Current Code Analysis

### ✅ **What You Have (Good!)**

1. **Withdrawal System**
   - ✅ Withdrawal request functionality
   - ✅ Multiple payment methods (Bank, JazzCash, Easypaisa)
   - ✅ Withdrawal history tracking
   - ✅ Balance overview (Current, Available, Pending)

2. **Earnings Tracking**
   - ✅ Earnings summary per order
   - ✅ Order-based earnings display

3. **Payment Status Tracking**
   - ✅ Payment status in orders (pending, paid, failed)
   - ✅ Order status tracking

### ❌ **What's Missing (Critical!)**

1. **Commission Calculation**
   - ❌ No commission calculation logic
   - ❌ No commission rate configuration
   - ❌ Commission shown as "Pending gateway capture" or "PKR 0"
   - **Current Code:**
   ```typescript
   platformCommission: order.paymentMethod === 'cod'
     ? 'PKR 0 (COD release)'
     : 'Pending gateway capture',
   ```

2. **Escrow/Holding Period**
   - ❌ No escrow period implementation
   - ❌ No settlement date calculation
   - ❌ All earnings immediately "available to withdraw"

3. **Settlement Logic**
   - ❌ No automatic settlement after holding period
   - ❌ No distinction between "Pending Earnings" and "Available to Withdraw"
   - ❌ No settlement date tracking

4. **Order-to-Earnings Link**
   - ❌ Earnings not calculated from actual orders
   - ❌ Mock data in `paymentsController.js`
   - ❌ No commission deduction from order total

5. **Payment Gateway Fee**
   - ❌ No payment gateway fee calculation
   - ❌ No separate fee tracking

6. **Seller Payout Calculation**
   - ❌ Seller payout = Order total (should be: total - commission - fees)
   - ❌ No proper payout calculation

---

## What You Need to Implement

### 1. **Commission Configuration**

Create a commission system:

```javascript
// backend/src/models/CommissionConfig.js
const commissionConfigSchema = {
  categoryId: String,
  commissionRate: Number, // e.g., 10 = 10%
  paymentGatewayFee: Number, // e.g., 2 = 2%
  codFee: Number, // Additional fee for COD
  minCommission: Number, // Minimum commission amount
}
```

### 2. **Order Settlement Fields**

Add to Order model:

```javascript
// In Order model
settlement: {
  commissionAmount: Number,
  paymentGatewayFee: Number,
  sellerPayout: Number,
  settlementDate: Date, // When seller can withdraw
  settledAt: Date, // When actually settled
  settlementStatus: {
    type: String,
    enum: ['pending', 'available', 'settled'],
    default: 'pending'
  }
}
```

### 3. **Settlement Calculation Logic**

```javascript
// Calculate commission and payout
function calculateSettlement(order) {
  const commissionRate = getCommissionRate(order.category); // e.g., 10%
  const paymentGatewayFee = order.paymentMethod !== 'cod' ? 0.02 : 0; // 2%
  
  const commissionAmount = order.subtotal * (commissionRate / 100);
  const gatewayFee = order.total * paymentGatewayFee;
  const sellerPayout = order.total - commissionAmount - gatewayFee;
  
  // Escrow period: 7 days after delivery
  const settlementDate = new Date(order.deliveredAt);
  settlementDate.setDate(settlementDate.getDate() + 7);
  
  return {
    commissionAmount,
    paymentGatewayFee: gatewayFee,
    sellerPayout,
    settlementDate
  };
}
```

### 4. **Settlement Status Update**

When order is delivered:

```javascript
// In ordersController.js - when order status changes to 'delivered'
if (order.status === 'delivered' && !order.deliveredAt) {
  order.deliveredAt = new Date();
  
  const settlement = calculateSettlement(order);
  order.settlement = {
    ...settlement,
    settlementStatus: 'pending' // Will become 'available' after 7 days
  };
  
  await order.save();
}
```

### 5. **Automatic Settlement Job**

Run daily to move pending earnings to available:

```javascript
// backend/src/jobs/settlementJob.js
async function processSettlements() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find orders ready for settlement
  const ordersToSettle = await Order.find({
    'settlement.settlementStatus': 'pending',
    'settlement.settlementDate': { $lte: today },
    status: 'delivered',
    paymentStatus: 'paid'
  });
  
  for (const order of ordersToSettle) {
    order.settlement.settlementStatus = 'available';
    order.settlement.settledAt = new Date();
    await order.save();
    
    // Update seller's available balance
    await updateSellerBalance(order.sellerId, order.settlement.sellerPayout);
  }
}
```

### 6. **Seller Balance Calculation**

```javascript
// Calculate from actual orders
async function getSellerBalance(sellerId) {
  const orders = await Order.find({
    sellerId,
    status: 'delivered',
    paymentStatus: 'paid'
  });
  
  let currentWalletBalance = 0;
  let availableToWithdraw = 0;
  let pendingEarnings = 0;
  
  for (const order of orders) {
    const payout = order.settlement?.sellerPayout || 0;
    
    if (order.settlement?.settlementStatus === 'available') {
      availableToWithdraw += payout;
    } else if (order.settlement?.settlementStatus === 'pending') {
      pendingEarnings += payout;
    }
    
    currentWalletBalance += payout;
  }
  
  return {
    currentWalletBalance,
    availableToWithdraw,
    pendingEarnings
  };
}
```

---

## Complete Flow Comparison

### **Daraz/Amazon Flow:**

```
1. Customer pays PKR 10,000
   ↓
2. Order created (status: pending)
   ↓
3. Order confirmed (status: confirmed)
   ↓
4. Order shipped (status: shipped)
   ↓
5. Order delivered (status: delivered)
   ↓
6. Settlement calculated:
   - Commission: PKR 1,000 (10%)
   - Gateway Fee: PKR 200 (2%)
   - Seller Payout: PKR 8,800
   ↓
7. Escrow period: 7 days
   - Status: "Pending Earnings"
   ↓
8. After 7 days: Status → "Available to Withdraw"
   ↓
9. Seller requests withdrawal
   ↓
10. Money transferred to seller (2-5 days)
```

### **Your Current Flow:**

```
1. Customer pays PKR 10,000
   ↓
2. Order created (status: pending)
   ↓
3. Order delivered (status: delivered)
   ↓
4. ❌ No commission calculation
   ↓
5. ❌ No escrow period
   ↓
6. ❌ All money immediately "available"
   ↓
7. Seller can withdraw full amount
```

---

## Implementation Priority

### **Phase 1: Basic Commission (High Priority)**
- [ ] Add commission rate configuration
- [ ] Calculate commission on order creation
- [ ] Store commission in order
- [ ] Display commission in seller dashboard
- [ ] Calculate seller payout = total - commission

### **Phase 2: Escrow Period (High Priority)**
- [ ] Add settlement date calculation
- [ ] Add settlement status field
- [ ] Implement holding period (7-14 days)
- [ ] Separate "Pending" vs "Available" earnings
- [ ] Update balance calculation

### **Phase 3: Settlement Automation (Medium Priority)**
- [ ] Create daily settlement job
- [ ] Automatically move pending → available
- [ ] Update seller balance automatically
- [ ] Send notifications to sellers

### **Phase 4: Advanced Features (Low Priority)**
- [ ] Payment gateway fee calculation
- [ ] Category-based commission rates
- [ ] Minimum withdrawal amount
- [ ] Withdrawal processing time
- [ ] Invoice generation
- [ ] Tax document generation

---

## Database Schema Changes Needed

### **Order Model - Add Settlement Fields:**

```javascript
settlement: {
  commissionAmount: { type: Number, default: 0 },
  paymentGatewayFee: { type: Number, default: 0 },
  sellerPayout: { type: Number, default: 0 },
  settlementDate: Date,
  settledAt: Date,
  settlementStatus: {
    type: String,
    enum: ['pending', 'available', 'settled'],
    default: 'pending'
  }
}
```

### **New Model: CommissionConfig**

```javascript
// backend/src/models/CommissionConfig.js
const commissionConfigSchema = {
  categoryId: { type: String, required: true },
  commissionRate: { type: Number, required: true }, // Percentage
  paymentGatewayFee: { type: Number, default: 0 },
  codFee: { type: Number, default: 0 },
  minCommission: { type: Number, default: 0 }
}
```

### **New Model: SellerBalance (Optional - for faster queries)**

```javascript
// backend/src/models/SellerBalance.js
const sellerBalanceSchema = {
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentWalletBalance: { type: Number, default: 0 },
  availableToWithdraw: { type: Number, default: 0 },
  pendingEarnings: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}
```

---

## Summary

### **What is Vendor Payment Solution?**
A complete system that:
- Collects payment from customers
- Calculates and deducts platform commission
- Holds money in escrow (holding period)
- Settles payments to sellers after holding period
- Allows sellers to withdraw earnings

### **Does Your Code Match?**
**Partially** - You have:
- ✅ Withdrawal system
- ✅ Balance display
- ✅ Earnings tracking (basic)

**Missing:**
- ❌ Commission calculation
- ❌ Escrow/holding period
- ❌ Settlement automation
- ❌ Proper payout calculation

### **How Daraz/Amazon Work?**
1. Customer pays → Platform collects
2. Order delivered → Commission calculated
3. 7-14 day escrow period
4. Money becomes "available to withdraw"
5. Seller requests withdrawal
6. Platform transfers to seller

**Your code needs to implement steps 2, 3, and 4 to match industry standards!**

