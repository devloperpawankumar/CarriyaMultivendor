# Order Status Flow - Complete Explanation

## Standard E-commerce Flow (Daraz/Amazon Style)

The order status flow follows industry standards used by major e-commerce platforms like **Daraz** and **Amazon**.

### Sequential Flow

```
pending → confirmed → processing → shipped → delivered
```

### Status Definitions

1. **Pending** (Awaiting Confirmation)
   - Order has been placed by the buyer
   - Waiting for seller to accept/confirm the order
   - **Badge Label**: "Awaiting Confirmation"
   - **Color**: Yellow

2. **Confirmed** (Order Confirmed)
   - Seller has accepted the order
   - Order is confirmed and ready for processing
   - **Badge Label**: "Confirmed"
   - **Color**: Emerald/Green
   - **Next Steps**: Can move to Processing or Cancel

3. **Processing** (In Progress)
   - Order is being prepared
   - Items are being picked and packed
   - **Badge Label**: "Processing"
   - **Color**: Blue
   - **Next Steps**: Can move to Shipped or Cancel

4. **Shipped** (On the Way)
   - Order has been dispatched
   - Tracking number should be added
   - Package is with the courier
   - **Badge Label**: "Shipped"
   - **Color**: Indigo/Blue
   - **Next Steps**: Can move to Delivered or Cancel

5. **Delivered** (Completed)
   - Order has been delivered to the customer
   - Customer has received the package
   - **Badge Label**: "Delivered"
   - **Color**: Green
   - **Locked**: Once payout is released, status cannot be changed by seller

### Status Transitions (Backend Rules)

The backend enforces strict one-way transitions to prevent skipping steps:

```javascript
STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],      // Can only confirm or cancel
  confirmed: ['processing', 'cancelled'],   // Can only process or cancel
  processing: ['shipped', 'cancelled'],    // Can only ship or cancel
  shipped: ['delivered', 'cancelled'],     // Can only deliver or cancel
  delivered: [],                           // No further changes (locked)
  cancelled: [],                           // Final state
  refunded: [],                            // Final state
};
```

### Why Sequential Flow?

1. **Fraud Prevention**: Prevents sellers from marking orders as delivered without proper tracking
2. **Buyer Notifications**: Each status change triggers appropriate notifications
3. **Settlement Accuracy**: Ensures payout calculations are based on actual delivery
4. **Analytics**: Provides accurate order fulfillment metrics
5. **Industry Standard**: Matches how Daraz, Amazon, and other major platforms work

### Frontend Implementation

- **Dropdown shows only valid next statuses** based on current status
- **Badge labels match dropdown labels** to avoid confusion
- **Status is locked after delivery** when payout is released
- **Admin override available** for exceptional cases

### Example Flow

1. Buyer places order → **Pending** (Awaiting Confirmation)
2. Seller accepts order → **Confirmed**
3. Seller starts packing → **Processing**
4. Seller ships with tracking → **Shipped**
5. Customer receives package → **Delivered** (Locked)

### Cancellation

At any point before delivery, the order can be cancelled:
- **Pending** → Cancelled
- **Confirmed** → Cancelled
- **Processing** → Cancelled
- **Shipped** → Cancelled (rare, but possible)

### Locked Status

Once an order is **Delivered** and the payout is released:
- Status cannot be changed by seller
- Contact support for any adjustments
- Admin can override if needed

---

**This flow ensures consistency between backend validation and frontend display, matching industry standards used by major e-commerce platforms.**

