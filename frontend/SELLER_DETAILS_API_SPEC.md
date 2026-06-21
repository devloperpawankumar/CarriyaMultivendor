# Seller Details API Specification

This document describes the API endpoints required for the Seller Details page.

---

## 1. Get Seller Details

### Endpoint
```
GET /api/admin/sellers/:id
```

### Description
Fetch complete details of a specific seller by their ID.

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Unique seller identifier |

### Request Example
```
GET /api/admin/sellers/seller_001
```

### Response Format

```typescript
{
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  contactNumber: string;
  status: 'Active' | 'Pending' | 'Suspended';
  commission: number;
  pickupAddress: string;
  returnAddress: string;
  nameOnIdCard: string;
  idCardNumber: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  accountHolderName: string;
  ibanNumber: string;
  accountNumber: string;
  bankName: string;
  branchCode: string;
  bankDocumentUrl?: string;
  createdAt?: string;
}
```

### Sample Response
```json
{
  "id": "seller_001",
  "storeName": "Tech Store",
  "ownerName": "John Merchant",
  "email": "john@techstore.com",
  "contactNumber": "+1 (555) 123-4567",
  "status": "Active",
  "commission": 15,
  "pickupAddress": "123 Main St, Tech District, NY 10001",
  "returnAddress": "123 Main St, Tech District, NY 10001",
  "nameOnIdCard": "John Michael Merchant",
  "idCardNumber": "ID-4521-8976-3421",
  "idCardFrontUrl": "https://yourdomain.com/uploads/id-front-seller001.jpg",
  "idCardBackUrl": "https://yourdomain.com/uploads/id-back-seller001.jpg",
  "accountHolderName": "John Merchant",
  "ibanNumber": "US12 3456 7890 1234 5678 90",
  "accountNumber": "1234567890",
  "bankName": "Global Bank",
  "branchCode": "GB-001",
  "bankDocumentUrl": "https://yourdomain.com/uploads/bank-doc-seller001.pdf",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Error Responses

**404 Not Found**
```json
{
  "error": "Seller not found",
  "message": "No seller exists with the provided ID"
}
```

**401 Unauthorized**
```json
{
  "error": "Unauthorized",
  "message": "Admin authentication required"
}
```

---

## 2. Approve Seller

### Endpoint
```
POST /api/admin/sellers/:id/approve
```

### Description
Approve a pending seller application.

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Unique seller identifier |

### Request Example
```
POST /api/admin/sellers/seller_003/approve
```

### Request Body
```json
{}
```
*(No body required, or you can include optional approval notes)*

### Response Format
```typescript
{
  success: boolean;
  message?: string;
}
```

### Sample Response
```json
{
  "success": true,
  "message": "Seller approved successfully"
}
```

### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "Seller is already approved"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Seller not found"
}
```

---

## 3. Suspend Seller

### Endpoint
```
POST /api/admin/sellers/:id/suspend
```

### Description
Suspend a seller's account.

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Unique seller identifier |

### Request Example
```
POST /api/admin/sellers/seller_005/suspend
```

### Request Body
```json
{
  "reason": "Optional suspension reason"
}
```

### Response Format
```typescript
{
  success: boolean;
  message?: string;
}
```

### Sample Response
```json
{
  "success": true,
  "message": "Seller suspended successfully"
}
```

### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "Seller is already suspended"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Seller not found"
}
```

---

## Field Descriptions

### Required Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | string | Unique seller identifier | Not empty |
| storeName | string | Name of the store | 3-100 characters |
| ownerName | string | Full name of store owner | 2-100 characters |
| email | string | Contact email address | Valid email format |
| contactNumber | string | Phone number with country code | Valid phone format |
| status | enum | Current seller status | 'Active', 'Pending', or 'Suspended' |
| commission | number | Commission percentage | 0-100 |
| pickupAddress | string | Store pickup address | 10-500 characters |
| returnAddress | string | Return address | 10-500 characters |
| nameOnIdCard | string | Full name on ID card | 2-100 characters |
| idCardNumber | string | Government ID number | Format varies by country |
| accountHolderName | string | Bank account holder name | 2-100 characters |
| ibanNumber | string | International Bank Account Number | Valid IBAN format |
| accountNumber | string | Bank account number | 8-20 digits |
| bankName | string | Name of the bank | 2-100 characters |
| branchCode | string | Bank branch code | 2-20 characters |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| idCardFrontUrl | string | URL to front ID card image |
| idCardBackUrl | string | URL to back ID card image |
| bankDocumentUrl | string | URL to bank verification document |
| createdAt | string | ISO 8601 timestamp of registration |

---

## Status Values

The `status` field indicates the seller's current state:

### Active
- Seller is approved and can list products
- Can receive orders
- Commission is active

### Pending
- New seller registration awaiting approval
- Cannot list products yet
- Requires admin review

### Suspended
- Seller account is suspended
- Cannot receive new orders
- Existing orders may be fulfilled
- Requires admin action to reactivate

---

## File Upload URLs

Document URLs should be:
- **Secure**: HTTPS only
- **Accessible**: Direct access for authorized admins
- **Permanent**: Don't expire or change
- **Format**: JPG, PNG for images; PDF for documents

Example formats:
```
https://yourdomain.com/uploads/sellers/seller_001/id-front.jpg
https://yourdomain.com/uploads/sellers/seller_001/id-back.jpg
https://yourdomain.com/uploads/sellers/seller_001/bank-document.pdf
```

---

## Security Considerations

1. **Authentication**: All endpoints require admin authentication
2. **Authorization**: Verify admin has permissions to view/modify sellers
3. **Data Privacy**: Mask sensitive information if needed (e.g., partial account numbers)
4. **Audit Log**: Log all approve/suspend actions with admin ID and timestamp
5. **Rate Limiting**: Prevent abuse of approval/suspension endpoints

---

## Database Schema Example

```sql
CREATE TABLE sellers (
  id VARCHAR(50) PRIMARY KEY,
  store_name VARCHAR(100) NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contact_number VARCHAR(20) NOT NULL,
  status ENUM('Active', 'Pending', 'Suspended') DEFAULT 'Pending',
  commission DECIMAL(5,2) NOT NULL,
  pickup_address TEXT NOT NULL,
  return_address TEXT NOT NULL,
  name_on_id_card VARCHAR(100) NOT NULL,
  id_card_number VARCHAR(50) NOT NULL,
  id_card_front_url VARCHAR(500),
  id_card_back_url VARCHAR(500),
  account_holder_name VARCHAR(100) NOT NULL,
  iban_number VARCHAR(50) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  branch_code VARCHAR(20) NOT NULL,
  bank_document_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  approved_by VARCHAR(50),
  approved_at TIMESTAMP,
  suspended_by VARCHAR(50),
  suspended_at TIMESTAMP,
  suspension_reason TEXT,
  INDEX idx_status (status),
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);
```

---

## Frontend Integration

### Switching from Mock to Real API

In `adminService.ts`, change:
```typescript
const USE_MOCK_DATA = false;  // Switch to real API
```

### Current Mock Data

The frontend currently uses mock data for testing:
- 2 sample sellers with complete details
- Simulated 500ms network delay
- All fields populated with realistic data

---

## Testing Checklist

Backend developers should test:

- [ ] GET seller details returns correct data
- [ ] GET returns 404 for non-existent seller
- [ ] POST approve changes status to 'Active'
- [ ] POST approve fails if already approved
- [ ] POST suspend changes status to 'Suspended'
- [ ] POST suspend fails if already suspended
- [ ] All endpoints require admin authentication
- [ ] File URLs are valid and accessible
- [ ] Commission is returned as number (not string)
- [ ] Phone numbers have proper formatting
- [ ] IBAN numbers are validated
- [ ] Sensitive data is properly secured

---

## Notes for Backend Developers

1. **Image Storage**: Use cloud storage (AWS S3, Google Cloud Storage, etc.) for ID cards and bank documents
2. **Validation**: Validate all input data before saving
3. **Notifications**: Send email notifications to sellers on approval/suspension
4. **Audit Trail**: Keep logs of who approved/suspended sellers
5. **Batch Operations**: Consider adding bulk approve/suspend endpoints
6. **Search**: The main sellers list API already supports search, this endpoint is for details only

---

## Related Documentation

- `ADMIN_SELLERS_API_SPEC.md` - Main sellers list API
- `ADMIN_SELLERS_IMPROVEMENTS.md` - Frontend implementation details
- `MOCK_DATA_GUIDE.md` - Testing with mock data

---

## Support

For questions or clarifications, contact the frontend team.

