import { RootState } from '../index';
import { createSelector } from '@reduxjs/toolkit';

// ============================================
// Admin Buyers Selectors
// ============================================

export const selectAdminBuyersState = (state: RootState) => state.adminBuyers;

export const selectBuyers = createSelector(
  [selectAdminBuyersState],
  (buyersState) => buyersState.buyers
);

export const selectBuyersLoading = createSelector(
  [selectAdminBuyersState],
  (buyersState) => buyersState.loading
);

export const selectBuyersError = createSelector(
  [selectAdminBuyersState],
  (buyersState) => buyersState.error
);

export const selectBuyersCurrentPage = createSelector(
  [selectAdminBuyersState],
  (buyersState) => buyersState.currentPage
);

export const selectBuyersTotalPages = createSelector(
  [selectAdminBuyersState],
  (buyersState) => buyersState.totalPages
);

export const selectBuyersTotalCount = createSelector(
  [selectAdminBuyersState],
  (buyersState) => buyersState.totalBuyers
);

export const selectBuyersSearchQuery = createSelector(
  [selectAdminBuyersState],
  (buyersState) => buyersState.searchQuery
);

export const selectBuyersStatusFilter = createSelector(
  [selectAdminBuyersState],
  (buyersState) => buyersState.statusFilter
);

export const selectBuyersActionLoading = createSelector(
  [selectAdminBuyersState],
  (buyersState) => buyersState.actionLoading
);

// ============================================
// Admin Sellers Selectors
// ============================================

export const selectAdminSellersState = (state: RootState) => state.adminSellers;

export const selectSellers = createSelector(
  [selectAdminSellersState],
  (sellersState) => sellersState.sellers
);

export const selectSellersLoading = createSelector(
  [selectAdminSellersState],
  (sellersState) => sellersState.loading
);

export const selectSellersError = createSelector(
  [selectAdminSellersState],
  (sellersState) => sellersState.error
);

export const selectSellersCurrentPage = createSelector(
  [selectAdminSellersState],
  (sellersState) => sellersState.currentPage
);

export const selectSellersTotalPages = createSelector(
  [selectAdminSellersState],
  (sellersState) => sellersState.totalPages
);

export const selectSellersTotalCount = createSelector(
  [selectAdminSellersState],
  (sellersState) => sellersState.totalSellers
);

export const selectSellersSearchQuery = createSelector(
  [selectAdminSellersState],
  (sellersState) => sellersState.searchQuery
);

export const selectSellersStatusFilter = createSelector(
  [selectAdminSellersState],
  (sellersState) => sellersState.statusFilter
);

export const selectSellersActionLoading = createSelector(
  [selectAdminSellersState],
  (sellersState) => sellersState.actionLoading
);

// ============================================
// Admin Dashboard Selectors
// ============================================

export const selectAdminDashboardState = (state: RootState) => state.adminDashboard;

export const selectDashboardStats = createSelector(
  [selectAdminDashboardState],
  (dashboardState) => dashboardState.stats
);

export const selectDashboardRecentOrders = createSelector(
  [selectAdminDashboardState],
  (dashboardState) => dashboardState.recentOrders
);

export const selectDashboardNewSellers = createSelector(
  [selectAdminDashboardState],
  (dashboardState) => dashboardState.newSellers
);

export const selectDashboardLoading = createSelector(
  [selectAdminDashboardState],
  (dashboardState) => dashboardState.loading
);

export const selectDashboardError = createSelector(
  [selectAdminDashboardState],
  (dashboardState) => dashboardState.error
);

export const selectDashboardLastUpdated = createSelector(
  [selectAdminDashboardState],
  (dashboardState) => dashboardState.lastUpdated
);

// ============================================
// Computed/Derived Selectors
// ============================================

/**
 * Check if buyers have any data
 */
export const selectHasBuyers = createSelector(
  [selectBuyers],
  (buyers) => buyers.length > 0
);

/**
 * Check if sellers have any data
 */
export const selectHasSellers = createSelector(
  [selectSellers],
  (sellers) => sellers.length > 0
);

/**
 * Get total platform users (buyers + sellers)
 */
export const selectTotalPlatformUsers = createSelector(
  [selectDashboardStats],
  (stats) => stats.totalUsers + stats.totalSellers
);

/**
 * Check if dashboard data is stale (older than 5 minutes)
 */
export const selectIsDashboardDataStale = createSelector(
  [selectDashboardLastUpdated],
  (lastUpdated) => {
    if (!lastUpdated) return true;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return new Date(lastUpdated).getTime() < fiveMinutesAgo;
  }
);

/**
 * Check if any admin data is loading
 */
export const selectIsAnyAdminDataLoading = createSelector(
  [selectBuyersLoading, selectSellersLoading, selectDashboardLoading],
  (buyersLoading, sellersLoading, dashboardLoading) => 
    buyersLoading || sellersLoading || dashboardLoading
);

/**
 * Get all admin errors combined
 */
export const selectAllAdminErrors = createSelector(
  [selectBuyersError, selectSellersError, selectDashboardError],
  (buyersError, sellersError, dashboardError) => {
    const errors = [];
    if (buyersError) errors.push({ source: 'buyers', message: buyersError });
    if (sellersError) errors.push({ source: 'sellers', message: sellersError });
    if (dashboardError) errors.push({ source: 'dashboard', message: dashboardError });
    return errors;
  }
);

