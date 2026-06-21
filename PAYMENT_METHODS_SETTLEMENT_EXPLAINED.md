# Payment Methods & Settlement - How It Works

## ✅ Yes! It Works for ALL Payment Methods

Your vendor payment solution (commission, escrow, settlement) works for **ALL payment methods**:
- ✅ **Bank Transfer**
- ✅ **JazzCash**
- ✅ **Easypaisa**
- ✅ **Cash on Delivery (COD)**
- ✅ **Card Payments**

---

## 💰 How Each Payment Method Works

### **1. JazzCash Payment Flow**

```
Customer Pays via JazzCash (PKR 10,000)
   ↓
Money Goes to YOUR JazzCash Merchant Account
   ↓
Order Created in System:
├─ Commission (10%): PKR 1,000 → YOU keep
├─ Gateway Fee (2%): PKR 200 → YOU keep
└─ Seller Payout: PKR 8,800 → Held in escrow
   ↓
Order Delivered (7 days later)
   ↓
Escrow Period (7 days)
   ↓
Settlement Date Reached
   ↓
Seller Can Withdraw PKR 8,800
```

**What You Need:**
- JazzCash Merchant Account
- JazzCash API credentials (Merchant ID, API Key, Secret Key)
- Money received in YOUR JazzCash account

---

### **2. Easypaisa Payment Flow**

```
Customer Pays via Easypaisa (PKR 10,000)
   ↓
Money Goes to YOUR Easypaisa Merchant Account
   ↓
Order Created in System:
├─ Commission (10%): PKR 1,000 → YOU keep
├─ Gateway Fee (2%): PKR 200 → YOU keep
└─ Seller Payout: PKR 8,800 → Held in escrow
   ↓
Order Delivered (7 days later)
   ↓
Escrow Period (7 days)
   ↓
Settlement Date Reached
   ↓
Seller Can Withdraw PKR 8,800
```

**What You Need:**
- Easypaisa Merchant Account
- Easypaisa API credentials (Merchant ID, API Key, Secret Key)
- Money received in YOUR Easypaisa account

---

### **3. Bank Transfer Payment Flow**

```
Customer Pays via Bank Transfer (PKR 10,000)
   ↓
Money Goes to YOUR Bank Account (via Gateway)
   ↓
Order Created in System:
├─ Commission (10%): PKR 1,000 → YOU keep
├─ Gateway Fee (2%): PKR 200 → YOU keep
└─ Seller Payout: PKR 8,800 → Held in escrow
   ↓
Order Delivered (7 days later)
   ↓
Escrow Period (7 days)
   ↓
Settlement Date Reached
   ↓
Seller Can Withdraw PKR 8,800
```

**What You Need:**
- Bank Payment Gateway Account (HBL/UBL/MCB)
- Gateway API credentials
- Money received in YOUR bank account

---

### **4. Cash on Delivery (COD) Payment Flow**

```
Customer Orders (PKR 10,000)
   ↓
Order Created (Payment Status: Pending)
   ↓
Order Delivered → Customer Pays Cash
   ↓
You Collect Cash → Goes to YOUR Account
   ↓
Order Updated (Payment Status: Paid)
   ↓
System Calculates:
├─ Commission (10%): PKR 1,000 → YOU keep
├─ Gateway Fee (0%): PKR 0 → No fee for COD
└─ Seller Payout: PKR 9,000 → Held in escrow
   ↓
Escrow Period (7 days)
   ↓
Settlement Date Reached
   ↓
Seller Can Withdraw PKR 9,000
```

**What You Need:**
- No gateway needed
- You collect cash directly
- Money goes to YOUR account

**Note:** COD has **NO gateway fee** (only commission)

---

## 📊 Commission & Fees Breakdown

### **For JazzCash/Easypaisa/Bank Transfer:**

```
Order Total: PKR 10,000
├─ Commission (10% of subtotal): PKR 1,000
├─ Gateway Fee (2% of total): PKR 200
└─ Seller Payout: PKR 8,800

Your Revenue: PKR 1,200
```

### **For COD:**

