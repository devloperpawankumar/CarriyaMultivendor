import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchAdminDashboardOverview,
  fetchDashboardStats,
  DashboardStats,
  AdminDashboardOverview 
} from '../services/adminService';
import { RecentOrder } from '../components/admin/RecentOrdersTable';
import { NewSeller } from '../components/admin/NewSellersList';

// ============================================
// Types
// ============================================

export interface AdminDashboardState {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  newSellers: NewSeller[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: AdminDashboardState = {
  stats: {
    totalUsers: 0,
    totalSellers: 0,
    totalOrders: 0,
    platformEarnings: 0,
  },
  recentOrders: [],
  newSellers: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// ============================================
// Async Thunks
// ============================================

/**
 * Fetch complete dashboard overview
 */
export const fetchDashboardOverviewAsync = createAsyncThunk(
  'adminDashboard/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAdminDashboardOverview();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch dashboard overview');
    }
  }
);

/**
 * Fetch only dashboard stats (lightweight)
 */
export const fetchDashboardStatsAsync = createAsyncThunk(
  'adminDashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchDashboardStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch dashboard stats');
    }
  }
);

// ============================================
// Slice
// ============================================

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Dashboard Overview
    builder
      .addCase(fetchDashboardOverviewAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardOverviewAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.recentOrders = action.payload.recentOrders;
        state.newSellers = action.payload.newSellers;
        state.lastUpdated = action.payload.lastUpdated;
      })
      .addCase(fetchDashboardOverviewAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Dashboard Stats Only
    builder
      .addCase(fetchDashboardStatsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStatsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardStatsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================
// Exports
// ============================================

export const {
  clearError,
  resetState,
} = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;

