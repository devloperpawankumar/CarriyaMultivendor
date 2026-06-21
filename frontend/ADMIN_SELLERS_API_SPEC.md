# Admin Sellers API Specification

This document describes the API endpoint requirements for the Admin Sellers Dashboard.

## Endpoint

```
GET /api/admin/sellers
```

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Current page number (1-indexed) |
| pageSize | number | No | 10 | Number of items per page |
| status | string | No | all | Filter by status: 'all', 'active', 'pending', 'suspended' |
| search | string | No | - | Search query for store name, owner name, or email |

## Request Example

```
GET /api/admin/sellers?page=1&pageSize=10&status=active&search=tech
```

## Response Format

The API should return a JSON object with the following structure:

```typescript
{
  items: AdminSeller[];
  total: number;
  page: number;
  pageSize: number;
}
```

### AdminSeller Type

```typescript
{
  id: string;                    // Unique seller identifier
  storeName: string;             // Name of the store
  ownerName: string;             // Full name of the store owner
  email: string;                 // Contact email
  status: 'Active' | 'Pending' | 'Suspended';  // Current status
  commission: number;            // Commission percentage (0-100)
  createdAt?: string;            // ISO date string (optional)
}
```

## Sample Response

```json
{
  "items": [
    {
      "id": "seller_001",
      "storeName": "Tech Store",
      "ownerName": "John Merchant",
      "email": "john@techstore.com",
      "status": "Active",
      "commission": 15,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "seller_002",
      "storeName": "Fashion Hub",
      "ownerName": "Sarah Style",
      "email": "sarah@fashionhub.com",
      "status": "Active",
      "commission": 12,
      "createdAt": "2024-01-16T14:20:00Z"
    },
    {
      "id": "seller_003",
      "storeName": "Book World",
      "ownerName": "Mike Reader",
      "email": "mike@bookworld.com",
      "status": "Pending",
      "commission": 10,
      "createdAt": "2024-01-17T09:15:00Z"
    }
  ],
  "total": 8,
  "page": 1,
  "pageSize": 10
}
```

## Status Values

The `status` field must be one of:
- **Active**: Seller is active and can list products
- **Pending**: Seller registration is pending approval
- **Suspended**: Seller account is suspended

## Error Handling

If the request fails, the frontend will handle it gracefully by:
- Displaying an error message to the user
- Returning an empty array with total: 0
- Allowing the user to retry the request

## Search Functionality

When a `search` parameter is provided, the backend should search across:
- Store name
- Owner name
- Email address

The search should be case-insensitive and support partial matches.

## Pagination Logic

- Pages are 1-indexed (first page = 1)
- If `page` exceeds available pages, return empty items array
- Total count should reflect the filtered results, not all sellers

## Example Database Query (Pseudo-code)

```sql
SELECT 
  id,
  store_name as storeName,
  owner_name as ownerName,
  email,
  status,
  commission_percentage as commission,
  created_at as createdAt
FROM sellers
WHERE 
  (status = ? OR ? = 'all') AND
  (
    LOWER(store_name) LIKE CONCAT('%', LOWER(?), '%') OR
    LOWER(owner_name) LIKE CONCAT('%', LOWER(?), '%') OR
    LOWER(email) LIKE CONCAT('%', LOWER(?), '%')
  )
ORDER BY created_at DESC
LIMIT ? OFFSET ?
```

## Notes for Backend Developers

1. **Performance**: Consider adding indexes on `status`, `store_name`, `owner_name`, and `email` columns
2. **Security**: Ensure only authenticated admin users can access this endpoint
3. **Validation**: Validate `page` and `pageSize` to prevent abuse (e.g., max pageSize = 100)
4. **Caching**: Consider caching the total count for better performance on large datasets
5. **Rate Limiting**: Implement rate limiting to prevent API abuse

