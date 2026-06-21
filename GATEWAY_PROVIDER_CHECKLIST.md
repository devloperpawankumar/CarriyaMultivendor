# Payment Gateway Integration - Information Request

**To:** [Gateway Provider Name]  
**Subject:** Bank Transfer Integration - Credentials & Documentation Required  
**Date:** _______________

---

## Required Information for Bank Transfer Integration

Please provide the following information to enable bank transfer payment integration:

---

### ✅ 1. API Credentials

- [ ] **Merchant ID / Merchant Code**: _________________________
- [ ] **API Key / Public Key**: _________________________
- [ ] **Secret Key / Private Key**: _________________________
- [ ] **Hash Key / Signature Key** (if applicable): _________________________

---

### ✅ 2. Environment URLs

**Test/Sandbox Environment:**
- [ ] **API Base URL**: _________________________
- [ ] **Payment Initiation URL**: _________________________
- [ ] **Payment Status Check URL**: _________________________
- [ ] **Redirect URL** (if redirect-based): _________________________

**Production Environment:**
- [ ] **API Base URL**: _________________________
- [ ] **Payment Initiation URL**: _________________________
- [ ] **Payment Status Check URL**: _________________________
- [ ] **Redirect URL** (if redirect-based): _________________________

---

### ✅ 3. Webhook Configuration

- [ ] **Webhook Secret / Webhook Key**: _________________________
- [ ] **Webhook Events Supported**: 
  - [ ] Payment Success
  - [ ] Payment Failed
  - [ ] Payment Pending
  - [ ] Payment Cancelled
  - [ ] Other: _________________________

- [ ] **Webhook URL Format**: 
  ```
  Our webhook endpoint: https://yourdomain.com/api/webhooks/bank-transfer
  ```

- [ ] **Sample Webhook Payload** (JSON/XML format): 
  ```
  [Please provide example]
  ```

---

### ✅ 4. Payment Flow Type

Which payment flow does your gateway use for bank transfer?

- [ ] **Redirect Flow** (Customer redirected to gateway page)
- [ ] **Iframe/Embedded Flow** (Payment form embedded in our page)
- [ ] **API-Based Flow** (We collect details, send via API)
- [ ] **Hybrid Flow** (Combination)

---

### ✅ 5. API Documentation

- [ ] **API Documentation URL**: _________________________
- [ ] **SDK/Library Available**: 
  - [ ] Node.js SDK
  - [ ] JavaScript SDK
  - [ ] REST API only
  - [ ] Other: _________________________

- [ ] **Code Examples**: 
  - [ ] Sample request/response
  - [ ] Integration guide
  - [ ] GitHub repository: _________________________

---

### ✅ 6. Bank Transfer Specifics

- [ ] **Supported Banks**: 
  - [ ] HBL
  - [ ] UBL
  - [ ] MCB
  - [ ] Allied Bank
  - [ ] Meezan Bank
  - [ ] Bank Alfalah
  - [ ] Other: _________________________

- [ ] **Payment Processing Time**: 
  - [ ] Real-time
  - [ ] 24 hours
  - [ ] 48 hours
  - [ ] Other: _________________________

- [ ] **Transaction Limits**: 
  - Minimum: Rs. _______________
  - Maximum: Rs. _______________

- [ ] **Transaction Fees**: 
  - Percentage: _______%
  - Fixed Amount: Rs. _______
  - Other: _________________________

---

### ✅ 7. Security & Authentication

- [ ] **Authentication Method**: 
  - [ ] API Key in headers
  - [ ] Bearer Token (OAuth)
  - [ ] Basic Auth
  - [ ] Signature-based (HMAC)
  - [ ] Other: _________________________

- [ ] **Request Signing Required**: 
  - [ ] Yes (Algorithm: _________________________)
  - [ ] No

- [ ] **IP Whitelisting Required**: 
  - [ ] Yes (Our server IPs: _________________________)
  - [ ] No

---

### ✅ 8. Response Format

- [ ] **Response Format**: 
  - [ ] JSON
  - [ ] XML
  - [ ] Other: _________________________

- [ ] **Success Response Example**:
```json
[Please provide example]
```

- [ ] **Error Response Example**:
```json
[Please provide example]
```

---

### ✅ 9. Payment Status Codes

Please list all possible payment statuses:

- [ ] `pending` - Payment initiated
- [ ] `processing` - Payment being processed
- [ ] `success` / `completed` - Payment successful
- [ ] `failed` - Payment failed
- [ ] `cancelled` - Payment cancelled
- [ ] `refunded` - Payment refunded
- [ ] Other: _________________________

---

### ✅ 10. Return URLs Configuration

Please configure the following return URLs:

- [ ] **Success URL**: `https://yourdomain.com/payment/success`
- [ ] **Failure URL**: `https://yourdomain.com/payment/failure`
- [ ] **Cancel URL**: `https://yourdomain.com/payment/cancel`

---

### ✅ 11. Test Credentials

- [ ] **Test Merchant ID**: _________________________
- [ ] **Test API Key**: _________________________
- [ ] **Test Secret Key**: _________________________
- [ ] **Test Bank Account Numbers** (for testing): _________________________

---

### ✅ 12. Additional Information

- [ ] **Default Currency**: PKR (Pakistani Rupee)
- [ ] **Language Support**: 
  - [ ] English
  - [ ] Urdu
  - [ ] Other: _________________________

- [ ] **Support Contact**: 
  - Email: _________________________
  - Phone: _________________________
  - Technical Support: _________________________

- [ ] **Documentation URL**: _________________________
- [ ] **Status Page URL**: _________________________

---

## Example Response Format

```
Merchant ID: MERCHANT123456
API Key: pk_live_51H...
Secret Key: sk_live_51H...
Hash Key: hash_abc123...

Test API URL: https://sandbox.gateway.com/api/v1
Production API URL: https://api.gateway.com/v1

Webhook Secret: webhook_secret_xyz789
Webhook Events: payment.success, payment.failed, payment.pending

Payment Flow: Redirect-based
Supported Banks: HBL, UBL, MCB, Allied Bank, Meezan Bank
Processing Time: Real-time
Transaction Limits: Min Rs. 100, Max Rs. 500,000

Authentication: API Key in headers
Response Format: JSON

[etc...]
```

---

**Please fill this form and return it to us so we can proceed with the integration.**

**Thank you!**

---

**Contact Information:**
- **Your Name**: _________________________
- **Your Email**: _________________________
- **Your Phone**: _________________________
- **Company Name**: _________________________

