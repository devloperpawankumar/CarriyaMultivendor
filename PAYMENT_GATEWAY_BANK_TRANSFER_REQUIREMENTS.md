# Payment Gateway Integration - Bank Transfer Requirements

## Overview
If you have a payment gateway that supports bank transfer, you need specific credentials and information from the gateway provider to integrate it into your e-commerce platform.

---

## 🔑 Required Credentials & Information

### 1. **API Credentials** (Required)

Ask your gateway provider for:

- **Merchant ID / Merchant Code**
  - Format: Usually alphanumeric (e.g., `MERCHANT123456`)
  - Used to identify your merchant account

- **API Key / Public Key**
  - Format: Long string (e.g., `pk_live_51H...` or `PUBLIC_KEY_ABC123...`)
  - Used for API authentication

- **Secret Key / Private Key**
  - Format: Long string (e.g., `sk_live_51H...` or `SECRET_KEY_XYZ789...`)
  - **⚠️ KEEP THIS SECRET** - Never expose in frontend code
  - Used for server-side API calls

- **Hash Key / Signature Key** (If applicable)
  - Used for request/response signature verification
  - Format: Usually a long string

---

### 2. **Environment URLs** (Required)

Ask for both **Test/Sandbox** and **Production** URLs:

#### **Test/Sandbox Environment:**
- **API Base URL**: `https://sandbox.gateway.com/api` or similar
- **Payment Initiation URL**: `https://sandbox.gateway.com/payment/initiate`
- **Payment Status Check URL**: `https://sandbox.gateway.com/payment/status`
- **Redirect URL** (if redirect-based): `https://sandbox.gateway.com/payment/redirect`

#### **Production Environment:**
- **API Base URL**: `https://api.gateway.com` or similar
- **Payment Initiation URL**: `https://api.gateway.com/payment/initiate`
- **Payment Status Check URL**: `https://api.gateway.com/payment/status`
- **Redirect URL** (if redirect-based): `https://gateway.com/payment/redirect`

**Example:**
```
Test API URL: https://sandbox.hblpg.com/api/v1
Production API URL: https://hblpg.com/api/v1
```

---

### 3. **Webhook Configuration** (Required)

You need to provide your webhook URL to the gateway, and they need to provide:

- **Webhook Secret / Webhook Key**
  - Used to verify webhook requests are from the gateway
  - Format: Usually a long string

- **Webhook Events Supported**
  - Which events does the gateway send? (e.g., `payment.success`, `payment.failed`, `payment.pending`)

- **Webhook URL Format**
  - What URL should you provide? (e.g., `https://yourdomain.com/api/webhooks/bank-transfer`)

**Your Webhook Endpoint:**
```
https://yourdomain.com/api/webhooks/bank-transfer
```

**Webhook Payload Format:**
- Ask for sample webhook payload structure
- What fields are included? (transaction_id, amount, status, etc.)

---

### 4. **Payment Flow Type** (Required)

Ask which payment flow the gateway uses:

- **☐ Redirect Flow**
  - Customer is redirected to gateway's payment page
  - Customer completes payment on gateway's website
  - Customer is redirected back to your site

- **☐ Iframe/Embedded Flow**
  - Payment form is embedded in your page
  - Customer stays on your website

- **☐ API-Based Flow**
  - You collect bank details on your site
  - You send payment request via API
  - Gateway processes and returns status

- **☐ Hybrid Flow**
  - Combination of above

---

### 5. **API Documentation** (Required)

Ask for:

- **API Documentation URL** or PDF
- **SDK/Library** (if available)
  - Node.js SDK?
  - JavaScript SDK?
  - REST API only?

- **Code Examples**
  - Sample request/response
  - Integration examples

---

### 6. **Payment Method Details** (Required)

For bank transfer specifically, ask:

- **Supported Banks**
  - Which Pakistani banks are supported?
  - (HBL, UBL, MCB, Allied Bank, Meezan Bank, etc.)

- **Payment Processing Time**
  - How long does verification take? (Real-time, 24 hours, etc.)

- **Minimum/Maximum Amount**
  - Any limits on transaction amounts?

- **Transaction Fees**
  - What are the fees? (Percentage or fixed amount)

---

### 7. **Security & Authentication** (Required)

Ask about:

- **Authentication Method**
  - ☐ API Key in headers
  - ☐ Bearer Token (OAuth)
  - ☐ Basic Auth
  - ☐ Signature-based (HMAC)

- **Request Signing**
  - Do requests need to be signed?
  - What algorithm? (HMAC-SHA256, RSA, etc.)

- **IP Whitelisting**
  - Do you need to whitelist your server IPs?
  - What IPs should be whitelisted?

---

### 8. **Response Format** (Required)

Ask for:

- **Response Format**
  - JSON? XML?
  - What is the structure?

- **Success Response Example:**
```json
{
  "status": "success",
  "transaction_id": "TXN123456",
  "amount": 5000,
  "currency": "PKR",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

- **Error Response Example:**
```json
{
  "status": "failed",
  "error_code": "INSUFFICIENT_FUNDS",
  "error_message": "Insufficient funds in account"
}
```

---

### 9. **Status Codes** (Required)

Ask for all possible payment statuses:

- `pending` - Payment initiated, awaiting processing
- `processing` - Payment being processed
- `success` / `completed` - Payment successful
- `failed` - Payment failed
- `cancelled` - Payment cancelled
- `refunded` - Payment refunded
- Others?

---

### 10. **Additional Configuration** (Optional but Recommended)

- **Return URLs**
  - Success URL: `https://yourdomain.com/payment/success`
  - Failure URL: `https://yourdomain.com/payment/failure`
  - Cancel URL: `https://yourdomain.com/payment/cancel`

