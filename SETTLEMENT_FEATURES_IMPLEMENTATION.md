# Settlement Features Implementation

## ✅ What Has Been Implemented

### 1. **Daily Settlement Cron Job** ✅
- **File**: `backend/src/jobs/settlementJob.js`
- **Schedule**: Daily at 2:00 AM
- **Function**: Automatically moves pending settlements → available
- **Features**:
  - Processes all orders past settlement date
  - Updates settlement status from 'pending' to 'available'
  - Groups settlements by seller
  - Sends notifications to sellers

### 2. **Minimum Withdrawal Amount** ✅
- **Default**: PKR 5,000
- **Location**: `backend/src/utils/settlement.js`
- **Validation**: 
  - Checks minimum amount before withdrawal
  - Checks available balance
  - Returns clear error messages

### 3. **Settlement Notifications** ✅
- **File**: `backend/src/services/settlementNotifications.js`
- **Channels**:
  - ✅ Email notifications
  - ✅ SMS/WhatsApp notifications (via existing service)
- **Triggers**: When settlements become available
- **Content**: 
  - Total amount available
  - Number of orders settled
  - Withdrawal instructions

---

## 📋 How It Works

### **Daily Settlement Process:**

1. **Cron Job Runs** (2:00 AM daily)
   ```
   → Finds all orders with:
     - Settlement status: 'pending'
     - Settlement date: <= today
     - Order status: 'delivered'
     - Payment status: 'paid'
   ```

2. **Process Settlements**
   ```
   → Updates settlement status: 'pending' → 'available'
   → Sets settledAt timestamp
   → Groups by seller
   ```

3. **Send Notifications**
   ```
   → For each seller:
     - Calculate total amount available
     - Count number of orders
     - Send email + SMS
   ```

4. **Log Results**
   ```
   → Console logs:
     - Number of orders settled
     - Total amount settled
     - Number of notifications sent
   ```

---

## 🔧 Configuration

### **Minimum Withdrawal Amount**

**Default**: PKR 5,000

**To Change:**
Edit `backend/src/utils/settlement.js`:
```javascript
const MINIMUM_WITHDRAWAL_AMOUNT = 10000; // Change to PKR 10,000
```

### **Cron Schedule**

**Default**: Daily at 2:00 AM

**To Change:**
Edit `backend/src/jobs/settlementJob.js`:
```javascript
// Current: '0 2 * * *' (2:00 AM daily)
// Examples:
// '0 3 * * *' - 3:00 AM daily
// '0 2 * * 1' - 2:00 AM every Monday
// '0 */6 * * *' - Every 6 hours
cron.default.schedule('0 2 * * *', async () => {
  // ...
});
```

**Cron Format**: `minute hour day month weekday`
- `0 2 * * *` = 2:00 AM every day
- `0 0 * * 1` = Midnight every Monday
- `0 */6 * * *` = Every 6 hours

---

## 📧 Notification Setup

### **Email Notifications**

**Required Environment Variables:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Carryia Platform
SMTP_FROM_ADDRESS=noreply@carryia.com
```

**Email Content:**
- Subject: "💰 PKR X Available for Withdrawal - Carryia"
- Body: Includes amount, order count, withdrawal instructions

### **SMS/WhatsApp Notifications**

**Required Environment Variables:**
```env
WHATSAPP_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_ID=your-phone-id
```

**Message Format:**
```
Carryia: PKR X is now available for withdrawal. 
N order(s) settled. Login to withdraw.
```

---

## 🚀 Installation

### **1. Install Dependencies**

```bash
cd backend
npm install node-cron
```

### **2. Start Server**

The cron job starts automatically when the server starts:

```bash
npm run dev
# or
npm start
```

**Expected Output:**
```
Backend listening on http://localhost:4000
[Settlement Job] Cron job scheduled: Daily at 2:00 AM
```

### **3. Manual Testing**

You can manually trigger the settlement job:

```javascript
// In Node.js console or API endpoint
import { runSettlementJob } from './jobs/settlementJob.js';

