import api from '../../../../services/api';
import {
  OrderStatsResponse,
  PaymentStatus,
  SellerOrderDetail,
  SellerOrderStatus,
  SellerOrdersResponse,
  SellerOrdersOverviewResponse,
} from '../types/orderTypes';

export interface SellerOrderQuery {
  searchTerm?: string;
  status?: string;
  paymentStatus?: PaymentStatus | 'all';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const fetchOrders = async (
  filters: SellerOrderQuery = {},
  init?: RequestInit
): Promise<SellerOrdersResponse> => {
  const queryParams = new URLSearchParams();

  if (filters.searchTerm) queryParams.set('search', filters.searchTerm);
  if (filters.status) queryParams.set('status', filters.status);
  if (filters.paymentStatus) queryParams.set('paymentStatus', filters.paymentStatus);
  if (filters.startDate) queryParams.set('startDate', filters.startDate);
  if (filters.endDate) queryParams.set('endDate', filters.endDate);
  queryParams.set('page', String(filters.page || 1));
  queryParams.set('pageSize', String(filters.limit || 10));

  return api.get<SellerOrdersResponse>(`/api/seller/orders?${queryParams.toString()}`, init);
};

export const fetchOrdersOverview = async (
  filters: SellerOrderQuery = {},
  init?: RequestInit
): Promise<SellerOrdersOverviewResponse> => {
  const queryParams = new URLSearchParams();

  if (filters.searchTerm) queryParams.set('search', filters.searchTerm);
  if (filters.status) queryParams.set('status', filters.status);
  if (filters.paymentStatus) queryParams.set('paymentStatus', filters.paymentStatus);
  if (filters.startDate) queryParams.set('startDate', filters.startDate);
  if (filters.endDate) queryParams.set('endDate', filters.endDate);
  queryParams.set('page', String(filters.page || 1));
  queryParams.set('pageSize', String(filters.limit || 10));

  return api.get<SellerOrdersOverviewResponse>(
    `/api/seller/orders/overview?${queryParams.toString()}`,
    init
  );
};

export const fetchOrderStats = async (): Promise<OrderStatsResponse> => {
  return api.get<OrderStatsResponse>('/api/seller/orders/stats');
};

export interface UpdateOrderStatusPayload {
  status: SellerOrderStatus;
  reason?: string;
  note?: string;
}

export const updateOrderStatus = async (orderId: string, payload: UpdateOrderStatusPayload) => {
  return api.patch(`/api/orders/${orderId}/status`, payload);
};

export const getOrderDetails = async (orderId: string, init?: RequestInit): Promise<SellerOrderDetail> => {
  return api.get<SellerOrderDetail>(`/api/orders/${orderId}`, init);
};