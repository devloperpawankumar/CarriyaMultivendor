import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  fetchSellers, 
  approveSeller, 
  suspendSeller, 
  reactivateSeller,
  FetchSellersParams 
} from '../services/adminService';
import { AdminSeller } from '../types/admin';

// ============================================
// Types
// ============================================

export interface AdminSellersState {
  sellers: AdminSeller[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalSellers: number;
  totalPages: number;
  searchQuery: string;
  statusFilter: 'all' | 'Active' | 'Pending' | 'Suspended';
  actionLoading: string | null; // ID of seller being acted upon
}

const initialState: AdminSellersState = {
  sellers: [],
  loading: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  totalSellers: 0,
  totalPages: 0,
  searchQuery: '',
  statusFilter: 'all',
  actionLoading: null,
};

// ============================================
// Async Thunks
// ============================================

/**
 * Fetch sellers with pagination and filters
 */
export const fetchSellersAsync = createAsyncThunk(
  'adminSellers/fetchSellers',
  async (params: FetchSellersParams | undefined, { rejectWithValue }) => {
    try {
      const response = await fetchSellers(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch sellers');
    }
  }
);

/**
 * Approve a seller
 */
export const approveSellerAsync = createAsyncThunk(
  'adminSellers/approveSeller',
  async (sellerId: string, { rejectWithValue }) => {
    try {
      await approveSeller(sellerId);
      return sellerId;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to approve seller');
    }
  }
);

/**
 * Suspend a seller
 */
export const suspendSellerAsync = createAsyncThunk(
  'adminSellers/suspendSeller',
  async ({ sellerId, reason }: { sellerId: string; reason?: string }, { rejectWithValue }) => {
    try {
      await suspendSeller(sellerId, reason);
      return sellerId;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to suspend seller');
    }
  }
);

/**
 * Reactivate a seller
 */
export const reactivateSellerAsync = createAsyncThunk(
  'adminSellers/reactivateSeller',
  async (sellerId: string, { rejectWithValue }) => {
    try {
      await reactivateSeller(sellerId);
      return sellerId;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to reactivate seller');
    }
  }
);

// ============================================
// Slice
// ============================================

const adminSellersSlice = createSlice({
  name: 'adminSellers',
  initialState,
  reducers: {
    // Set search query
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page on search
    },

    // Set status filter
    setStatusFilter: (state, action: PayloadAction<AdminSellersState['statusFilter']>) => {
      state.statusFilter = action.payload;
      state.currentPage = 1; // Reset to first page on filter change
    },

    // Set current page
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    // Set page size
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page on page size change
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Sellers
    builder
      .addCase(fetchSellersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.sellers = action.payload.items;
        state.totalSellers = action.payload.total;
        state.currentPage = action.payload.page || state.currentPage;
        state.pageSize = action.payload.pageSize || state.pageSize;
        state.totalPages = Math.ceil(action.payload.total / state.pageSize);
      })
      .addCase(fetchSellersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Approve Seller
    builder
      .addCase(approveSellerAsync.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(approveSellerAsync.fulfilled, (state, action) => {
        state.actionLoading = null;
        // Update the seller's status in the list
        const seller = state.sellers.find(s => s.id === action.payload);
        if (seller) {
          seller.status = 'Active';
        }
      })
      .addCase(approveSellerAsync.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      });

    // Suspend Seller
    builder
      .addCase(suspendSellerAsync.pending, (state, action) => {
        state.actionLoading = action.meta.arg.sellerId;
      })
      .addCase(suspendSellerAsync.fulfilled, (state, action) => {
        state.actionLoading = null;
        // Update the seller's status in the list
        const seller = state.sellers.find(s => s.id === action.payload);
        if (seller) {
          seller.status = 'Suspended';
        }
      })
      .addCase(suspendSellerAsync.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      });

    // Reactivate Seller
    builder
      .addCase(reactivateSellerAsync.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(reactivateSellerAsync.fulfilled, (state, action) => {
        state.actionLoading = null;
        // Update the seller's status in the list
        const seller = state.sellers.find(s => s.id === action.payload);
        if (seller) {
          seller.status = 'Active';
        }
      })
      .addCase(reactivateSellerAsync.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      });
  },
});

// ============================================
// Exports
// ============================================

export const {
  setSearchQuery,
  setStatusFilter,
  setCurrentPage,
  setPageSize,
  clearError,
  resetState,
} = adminSellersSlice.actions;

export default adminSellersSlice.reducer;

