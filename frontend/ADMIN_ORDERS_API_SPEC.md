# 📦 Admin Orders API Specification

## Backend API Requirements for Admin Orders Dashboard

---

## 📍 Endpoint

```
GET /api/admin/orders
```

---

## 🔐 Authentication

- Requires admin authentication token
- Header: `Authorization: Bearer <token>`

---

## 📥 Request Parameters

### Query Parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Current page number (1-based) |
| `pageSize` | number | No | 10 | Number of items per page |
| `status` | string | No | - | Filter by order status |
| `escrowStatus` | string | No | - | Filter by escrow status |
| `search` | string | No | - | Search query (order ID, buyer name, seller name) |

### Status Values:

**Order Status Options:**
- `"all"` - Show all statuses (default)
- `"completed"` - Completed orders only
- `"paid"` - Paid orders only
- `"pending"` - Pending orders only
- `"cancelled"` - Cancelled orders only

**Escrow Status Options:**
- `"all"` - Show all statuses (default)
- `"completed"` - Completed escrow
- `"in_escrow"` - Currently in escrow
- `"released"` - Escrow released
- `"refunded"` - Escrow refunded

### Example Requests:

```
# Get first page (default)
GET /api/admin/orders

# Get page 2 with 20 items
GET /api/admin/orders?page=2&pageSize=20

# Filter by completed status
GET /api/admin/orders?status=completed

# Filter by escrow status
GET /api/admin/orders?escrowStatus=in_escrow

# Search for orders
GET /api/admin/orders?search=John

# Combined filters
GET /api/admin/orders?page=1&pageSize=10&status=paid&search=Tech+Store
```

---

## 📤 Response Format

### Success Response (200 OK):

```json
{
  "items": [
    {
      "id": "order_001",
      "orderId": "#ORD-1234",
      "buyer": "John Doe",
      "seller": "Tech Store",
      "amount": 299.99,
      "currency": "RS",
      "status": "Completed",
      "escrowStatus": "Completed",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "order_002",
      "orderId": "#ORD-1235",
      "buyer": "Jane Smith",
      "seller": "Fashion Hub",
      "amount": 159.50,
      "currency": "RS",
      "status": "Paid",
      "escrowStatus": "In Escrow",
      "createdAt": "2024-01-15T11:45:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 10
}
```

### Response Fields:

| Field | Type | Description |
|-------|------|-------------|
| `items` | Array | Array of order objects |
| `total` | number | Total number of orders (after filtering) |
| `page` | number | Current page number |
| `pageSize` | number | Number of items per page |

### Order Object Fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique order identifier (database ID) |
| `orderId` | string | Yes | Display order ID (e.g., "#ORD-1234") |
| `buyer` | string | Yes | Buyer's full name |
| `seller` | string | Yes | Seller's store name or full name |
| `amount` | number | Yes | Order amount (numeric, e.g., 299.99) |
| `currency` | string | Yes | Currency code (e.g., "RS", "USD") |
| `status` | string | Yes | Order status (see status values below) |
| `escrowStatus` | string | Yes | Escrow status (see escrow status values below) |
| `createdAt` | string | No | ISO 8601 timestamp |

### Status Values (IMPORTANT - Exact Capitalization):

**Order Status (case-sensitive):**
- `"Completed"` - Order fulfilled and completed
- `"Paid"` - Payment received, order processing
- `"Pending"` - Awaiting payment
- `"Cancelled"` - Order cancelled

**Escrow Status (case-sensitive):**
- `"Completed"` - Escrow process completed
- `"In Escrow"` - Funds currently held in escrow
- `"Released"` - Escrow funds released to seller
- `"Refunded"` - Escrow funds refunded to buyer

⚠️ **CRITICAL**: Status values MUST match exactly with the capitalization shown above. The frontend expects:
- `"Completed"` (NOT "completed" or "COMPLETED")
- `"Paid"` (NOT "paid")
- `"In Escrow"` (NOT "in_escrow" or "In escrow")

---

## ❌ Error Responses

