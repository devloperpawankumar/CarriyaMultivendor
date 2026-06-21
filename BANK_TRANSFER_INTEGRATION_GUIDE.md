# Bank Transfer Integration Guide for Pakistan

## ⚠️ Important: Do You Have a Payment Gateway?

**If you have a payment gateway for bank transfer**, please refer to:
- **[PAYMENT_GATEWAY_BANK_TRANSFER_REQUIREMENTS.md](./PAYMENT_GATEWAY_BANK_TRANSFER_REQUIREMENTS.md)** - Complete guide on what credentials you need
- **[GATEWAY_PROVIDER_CHECKLIST.md](./GATEWAY_PROVIDER_CHECKLIST.md)** - Ready-to-send checklist for your gateway provider

**If you DON'T have a payment gateway**, continue reading this guide for manual bank transfer integration.

---

## Overview
Bank transfer in Pakistan can be implemented in two ways:

1. **Manual Bank Transfer** (No Gateway) - Customers transfer money directly to your business bank account, and you manually verify payments
2. **Gateway-Based Bank Transfer** (With Gateway) - Payment gateway handles the transfer and verification automatically

This guide covers **Manual Bank Transfer**. If you have a gateway, see the gateway requirements document above.

## What You Need to Ask Your Client

### 1. **Bank Account Information** (Required)
Ask your client to provide the following details for their business bank account:

