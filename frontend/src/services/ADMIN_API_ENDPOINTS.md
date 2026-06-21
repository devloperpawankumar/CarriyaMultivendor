# Admin API Endpoints Documentation

This document outlines the backend API endpoints required for the Admin Dashboard.

## Base URL
All endpoints are prefixed with `/api/admin`

## Authentication
All endpoints require admin authentication (JWT token in cookies/headers).

---

## Dashboard Endpoints

### 1. Get Dashboard Overview
**GET** `/api/admin/dashboard`

Returns complete dashboard data including stats, recent orders, and new sellers.

**Response:**
```json
{
  "stats": {
    "totalUsers": 12458,
    "totalSellers": 3247,
    "totalOrders": 8921,
    "platformEarnings": 124590,
    "lastUpdated": "2026-01-08T10:30:00Z"
  },
  "recentOrders": [
    {
      "orderId": "#ORD-1234",
      "buyer": "John Doe",
      "seller": "Tech Store",
      "amount": "RS 299.99",
      "status": "Completed"
    }
  ],
  "newSellers": [
    {
      "id": "1",
      "name": "Electronics Plus",
      "joinedDate": "2026-01-08",
      "status": "Pending"
    }
  ],
  "lastUpdated": "2026-01-08T10:30:00Z"
}
```

---

### 2. Get Dashboard Stats Only
**GET** `/api/admin/dashboard/stats`

Returns only statistics.

**Response:**
```json
{
  "totalUsers": 12458,
  "totalSellers": 3247,
  "totalOrders": 8921,
  "platformEarnings": 124590,
  "lastUpdated": "2026-01-08T10:30:00Z"
}
```

---

## Orders Endpoints

### 3. Get Recent Orders
**GET** `/api/admin/orders/recent?limit=5`

Returns recent orders (default limit: 5).

**Query Parameters:**
- `limit` (optional): Number of orders to return (default: 5)

**Response:**
```json
[
  {
    "orderId": "#ORD-1234",
    "buyer": "John Doe",
    "seller": "Tech Store",
    "amount": "RS 299.99",
    "status": "Completed"
  }
]
```

**Order Status Values:**
- `Completed`
- `In Escrow`
- `Paid`
- `Pending`
- `Processing`

---

## Sellers Endpoints

### 4. Get New Sellers
**GET** `/api/admin/sellers/new?limit=4`

Returns list of new sellers (default limit: 4).

**Query Parameters:**
- `limit` (optional): Number of sellers to return (default: 4)

**Response:**
```json
[
  {
    "id": "1",
    "name": "Electronics Plus",
    "joinedDate": "2026-01-08",
    "status": "Pending"
  }
]
```

**Seller Status Values:**
- `Pending`
- `Active`
- `Inactive`

---

### 5. Get All Sellers (with pagination)
**GET** `/api/admin/sellers?page=1&pageSize=10&status=all&search=`

Returns paginated list of sellers.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)
- `status` (optional): Filter by status - `all`, `new`, `active`, `inactive` (default: `all`)
- `search` (optional): Search term for seller name/email

**Response:**
```json
{
  "items": [
    {
      "id": "1",
      "firstName": "Muhammad",
      "lastName": "Huzaifa",
      "status": "new"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

---

### 6. Get New Sellers (Legacy - for seller management)
**GET** `/api/admin/sellers?status=new`

Returns sellers with status "new" (for seller management page).

**Response:**
```json
[
  {
    "id": "1",
    "firstName": "Muhammad",
    "lastName": "Huzaifa",
    "status": "new",
    "createdAt": "2026-01-08T10:30:00Z"
  }
]
```

---

## Error Handling

All endpoints should follow the standard API response format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not admin)
- `404` - Not found
- `500` - Server error

---

## Notes

1. All endpoints use the standard API client from `services/api.ts` which includes:
   - Professional headers (X-Request-ID, X-Client-ID, etc.)
   - Automatic error handling
   - Request/response logging (in development)

2. The frontend service (`adminService.ts`) handles errors gracefully:
   - Returns empty arrays/objects on error
   - Logs errors to console
   - Does not throw errors to prevent UI crashes

3. All date formats should be ISO 8601 strings (e.g., `2026-01-08T10:30:00Z`)

4. Amount values should be formatted as strings with currency (e.g., `"RS 299.99"`)

