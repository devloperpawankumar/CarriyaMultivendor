# Bank Transfer Integration - Information Required

Dear Client,

To implement bank transfer payment method for your e-commerce platform, we need the following information:

## 1. Bank Account Details (Required)

Please provide your business bank account information:

- **Bank Name**: _________________________
  (e.g., HBL, UBL, MCB, Allied Bank, Meezan Bank, Bank Alfalah, etc.)

- **Account Title**: _________________________
  (Business/Company name as registered with the bank)

- **Account Number**: _________________________

- **IBAN**: _________________________
  (Format: PK##XXXX######### - International Bank Account Number)

- **Branch Name**: _________________________ (Optional)

- **Account Type**: ☐ Current Account  ☐ Savings Account

---

## 2. Payment Verification Process

**Who will verify bank transfer payments?**
- ☐ Admin (Platform admin team)
- ☐ Seller (Individual sellers verify their own orders)
- ☐ Automated (If bank API is available)

**How long should customers wait for payment verification?**
- ☐ 24 hours
- ☐ 48 hours
- ☐ 72 hours
- ☐ Other: _______________

**What should happen if payment is not verified within the time limit?**
- ☐ Auto-cancel the order
- ☐ Keep order pending (manual review)
- ☐ Send reminder to customer

---

## 3. Business Rules

**Minimum order amount for bank transfer:**
- Rs. _______________ (Leave blank if no minimum)

**Maximum order amount for bank transfer:**
- Rs. _______________ (Leave blank if no maximum)

**Do you want to support multiple bank accounts?**
- ☐ Yes (Please provide details for each bank)
- ☐ No (Single bank account is sufficient)

---

## 4. Notification Preferences

**Email notifications:**
- ☐ Send email to customer when payment proof is uploaded
- ☐ Send email to customer when payment is verified
- ☐ Send email to admin when new payment proof is uploaded

**SMS notifications:**
- ☐ Send SMS to customer when payment is verified
- ☐ Send SMS to admin when new payment proof is uploaded

---

## 5. Bank API Integration (Optional - Advanced)

**Does your bank provide API for payment verification?**
- ☐ Yes (Please provide API documentation and credentials)
- ☐ No (We'll use manual verification)
- ☐ Not sure (We'll start with manual verification)

**If Yes, please provide:**
- Bank Name: _________________________
- API Documentation: ☐ Available  ☐ Not Available
- Test/Sandbox Environment: ☐ Available  ☐ Not Available

---

## 6. Payment Proof Requirements

**What should customers upload as proof of payment?**
- ☐ Screenshot of bank transfer receipt (Required)
- ☐ Transaction ID/Reference Number (Required)
- ☐ Transfer Date (Required)
- ☐ Amount Transferred (Required)

**File upload specifications:**
- Maximum file size: ☐ 2 MB  ☐ 5 MB  ☐ 10 MB
- Accepted formats: ☐ JPG/PNG  ☐ PDF  ☐ Both

---

## Example Response

```
Bank Name: HBL (Habib Bank Limited)
Account Title: Carryia E-commerce Pvt Ltd
Account Number: 1234567890123
IBAN: PK36SCBL0000001123456789012
Branch Name: Main Branch, Karachi
Account Type: Current Account

Verification: Admin team will verify within 24 hours
Auto-cancel: Yes, after 72 hours if not verified
Minimum amount: Rs. 1,000
Maximum amount: No limit
Multiple accounts: No
Notifications: Email to customer and admin
Bank API: Not available (manual verification)
```

---

**Please fill this form and return it to us so we can proceed with the implementation.**

Thank you!