- **Bank Name** (e.g., HBL, UBL, MCB, Allied Bank, Meezan Bank, etc.)
- **Account Title** (Business/Company name as registered with the bank)
- **Account Number** (IBAN format preferred: PK##XXXX#########)
- **IBAN** (International Bank Account Number - format: PK##XXXX#########)
- **Branch Name** (Optional but helpful)
- **Branch Code** (Optional)
- **Account Type** (Current/Savings)

**Example:**
```
Bank Name: HBL (Habib Bank Limited)
Account Title: Carryia E-commerce Pvt Ltd
Account Number: 1234567890123
IBAN: PK36SCBL0000001123456789012
Branch: Main Branch, Karachi
```

### 2. **Payment Verification Process** (Required)
Ask your client how they want to handle payment verification:

**Option A: Manual Verification (Recommended for Start)**
- Customer uploads proof of payment (screenshot/receipt)
- Admin/Seller manually verifies the payment
- Order status changes from "pending" to "paid" after verification

**Option B: Automated Verification (Advanced)**
- Integration with bank's API (if available)
- Real-time payment verification
- Requires bank API credentials and technical setup

**Questions to Ask:**
- Who will verify payments? (Admin, Seller, or Automated)
- How long should customers wait for verification? (Usually 24-48 hours)
- What happens if payment is not verified? (Auto-cancel after X hours)

### 3. **Payment Proof Requirements** (Required)
Define what customers need to upload:

- **Screenshot of bank transfer receipt** (Required)
- **Transaction ID/Reference Number** (Required)
- **Transfer Date** (Required)
- **Amount Transferred** (Required)
- **Sender Account Details** (Optional - for verification)

**File Upload Specifications:**
- Maximum file size: 2-5 MB
- Accepted formats: JPG, PNG, PDF
- Number of files: 1-2 files

### 4. **Business Rules** (Required)
Ask your client about:

- **Minimum Order Amount**: Is there a minimum amount for bank transfer? (e.g., Rs. 1000)
- **Maximum Order Amount**: Any limit? (e.g., Rs. 100,000)
- **Processing Time**: How long before order is confirmed? (e.g., 24-48 hours)
- **Auto-Cancel**: Cancel order if payment not verified within X hours? (e.g., 72 hours)
- **Multiple Bank Accounts**: Do they want to support multiple bank accounts? (Different banks for different regions)

### 5. **Notification Preferences** (Optional but Recommended)
- Email notification when payment proof is uploaded?
- SMS notification to customer when payment is verified?
- Email to admin when new payment proof is uploaded?

### 6. **Bank API Integration** (Optional - Advanced)
If client wants automated verification, ask:

- **Does the bank provide API?** (Most Pakistani banks don't, but some do)
- **Bank Name**: Which bank? (HBL, UBL, MCB, etc.)
- **API Documentation**: Do they have access to bank's API docs?
- **API Credentials**: Merchant ID, API Key, Secret Key
- **Sandbox/Test Environment**: Available for testing?

**Note**: Most Pakistani banks (HBL, UBL, MCB, etc.) do NOT provide public APIs for payment verification. Manual verification is the standard approach.

## Implementation Approach

### Phase 1: Manual Bank Transfer (Recommended Start)

**Frontend Changes:**
1. Update `BankTransferDetails.tsx` to show:
   - Bank account details (Bank name, Account number, IBAN)
   - Instructions for customer
   - File upload for payment proof
   - Transaction ID input field
   - Transfer date picker

**Backend Changes:**
1. Add fields to Order model:
   - `bankTransferProof` (file URL)
   - `bankTransferTransactionId` (string)
   - `bankTransferDate` (date)
   - `bankTransferVerified` (boolean)
   - `bankTransferVerifiedAt` (date)
   - `bankTransferVerifiedBy` (admin/seller ID)

2. Create admin endpoint to:
   - View pending bank transfer orders
   - Verify payment (upload proof)
   - Reject payment (with reason)

**Database Schema Addition:**
```javascript
// In Order model
bankTransferDetails: {
  proofUrl: String,
  transactionId: String,
  transferDate: Date,
  verified: { type: Boolean, default: false },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: String
}
```

### Phase 2: Automated Verification (Future - If Bank API Available)

If bank provides API:
- Integrate bank's payment verification API
- Real-time payment status check
- Automatic order confirmation

## Current Issue

The current `BankTransferDetails.tsx` component shows **credit card fields** which is incorrect for bank transfer in Pakistan. It needs to be updated to show:

1. **Bank Account Information** (display only)
2. **Payment Instructions** (step-by-step guide)
3. **Payment Proof Upload** (file upload)
4. **Transaction Details** (transaction ID, date, amount)

## Recommended Flow

1. **Customer selects "Bank Transfer"**
2. **Customer sees bank account details** (Bank name, Account number, IBAN)
3. **Customer makes transfer** from their bank (mobile app/online banking)
4. **Customer uploads proof** (screenshot/receipt) + enters transaction ID
5. **Order created with status: "pending_payment_verification"**
6. **Admin/Seller receives notification**
7. **Admin verifies payment** (checks bank statement/account)
8. **Order status changes to "paid"** → Order confirmed
9. **Customer receives confirmation** (email/SMS)

## Security Considerations

- **Never store full bank account details in frontend code** (use environment variables)
- **Validate uploaded files** (file type, size, scan for malware)
- **Store payment proofs securely** (encrypted storage, access control)
- **Log all verification actions** (audit trail)
- **Rate limit payment proof uploads** (prevent spam)

## Testing Checklist

- [ ] Customer can see bank account details
- [ ] Customer can upload payment proof
- [ ] Customer can enter transaction ID
- [ ] Order is created with correct status
- [ ] Admin can view pending payments
- [ ] Admin can verify payment
- [ ] Admin can reject payment with reason
- [ ] Customer receives verification notification
- [ ] Order status updates correctly
- [ ] File upload validation works
- [ ] Payment proof is stored securely

## Questions to Confirm with Client

1. ✅ Bank account details (Bank name, Account number, IBAN, Account title)
2. ✅ Who will verify payments? (Admin/Seller)
3. ✅ Processing time? (24-48 hours)
4. ✅ Auto-cancel policy? (Cancel after 72 hours if not verified?)
5. ✅ Minimum/maximum order amounts?
6. ✅ Multiple bank accounts needed?
7. ✅ Notification preferences?
8. ✅ Bank API available? (Usually NO for Pakistani banks)

---

**Next Steps:**
1. Get bank account details from client
2. Update `BankTransferDetails.tsx` component
3. Add payment proof upload functionality
4. Create admin verification interface
5. Test the complete flow

