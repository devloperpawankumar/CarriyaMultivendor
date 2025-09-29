import { Order, OrderStats } from '../types/orderTypes';

// API endpoints - replace with your actual backend URLs
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

export interface OrderFilters {
  searchTerm?: string;
  dateFilter?: string;
  status?: 'new' | 'processing' | 'completed' | 'canceled';
  page?: number;
  limit?: number;
}

export interface OrderResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderStatsResponse {
  stats: OrderStats;
}

/**
 * Fetch orders with filters - Backend friendly
 */
export const fetchOrders = async (filters: OrderFilters = {}): Promise<OrderResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.searchTerm) queryParams.append('search', filters.searchTerm);
    if (filters.dateFilter) queryParams.append('date', filters.dateFilter);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/orders?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Add auth token
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Fetch order statistics - Backend friendly
 */
export const fetchOrderStats = async (): Promise<OrderStatsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
};

/**
 * Update order status - Backend friendly
 */
export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Get order details - Backend friendly
 */
export const getOrderDetails = async (orderId: string): Promise<Order> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

/**
 * Search orders - Backend friendly
 */
export const searchOrders = async (searchTerm: string, filters: Omit<OrderFilters, 'searchTerm'> = {}): Promise<OrderResponse> => {
  return fetchOrders({ ...filters, searchTerm });
};

/**
 * Filter orders by date range - Backend friendly
 */
export const filterOrdersByDate = async (dateFilter: string, filters: Omit<OrderFilters, 'dateFilter'> = {}): Promise<OrderResponse> => {
  return fetchOrders({ ...filters, dateFilter });
};

/**
 * Filter orders by status - Backend friendly
 */
export const filterOrdersByStatus = async (status: 'new' | 'processing' | 'completed' | 'canceled', filters: Omit<OrderFilters, 'status'> = {}): Promise<OrderResponse> => {
  return fetchOrders({ ...filters, status });
};