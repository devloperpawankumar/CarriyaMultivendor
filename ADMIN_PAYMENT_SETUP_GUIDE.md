# Admin Payment Setup Guide - Complete Flow

## 🎯 Overview: How Your Payment System Works

When a customer pays for an order, the money flows through your platform. This guide explains:
1. **How money flows** from customer → your admin account
2. **What you need** to set up to receive payments
3. **How it matches** Daraz/Amazon's system

---

## 💰 Complete Payment Flow

### **Step-by-Step Money Flow:**

```
1. Customer Places Order (PKR 10,000)
   ↓
2. Customer Selects Payment Method
   - Bank Transfer
   - JazzCash
   - Easypaisa
   - Cash on Delivery (COD)
   ↓
3. Customer Pays
   ↓
4. Money Goes to YOUR Payment Gateway Account
   (Your admin account - NOT seller's account)
   ↓
5. Order Created in System
   - Commission calculated (10% = PKR 1,000)
   - Gateway fee (2% = PKR 200)
   - Seller payout calculated (PKR 8,800)
   ↓
6. Order Delivered (7 days later)
   ↓
7. Escrow Period (7 days)
   - Money held in YOUR account
   - Seller can't withdraw yet
   ↓
8. Settlement Date Reached
   - Money becomes "available" for seller
   - Seller can request withdrawal
   ↓
9. Seller Requests Withdrawal
   - You transfer PKR 8,800 to seller
   - You keep PKR 1,200 (commission + fees)
```

---

## 🔑 What You Need as Admin

### **1. Payment Gateway Account** (Required)

You need a **merchant account** with payment gateway providers to receive customer payments.

#### **For Each Payment Method:**

**A. Bank Transfer Gateway**
- ✅ Merchant Account with bank (HBL, UBL, MCB, etc.)
- ✅ API credentials (Merchant ID, API Key, Secret Key)
- ✅ Webhook URL configured
- 📄 **See**: `PAYMENT_GATEWAY_BANK_TRANSFER_REQUIREMENTS.md`

**B. JazzCash Integration**
- ✅ JazzCash Merchant Account
- ✅ API credentials
- ✅ Merchant ID
- ✅ API Key / Secret Key

**C. Easypaisa Integration**
- ✅ Easypaisa Merchant Account
- ✅ API credentials
- ✅ Merchant ID
- ✅ API Key / Secret Key

**D. Cash on Delivery (COD)**
- ✅ No gateway needed
- ✅ You collect cash on delivery
- ✅ Money goes directly to your account

---

## 📋 Complete Setup Checklist

### **Step 1: Payment Gateway Accounts**

#### **Bank Transfer Gateway:**
```
☐ Choose bank (HBL, UBL, MCB, Bank Alfalah, etc.)
☐ Open merchant account
☐ Get credentials:
   - Merchant ID: _________________________
   - API Key: _________________________
   - Secret Key: _________________________
   - Webhook Secret: _________________________
☐ Get API URLs:
   - Test URL: _________________________
   - Production URL: _________________________
```

#### **JazzCash:**
```
☐ Register as merchant on JazzCash
☐ Get credentials:
   - Merchant ID: _________________________
   - API Key: _________________________
   - Secret Key: _________________________
```

#### **Easypaisa:**
```
☐ Register as merchant on Easypaisa
☐ Get credentials:
   - Merchant ID: _________________________
   - API Key: _________________________
   - Secret Key: _________________________
```

---

### **Step 2: Environment Variables**

Add to your `backend/.env` file:

```env
# Bank Transfer Gateway
BANK_TRANSFER_GATEWAY_MERCHANT_ID=your_merchant_id
BANK_TRANSFER_GATEWAY_API_KEY=your_api_key
BANK_TRANSFER_GATEWAY_SECRET_KEY=your_secret_key
BANK_TRANSFER_GATEWAY_WEBHOOK_SECRET=your_webhook_secret
BANK_TRANSFER_GATEWAY_API_URL=https://api.gateway.com
BANK_TRANSFER_GATEWAY_ENV=production

# JazzCash
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_API_KEY=your_api_key
JAZZCASH_SECRET_KEY=your_secret_key

# Easypaisa
EASYPAISA_MERCHANT_ID=your_merchant_id
EASYPAISA_API_KEY=your_api_key
EASYPAISA_SECRET_KEY=your_secret_key

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Carryia Platform
SMTP_FROM_ADDRESS=noreply@carryia.com

# Settlement & withdrawals
SETTLEMENT_CRON_SCHEDULE=0 2 * * *
SETTLEMENT_CRON_TZ=Asia/Karachi
SETTLEMENT_JOB_LOCK_TTL_MS=600000
SETTLEMENT_ESCROW_DAYS=7
MIN_WITHDRAWAL_AMOUNT=5000
```

> ⏱️ **Tip:** Keeping the cron/escrow values in `.env` lets you move from the default “run every 2 minutes” development schedule (see `backend/src/jobs/settlementJob.js`) to a 2 AM production schedule without touching code. Tweak `MIN_WITHDRAWAL_AMOUNT` whenever finance adjusts policy.

