# Production Credential & Key Deployment Guide

Use this checklist whenever you receive real payment-gateway credentials so the platform starts processing live transactions immediately (and safely).

---

## 1. File Locations & Secret Management

| Component | Where to store secrets | Notes |
|-----------|------------------------|-------|
| Backend (Node/Express) | `backend/.env` (local) → secret manager / server env vars (prod) | Never commit `.env`. Use your hosting provider’s secret store (`pm2 ecosystem`, Docker `env_file`, Railway, Render, etc.). |
| Frontend (React) | `frontend/.env` (local) → build-time env vars `REACT_APP_*` | These must be set before `npm run build`. Encrypt or store in Vercel/Netlify project settings. |
| CI/CD | Secret store (GitHub Actions, GitLab, etc.) | Only expose secrets to build/deploy jobs; never echo them in logs. |

---

## 2. Backend `.env` Template (replace placeholders)

```env
# App / CORS
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://app.yourdomain.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/carriya

# Session / auth
JWT_SECRET=replace_with_strong_random
COOKIE_DOMAIN=.yourdomain.com

# Bank transfer gateway
BANK_TRANSFER_GATEWAY_MERCHANT_ID=live_merchant_id
BANK_TRANSFER_GATEWAY_API_KEY=live_public_key
BANK_TRANSFER_GATEWAY_SECRET_KEY=live_secret_key
BANK_TRANSFER_GATEWAY_WEBHOOK_SECRET=live_hmac_secret
BANK_TRANSFER_GATEWAY_API_URL=https://api.bankgateway.com/v1
BANK_TRANSFER_GATEWAY_ENV=production

# JazzCash
JAZZCASH_MERCHANT_ID=live_id
JAZZCASH_API_KEY=live_public_key
JAZZCASH_SECRET_KEY=live_secret_key
JAZZCASH_RETURN_URL=https://api.yourdomain.com/payment/jazzcash/return
JAZZCASH_WEBHOOK_URL=https://api.yourdomain.com/api/webhooks/jazzcash

# Easypaisa
EASYPAISA_MERCHANT_ID=live_id
EASYPAISA_API_KEY=live_public_key
EASYPAISA_SECRET_KEY=live_secret_key
EASYPAISA_RETURN_URL=https://api.yourdomain.com/payment/easypaisa/return
EASYPAISA_WEBHOOK_URL=https://api.yourdomain.com/api/webhooks/easypaisa

# Email/SMS (optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sg_live_password
SMTP_FROM_NAME=Carryia Platform
SMTP_FROM_ADDRESS=noreply@yourdomain.com

# Settlement / withdrawals
SETTLEMENT_CRON_SCHEDULE=0 2 * * *
SETTLEMENT_CRON_TZ=Asia/Karachi
SETTLEMENT_JOB_LOCK_TTL_MS=600000
SETTLEMENT_ESCROW_DAYS=7
MIN_WITHDRAWAL_AMOUNT=5000

# Observability
LOG_LEVEL=info
SENTRY_DSN=https://your_sentry_dsn (optional)
```

> **Tip:** keep a `backend/.env.example` with the same keys but dummy values so teammates know what must be provided.

---

## 3. Frontend `.env` Template

```env
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_CLIENT_VERSION=1.0.0
REACT_APP_API_VERSION=1.0.0
```

Set these in your React hosting provider (Vercel/Netlify) **before** running `npm run build`. After updating, redeploy so the new values bake into the bundle.

---

## 4. Deployment Steps When Keys Arrive

1. **Create/update `.env` files locally** with the new credentials (use the templates above).
2. **Test in sandbox mode** (if provided) by toggling `*_API_URL`/`*_ENV` to the sandbox endpoints.
3. **Run integration smoke tests locally:**
   - Create a bank-transfer order.
   - Run settlement cron (`node src/jobs/settlementJob.js`).
   - Submit a withdrawal request and complete it via admin.
4. **Upload secrets to production**:
   - Backend server/secret manager
   - Frontend hosting env vars
5. **Redeploy backend** (`pm2 restart`, Docker redeploy, etc.) so Express reloads the new env.
6. **Redeploy frontend** so the new `REACT_APP_*` values take effect.
7. **Configure gateway dashboards**:
   - Set return URLs and webhook URLs to the values defined above.
   - Whitelist your production IPs if required.
8. **Verify webhooks** by triggering a small test payment and checking server logs for signature validation.
9. **Run the full test plan** (`PAYMENT_SYSTEM_TEST_PLAN.md`) to confirm COD and non-COD flows update wallets/reports.

---

## 5. Error-Free Go-Live Checklist

- [ ] `.env` values match the credentials received from each provider.
- [ ] Gateway dashboards have the correct callback URLs (HTTPS, production domain).
- [ ] Backend/Frontend redeployed after updating secrets.
- [ ] Settlement cron schedule confirmed via logs (`[Settlement Job] Cron job scheduled: "0 2 * * *"`).
- [ ] Payment orders appear with `paymentStatus: 'paid'` for non-COD.
- [ ] Seller dashboard shows new earnings after a test order.
- [ ] Webhook signature logs show “verified” (no HMAC mismatch).
- [ ] Finance team has access to the secret manager and rotation policy documented.

Follow this doc each time you rotate keys or onboard a new payment provider to keep the rollout smooth. If anything fails, revert to sandbox keys, inspect logs (`backend/debug.log`), fix configuration, and redeploy. 