const result = await runSettlementJob();
console.log(result);
// {
//   success: true,
//   settledCount: 5,
//   totalSettled: 50000,
//   notificationsSent: 3,
//   duration: 1234
// }
```

---

## 🧪 Testing

### **Test Minimum Withdrawal**

1. **Try withdrawal below minimum:**
   ```bash
   POST /api/payments/withdrawals
   Body: { "amount": 1000, "method": "Bank" }
   ```
   **Expected Response:**
   ```json
   {
     "error": "Minimum withdrawal amount is PKR 5,000",
     "minimumAmount": 5000
   }
   ```

2. **Try withdrawal above balance:**
   ```bash
   POST /api/payments/withdrawals
   Body: { "amount": 100000, "method": "Bank" }
   ```
   **Expected Response:**
   ```json
   {
     "error": "Insufficient balance",
     "availableBalance": 50000
   }
   ```

3. **Valid withdrawal:**
   ```bash
   POST /api/payments/withdrawals
   Body: { "amount": 10000, "method": "Bank" }
   ```
   **Expected Response:**
   ```json
   {
     "success": true,
     "withdrawal": {
       "amount": 10000,
       "method": "Bank",
       "status": "pending",
       "estimatedProcessingTime": "2-5 business days"
     }
   }
   ```

### **Test Settlement Job**

1. **Create test order:**
   - Create order
   - Mark as delivered (7+ days ago)
   - Ensure payment status is 'paid'

2. **Run job manually:**
   ```javascript
   import { runSettlementJob } from './jobs/settlementJob.js';
   await runSettlementJob();
   ```

3. **Check results:**
   - Order settlement status should be 'available'
   - Seller should receive email/SMS
   - Console should show settlement logs

---

## 📊 API Changes

### **GET /api/payments/balance-overview**

**New Response:**
```json
{
  "currentWalletBalance": 50000,
  "availableToWithdraw": 45000,
  "pendingEarnings": 5000,
  "minimumWithdrawal": 5000
}
```

### **POST /api/payments/withdrawals**

**Request:**
```json
{
  "amount": 10000,
  "method": "Bank"
}
```

**Success Response:**
```json
{
  "success": true,
  "withdrawal": {
    "amount": 10000,
    "method": "Bank",
    "status": "pending",
    "estimatedProcessingTime": "2-5 business days"
  }
}
```

**Error Response (Below Minimum):**
```json
{
  "error": "Minimum withdrawal amount is PKR 5,000",
  "minimumAmount": 5000
}
```

**Error Response (Insufficient Balance):**
```json
{
  "error": "Insufficient balance",
  "availableBalance": 45000
}
```

---

## 🔍 Monitoring

### **Check Cron Job Status**

The cron job logs to console:
```
[Settlement Job] Starting settlement processing...
[Settlement Job] Processed 5 orders, Total: PKR 50,000
[Settlement Job] Notification sent to seller abc123 (PKR 50,000)
[Settlement Job] Completed in 1234ms
[Settlement Job] Summary: 5 orders settled, 3 notifications sent
```

### **Check Settlement Status**

Query orders to see settlement status:
```javascript
// Orders with available settlements
db.orders.find({
  "settlement.settlementStatus": "available",
  "status": "delivered"
})

// Orders pending settlement
db.orders.find({
  "settlement.settlementStatus": "pending",
  "status": "delivered"
})
```

---

## 🎯 Summary

✅ **Daily Cron Job**: Automatically processes settlements at 2:00 AM  
✅ **Minimum Withdrawal**: PKR 5,000 validation  
✅ **Email Notifications**: Sent when money becomes available  
✅ **SMS Notifications**: Sent via WhatsApp service  
✅ **Error Handling**: Clear validation messages  
✅ **Logging**: Comprehensive settlement activity logs  

**Your settlement system is now fully automated!** 🎉