---

### **Step 3: Bank Account for Receiving Payments**

You need a **business bank account** where all customer payments will be received:

```
☐ Business Bank Account Details:
   - Bank Name: _________________________
   - Account Title: _________________________
   - Account Number: _________________________
   - IBAN: _________________________
   - Branch: _________________________
```

**This account receives:**
- All customer payments (Bank Transfer, JazzCash, Easypaisa)
- COD collections (if you handle COD)
- **You keep commission + fees from this account**

---

### **Step 4: Seller Payout Account (Optional)**

A separate account for paying sellers (optional, can use same account):

```
☐ Seller Payout Account:
   - Bank Name: _________________________
   - Account Number: _________________________
   - IBAN: _________________________
```

**This account is used to:**
- Transfer money to sellers when they withdraw
- Keep track of seller payouts

---

## 💵 How Money Flows (Detailed)

### **Example: Order of PKR 10,000**

#### **1. Customer Pays:**
```
Customer → Payment Gateway → YOUR Admin Account
Amount: PKR 10,000
```

#### **2. System Calculates:**
```
Order Total: PKR 10,000
├─ Commission (10%): PKR 1,000 → YOUR PROFIT
├─ Gateway Fee (2%): PKR 200 → YOUR PROFIT
└─ Seller Payout: PKR 8,800 → HELD FOR SELLER
```

#### **3. Money in Your Account:**
```
Total Received: PKR 10,000
├─ Your Profit: PKR 1,200 (commission + fee)
└─ Seller's Money: PKR 8,800 (held in escrow)
```

#### **4. After 7 Days (Escrow Period):**
```
Seller's Money: PKR 8,800
Status: Available for withdrawal
```

#### **5. Seller Requests Withdrawal:**
```
You Transfer: PKR 8,800 → Seller's Account
You Keep: PKR 1,200 (commission + fee)
```

---

## 🏦 Comparison with Other Platforms

### **Daraz Payment Flow:**

```
Customer Pays → Daraz Account
├─ Commission (5-15%) → Daraz keeps
├─ Gateway Fee (2-3%) → Daraz keeps
└─ Seller Payout → Held 7-14 days → Paid to seller
```

**Your System (Same Flow):**
```
Customer Pays → YOUR Account
├─ Commission (10%) → YOU keep
├─ Gateway Fee (2%) → YOU keep
└─ Seller Payout → Held 7 days → Paid to seller
```

### **Amazon Payment Flow:**

```
Customer Pays → Amazon Account
├─ Referral Fee (6-45%) → Amazon keeps
├─ FBA Fees → Amazon keeps
└─ Seller Payout → Held 14 days → Auto-transferred
```

**Your System (Similar):**
```
Customer Pays → YOUR Account
├─ Commission (10%) → YOU keep
├─ Gateway Fee (2%) → YOU keep
└─ Seller Payout → Held 7 days → Manual transfer
```

---

## 🔐 Security & Best Practices

### **1. Separate Accounts (Recommended)**

```
Account 1: Customer Payments Account
- Receives all customer payments
- High balance (all orders)
- Secure, limited access

Account 2: Seller Payout Account
- Used only for paying sellers
- Lower balance (only when paying)
- Separate access controls
```

### **2. API Key Security**

- ✅ **Never commit** API keys to Git
- ✅ **Use environment variables** only
- ✅ **Rotate keys** regularly (every 90 days)
- ✅ **Use different keys** for test/production

### **3. Webhook Security**

- ✅ **Verify webhook signatures** (prevent fraud)
- ✅ **Use HTTPS** for webhook URLs
- ✅ **Validate all webhook data**

---

## 📊 Revenue Tracking

### **Your Revenue Sources:**

1. **Commission** (10% of order subtotal)
   - Example: PKR 10,000 order → PKR 1,000 commission

2. **Payment Gateway Fee** (2% of order total)
   - Example: PKR 10,000 order → PKR 200 fee

3. **Total Revenue per Order:**
   - Commission + Gateway Fee = PKR 1,200 per PKR 10,000 order

### **Monthly Revenue Calculation:**

```
Total Orders: 100 orders
Average Order: PKR 10,000
Total Sales: PKR 1,000,000

Your Revenue:
- Commission (10%): PKR 100,000
- Gateway Fee (2%): PKR 20,000
- Total Revenue: PKR 120,000/month
```

---

## 🚀 Setup Steps Summary

### **Quick Start:**

1. **Get Payment Gateway Accounts**
   - Bank Transfer Gateway (HBL/UBL/MCB)
   - JazzCash Merchant Account
   - Easypaisa Merchant Account

2. **Get Credentials**
   - Merchant IDs
   - API Keys
   - Secret Keys

3. **Set Up Bank Account**
   - Business account for receiving payments
   - Connect to payment gateways

4. **Configure Environment**
   - Add credentials to `.env` file
   - Set up webhook URLs

