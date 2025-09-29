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
- `date` (optional): Date filter (Recent Order, Last Week, etc.)
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
- Predefined filters (Recent Order, Last Week, etc.)
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