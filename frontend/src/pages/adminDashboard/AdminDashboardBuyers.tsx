import React, { useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminTopGreenHeader from '../../components/admin/AdminTopGreenHeader';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import Footer from '../../components/Footer';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAppDispatch, useAppSelector } from '../../store';
import { useDebounce } from '../../hooks/useDebounce';
import {
  fetchBuyersAsync,
  blockBuyerAsync,
  approveBuyerAsync,
  setSearchQuery,
  setStatusFilter,
  setCurrentPage,
  clearError,
} from '../../store/adminBuyersSlice';
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
  BuyerStatusFilter,
} from './constants/buyerConstants';
import {
  getStatusStyle,
  formatCountText,
  calculatePagination,
  buildBuyersQueryParams,
  canApproveBuyer,
  canBlockBuyer,
} from './utils/buyerUtils';

const AdminDashboardBuyers: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [confirmBlockBuyerId, setConfirmBlockBuyerId] = useState<string | null>(null);

  // Redux state
  const {
    buyers,
    loading,
    error,
    searchQuery,
    currentPage,
    totalBuyers,
    statusFilter,
    actionLoading,
    pageSize,
  } = useAppSelector((state) => state.adminBuyers);

  // Local state for immediate search input feedback
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  
  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(localSearchQuery, 500);

  const activeKey = location.pathname.includes('/admin/buyers') ? 'users' : 'dashboard';

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

  // Update Redux state when debounced search query changes
  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearchQuery));
  }, [debouncedSearchQuery, dispatch]);

  // Fetch buyers data when filters change
  useEffect(() => {
    const queryParams = buildBuyersQueryParams(
      currentPage,
      pageSize,
      statusFilter,
      searchQuery
    );

    dispatch(fetchBuyersAsync(queryParams));
  }, [dispatch, currentPage, pageSize, statusFilter, searchQuery]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error,
      });
      dispatch(clearError());
    }
  }, [error, showToast, dispatch]);

  // Handle search - update local state immediately for responsive UI
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
  }, []);

  // Handle pagination
  const pagination = calculatePagination(totalBuyers, pageSize, currentPage);

  const handlePreviousPage = useCallback(() => {
    if (pagination.hasPreviousPage) {
      dispatch(setCurrentPage(currentPage - 1));
    }
  }, [dispatch, currentPage, pagination.hasPreviousPage]);

  const handleNextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      dispatch(setCurrentPage(currentPage + 1));
    }
  }, [dispatch, currentPage, pagination.hasNextPage]);

  // Handle buyer actions with proper error handling
  const handleBlockBuyer = useCallback(async (buyerId: string) => {
    try {
      await dispatch(blockBuyerAsync(buyerId)).unwrap();
      setConfirmBlockBuyerId(null);
      
      showToast({
        type: 'success',
        title: 'Success',
        message: TOAST_MESSAGES.BUYER_BLOCKED_SUCCESS,
      });
    } catch (err: any) {
      const errorMessage = err || TOAST_MESSAGES.BUYER_BLOCKED_ERROR;
      
      if (process.env.NODE_ENV !== 'production') {
        console.error('[AdminDashboardBuyers] Error blocking buyer:', err);
      }

      showToast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    }
  }, [dispatch, showToast]);

  const handleApproveBuyer = useCallback(async (buyerId: string) => {
    try {
      await dispatch(approveBuyerAsync(buyerId)).unwrap();
      
      showToast({
        type: 'success',
        title: 'Success',
        message: TOAST_MESSAGES.BUYER_APPROVED_SUCCESS,
      });
    } catch (err: any) {
      const errorMessage = err || TOAST_MESSAGES.BUYER_APPROVED_ERROR;
      
      if (process.env.NODE_ENV !== 'production') {
        console.error('[AdminDashboardBuyers] Error approving buyer:', err);
      }

      showToast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    }
  }, [dispatch, showToast]);

  const handleViewBuyer = useCallback((buyerId: string) => {
    navigate(`${ADMIN_ROUTES.BUYERS}/${buyerId}`);
  }, [navigate]);

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
        header={<AdminTopBar title="Buyers" />}
      >
        <div className="bg-white flex flex-col gap-4 sm:gap-[23.991px] px-4 py-6 sm:px-8 sm:py-8">
          <ConfirmModal
            open={Boolean(confirmBlockBuyerId)}
            title="Block buyer"
            message="Blocked buyers will be logged out immediately and cannot log back in until reactivated."
            confirmText="Block buyer"
            cancelText="Cancel"
            danger
            loading={actionLoading === confirmBlockBuyerId}
            onClose={() => setConfirmBlockBuyerId(null)}
            onConfirm={() => confirmBlockBuyerId && handleBlockBuyer(confirmBlockBuyerId)}
          />
          {/* Search Bar */}
          <div className="relative w-full" style={{ maxWidth: UI_STYLES.SEARCH_BAR_MAX_WIDTH }}>
            <input
              type="text"
              placeholder={SEARCH_PLACEHOLDER}
              value={localSearchQuery}
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

          {/* Buyers Table Card */}
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
                  All Buyers
                </h2>
                <p
                  className="text-[13px] sm:text-[14px] text-[#6A7282]"
                  style={{
                    fontFamily: UI_STYLES.FONT_FAMILY,
                    lineHeight: '20px',
                  }}
                >
                  {formatCountText(totalBuyers)}
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

              {/* Empty State */}
              {!loading && buyers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#6A7282] text-[16px]" style={{ fontFamily: UI_STYLES.FONT_FAMILY }}>
                    {searchQuery ? 'No buyers found matching your search.' : 'No buyers found.'}
                  </p>
                </div>
              )}

              {/* Table */}
              {!loading && buyers.length > 0 && (
                <>
                  {/* Table - Responsive with horizontal scroll on mobile */}
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
                            {buyers.map((buyer) => {
                              const statusStyle = getStatusStyle(buyer.status);
                              const isActionLoading = actionLoading === buyer.id;

                              return (
                                <tr
                                  key={buyer.id}
                                  className="border-b border-[#E5E7EB] last:border-b-0"
                                  style={{ height: UI_STYLES.TABLE_ROW_HEIGHT }}
                                >
                                  {/* User Name */}
                                  <td className="align-middle">
                                    <div style={{ marginLeft: UI_STYLES.CELL_MARGIN_LEFT }}>
                                      <p
                                        className="text-[14px] text-[#101828]"
                                        style={{
                                          fontFamily: UI_STYLES.FONT_FAMILY,
                                          lineHeight: '20px',
                                        }}
                                      >
                                        {buyer.name}
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
                                      {buyer.email}
                                    </p>
                                  </td>

                                  {/* Status Badge */}
                                  <td className="align-middle">
                                    <div style={{ marginLeft: UI_STYLES.CELL_MARGIN_LEFT }}>
                                      <div
                                        className="rounded-full inline-flex items-center px-3"
                                        style={{
                                          height: UI_STYLES.BADGE_HEIGHT,
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
                                          }}
                                        >
                                          {buyer.status}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Joined Date */}
                                  <td className="align-middle">
                                    <p
                                      className="text-[14px] text-[#101828]"
                                      style={{
                                        fontFamily: UI_STYLES.FONT_FAMILY,
                                        lineHeight: '20px',
                                        marginLeft: UI_STYLES.CELL_MARGIN_LEFT,
                                      }}
                                    >
                                      {buyer.joinedDate}
                                    </p>
                                  </td>

                                  {/* Actions */}
                                  <td className="align-middle">
                                    <div
                                      className="flex items-center gap-2"
                                      style={{ marginLeft: UI_STYLES.CELL_MARGIN_LEFT }}
                                    >
                                      {canApproveBuyer(buyer) && (
                                        <button
                                          type="button"
                                          onClick={() => handleApproveBuyer(buyer.id)}
                                          disabled={isActionLoading}
                                          className="rounded-[10px] px-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:opacity- transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                          style={{
                                            fontFamily: UI_STYLES.FONT_FAMILY,
                                            color: '#FFFFFF',
                                            fontSize: UI_STYLES.BUTTON_FONT_SIZE,
                                            backgroundColor: '#2ECC71',
                                            height: UI_STYLES.BUTTON_HEIGHT,
                                          }}
                                          aria-label={`Approve ${buyer.name}`}
                                        >
                                          {isActionLoading ? 'Processing...' : ACTION_LABELS.APPROVE}
                                        </button>
                                      )}
                                      {canBlockBuyer(buyer) && (
                                        <button
                                          type="button"
                                          onClick={() => setConfirmBlockBuyerId(buyer.id)}
                                          disabled={isActionLoading}
                                          className="rounded-[10px] border border-[#FB2C36] px-4 hover:bg-red-100 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          style={{
                                            fontFamily: UI_STYLES.FONT_FAMILY,
                                            color: '#FB2C36',
                                            fontSize: UI_STYLES.BUTTON_FONT_SIZE,
                                            height: UI_STYLES.BUTTON_HEIGHT,
                                          }}
                                          aria-label={`Block ${buyer.name}`}
                                        >
                                          {isActionLoading ? 'Processing...' : ACTION_LABELS.BLOCK}
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleViewBuyer(buyer.id)}
                                        className="rounded-[10px] border border-[#D1D5DC] px-4 hover:bg-gray-50 transition-colors"
                                        style={{
                                          fontFamily: UI_STYLES.FONT_FAMILY,
                                          color: '#364153',
                                          fontSize: UI_STYLES.BUTTON_FONT_SIZE,
                                          height: UI_STYLES.BUTTON_HEIGHT,
                                        }}
                                        aria-label={`View ${buyer.name} details`}
                                      >
                                        {ACTION_LABELS.VIEW}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-[#E5E7EB]">
                    <p
                      className="text-[13px] sm:text-[14px] text-[#6A7282]"
                      style={{
                        fontFamily: UI_STYLES.FONT_FAMILY,
                        lineHeight: '20px',
                      }}
                    >
                      Showing {buyers.length} of {totalBuyers} buyers
                    </p>

                    <div className="flex items-center gap-2">
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
                      
                      <div className="flex items-center gap-1 px-2">
                        <span
                          className="text-[13px] sm:text-[14px] text-[#6A7282]"
                          style={{
                            fontFamily: UI_STYLES.FONT_FAMILY,
                          }}
                        >
                          Page {currentPage} of {pagination.totalPages}
                        </span>
                      </div>
                      
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
                </>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
      <Footer />
    </div>
  );
};

export default AdminDashboardBuyers;
