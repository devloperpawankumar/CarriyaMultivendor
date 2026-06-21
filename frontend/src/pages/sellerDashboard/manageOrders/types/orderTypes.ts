export type SellerOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'cod' | 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'card';

export interface SellerOrderItem {
  productSlug?: string; // Public identifier (Daraz/Amazon style)
  productId?: string; // Deprecated - kept for backward compatibility
  title: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  thumbnailUrl?: string;
}

export interface SellerOrderSummary {
  id?: string; // Deprecated - use orderNumber instead (Daraz/Amazon style)
  orderNumber: string;
  buyer: {
    id?: string; // Deprecated - removed for security (Daraz/Amazon style)
    name?: string;
    email?: string;
    phone?: string;
  };
  items: SellerOrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: SellerOrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    district?: string;
    postalCode?: string;
  };
  trackingNumber?: string;
  settlement?: Settlement;
  createdAt: string;
  updatedAt: string;
  statusUpdateLocked?: boolean;
  statusLockedReason?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  returnRequestedAt?: string;
  returnedAt?: string;
  cancellationNote?: string;
}

export interface Settlement {
  commissionAmount: number;
  paymentGatewayFee: number;
  codFee: number;
  sellerPayout: number;
  settlementDate?: string;
  settledAt?: string;
  settlementStatus: 'pending' | 'available' | 'settled';
}

export interface SellerOrderDetail extends SellerOrderSummary {
  seller?: {
    id?: string; // Deprecated - removed for security (Daraz/Amazon style)
    name?: string;
    email?: string;
  };
  paymentTransactionId?: string;
  shippedAt?: string;
  deliveredAt?: string;
  paidAt?: string;
  notes?: string;
  statusHistory?: Array<{
    from?: SellerOrderStatus;
    to: SellerOrderStatus;
    changedAt: string;
    changedBy?: {
      id?: string;
      role?: string;
    };
    note?: string;
  }>;
}

export interface SellerOrdersResponse {
  items: SellerOrderSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaymentStats {
  pending: number;
  paid: number;
  failed: number;
  refunded: number;
}

export interface OrderStatsResponse {
  stats: OrderStats;
  paymentStats: PaymentStats;
  lastUpdated: string;
}

export interface SellerOrdersOverviewResponse extends SellerOrdersResponse {
  stats: OrderStats;
  paymentStats?: PaymentStats;
  lastUpdated?: string;
}

export type OrderStatusBadge = 'new' | 'processing' | 'completed' | 'canceled';

export interface Order {
  id?: string; // Deprecated - use orderNumber instead (Daraz/Amazon style)
  orderNumber?: string;
  customer: string;
  product: string;
  photo: string;
  date: string;
  payment: string;
  amount: string;
  status: OrderStatusBadge;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  sellerStatus?: SellerOrderStatus;
  publicId?: string;
  trackingNumber?: string;
}

export interface OrderDetails {
  id?: string; // Deprecated - use orderNumber instead (Daraz/Amazon style)
  orderNumber?: string;
  customerName: string;
  address: string;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;
  shippingCharges: string;
  productName: string;
  unitPrice: string;
  quantity: number;
  platformCommission: string;
  discount: string;
  sellerPayout: string;
  productImage?: string;
  // Return/Cancellation specific (for Canceled/Returned flow)
  isReturned?: boolean;
  isCanceled?: boolean;
  returnReason?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  returnRequestedAt?: string;
  returnedAt?: string;
  cancellationNote?: string;
  sellerStatus?: SellerOrderStatus;
  statusBadge?: OrderStatusBadge;
  canAccept?: boolean;
  canCancel?: boolean;
  trackingNumber?: string;
  statusUpdateLocked?: boolean;
  statusLockedReason?: string;
  statusHistory?: SellerOrderDetail['statusHistory'];
}

export interface CancelOrderPayload {
  reason: string;
  note?: string;
}

export interface OrderStats {
  newOrders: number;
  processing: number;
  completed: number;
  canceled: number;
}

export interface OrderFilters {
  searchTerm: string;
  selectedDate: string;
  status?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface OrderTableProps {
  orders: Order[];
  onViewOrder: (orderId: string) => void;
  loading: boolean;
}

export interface OrderStatsCardsProps {
  stats: OrderStats;
}

export interface OrderFiltersProps {
  searchTerm: string;
  selectedDate: string;
  onSearch: (term: string) => void;
  onDateFilter: (date: string) => void;
  activeFilter?: string;
  onStatusChange: (status: string) => void;
  isLoading?: boolean;
}