```
Order Total: PKR 10,000
├─ Commission (10% of subtotal): PKR 1,000
├─ Gateway Fee (0%): PKR 0
└─ Seller Payout: PKR 9,000

Your Revenue: PKR 1,000
```

---

## 🔍 How the Code Handles It

### **Settlement Calculation (from `settlement.js`):**

```javascript
// Commission is calculated for ALL payment methods
const commissionAmount = subtotal * 0.10; // 10%

// Gateway fee ONLY for non-COD payments
const gatewayFee = paymentMethod !== 'cod' 
  ? total * 0.02  // 2% for JazzCash, Easypaisa, Bank Transfer
  : 0;            // 0% for COD

// Seller payout
const sellerPayout = total - commissionAmount - gatewayFee;
```

**This means:**
- ✅ JazzCash: Gets commission + gateway fee
- ✅ Easypaisa: Gets commission + gateway fee
- ✅ Bank Transfer: Gets commission + gateway fee
- ✅ COD: Gets commission only (no gateway fee)

---

## 💳 Where Money Goes

### **JazzCash Payments:**
```
Customer → JazzCash → YOUR JazzCash Merchant Account
```

**You receive money in:**
- Your JazzCash merchant wallet/account
- Can transfer to your bank account

### **Easypaisa Payments:**
```
Customer → Easypaisa → YOUR Easypaisa Merchant Account
```

**You receive money in:**
- Your Easypaisa merchant wallet/account
- Can transfer to your bank account

### **Bank Transfer Payments:**
```
Customer → Bank Gateway → YOUR Bank Account
```

**You receive money in:**
- Your business bank account directly

### **COD Payments:**
```
Customer → Cash Payment → YOUR Bank Account (you deposit)
```

**You receive money in:**
- Your bank account (after you deposit cash)

---

## 🎯 Complete Example: JazzCash Order

### **Step 1: Customer Pays**
```
Customer: Pays PKR 10,000 via JazzCash
Money: Goes to YOUR JazzCash merchant account
```

### **Step 2: Order Created**
```javascript
Order {
  total: 10000,
  paymentMethod: 'jazzcash',
  paymentStatus: 'paid',
  settlement: {
    commissionAmount: 1000,    // 10% of subtotal
    paymentGatewayFee: 200,    // 2% of total
    sellerPayout: 8800,       // What seller gets
    settlementStatus: 'pending'
  }
}
```

### **Step 3: Order Delivered**
```
Order status: 'delivered'
Settlement date: 7 days from now
Settlement status: 'pending' (in escrow)
```

### **Step 4: After 7 Days**
```
Cron job runs → Settlement status: 'available'
Seller can now withdraw PKR 8,800
```

### **Step 5: Seller Withdraws**
```
You transfer: PKR 8,800 → Seller's account
You keep: PKR 1,200 (commission + fee)
```

---

## 🔑 What You Need for Each Method

### **JazzCash:**
```
☐ JazzCash Merchant Account
☐ Merchant ID
☐ API Key
☐ Secret Key
☐ JazzCash account where money is received
```

### **Easypaisa:**
```
☐ Easypaisa Merchant Account
☐ Merchant ID
☐ API Key
☐ Secret Key
☐ Easypaisa account where money is received
```

### **Bank Transfer:**
```
☐ Bank Payment Gateway Account
☐ Merchant ID
☐ API Key
☐ Secret Key
☐ Bank account where money is received
```

### **COD:**
```
☐ No gateway needed
☐ Bank account to deposit cash
```

---

## ✅ Verification: How to Check

### **Check if Settlement Works for JazzCash/Easypaisa:**

1. **Create order with JazzCash/Easypaisa payment**
2. **Check order in database:**
   ```javascript
   order.settlement.commissionAmount  // Should be calculated
   order.settlement.paymentGatewayFee // Should be 2% (not 0)
   order.settlement.sellerPayout      // Should be total - commission - fee
   ```

3. **Verify calculation:**
   ```
   Order: PKR 10,000
   Commission: PKR 1,000 (10%)
   Gateway Fee: PKR 200 (2%)
   Seller Payout: PKR 8,800
   ```

