import api from './api';

export type OrderItemPayload = {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
};

export type ShippingAddressPayload = {
  fullName: string;
  contactNumber: string;
  streetAddress: string;
  locality: string;
  province: string;
  city: string;
  area: string;
  addressNotes: string;
};

export type CreateOrderPayload = {
  items: OrderItemPayload[];
  shippingAddress: ShippingAddressPayload;
  paymentMethod: string;
  notes?: string;
};

export type CreateOrderResponse = {
  success: boolean;
  orders: Array<{
    id: string;
    orderNumber?: string;
    total: number;
    status: string;
    paymentStatus: string;
  }>;
};

export function createOrder(payload: CreateOrderPayload) {
  return api.post<CreateOrderResponse>('/api/orders', payload);
}

export type BuyerOrderItem = {
  // Note: Raw database IDs removed (Daraz/Amazon style)
  productSlug: string; // Public product identifier (replaces productId)
  productTitle?: string; // Product title from product data
  title: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  thumbnailUrl?: string;
};

export type BuyerOrder = {
  // Note: Raw database ID removed - use orderNumber as identifier (Daraz/Amazon style)
  orderNumber: string;
  items: BuyerOrderItem[];
  storeName?: string | null;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
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
  hasReview?: boolean;
  cancellationReason?: string | null;
  cancellationNote?: string | null;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type BuyerOrderResponse = {
  items: BuyerOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type BuyerOrderQuery = {
  page?: number;
  pageSize?: number;
  status?: string;
};

export function fetchBuyerOrders(params: BuyerOrderQuery = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.pageSize) search.set('pageSize', String(params.pageSize));
  if (params.status && params.status !== 'all') {
    search.set('status', params.status);
  }
  const suffix = search.toString() ? `?${search.toString()}` : '';
  return api.get<BuyerOrderResponse>(`/api/orders${suffix}`);
}