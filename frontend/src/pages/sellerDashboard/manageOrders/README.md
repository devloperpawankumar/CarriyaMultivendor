# Manage Orders - Backend Integration Guide

## Overview
This module handles order management for sellers with full backend integration support. It includes filtering, searching, pagination, and different order status views.

## Features Implemented

### 1. Processing Orders View
- **Component**: `ProcessingOrdersTable.tsx`
- **Trigger**: Clicking "Processing" tab in OrderFilters
- **Design**: Matches Figma design exactly
- **Backend Ready**: Uses same API endpoints as other order views

### 2. Backend Integration
- **Service**: `orderService.ts`
- **API Endpoints**: Fully configured for backend integration
- **Authentication**: JWT token support
- **Error Handling**: Graceful fallback to mock data

## API Endpoints Required

### Base Configuration
```typescript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
```

### Required Endpoints

#### 1. Fetch Orders with Filters
```
GET /api/orders?search={term}&date={filter}&status={status}&page={page}&limit={limit}
```

**Query Parameters:**
- `search` (optional): Search term for orders
- `date` (optional): Date filter preset slug (`recent`, `last_week`, `last_month`, `last_year`) or custom value (`Exact:YYYY-MM-DD`, `Custom:YYYY-MM-DD|YYYY-MM-DD`)
- `status` (optional): Order status (new, processing, completed, canceled)
- `page` (optional): Page number for pagination
- `limit` (optional): Number of orders per page

**Response:**
```json
{
  "orders": [
    {
      "id": "#A12345J",
      "customer": "Wasif Bhatti",
      "product": "Men's Casual Cotton Slim Fit Shirt – Blue Long Sleeve",
      "photo": "/path/to/image.png",
      "date": "01/09/2025 , 4:21",
      "payment": "COD",
      "amount": "PKR 1200",
      "status": "processing"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

#### 2. Fetch Order Statistics
```
GET /api/orders/stats
```

**Response:**
```json
{
  "stats": {
    "newOrders": 50,
    "processing": 20,
    "completed": 10,
    "canceled": 10
  }
}
```

#### 3. Update Order Status
```
PATCH /api/orders/{orderId}/status
```

**Request Body:**
```json
{
  "status": "processing"
}
```

#### 4. Get Order Details
```
GET /api/orders/{orderId}
```

**Response:**
```json
{
  "id": "#A12345J",
  "customer": "Wasif Bhatti",
  "product": "Men's Casual Cotton Slim Fit Shirt – Blue Long Sleeve",
  "photo": "/path/to/image.png",
  "date": "01/09/2025 , 4:21",
  "payment": "COD",
  "amount": "PKR 1200",
  "status": "processing"
}
```

## Authentication
All API calls include JWT authentication:
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
}
```

## Environment Variables
Add to your `.env` file:
```
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

## Component Structure

### Main Components
- `ManageOrders` - Main container component
- `OrderFilters` - Filter tabs and search functionality
- `OrdersTable` - Default orders table
- `ProcessingOrdersTable` - Processing orders specific table
- `OrderStatsCards` - Statistics display
- `Pagination` - Pagination controls

### Service Layer
- `orderService.ts` - All API communication
- Error handling with fallback to mock data
- Type-safe API calls

## Usage

### Order lifecycle (seller experience)

```
 Buyer pays →  Pending (await seller decision)
                  │
                  ├─ Accept order  → Confirmed (packing) → Processing (handed to carrier)
                  │                                          │
                  │                                          └─ Carrier scans delivered → Completed
                  │
                  └─ Cancel order → Cancelled/Returned (reason logged, buyer notified)
```

| Stage        | Backend `status`      | What seller sees / can do                                |
|--------------|-----------------------|----------------------------------------------------------|
| Pending      | `pending`             | `Accept` and `Cancel` buttons.                           |
| Confirmed    | `confirmed`           | Buttons hidden, “Order confirmed” card with packing tips and a CTA to generate a tracking number.|
| Processing   | `processing`/`shipped`| “Shipment in progress” card, tracking-only UI.           |
| Completed    | `delivered`/`completed`| Appears under Completed tab, read-only summary.         |
| Cancelled    | `cancelled`/`refunded`| Returned order layout showing reason + audit trail.      |

**Flows**
- **Accept order**: PATCH `/api/orders/{id}/status` → `{ status: 'confirmed' }`. UI refreshes, record moves from “New” tab to “Processing” once the carrier accepts pickup (`status: 'processing'`).
- **Cancel order**: PATCH `/api/orders/{id}/status` → `{ status: 'cancelled', reason, note }`. We capture reason from the modal and immediately switch to the canceled template; row relocates to the `Canceled/Returned` tab.
- **Auto-complete**: Carrier webhook or cron updates to `delivered`. Frontend automatically shows the order under Completed with fulfillment summary—no seller action required.

### Leopards Courier tracking

| Requirement | Value |
|-------------|-------|
| Base URL    | `REACT_APP_LEOPARDS_API_BASE` (e.g. `https://example.leopardscourier.com/api`) |
| Client ID   | `REACT_APP_LEOPARDS_CLIENT_ID` |
| Client Secret | `REACT_APP_LEOPARDS_CLIENT_SECRET` |