---

## 📝 Summary

### **✅ YES - It Works for All Payment Methods!**

| Payment Method | Commission | Gateway Fee | Escrow | Settlement |
|----------------|------------|-------------|--------|------------|
| **JazzCash** | ✅ 10% | ✅ 2% | ✅ 7 days | ✅ Automatic |
| **Easypaisa** | ✅ 10% | ✅ 2% | ✅ 7 days | ✅ Automatic |
| **Bank Transfer** | ✅ 10% | ✅ 2% | ✅ 7 days | ✅ Automatic |
| **COD** | ✅ 10% | ❌ 0% | ✅ 7 days | ✅ Automatic |

**All payment methods:**
- ✅ Calculate commission automatically
- ✅ Apply gateway fees (except COD)
- ✅ Hold money in escrow (7 days)
- ✅ Process settlement automatically
- ✅ Send notifications to sellers

**The system treats JazzCash and Easypaisa exactly the same as Bank Transfer!** 🎉

---

## 🧭 Checkout Payment Method Mapping (Frontend → Backend)

The checkout screen in [`frontend/src/pages/Payment.tsx`](frontend/src/pages/Payment.tsx) wires the UI cards rendered by [`PaymentMethodsGrid`](frontend/src/components/payment/PaymentMethodsGrid.tsx) to the `createOrder()` call in [`frontend/src/services/orderService.ts`](frontend/src/services/orderService.ts). The table below clarifies how each card maps to the `paymentMethod` stored on the order document and which extra fields you should collect when real gateways go live.

| UI Card (`selectedPaymentMethod` id) | Order schema value (`paymentMethod`) | Gateway action today | What to add once keys exist |
|-------------------------------------|--------------------------------------|----------------------|-----------------------------|
| `bank-transfer`                     | `bank_transfer`                      | Order is created immediately with `paymentStatus: 'pending'`. Money is owed via manual bank/card processing. | Replace the static form inside [`BankTransferDetails`](frontend/src/components/payment/BankTransferDetails.tsx) with your bank/acquirer card fields or redirect script. On success, call `createOrder()` with `paymentStatus` override of `'paid'` or post a webhook that sets it to paid. |
| `jazzcash`                          | `jazzcash`                           | Customer just confirms intent; admin collects funds externally. | In [`JazzCashDetails`](frontend/src/components/payment/JazzCashDetails.tsx) capture the 11-digit wallet and OTP before calling JazzCash APIs. When their callback/webhook confirms success, call `/api/orders/:id/payment` (new endpoint) or mark order `paymentStatus: 'paid'` in a webhook handler. |
| `easypaisa`                         | `easypaisa`                          | Same as JazzCash for now. | Clone the JazzCash flow: collect wallet, redirect to Easypaisa’s hosted page, and mark the order `paid` via webhook/return URL handler. |
| `cod`                               | `cod`                                | System keeps `paymentStatus: 'pending'` until you mark the order paid after delivery. | No gateway integration needed. When courier remits cash, update the order via admin panel or internal job to set `paymentStatus: 'paid'`. |

📌 **Where to plug gateway responses?**
- Success webhooks → patch the order via `/api/orders/:orderId/payment` (add this endpoint) or reuse admin tools to set `paymentStatus`.
- Failure webhooks → update `paymentStatus` to `'failed'` and optionally cancel the order.
- Pending callbacks → keep `paymentStatus: 'pending'`; settlement logic only moves funds once orders are `paid + delivered`.

🧪 **Local testing without keys:** keep the current dummy UI, choose any method, and observe that the backend still calculates escrow/settlement correctly because it only depends on `paymentMethod`, `paymentStatus`, and delivery status.

---

## 🚀 Next Steps

1. **Get JazzCash Merchant Account** → Get API credentials
2. **Get Easypaisa Merchant Account** → Get API credentials
3. **Integrate payment gateways** → Connect to your system
4. **Test payments** → Verify money flow
5. **Go live** → Start receiving payments!

**Your vendor payment solution is payment-method agnostic - it works the same way regardless of how customers pay!** ✅