5. **Test Integration**
   - Test payments in sandbox
   - Verify money flow
   - Test seller payouts

---

## ⚙️ Environment Variable Reference & Go-Live Checklist

| Variable | Purpose | Default | When to change |
|----------|---------|---------|----------------|
| `FRONTEND_URL` | CORS origin for backend | `http://localhost:3000` | Point to your production domain before deployment. |
| `REACT_APP_API_BASE_URL` | Frontend → backend base URL | `http://localhost:4000` | Update in `frontend/.env` or hosting dashboard once the backend is hosted. |
| `JAZZCASH_*`, `EASYPAISA_*`, `BANK_TRANSFER_*` | Gateway credentials | _empty_ | Fill in sandbox keys first, then rotate with production keys when live. |
| `SETTLEMENT_CRON_SCHEDULE` | Escrow release cron | `*/2 * * * *` (dev) | Switch to `0 2 * * *` for a 2 AM PKT production run. |
| `SETTLEMENT_CRON_TZ` | Cron timezone | _unset_ | Set to `Asia/Karachi` (or your timezone) for deterministic runs. |
| `SETTLEMENT_ESCROW_DAYS` | Escrow duration | `7` | Increase if your gateway/bank requires longer hold time. |
| `MIN_WITHDRAWAL_AMOUNT` | Seller withdrawal limit (PKR) | `5000` | Adjust based on finance policy. |

### 🔁 After you receive live keys
1. Copy your working sandbox `.env` to a secure production secret (or `.env.production`).
2. Replace every gateway credential with the production values supplied by JazzCash/Easypaisa/bank.
3. Update `FRONTEND_URL` + `REACT_APP_API_BASE_URL` to your live domains and redeploy the frontend so React picks up the new `REACT_APP_*` values.
4. Restart the backend (`pm2 restart`, `docker compose up -d`, etc.) so Express reloads the secrets.
5. Verify the settlement cron is using the production schedule (`0 2 * * *`) and timezone.
6. Run the smoke tests in `PAYMENT_SYSTEM_TEST_PLAN.md` (sandbox + live) to confirm each method works end-to-end.
7. Rotate sandbox keys quarterly and document the location of production keys in your secret manager.

---

## 📝 What You Need to Ask Payment Gateways

### **For Each Gateway Provider:**

1. **"I need to receive customer payments for my e-commerce platform"**
2. **"I need merchant account with API access"**
3. **"What credentials do I need?"**
   - Merchant ID
   - API Key
   - Secret Key
   - Webhook URL format

4. **"How do I receive money?"**
   - Automatic transfer to bank account?
   - Manual withdrawal?
   - Settlement period?

5. **"What are the fees?"**
   - Transaction fees
   - Monthly fees
   - Setup fees

---

## 🎯 Key Differences: Your System vs Daraz/Amazon

| Feature | Daraz/Amazon | Your System | Status |
|---------|--------------|-------------|--------|
| **Payment Collection** | Platform collects | ✅ YOU collect | ✅ Match |
| **Commission** | 5-45% | ✅ 10% (configurable) | ✅ Match |
| **Escrow Period** | 7-14 days | ✅ 7 days | ✅ Match |
| **Settlement** | Automatic | ✅ Automatic (cron job) | ✅ Match |
| **Seller Payout** | Auto-transfer | ⚠️ Manual (you transfer) | ⚠️ Different |
| **Revenue** | Platform keeps | ✅ YOU keep | ✅ Match |

**Note:** Your system requires **manual transfer** to sellers (you initiate the transfer). Daraz/Amazon do automatic transfers, but that requires additional banking integration.

---

## 💡 Important Notes

### **1. You Are the Payment Processor**
- All customer payments go to **YOUR account**
- You are responsible for:
  - Receiving payments
  - Holding money in escrow
  - Paying sellers
  - Keeping commission

### **2. Escrow Responsibility**
- Money is held in **YOUR account** for 7 days
- You must have sufficient balance to pay sellers
- Keep track of pending payouts

### **3. Seller Trust**
- Sellers trust **YOU** to pay them
- Clear settlement dates build trust
- Automated notifications help

### **4. Legal Considerations**
- Ensure you have proper business registration
- Follow payment processing regulations
- Keep records of all transactions
- Consider payment processor licenses (if required)

---

## ✅ Final Checklist

Before going live:

```
☐ Payment gateway accounts set up
☐ API credentials obtained
☐ Environment variables configured
☐ Bank account connected
☐ Webhook URLs configured
☐ Test payments successful
☐ Seller payout process tested
☐ Notification system working
☐ Settlement cron job running
☐ Legal/compliance checked
```

---

## 📞 Support

If you need help:
1. Check gateway provider documentation
2. Contact gateway support for credentials
3. Test in sandbox environment first
4. Monitor logs for errors

---

**Your payment system is now ready! All customer payments will flow to your admin account, and you'll automatically calculate and hold seller payouts.** 🎉

