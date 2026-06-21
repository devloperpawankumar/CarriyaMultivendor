import api from './api';

export type SellerDashboardOverview = {
  metrics: {
    todaySales: number;
    todayNetSales?: number;
    todayCommission?: number;
    totalOrders: number;
    pendingOrders: number;
    walletBalance: number;
  };
  breakdown: {
    orders: {
      newOrders: number;
      processing: number;
      completed: number;
      canceled: number;
    };
  };
  lastUpdated: string;
};

export async function fetchSellerDashboardOverview(): Promise<SellerDashboardOverview> {
  return api.get<SellerDashboardOverview>('/api/seller/dashboard');
}


