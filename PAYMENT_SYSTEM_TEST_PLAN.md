# Payment System – Flow & Test Plan

## 1. End-to-End Flow (Amazon/Daraz Style)

```
Customer pays → Money lands in YOUR gateway account
     ↓
Order recorded with settlement info (commission, seller payout, escrow date)
     ↓
Order delivered → 7‑day escrow timer starts
     ↓
Daily cron job (2:00 AM PKT):
     • Finds orders whose settlementDate <= today
     • Moves settlementStatus: pending → available
     • Sends email/SMS to seller
     ↓
Seller requests withdrawal (POST /api/payments/withdrawals)
     ↓
Admin transfers funds manually (bank/JazzCash/Easypaisa)
     ↓
Admin marks request completed (PATCH /api/admin/withdrawals/:id/status)
     ↓
Seller sees updated status in dashboard
```

## 2. Files/Modules Involved

| Area | Files |
|------|-------|
| Escrow + commission logic | `backend/src/utils/settlement.js` |
| Settlement cron job | `backend/src/jobs/settlementJob.js` |
| Withdrawal storage | `backend/src/models/Withdrawal.js` |
| Seller/admin APIs | `backend/src/controllers/paymentsController.js`, `backend/src/routes/payments.js` |
| Seller UI (real data) | `frontend/src/pages/sellerDashboard/managePayments/*` |
| API client | `frontend/src/services/paymentService.ts` |
| Documentation | `SELLER_PAYOUT_FLOW_SIMPLE.md`, `SETTLEMENT_FEATURES_IMPLEMENTATION.md` |

## 3. How to Test

### 3.1 Settlement Release
1. Insert an order with `status: "delivered"`, `paymentStatus: "paid"`, and `deliveredAt` ≥7 days ago.
2. Run the cron manually:
   ```bash
   cd backend
   node -e "import('./src/jobs/settlementJob.js').then(m => m.runSettlementJob())"
   ```
3. Verify order:
   ```js
   db.orders.findOne({_id: ObjectId('...')}).settlement
   // settlementStatus should now be "available"
   ```
4. Seller dashboard → “Available to Withdraw” reflects the new amount.

### 3.2 Seller Withdrawal Request
1. Log in as seller, open `/seller/manage-payments`.
2. Click “Request Withdrawal”.
3. Backend stores entry in `Withdrawal` collection with status `pending`.
4. Check via API:
   ```
   GET /api/payments/withdrawals
   ```

### 3.3 Admin Completion
1. Review pending requests:
   ```
   GET /api/admin/withdrawals?status=pending
   ```
2. Transfer money manually (bank/JazzCash/Easypaisa).
3. Mark completed:
   ```
   PATCH /api/admin/withdrawals/WDR-123/status
   Body: { "status": "completed", "transactionId": "BANK123" }
   ```
4. Seller dashboard history now shows “Completed”.

### 3.4 Edge Cases
| Scenario | How to Test | Expected Result |
|----------|-------------|-----------------|
| Below min withdrawal | `POST /api/payments/withdrawals { "amount": 1000 }` | `400` + “Minimum withdrawal amount is PKR 5,000” |
| Insufficient balance | `POST /api/payments/withdrawals { "amount": 999999 }` | `400` + “Insufficient balance” |
| Cron logging | Check backend console at 2:00 AM or after manual run | “Processed X orders, Total PKR …” |

---

## 4. Payment Method Test Matrix

| Flow | Without real keys (today) | With sandbox/production keys |
|------|---------------------------|------------------------------|
| Bank/Card (`bank_transfer`) | 1) Visit `/payment`, pick **Bank Transfer**.<br>2) Place order; confirm Mongo record has `paymentMethod: 'bank_transfer'` and `paymentStatus: 'pending'`.<br>3) Mark the order `paymentStatus: 'paid'` via admin or a helper script to simulate a gateway callback.<br>4) Run `runSettlementJob()` to ensure the payout moves from pending → available. | 1) Replace `BankTransferDetails` inputs with your bank/acquirer hosted fields or redirect snippet.<br>2) Once the bank reports success, either call `createOrder()` with `paymentStatus: 'paid'` or accept the webhook at `/api/webhooks/bank-transfer` and update the order.<br>3) Persist the gateway transaction ID on the order and verify settlement math stays identical. |
| JazzCash (`jazzcash`) | 1) Select **Jazz Cash**, place order, and ensure DB captures `paymentMethod: 'jazzcash'`.<br>2) Manually mark the order `paymentStatus = 'paid'` after “collecting” funds.<br>3) Continue with cron + withdrawal steps. | 1) Capture wallet + OTP in `JazzCashDetails` and call JazzCash sandbox APIs.<br>2) Configure return + webhook URLs; webhook validates `JAZZCASH_SECRET_KEY` and updates the order to `paid`.<br>3) Test decline path (wrong OTP) → order remains pending/cancelled. |
| Easypaisa (`easypaisa`) | Same as JazzCash; only the `paymentMethod` string differs. | Mirror the JazzCash setup using Easypaisa credentials/endpoints. |
| Cash on Delivery (`cod`) | 1) Select **Cash on Delivery**.<br>2) Place order; verify `paymentStatus: 'pending'`.<br>3) After courier “collects” cash, set `paymentStatus` to `'paid'` and track escrow release. | Courier or finance tooling marks COD orders paid once cash hits your account; settlement + withdrawals follow automatically. |

> 🧪 **Automation idea:** keep a Postman/k6 script that patches `/api/admin/orders/:id/payment` to mimic gateway callbacks while QA runs smoke tests.

---

## 5. Seller Withdrawal Regression

1. Ensure at least one delivered order has `settlement.settlementStatus = 'available'` (run the cron job if necessary).
2. As a seller, send:
   ```http
   POST /api/payments/withdrawals
   {
     "amount": 5000,
     "method": "Bank",
     "note": "QA cash-out"
   }
   ```
3. Expect `201 Created` with `success: true`; verify Mongo contains a `Withdrawal` doc (`status: 'pending'`).
4. Admin lists pending withdrawals: `GET /api/admin/withdrawals?status=pending`.
5. Admin completes the payout:
   ```http
   PATCH /api/admin/withdrawals/WD-XXXX/status
   {
     "status": "completed",
     "transactionId": "BANK123",
     "transactionReference": "JazzCashRef001"
   }
   ```
6. Seller reloads `/seller/manage-payments`; the overview cache invalidates and the withdrawal shows as **Completed** with a success notification.

---

## 6. Notes & Next Steps
- Current payouts are manual after seller requests (just like early Amazon/Daraz). To automate, integrate payout APIs from your bank/JazzCash/Easypaisa.
- All UI components retain original styling; they simply render live data from the endpoints above.
- Keep `.env` configured with payment gateway + SMTP credentials so notifications work. 