### 400 Bad Request:
```json
{
  "error": "Invalid page number",
  "message": "Page number must be a positive integer"
}
```

### 401 Unauthorized:
```json
{
  "error": "Unauthorized",
  "message": "Admin authentication required"
}
```

### 500 Internal Server Error:
```json
{
  "error": "Internal server error",
  "message": "Failed to fetch orders"
}
```

---

## 🔍 Search Implementation

### Search Fields:
The `search` parameter should search across:
1. **Order ID** - Partial match (e.g., "1234" matches "#ORD-1234")
2. **Buyer Name** - Case-insensitive partial match
3. **Seller Name** - Case-insensitive partial match

### Search Examples:

```
# Search by order ID
?search=ORD-1234
→ Returns orders with IDs containing "ORD-1234"

# Search by buyer name
?search=John
→ Returns orders where buyer name contains "John"

# Search by seller name
?search=Tech Store
→ Returns orders where seller name contains "Tech Store"

# Combined search
?search=Tech&status=completed
→ Returns completed orders with "Tech" in any searchable field
```

### Recommended SQL Query Pattern:

```sql
SELECT * FROM orders
WHERE 
  (order_id LIKE '%{search}%' 
   OR buyer_name LIKE '%{search}%' 
   OR seller_name LIKE '%{search}%')
  AND (status = '{status}' OR '{status}' = 'all')
  AND (escrow_status = '{escrowStatus}' OR '{escrowStatus}' = 'all')
ORDER BY created_at DESC
LIMIT {pageSize} OFFSET {(page - 1) * pageSize}
```

---

## 📊 Pagination Logic

### Calculation:
```
offset = (page - 1) * pageSize
limit = pageSize
```

### Example:
```
Page 1, PageSize 10: offset=0, limit=10 (items 1-10)
Page 2, PageSize 10: offset=10, limit=10 (items 11-20)
Page 3, PageSize 10: offset=20, limit=10 (items 21-30)
```

### Total Pages Calculation (Frontend):
```
totalPages = Math.ceil(total / pageSize)
```

---

## 🎯 Sorting

### Default Sort:
- Orders should be sorted by `createdAt` in **descending order** (newest first)

### Future Enhancement:
Consider adding `sort` and `sortDirection` parameters:
```
?sort=amount&sortDirection=desc
?sort=createdAt&sortDirection=asc
```

---

## 🧪 Testing Data

### Recommended Test Data:

Create at least **20 test orders** with:
- Mix of statuses (Completed, Paid, Pending, Cancelled)
- Mix of escrow statuses
- Different buyers and sellers
- Various amounts
- Different dates

### Example Test Data Set:

```json
[
  {
    "id": "order_001",
    "orderId": "#ORD-1234",
    "buyer": "John Doe",
    "seller": "Tech Store",
    "amount": 299.99,
    "currency": "RS",
    "status": "Completed",
    "escrowStatus": "Completed",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "order_002",
    "orderId": "#ORD-1235",
    "buyer": "Jane Smith",
    "seller": "Fashion Hub",
    "amount": 159.50,
    "currency": "RS",
    "status": "Paid",
    "escrowStatus": "In Escrow",
    "createdAt": "2024-01-15T11:45:00Z"
  },
  // ... 18 more orders
]
```

---

## 🔐 Security Considerations

### Required Validations:

1. **Authentication**:
   - Verify admin JWT token
   - Reject requests without valid token

2. **Input Validation**:
   - `page`: Must be positive integer ≥ 1
   - `pageSize`: Must be positive integer (recommend max 100)
   - `status`: Must be one of allowed values or "all"
   - `escrowStatus`: Must be one of allowed values or "all"
   - `search`: Sanitize to prevent SQL injection

3. **Authorization**:
   - Only admin users can access this endpoint
   - Verify user role = "admin"

### Rate Limiting:
Consider implementing rate limiting:
- 100 requests per minute per user
- 1000 requests per hour per user

---

## 📈 Performance Recommendations

