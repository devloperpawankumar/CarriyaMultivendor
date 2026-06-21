# Seller Payout Flow - Simple Explanation

## 🎯 Quick Answer

**When does money transfer to seller?**

1. **Customer pays** → Money in YOUR gateway account ✅
2. **Order delivered** → Escrow period starts (7 days) ⏳
3. **After 7 days** → Money becomes "available" for seller ✅
4. **Seller requests withdrawal** → You transfer money manually ✅
5. **Seller receives** → Money in seller's account ✅

---

## ⏰ Timeline

```
Day 1: Customer pays PKR 10,000
   → Money in YOUR account: PKR 10,000
   → Seller payout: PKR 8,800 (held)

Day 5: Order delivered
   → Settlement date: Day 12

Day 12: Settlement date reached (2:00 AM)
   → Status: "available"
   → Seller can request withdrawal

Day 13: Seller requests PKR 8,800
   → YOU transfer from YOUR account
   → To seller's account

Day 15: Seller receives PKR 8,800
   → Transaction complete
```

---

## 💰 How You Transfer

### **Step 1: Seller Requests**
```
Seller Dashboard → "Manage Payments"
→ Clicks "Withdraw"
→ Enters amount: PKR 8,800
→ Selects method: "Bank Transfer"
→ Submits request
```

### **Step 2: You Get Notification**
```
You receive:
- Email notification (if configured)
- Or check admin panel
- See: "Seller X wants to withdraw PKR 8,800"
```

### **Step 3: You Transfer Money**
```
From YOUR account:
├─ JazzCash account → Transfer PKR 8,800
├─ OR Bank account → Transfer PKR 8,800
└─ OR Easypaisa account → Transfer PKR 8,800

To SELLER's account:
├─ Seller's bank account
├─ OR Seller's JazzCash number
└─ OR Seller's Easypaisa number
```

### **Step 4: Update Status**
```
Mark withdrawal as "completed" in system
Seller receives notification
Done!
```

---

## 🔄 Current System: Manual Process

```
Seller Requests → YOU Transfer → Seller Receives
     (Automatic)    (Manual)      (Automatic)
```

**What's Automatic:**
- ✅ Settlement calculation
- ✅ Escrow period tracking
- ✅ Status updates (pending → available)
- ✅ Notifications to seller
- ✅ Balance calculation

**What's Manual:**
- ⚠️ You transfer money (from your account to seller)
- ⚠️ You update status (mark as completed)

---

## 📊 Example: Complete Flow

### **Order: PKR 10,000 via JazzCash**

```
1. Customer pays PKR 10,000
   YOUR JazzCash account: +PKR 10,000

2. System calculates:
   Commission: PKR 1,000 (you keep)
   Fee: PKR 200 (you keep)
   Seller: PKR 8,800 (held)

3. Order delivered (Day 5)
   Settlement date: Day 12

4. Day 12 (2:00 AM):
   Cron job runs
   Status: "available"
   Seller notified

5. Day 13:
   Seller requests PKR 8,800
   YOU transfer from YOUR JazzCash
   To seller's bank account

6. Day 15:
   Seller receives PKR 8,800
   YOUR account: PKR 1,200 (profit kept)
```

---

## ✅ Summary

**Money Flow:**
```
Customer → YOUR Gateway Account → (7 days escrow) → YOU Transfer → Seller Account
```

**Timing:**
- **Escrow Period**: 7 days after delivery
- **Transfer Time**: 2-5 days after seller requests
- **Total**: ~12-17 days from delivery to seller receiving money

**Your Role:**
- Receive money from customers ✅
- Keep commission + fees ✅
- Transfer seller payout when requested ⚠️ (manual)

**The system handles everything automatically - you just need to transfer money when sellers request withdrawal!** 🎉

