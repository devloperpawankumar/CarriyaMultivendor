import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminTopGreenHeader from '../../components/admin/AdminTopGreenHeader';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import Footer from '../../components/Footer';
import { fetchSellers, approveSeller, suspendSeller } from '../../services/adminService';
import { AdminSeller } from '../../types/admin';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  PAGE_SIZE,
  DEFAULT_STATUS_FILTER,
  ADMIN_ROUTES,
  UI_STYLES,
  TABLE_COLUMNS,
  ACTION_LABELS,
  CONFIRMATION_MESSAGES,
  TOAST_MESSAGES,
  SEARCH_PLACEHOLDER,
  EMPTY_STATE_MESSAGES,
  PAGINATION,
  SellerStatusFilter,
} from './constants/sellerConstants';
import {
  getStatusStyle,
  formatCountText,
  calculatePagination,
  buildSellersQueryParams,
  canApproveSeller,
  canSuspendSeller,
  formatCommission,
  generatePageNumbers,
  shouldShowEllipsis,
  formatPaginationRange,
} from './utils/sellerUtils';

const AdminDashboardSellers: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State management
  const [sellers, setSellers] = useState<AdminSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSellers, setTotalSellers] = useState(0);
  const [statusFilter, setStatusFilter] = useState<SellerStatusFilter>(DEFAULT_STATUS_FILTER);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmSuspendSellerId, setConfirmSuspendSellerId] = useState<string | null>(null);

  const activeKey = location.pathname.includes('/admin/sellers') ? 'sellers' : 'dashboard';

  // Menu navigation handler (centralized routing logic)
  const handleMenuClick = useCallback((key: string) => {
    const routeMap: Record<string, string> = {
      dashboard: ADMIN_ROUTES.DASHBOARD,
      users: ADMIN_ROUTES.BUYERS,
      sellers: ADMIN_ROUTES.SELLERS,
      orders: ADMIN_ROUTES.ORDERS,
      payments: ADMIN_ROUTES.PAYMENTS,
      settings: ADMIN_ROUTES.SETTINGS,
    };

    const route = routeMap[key];
    if (route) {
      navigate(route);
    }
  }, [navigate]);

  // Fetch sellers data with abort controller for cleanup
  const loadSellers = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = buildSellersQueryParams(
        currentPage,
        PAGE_SIZE,
        statusFilter,
        searchQuery
      );

      const response = await fetchSellers(queryParams, signal);

      if (!signal?.aborted) {
        setSellers(response.items);
        setTotalSellers(response.total);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !signal?.aborted) {
        const errorMessage = err?.message || TOAST_MESSAGES.LOAD_SELLERS_ERROR;
        setError(errorMessage);
        
        if (process.env.NODE_ENV !== 'production') {
          console.error('[AdminDashboardSellers] Error loading sellers:', err);
        }

        showToast({
          type: 'error',
          title: 'Error',
          message: errorMessage,
        });
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [currentPage, statusFilter, searchQuery, showToast]);

  // Load sellers on mount and when dependencies change
  useEffect(() => {
    const controller = new AbortController();
    loadSellers(controller.signal);
    
    return () => controller.abort();
  }, [loadSellers]);

  // Handle search
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  // Handle pagination
  const pagination = calculatePagination(totalSellers, PAGE_SIZE, currentPage);

  const handlePreviousPage = useCallback(() => {
    if (pagination.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [pagination.hasPreviousPage]);

  const handleNextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [pagination.hasNextPage]);

  const handlePageClick = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  // Handle seller actions
  const handleApproveSeller = useCallback(async (sellerId: string) => {
    if (!window.confirm(CONFIRMATION_MESSAGES.APPROVE_SELLER)) {
      return;
    }

    setActionLoading(sellerId);
    try {
      await approveSeller(sellerId);
      
      showToast({
        type: 'success',
        title: 'Success',
        message: TOAST_MESSAGES.SELLER_APPROVED_SUCCESS,
      });

      // Reload sellers list
      await loadSellers();
    } catch (err: any) {
      const errorMessage = err?.message || TOAST_MESSAGES.SELLER_APPROVED_ERROR;
      
      if (process.env.NODE_ENV !== 'production') {
        console.error('[AdminDashboardSellers] Error approving seller:', err);
      }

      showToast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    } finally {
      setActionLoading(null);
    }
  }, [showToast, loadSellers]);

  const handleSuspendSeller = useCallback((sellerId: string) => {
    // Open confirm card first (no browser dialogs)
    setConfirmSuspendSellerId(sellerId);
  }, []);

  const confirmSuspendSeller = useCallback(async () => {
    if (!confirmSuspendSellerId) return;
    setActionLoading(confirmSuspendSellerId);
    try {
      await suspendSeller(confirmSuspendSellerId);
      
      showToast({
        type: 'success',
        title: 'Success',
        message: TOAST_MESSAGES.SELLER_SUSPENDED_SUCCESS,
      });

      // Reload sellers list
      await loadSellers();
    } catch (err: any) {
      const errorMessage = err?.message || TOAST_MESSAGES.SELLER_SUSPENDED_ERROR;
      
      if (process.env.NODE_ENV !== 'production') {
        console.error('[AdminDashboardSellers] Error suspending seller:', err);
      }

      showToast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    } finally {
      setActionLoading(null);
      setConfirmSuspendSellerId(null);
    }
  }, [confirmSuspendSellerId, showToast, loadSellers]);

  const handleViewProfile = useCallback ((sellerId: string) => {
    navigate (`${ADMIN_ROUTES.SELLERS}/${sellerId}`);
  }, [navigate]);

  // Generate page numbers for pagination
  const pageNumbers = generatePageNumbers(currentPage, pagination.totalPages, PAGINATION.MAX_VISIBLE_PAGES);
  const showEllipsis = shouldShowEllipsis(pagination.totalPages, PAGINATION.MAX_VISIBLE_PAGES);

  return (
    <div className="min-h-screen bg-white">
      <AdminTopGreenHeader />
      <AdminLayout
        sidebar={
          <AdminSidebar
            topLogoSrc={require('../../assets/images/Carriya logo 1.png')}
            activeKey={activeKey}
            onMenuClick={handleMenuClick}
          />
        }
        header={<AdminTopBar title="Sellers" />}
      >
        <div className="bg-white flex flex-col gap-4 sm:gap-[23.991px] px-4 py-6 sm:px-8 sm:py-8">
          <ConfirmModal
            open={Boolean(confirmSuspendSellerId)}
            title="Suspend seller?"
            message="Suspending will immediately log the seller out and archive their active listings. You can reactivate the seller later."
            confirmText="Suspend seller"
            cancelText="Cancel"
            danger
            loading={actionLoading === confirmSuspendSellerId}
            onConfirm={confirmSuspendSeller}
            onClose={() => setConfirmSuspendSellerId(null)}
          />
          {/* Search Bar */}
          <div className="relative w-full" style={{ maxWidth: UI_STYLES.SEARCH_BAR_MAX_WIDTH }}>
            <input
              type="text"
              placeholder={SEARCH_PLACEHOLDER}
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 rounded-[10px] border border-[#D1D5DC] text-[14px] sm:text-[16px] text-[#0A0A0A] placeholder:text-[#0A0A0A]/50 outline-none focus:border-[#2ECC71] focus:ring-1 focus:ring-[#2ECC71] transition-colors"
              style={{
                fontFamily: UI_STYLES.FONT_FAMILY,
                height: UI_STYLES.SEARCH_BAR_HEIGHT,
                borderWidth: UI_STYLES.BORDER_WIDTH,
              }}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#6A7282]"
                aria-hidden="true"
              >
                <path
                  d="M11 4a7 7 0 015.657 11.243l2.55 2.55a1 1 0 01-1.414 1.414l-2.55-2.55A7 7 0 1111 4zm0 2a5 5 0 100 10 5 5 0 000-10z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>

          {/* All Sellers Card + Table */}
          <div
            className="bg-white w-full rounded-[10px] border border-[#E5E7EB] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden"
            style={{
              borderWidth: UI_STYLES.BORDER_WIDTH,
            }}
          >
            <div className="p-4 sm:p-6">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 sm:mb-6">
                <h2
                  className="text-[16px] sm:text-[18px] font-bold text-[#101828]"
                  style={{
                    fontFamily: UI_STYLES.FONT_FAMILY,
                    lineHeight: '28px',
                  }}
                >
                  All Sellers
                </h2>
                <p
                  className="text-[13px] sm:text-[14px] text-[#6A7282]"
                  style={{
                    fontFamily: UI_STYLES.FONT_FAMILY,
                    lineHeight: '20px',
                  }}
                >
                  {formatCountText(totalSellers)}
                </p>
              </div>

              {/* Error State */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ECC71]" aria-label="Loading" />
                </div>
              )}

              {/* Table */}
              {!loading && (
                <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
                  <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                      <table className="w-full border-separate border-spacing-0" style={{ minWidth: UI_STYLES.TABLE_MIN_WIDTH }}>
                        <thead>
                          <tr
                            className="bg-[#F9FAFB]"
                            style={{ height: UI_STYLES.TABLE_HEADER_HEIGHT }}
                          >
                            {Object.values(TABLE_COLUMNS).map((column) => (
                              <th key={column} className="text-left align-middle">
                                <p
                                  className="text-[12px] text-[#6A7282] uppercase"
                                  style={{
                                    fontFamily: UI_STYLES.FONT_FAMILY,
                                    lineHeight: '16px',
                                    letterSpacing: 0.6,
                                    marginLeft: UI_STYLES.CELL_MARGIN_LEFT,
                                  }}
                                >
                                  {column}
                                </p>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sellers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-10">
                                <p
                                  className="text-[14px] text-[#6A7282]"
                                  style={{
                                    fontFamily: UI_STYLES.FONT_FAMILY,
                                    lineHeight: '20px',
                                  }}
                                >
                                  {searchQuery ? EMPTY_STATE_MESSAGES.NO_SEARCH_RESULTS : EMPTY_STATE_MESSAGES.NO_SELLERS}
                                </p>
                              </td>
                            </tr>
                          ) : (
                            sellers.map((seller) => {
                              // console.log("seller", seller)
                              const statusStyle = getStatusStyle(seller.status);
                              const isActionLoading = actionLoading === seller.id;

                              return (
                                <tr
                                  key={seller.id}
                                  className="border-b border-[#E5E7EB] last:border-b-0"
                                  style={{ height: UI_STYLES.TABLE_ROW_HEIGHT }}
                                >
                                  {/* Store Name */}
                                  <td className="align-middle">
                                    <div style={{ marginLeft: UI_STYLES.CELL_MARGIN_LEFT }}>
                                      <p
                                        className="text-[14px] text-[#101828]"
                                        style={{
                                          fontFamily: UI_STYLES.FONT_FAMILY,
                                          lineHeight: '20px',
                                        }}
                                      >
                                        {seller.storeName}
                                        
                                      </p>
                                    </div>
                                  </td>

                                  {/* Owner Name */}
                                  <td className="align-middle">
                                    <p
                                      className="text-[14px] text-[#101828]"
                                      style={{
                                        fontFamily: UI_STYLES.FONT_FAMILY,
                                        lineHeight: '20px',
                                        marginLeft: UI_STYLES.CELL_MARGIN_LEFT,
                                      }}
                                    >
                                      {seller.ownerName}
                                    </p>
                                  </td>

                                  {/* Status Badge */}
                                  <td className="align-middle">
                                    <div
                                      className="rounded-full flex items-center"
                                      style={{
                                        marginLeft: UI_STYLES.CELL_MARGIN_LEFT,
                                        height: UI_STYLES.BADGE_HEIGHT,
                                        width: statusStyle.width,
                                        backgroundColor: statusStyle.bg,
                                        borderColor: statusStyle.border,
                                        borderWidth: UI_STYLES.BADGE_BORDER_WIDTH,
                                      }}
                                    >
                                      <p
                                        className="text-[14px]"
                                        style={{
                                          fontFamily: UI_STYLES.FONT_FAMILY,
                                          lineHeight: '20px',
                                          color: statusStyle.color,
                                          marginLeft: UI_STYLES.BADGE_MARGIN_LEFT,
                                        }}
                                      >
                                        {seller.status}
                                      </p>
                                    </div>
                                  </td>

                                  {/* Email */}
                                  <td className="align-middle">
                                    <p
                                      className="text-[14px] text-[#101828]"
                                      style={{
                                        fontFamily: UI_STYLES.FONT_FAMILY,
                                        lineHeight: '20px',
                                        marginLeft: UI_STYLES.CELL_MARGIN_LEFT,
                                      }}
                                    >
                                      {seller.email}
                                    </p>
                                  </td>

                                  {/* Commission */}
                                  <td className="align-middle">
                                    <p
                                      className="text-[14px] text-[#101828]"
                                      style={{
                                        fontFamily: UI_STYLES.FONT_FAMILY,
                                        lineHeight: '20px',
                                        marginLeft: UI_STYLES.CELL_MARGIN_LEFT,
                                      }}
                                    >
                                      {formatCommission(seller.commission)}
                                    </p>
                                  </td>

                                  {/* Actions */}
                                  <td className="align-middle">
                                    <div
                                      className="flex items-center gap-2"
                                      style={{ marginLeft: UI_STYLES.CELL_MARGIN_LEFT }}
                                    >
                                      <button
                                        type="button"
                                        
                                        onClick={() => 
                                          
                                          handleViewProfile(seller.id)}
                                          
                                        className="rounded-[10px] px-3 sm:px-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:bg-[#27AE60] transition-colors text-[13px] sm:text-[14px] whitespace-nowrap"
                                        style={{
                                          fontFamily: UI_STYLES.FONT_FAMILY,
                                          color: '#FFFFFF',
                                          backgroundColor: '#2ECC71',
                                          height: UI_STYLES.BUTTON_HEIGHT,
                                        }}
                                        aria-label={`View ${seller.storeName} profile`}
                                      >
                                        {ACTION_LABELS.VIEW_PROFILE}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {sellers.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-[#E5E7EB] px-2 sm:px-0">
                      {/* Results Count */}
                      <div className="w-full sm:w-auto text-center sm:text-left">
                        <p
                          className="text-[13px] sm:text-[14px] text-[#6A7282]"
                          style={{
                            fontFamily: UI_STYLES.FONT_FAMILY,
                            lineHeight: '20px',
                          }}
                        >
                          {formatPaginationRange(currentPage, PAGE_SIZE, totalSellers)}
                        </p>
                      </div>
                      
                      {/* Pagination Controls */}
                      <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                        {/* Previous Button */}
                        <button
                          type="button"
                          onClick={handlePreviousPage}
                          disabled={!pagination.hasPreviousPage}
                          className="rounded-[10px] border border-[#D1D5DC] px-3 sm:px-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                          style={{
                            fontFamily: UI_STYLES.FONT_FAMILY,
                            color: '#364153',
                            fontSize: 13,
                            height: UI_STYLES.BUTTON_HEIGHT,
                          }}
                          aria-label="Previous page"
                        >
                          Previous
                        </button>
                        
                        {/* Page Numbers - Hidden on very small screens */}
                        <div className="hidden min-[500px]:flex items-center gap-1 sm:gap-2">
                          {pageNumbers.map((pageNumber) => (
                            <button
                              key={pageNumber}
                              type="button"
                              onClick={() => handlePageClick(pageNumber)}
                              className={`rounded-[10px] transition-colors ${
                                currentPage === pageNumber
                                  ? 'bg-[#2ECC71] text-white'
                                  : 'border border-[#D1D5DC] text-[#364153] hover:bg-gray-50'
                              }`}
                              style={{
                                fontFamily: UI_STYLES.FONT_FAMILY,
                                fontSize: 14,
                                height: UI_STYLES.BUTTON_HEIGHT,
                                width: UI_STYLES.BUTTON_HEIGHT,
                              }}
                              aria-label={`Go to page ${pageNumber}`}
                              aria-current={currentPage === pageNumber ? 'page' : undefined}
                            >
                              {pageNumber}
                            </button>
                          ))}
                          {showEllipsis && (
                            <>
                              <span className="text-[#6A7282] px-1">...</span>
                              <button
                                type="button"
                                onClick={() => handlePageClick(pagination.totalPages)}
                                className={`rounded-[10px] transition-colors ${
                                  currentPage === pagination.totalPages
                                    ? 'bg-[#2ECC71] text-white'
                                    : 'border border-[#D1D5DC] text-[#364153] hover:bg-gray-50'
                                }`}
                                style={{
                                  fontFamily: UI_STYLES.FONT_FAMILY,
                                  fontSize: 14,
                                  height: UI_STYLES.BUTTON_HEIGHT,
                                  width: UI_STYLES.BUTTON_HEIGHT,
                                }}
                                aria-label={`Go to page ${pagination.totalPages}`}
                              >
                                {pagination.totalPages}
                              </button>
                            </>
                          )}
                        </div>
                        
                        {/* Current Page Indicator - Mobile only */}
                        <div className="flex min-[500px]:hidden items-center px-3">
                          <span
                            className="text-[14px] text-[#364153] font-medium"
                            style={{
                              fontFamily: UI_STYLES.FONT_FAMILY,
                            }}
                          >
                            Page {currentPage} of {pagination.totalPages}
                          </span>
                        </div>
                        
                        {/* Next Button */}
                        <button
                          type="button"
                          onClick={handleNextPage}
                          disabled={!pagination.hasNextPage}
                          className="rounded-[10px] border border-[#D1D5DC] px-3 sm:px-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                          style={{
                            fontFamily: UI_STYLES.FONT_FAMILY,
                            color: '#364153',
                            fontSize: 13,
                            height: UI_STYLES.BUTTON_HEIGHT,
                          }}
                          aria-label="Next page"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
      <Footer />
    </div>
  );
};

export default AdminDashboardSellers;