### Database Indexes:
Create indexes on:
```sql
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_escrow_status ON orders(escrow_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_buyer_name ON orders(buyer_name);
CREATE INDEX idx_orders_seller_name ON orders(seller_name);
CREATE INDEX idx_orders_order_id ON orders(order_id);
```

### Caching:
- Consider caching total count for 5 minutes
- Cache first page results for 1 minute
- Invalidate cache on order updates

### Query Optimization:
- Use `COUNT(*) OVER()` for total count in single query
- Limit search results to prevent slow queries
- Use full-text search for better performance

---

## 🔄 Frontend Integration

### How Frontend Calls API:

```typescript
// In adminService.ts
export async function fetchOrders(
  params: FetchOrdersParams = {},
  signal?: AbortSignal
): Promise<FetchOrdersResponse> {
  const queryParams = new URLSearchParams();
  queryParams.set('page', String(params.page || 1));
  queryParams.set('pageSize', String(params.pageSize || 10));
  if (params.status) queryParams.set('status', params.status);
  if (params.escrowStatus) queryParams.set('escrowStatus', params.escrowStatus);
  if (params.search) queryParams.set('search', params.search);

  const data = await api.get<FetchOrdersResponse>(
    `/api/admin/orders?${queryParams.toString()}`,
    signal ? { signal } : undefined
  );
  return data;
}
```

### To Enable Backend:
In `adminService.ts`, change:
```typescript
const USE_MOCK_DATA = false; // Switch from mock to real API
```

---

## ✅ Checklist for Backend Implementation

- [ ] Create `/api/admin/orders` endpoint
- [ ] Add admin authentication middleware
- [ ] Implement pagination with page and pageSize
- [ ] Implement status filtering
- [ ] Implement escrow status filtering
- [ ] Implement search across order ID, buyer, seller
- [ ] Return correct response format with items, total, page, pageSize
- [ ] Use exact status capitalization (Completed, Paid, In Escrow, etc.)
- [ ] Sort by createdAt DESC by default
- [ ] Add input validation
- [ ] Add error handling
- [ ] Create database indexes
- [ ] Add API tests
- [ ] Test with frontend mock data structure
- [ ] Document any additional fields or features

---

## 🎯 Example Backend Implementation (Node.js/Express)

```javascript
// Example implementation
router.get('/api/admin/orders', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status = 'all',
      escrowStatus = 'all',
      search = ''
    } = req.query;

    // Build query
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    // Apply filters
    if (status !== 'all') {
      query += ' AND status = ?';
      params.push(status.charAt(0).toUpperCase() + status.slice(1));
    }

    if (escrowStatus !== 'all') {
      const formattedStatus = escrowStatus === 'in_escrow' 
        ? 'In Escrow' 
        : escrowStatus.charAt(0).toUpperCase() + escrowStatus.slice(1);
      query += ' AND escrow_status = ?';
      params.push(formattedStatus);
    }

    if (search) {
      query += ' AND (order_id LIKE ? OR buyer_name LIKE ? OR seller_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [{ total }] = await db.query(countQuery, params);

    // Add pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));

    // Execute query
    const items = await db.query(query, params);

    // Format response
    res.json({
      items: items.map(order => ({
        id: order.id,
        orderId: order.order_id,
        buyer: order.buyer_name,
        seller: order.seller_name,
        amount: parseFloat(order.amount),
        currency: order.currency,
        status: order.status,
        escrowStatus: order.escrow_status,
        createdAt: order.created_at
      })),
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});
```

---

## 📞 Support

If you have questions about the API specification:
- Check the mock data in `adminService.ts` for reference
- Review the frontend component in `AdminDashboardOrders.tsx`
- Test with mock data first, then switch to real API

---

## 🎊 Summary

**Key Points:**
1. ✅ Endpoint: `GET /api/admin/orders`
2. ✅ Supports pagination, search, and filtering
3. ✅ Returns items array with total count
4. ✅ **CRITICAL**: Use exact status capitalization
5. ✅ Sort by newest first (createdAt DESC)
6. ✅ Admin authentication required
7. ✅ Frontend ready - just flip USE_MOCK_DATA flag!

The API specification is complete and ready for backend implementation! 🚀

