## Seller Payments Flow (Carriya vs. Amazon/Daraz Parity)

This walkthrough explains how the `ManagePayments` page expects the backend to behave, starting from the moment a buyer places an order until the seller receives money in their bank/JazzCash/Easypaisa account.

### 1. Buyer Places Order
- **Checkout initiated:** Buyer confirms cart, selects payment method (online PSP vs. COD).
- **Payment authorization:**
  - *Online (Stripe/Adyen/JazzCash):* PSP returns `paymentIntentId` and status `AUTHORIZED`. Funds are reserved but not yet remitted to the seller.
  - *COD:* Order flagged as `COD_PENDING`. No funds collected until delivery.
- **Order status:** `PendingPayment` → `Paid` (online) or stays `COD_PENDING`.

### 2. Fulfillment & Delivery
- Seller ships the order; logistics service tracks carrier events.
- Once the parcel is delivered (or cash collected for COD), logistics sends a delivery confirmation event.
- Amazon/Daraz best practice: unlock payouts only after delivery + return window (e.g., 7 days for electronics, 3 for fashion).

### 3. Settlement Engine
- Finance service receives delivery confirmations and fetches order/payment metadata.
- Calculates **net earnings** per order:
  ```
  net = item_total - platform_fee - shipping_subsidy - dispute_hold
  ```
- Creates a `wallet_transaction` entry with these fields:
  - `orderId`, `productName`
  - `amount` (PKR)
  - `status` (`Pending`, `Processing`, `Paid`, `Failed`)
  - `payoutEligibleAt` (delivery + hold window)

### 4. Wallet States (what the UI shows)
- `pendingEarnings`: sum of transactions where `status !== 'Paid'` or current time < `payoutEligibleAt`.
- `availableToWithdraw`: transactions that cleared the hold and aren’t already in a withdrawal batch.
- `currentWalletBalance = pendingEarnings + availableToWithdraw`.
- `paymentService.getBalanceOverview` returns these totals. Amazon & Daraz expose similar wallet APIs with request IDs, version headers, etc. (our `api.ts` already injects them).

### 5. Earnings Summary Widget
- Frontend calls `paymentService.getEarningsSummary()` → backend returns the list of wallet transactions with:
  ```ts
  type EarningEntry = {
    id: string;
    orderId: string;
    productName: string;
    amount: number;
    date: string; // ISO
    status: 'Paid' | 'Pending' | 'Processing' | 'Failed';
  }
  ```
- Component groups entries by day/week/month/custom range, mirrors Amazon “Business Reports” & Daraz “Earnings Summary.”

### 6. Withdrawal Requests
- Seller submits amount + method via `withdrawalRequestCard`.
- `paymentService.createWithdrawalRequest` posts to `/api/payments/withdrawals` with:
  ```json
  { "amount": 50000, "method": "Bank", "note": "Weekly cash-out" }
  ```
- Backend validates:
  - amount ≤ `availableToWithdraw`
  - daily/weekly limits
  - no pending withdrawals exceeding cap
- If valid:
  - Locks wallet row, moves amount to `payout_in_progress`.
  - Creates `withdrawal` record (`withdrawalId`, amount, method, status=`PROCESSING`).
  - Returns `{ success: true, withdrawalId }`.
- Finance/treasury job pushes ACH/JazzCash/Easypaisa transfer, then updates status to `PAID` or `FAILED`.

### 7. Withdrawal History & Statements
- `paymentService.getWithdrawalHistory()` returns chronological records of transfers.
- Invoice data in the UI is currently derived from the same `earnings` payload (top 5‑6 entries). When an invoices endpoint is added it can return the richer `InvoiceRow` DTO:
  ```ts
  type InvoiceRow = {
    orderId: string;
    date: string;
    product: string;
    amount: number;
    downloadUrl?: string; // optional presigned S3 link
  }
  ```
- `DownloadInvoiceTable` downloads either the provided `downloadUrl` or generates a CSV locally (Daraz-style statement export).

### 8. Error & Dispute Handling
- If a buyer files a claim/chargeback, finance sets transaction status to `Processing` or `Failed` and deducts the amount from `availableToWithdraw`.
- UI reflects the new status automatically because all widgets read from the same earnings API.

### Key Differences vs. Amazon/Daraz
| Area                | Amazon/Daraz                                   | Carriya Implementation Plan                              |
|---------------------|-----------------------------------------------|----------------------------------------------------------|
| Auth Headers        | `x-amz-request-id`, `x-daraz-track-id`, etc.  | `api.ts` injects `X-Request-ID`, `X-Client-ID`, versions. |
| Settlement Cadence  | T+7 to T+14 based on category                 | Configurable hold window in settlement service.          |
| Statement Delivery  | PDF download + CSV exports                    | CSV today; add `downloadUrl` endpoint later.             |
| Withdrawal Limits   | Tiered (daily/week/monthly)                   | Validate server-side before accepting request.           |

### What to Build on Backend
1. `GET /api/payments/balance-overview`
2. `GET /api/payments/earnings?range=daily|weekly|monthly&start=&end=`
3. `GET /api/payments/withdrawals`
4. `GET /api/payments/invoices` *(future – currently derived on frontend)*
5. `POST /api/payments/withdrawals`

All endpoints should enforce seller auth, emit the shared DTOs, and include the professional headers that the frontend already sends. Once these routes are live, the `ManagePayments` page reflects true seller data without further UI work.

---

### Wiring to the live backend (already implemented)

1. **API client** – `frontend/src/services/paymentService.ts` calls `/api/payments/*` via the shared `api.ts` wrapper. Configure the frontend env var `REACT_APP_API_BASE_URL` before building so requests reach the deployed backend.
2. **Backend controllers** – `backend/src/controllers/paymentsController.js` already provides:
   - `getBalanceOverview` → wallet tiles
   - `getPaymentsOverview` (with ETag caching) → page bootstrap
   - `getEarnings`, `getWithdrawals`, `createWithdrawal`, `getAllWithdrawals`, `updateWithdrawalStatus`
3. **Auth requirements** – all seller routes require `requireAuth`. Make sure your session cookies/domain align with `FRONTEND_URL`/CORS settings; otherwise requests will be rejected before the UI can render.
4. **Cache/ETag notes** – `getPaymentsOverview` sets `ETag` + `Cache-Control`. The UI stores the ETag in `overviewEtagRef`. If you test on Postman first, clear the stored ETag (localStorage key `carriya_payment_overview_etag`) so you don’t keep getting `304 Not Modified`.
5. **Error surfacing** – any backend error bubble up as `err.response.data.error`. The UI shows them inside the yellow alert panel. While testing, inspect browser devtools → Network to confirm the response body matches the error you expect.

### Going live checklist for sellers

- ✅ **Update base URLs:** deploy backend, set `FRONTEND_URL` + `REACT_APP_API_BASE_URL`, rebuild frontend.
- ✅ **Seed orders:** mark a few orders `status: delivered`, `paymentStatus: paid` so the wallet/earnings widgets have data.
- ✅ **Verify cron:** run `node src/jobs/settlementJob.js` once (or wait for schedule) to ensure pending settlements flip to available and show up in `availableToWithdraw`.
- ✅ **Submit withdrawal test:** log in as a seller, request PKR 5,000, verify a `Withdrawal` document is created, then hit the admin PATCH route to mark it completed and observe the UI update in real time.

Once the real gateways are plugged in (see `PAYMENT_METHODS_SETTLEMENT_EXPLAINED.md`), the UI doesn’t change—only the backend order/payment records will transition from “manual” to “gateway-confirmed,” and the dashboard will reflect that automatically.