- **Currency**
  - Default currency: PKR (Pakistani Rupee)
  - Can you accept other currencies?

- **Language**
  - Default: English
  - Support for Urdu?

- **Test Cards/Accounts**
  - Test bank account numbers for testing?
  - Test credentials?

---

## 📋 Quick Checklist - What to Ask Gateway Provider

Copy this checklist and send to your gateway provider:

```
□ Merchant ID / Merchant Code
□ API Key / Public Key
□ Secret Key / Private Key
□ Hash Key / Signature Key (if applicable)
□ Test/Sandbox API URLs
□ Production API URLs
□ Webhook Secret / Webhook Key
□ Webhook URL format and events
□ Payment flow type (Redirect/Iframe/API)
□ API Documentation
□ SDK/Library availability
□ Supported banks list
□ Payment processing time
□ Transaction limits (min/max)
□ Transaction fees
□ Authentication method
□ Request signing requirements
□ IP whitelisting requirements
□ Response format (JSON/XML)
□ Success/Error response examples
□ All payment status codes
□ Return URLs format
□ Test credentials/cards
```

---

## 🔒 Security Best Practices

### Environment Variables Setup

Store all sensitive credentials in environment variables:

```env
# Payment Gateway - Bank Transfer
BANK_TRANSFER_GATEWAY_MERCHANT_ID=your_merchant_id
BANK_TRANSFER_GATEWAY_API_KEY=your_api_key
BANK_TRANSFER_GATEWAY_SECRET_KEY=your_secret_key
BANK_TRANSFER_GATEWAY_HASH_KEY=your_hash_key
BANK_TRANSFER_GATEWAY_WEBHOOK_SECRET=your_webhook_secret

# URLs
BANK_TRANSFER_GATEWAY_API_URL=https://api.gateway.com
BANK_TRANSFER_GATEWAY_SANDBOX_URL=https://sandbox.gateway.com

# Environment
BANK_TRANSFER_GATEWAY_ENV=production  # or 'sandbox'
```

### Never Expose in Frontend

- ❌ **Never** put secret keys in frontend code
- ❌ **Never** commit credentials to Git
- ✅ **Always** use environment variables
- ✅ **Always** validate webhook signatures
- ✅ **Always** use HTTPS for webhooks

---

## 📝 Integration Flow

### Typical Bank Transfer Gateway Flow:

1. **Customer selects "Bank Transfer"**
2. **Frontend sends payment request to your backend**
3. **Backend calls gateway API** to initiate payment
4. **Gateway returns payment URL or form data**
5. **Customer redirected/embedded to gateway** (if redirect/iframe)
   OR
   **Customer enters bank details on your site** (if API-based)
6. **Gateway processes payment**
7. **Gateway sends webhook** to your backend
8. **Backend verifies webhook signature**
9. **Backend updates order status**
10. **Customer sees payment confirmation**

---

## 🧪 Testing Requirements

Ask for:

- **Test/Sandbox Account**
  - Test merchant ID
  - Test API keys
  - Test bank account numbers

- **Test Scenarios**
  - Successful payment
  - Failed payment
  - Pending payment
  - Cancelled payment
  - Refund scenario

---

## 📞 Support Information

Also ask for:

- **Support Email/Phone**
- **Technical Support Contact**
- **Documentation URL**
- **Status Page** (to check gateway status)

---

## Example Request to Gateway Provider

**Email Template:**

```
Subject: Bank Transfer Integration - Credentials & Documentation Required

Dear [Gateway Provider],

We are integrating bank transfer payment method into our e-commerce platform 
and need the following information:

1. API Credentials:
   - Merchant ID
   - API Key (Public Key)
   - Secret Key (Private Key)
   - Hash/Signature Key (if applicable)

2. Environment URLs:
   - Test/Sandbox API URLs
   - Production API URLs

3. Webhook Configuration:
   - Webhook Secret
   - Webhook events supported
   - Webhook payload format

4. Documentation:
   - API Documentation
   - Integration guide
   - Code examples/SDK

5. Payment Flow:
   - What type of flow? (Redirect/Iframe/API)
   - Supported banks
   - Processing time

6. Test Credentials:
   - Test merchant account
   - Test bank accounts

Please provide the above information so we can proceed with integration.

Thank you!
```

---

## Common Pakistani Payment Gateways

If you're using one of these, here's what to expect:

### HBL Payment Gateway
- Usually provides: Merchant ID, API Key, Secret Key
- Flow: Usually redirect-based
- Documentation: Available on HBL portal

### UBL Payment Gateway
- Usually provides: Merchant ID, API Key, Secret Key
- Flow: Redirect or API-based
- Documentation: Available on UBL portal

### MCB Payment Gateway
- Usually provides: Merchant ID, API Key, Secret Key
- Flow: Usually redirect-based
- Documentation: Available on MCB portal

### Bank Alfalah Payment Gateway
- Usually provides: Merchant ID, API Key, Secret Key
- Flow: Redirect or API-based
- Documentation: Available on Bank Alfalah portal

---

**Once you have all this information, we can proceed with the integration!**

