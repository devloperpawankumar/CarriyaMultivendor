import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  fetchBuyers, 
  blockBuyer, 
  approveBuyer, 
  unblockBuyer,
  FetchBuyersParams 
} from '../services/adminService';
import { AdminBuyer } from '../types/admin';

// ============================================
// Types
// ============================================

export interface AdminBuyersState {
  buyers: AdminBuyer[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalBuyers: number;
  totalPages: number;
  searchQuery: string;
  statusFilter: 'all' | 'Active' | 'Pending' | 'Suspended';
  actionLoading: string | null; // ID of buyer being acted upon
}

const initialState: AdminBuyersState = {
  buyers: [],
  loading: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  totalBuyers: 0,
  totalPages: 0,
  searchQuery: '',
  statusFilter: 'all',
  actionLoading: null,
};

// ============================================
// Async Thunks
// ============================================

/**
 * Fetch buyers with pagination and filters
 */
export const fetchBuyersAsync = createAsyncThunk(
  'adminBuyers/fetchBuyers',
  async (params: FetchBuyersParams | undefined, { rejectWithValue }) => {
    try {
      const response = await fetchBuyers(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch buyers');
    }
  }
);

/**
 * Block a buyer
 */
export const blockBuyerAsync = createAsyncThunk(
  'adminBuyers/blockBuyer',
  async (buyerId: string, { rejectWithValue }) => {
    try {
      await blockBuyer(buyerId);
      return buyerId;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to block buyer');
    }
  }
);

/**
 * Approve a buyer
 */
export const approveBuyerAsync = createAsyncThunk(
  'adminBuyers/approveBuyer',
  async (buyerId: string, { rejectWithValue }) => {
    try {
      await approveBuyer(buyerId);
      return buyerId;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to approve buyer');
    }
  }
);

/**
 * Unblock a buyer
 */
export const unblockBuyerAsync = createAsyncThunk(
  'adminBuyers/unblockBuyer',
  async (buyerId: string, { rejectWithValue }) => {
    try {
      await unblockBuyer(buyerId);
      return buyerId;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to unblock buyer');
    }
  }
);

// ============================================
// Slice
// ============================================

const adminBuyersSlice = createSlice({
  name: 'adminBuyers',
  initialState,
  reducers: {
    // Set search query
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page on search
    },

    // Set status filter
    setStatusFilter: (state, action: PayloadAction<AdminBuyersState['statusFilter']>) => {
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
    // Fetch Buyers
    builder
      .addCase(fetchBuyersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuyersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.buyers = action.payload.items;
        state.totalBuyers = action.payload.total;
        state.currentPage = action.payload.page || state.currentPage;
        state.pageSize = action.payload.pageSize || state.pageSize;
        state.totalPages = Math.ceil(action.payload.total / state.pageSize);
      })
      .addCase(fetchBuyersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Block Buyer
    builder
      .addCase(blockBuyerAsync.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(blockBuyerAsync.fulfilled, (state, action) => {
        state.actionLoading = null;
        // Update the buyer's status in the list
        const buyer = state.buyers.find(b => b.id === action.payload);
        if (buyer) {
          buyer.status = 'Suspended';
        }
      })
      .addCase(blockBuyerAsync.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      });

    // Approve Buyer
    builder
      .addCase(approveBuyerAsync.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(approveBuyerAsync.fulfilled, (state, action) => {
        state.actionLoading = null;
        // Update the buyer's status in the list
        const buyer = state.buyers.find(b => b.id === action.payload);
        if (buyer) {
          buyer.status = 'Active';
        }
      })
      .addCase(approveBuyerAsync.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      });

    // Unblock Buyer
    builder
      .addCase(unblockBuyerAsync.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(unblockBuyerAsync.fulfilled, (state, action) => {
        state.actionLoading = null;
        // Update the buyer's status in the list
        const buyer = state.buyers.find(b => b.id === action.payload);
        if (buyer) {
          buyer.status = 'Active';
        }
      })
      .addCase(unblockBuyerAsync.rejected, (state, action) => {
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
} = adminBuyersSlice.actions;

export default adminBuyersSlice.reducer;