**Flow used by Amazon/Daraz and now mirrored here**
1. When the seller accepts an order, your backend books a shipment with Leopards (or prompts the seller to do so) and stores the **tracking / consignment number (CN)** on the order record (`trackingNumber` field already exists in `SellerOrderSummary`/`SellerOrderDetail`).
2. `TrackOrderPage` prefers that CN. If it’s missing, it falls back to the internal `orderId`.
3. `fetchLeopardsTracking(trackingNumber || orderId)` calls `GET {API_BASE}/tracking/{reference}` with the client headers. Whatever JSON Leopards returns is normalized into timeline events.
4. If the request fails or credentials are absent, the code returns a curated fallback timeline so the UI never looks broken (yellow warning banner included).

**Backend checklist**
- Add the CN to every order once a shipment is created: `order.trackingNumber = response.consignmentNo`.
- Ensure the seller detail endpoint returns `trackingNumber`.
- Optionally expose an endpoint like `POST /api/orders/{id}/tracking` to let sellers paste a CN manually; the UI will immediately start showing live data.


1. Tracking number travels through the whole stack
SellerOrderSummary/SellerOrderDetail already had trackingNumber; I now surface it everywhere:
Order and OrderDetails interfaces carry trackingNumber.
mapOrderToTable + mapDetails copy the CN from the backend response.
OrderDetailsWrapper passes both orderNumber and trackingNumber down to the tracking view.
2. Tracking UI prefers the Leopards CN
TrackOrderPage.tsx calls fetchLeopardsTracking(trackingNumber || orderId), shows the CN in the header, and animates the progress bar based on live events.
If the Leopards API/env vars aren’t available, a curated fallback timeline + yellow warning banner appears so the seller always sees something.
3. README now documents the real-world flow
Added the same lifecycle flowchart Amazon/Daraz follow: pending → confirmed → processing → delivered, with clear notes on when the seller should generate/store the CN.
New “Leopards Courier tracking” section explains exactly which env vars to set, how to store the CN on the order, and what happens if credentials are missing.
What you need to do server-side (just once)
When an order is accepted, call Leopards’ booking API and store their CN in order.trackingNumber.
Make sure your order-detail endpoint returns that field (the frontend already reads it).
Add the three env vars to .env:
Restart the frontend so they take effect.
Once the CN is present, the existing React code automatically pulls live tracking from Leopards; if Leopards is down, the fallback still keeps the seller informed. Let me know if you’d like a “Generate shipment” or “Add tracking number” button exposed in the UI—everything’s wired for it

### 1. Processing Orders
When user clicks "Processing" tab:
1. `activeFilter` state changes to "Processing"
2. API call made with `status: 'processing'`
3. `ProcessingOrdersTable` component renders
4. Shows only processing orders

### 2. Search Functionality
- Real-time search with debouncing
- Backend search across order fields
- Resets pagination on search

### 3. Date Filtering
- Calendar picker for specific dates
- Predefined filters (`recent`, `last_week`, `last_month`, `last_year`)
- Backend date range filtering

### 4. Pagination
- Server-side pagination
- Configurable page size
- Total count display

## Backend Requirements

### Database Schema
```sql
-- Orders table
CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY,
  customer VARCHAR(100) NOT NULL,
  product TEXT NOT NULL,
  photo VARCHAR(255),
  date DATETIME NOT NULL,
  payment VARCHAR(50) NOT NULL,
  amount VARCHAR(50) NOT NULL,
  status ENUM('new', 'processing', 'completed', 'canceled') NOT NULL,
  seller_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_date ON orders(date);
CREATE INDEX idx_orders_customer ON orders(customer);
```

### API Implementation Notes

1. **Authentication**: Verify JWT token on all endpoints
2. **Authorization**: Filter orders by seller_id
3. **Search**: Implement full-text search across customer, product, order_id
4. **Pagination**: Use LIMIT and OFFSET for database queries
5. **Date Filtering**: Parse date filters and apply appropriate WHERE clauses
6. **Status Filtering**: Filter by exact status match

### Error Handling
- Return appropriate HTTP status codes
- Include error messages in response body
- Handle authentication failures (401)
- Handle authorization failures (403)
- Handle server errors (500)

## Development Mode
When backend is not available, the component automatically falls back to mock data for development and testing.

## Testing
- All components are fully typed with TypeScript
- Service layer includes error handling
- Mock data matches production data structure
- Responsive design tested across devices