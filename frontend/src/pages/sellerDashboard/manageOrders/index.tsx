import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import { useToast } from '../../../contexts/ToastContext';
import OrderStatsCards from './components/OrderStatsCards';
import OrderFilters from './components/OrderFilters';
import OrdersTable from './components/OrdersTable';
import ProcessingOrdersTable from './components/ProcessingOrdersTable';
import CanceledReturnedOrdersTable from './components/CanceledReturnedOrdersTable';
import Pagination from './components/Pagination';
import OrderDetailsWrapper from './OrderDetailsWrapper';
import {
  CancelOrderPayload,
  Order,
  OrderDetails,
  OrderStats,
  OrderStatusBadge,
  PaymentMethod,
  SellerOrderDetail,
  SellerOrderStatus,
  SellerOrderSummary,
} from './types/orderTypes';
import apiClient from '../../../services/api';
import placeholderProduct from '../../../assets/images/Product/prodcut1.png';
import { fetchOrdersOverview, getOrderDetails, updateOrderStatus, SellerOrderQuery } from './services/orderService';
import {
  DEFAULT_DATE_PRESET,
  getDateRangeForPreset,
  normalizeDateFilterValue,
  resolvePresetIdFromValue,
} from './constants/dateFilters';

const PAGE_SIZE = 10;
const DEFAULT_FILTER = 'New Orders';

const FILTER_SLUG_MAP: Record<string, string> = {
  'New Orders': 'new',
  Processing: 'processing',
  Completed: 'completed',
  'Canceled/Returned': 'canceled-returned',
};

const SLUG_FILTER_MAP: Record<string, string> = Object.entries(FILTER_SLUG_MAP).reduce(
  (acc, [label, slug]) => {
    acc[slug] = label;
    return acc;
  },
  {} as Record<string, string>
);

const DEFAULT_STATUS_SLUG = FILTER_SLUG_MAP[DEFAULT_FILTER];
const CACHE_TTL_MS = 60 * 1000;
const CACHE_LIMIT = 12;
const ORDER_ID_SEPARATOR = '__';
const DECISION_ELIGIBLE_STATUSES: SellerOrderStatus[] = ['pending'];

type OrdersCacheEntry = {
  orders: Order[];
  total: number;
  totalPages: number;
  timestamp: number;
  stats: OrderStats;
};

const sanitizeOrderLabel = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const encodeOrderToken = (value: string) => {
  if (!value) return value;
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window
      .btoa(value)
      .replace(/=+$/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
  return value;
};

const decodeOrderToken = (value: string) => {
  if (!value) return value;
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    try {
      const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
      const padLength = (4 - (normalized.length % 4)) % 4;
      return window.atob(normalized + '='.repeat(padLength));
    } catch {
      return value;
    }
  }
  return value;
};

const buildOrderPublicId = (orderNumber: string | undefined, orderId: string) => {
  if (!orderId) return '';
  const labelSource = orderNumber || `order-${orderId.slice(-6) || 'ref'}`;
  const label = sanitizeOrderLabel(labelSource) || `order-${orderId.slice(-6) || 'ref'}`;
  return `${label}${ORDER_ID_SEPARATOR}${encodeOrderToken(orderId)}`;
};

const extractOrderIdFromPublicId = (publicId: string) => {
  if (!publicId) return publicId;
  const separatorIndex = publicId.lastIndexOf(ORDER_ID_SEPARATOR);
  if (separatorIndex === -1) return publicId;
  const encoded = publicId.slice(separatorIndex + ORDER_ID_SEPARATOR.length);
  const decoded = decodeOrderToken(encoded);
  return decoded || publicId;
};

const STATUS_FILTER_MAP: Record<string, SellerOrderStatus[] | undefined> = {
  'New Orders': ['pending', 'confirmed'],
  Processing: ['processing', 'shipped'],
  Completed: ['delivered'],
  'Canceled/Returned': ['cancelled', 'refunded'],
};

const DEFAULT_STATS: OrderStats = {
  newOrders: 0,
  processing: 0,
  completed: 0,
  canceled: 0,
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: 'Cash on Delivery',
  bank_transfer: 'Bank Transfer',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  card: 'Card',
};

const apiBaseUrl = apiClient.baseUrl || '';

const formatCurrency = (amount?: number) => {
  if (amount === undefined || amount === null) return 'PKR 0';
  return `PKR ${Number(amount).toLocaleString('en-PK')}`;
};

const formatDateTime = (value?: string) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const resolveImageUrl = (url?: string) => {
  if (!url) return placeholderProduct;
  if (url.startsWith('http')) return url;
  return `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;
};

const mapStatusToBadge = (status: SellerOrderStatus): OrderStatusBadge => {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return 'new';
    case 'processing':
    case 'shipped':
      return 'processing';
    case 'delivered':
      return 'completed';
    case 'cancelled':
    case 'refunded':
    default:
      return 'canceled';
  }
};

const getStatusQuery = (filter: string): string | undefined => {
  const statuses = STATUS_FILTER_MAP[filter];
  if (!statuses || statuses.length === 0) return undefined;
  return statuses.join(',');
};

const EMPTY_RANGE = { startDate: undefined, endDate: undefined } as const;

const buildDateRange = (startInput: Date, endInput: Date) => {
  const start = new Date(startInput);
  const end = new Date(endInput);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
};

const getDateRange = (selected: string): { startDate?: string; endDate?: string } => {
  if (!selected || selected === DEFAULT_DATE_PRESET) {
    return { ...EMPTY_RANGE };
  }

  if (selected.startsWith('Custom:')) {
    const payload = selected.replace('Custom:', '');
    const [startStr, endStr] = payload.split('|');
    const start = startStr ? new Date(startStr) : null;
    const end = endStr ? new Date(endStr) : null;
    if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      return buildDateRange(start, end);
    }
    return { ...EMPTY_RANGE };
  }

  if (selected.startsWith('Exact:')) {
    const iso = selected.replace('Exact:', '');
    const parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) {
      return buildDateRange(parsed, parsed);
    }
    return { ...EMPTY_RANGE };
  }

  const preset = resolvePresetIdFromValue(selected);
  if (!preset) {
    const parsed = new Date(selected);
    if (!Number.isNaN(parsed.getTime())) {
      return buildDateRange(parsed, parsed);
    }
    return { ...EMPTY_RANGE };
  }
  const presetRange = getDateRangeForPreset(preset);
  return presetRange || { ...EMPTY_RANGE };
};

type LockableOrder = SellerOrderSummary | SellerOrderDetail;

const deriveStatusLockMeta = (order: LockableOrder | null | undefined) => {
  if (!order) {
    return { locked: false, reason: undefined as string | undefined };
  }
  if (typeof order.statusUpdateLocked === 'boolean') {
    return {
      locked: order.statusUpdateLocked,
      reason: order.statusLockedReason || undefined,
    };
  }
  const settlementStatus = order.settlement?.settlementStatus;
  const payoutReleased =
    order.paymentStatus === 'paid' || settlementStatus === 'available' || settlementStatus === 'settled';
  if (order.status === 'delivered' && payoutReleased) {
    return {
      locked: true,
      reason: 'Order locked after delivery and payout release.',
    };
  }
  return { locked: false, reason: undefined };
};

const mapOrderToTable = (order: SellerOrderSummary): Order => {
  const firstItem = order.items?.[0];
  // Use orderNumber as primary identifier (Daraz/Amazon style)
  const orderIdentifier = order.orderNumber || order.id || '';
  return {
    id: orderIdentifier, // Use orderNumber as id for backward compatibility
    orderNumber: order.orderNumber,
    customer: order.buyer?.name || order.shippingAddress.fullName || 'Unknown buyer',
    product: firstItem?.title || `${order.items.length} item(s)`,
    photo: resolveImageUrl(firstItem?.thumbnailUrl) || placeholderProduct,
    date: formatDateTime(order.createdAt),
    payment: PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod,
    amount: formatCurrency(order.total),
    status: mapStatusToBadge(order.status),
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    sellerStatus: order.status,
    publicId: buildOrderPublicId(order.orderNumber, orderIdentifier),
    trackingNumber: order.trackingNumber,
  };
};

const mapDetails = (order: SellerOrderDetail): OrderDetails => {
  const firstItem = order.items?.[0];
  const address = order.shippingAddress;
  const canDecide = DECISION_ELIGIBLE_STATUSES.includes(order.status);
  const statusLockMeta = deriveStatusLockMeta(order);
  const cancellationReason = order.cancellationReason?.trim();
  const derivedReturnReason =
    order.status === 'refunded'
      ? 'Marked as refunded'
      : order.status === 'cancelled'
      ? cancellationReason || 'Order cancelled before shipment'
      : undefined;
  const cancellationNoteFromHistory =
    order.statusHistory?.slice().reverse().find((entry) => entry.to === 'cancelled' && entry.note)?.note || undefined;
  const cancellationNote = order.cancellationNote || cancellationNoteFromHistory;
  // Use orderNumber as primary identifier (Daraz/Amazon style)
  const orderIdentifier = order.orderNumber || order.id || '';
  return {
    id: orderIdentifier, // Use orderNumber as id for backward compatibility
    orderNumber: order.orderNumber,
    customerName: order.buyer?.name || address.fullName,
    address: `${address.address}, ${address.city}, ${address.province}`,
    paymentMethod: PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod,
    paymentStatus: order.paymentStatus ? order.paymentStatus.toUpperCase() : 'PENDING',
    orderDate: formatDateTime(order.createdAt),
    shippingCharges: formatCurrency(order.shippingCost),
    productName: firstItem?.title || `${order.items.length} item(s)`,
    unitPrice: formatCurrency(firstItem?.price),
    quantity: firstItem?.quantity || 0,
    platformCommission: (() => {
      if (order.settlement) {
        const commission = order.settlement.commissionAmount || 0;
        const gatewayFee = order.settlement.paymentGatewayFee || 0;
        const totalFees = commission + gatewayFee;
        if (totalFees > 0) {
          return formatCurrency(totalFees);
        }
      }
      // Fallback for old orders without settlement data
      return order.paymentMethod === 'cod'
        ? 'PKR 0 (COD release)'
        : 'Pending gateway capture';
    })(),
    discount: formatCurrency(order.discount),
    sellerPayout: formatCurrency(order.settlement?.sellerPayout || order.total),
    productImage: resolveImageUrl(firstItem?.thumbnailUrl),
    isCanceled: order.status === 'cancelled',
    isReturned: order.status === 'refunded',
    returnReason: derivedReturnReason,
    cancellationReason,
    cancellationNote,
    cancelledAt: order.cancelledAt,
    returnRequestedAt: order.returnRequestedAt,
    returnedAt: order.returnedAt,
    sellerStatus: order.status,
    statusBadge: mapStatusToBadge(order.status),
    canAccept: canDecide,
    canCancel: canDecide,
    trackingNumber: order.trackingNumber,
    statusUpdateLocked: statusLockMeta.locked,
    statusLockedReason: statusLockMeta.reason,
    statusHistory: order.statusHistory || [],
  };
};

const ManageOrders: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { status: statusParam, orderId } = useParams<{ status?: string; orderId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const lastQueryAppliedRef = useRef(searchParams.toString());
  const { showToast } = useToast();

  const resolvedStatusFromUrl = useMemo(() => {
    if (!statusParam) return DEFAULT_FILTER;
    const normalized = statusParam.toLowerCase();
    return SLUG_FILTER_MAP[normalized] || DEFAULT_FILTER;
  }, [statusParam]);

  const initialSearchValue = searchParams.get('q') || '';
  const initialDateValue = normalizeDateFilterValue(searchParams.get('date'));
  const initialPageValue = Number.parseInt(searchParams.get('page') || '1', 10);
  const safeInitialPage = Number.isNaN(initialPageValue) || initialPageValue < 1 ? 1 : initialPageValue;

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>(DEFAULT_STATS);
  const [currentPage, setCurrentPage] = useState(safeInitialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchTerm, setSearchTerm] = useState(initialSearchValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearchValue.trim());
  const [selectedDate, setSelectedDate] = useState(initialDateValue || DEFAULT_DATE_PRESET);
  const [activeFilter, setActiveFilter] = useState(resolvedStatusFromUrl);
  const [loading, setLoading] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentNoteDismissed, setPaymentNoteDismissed] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const ordersRequestRef = useRef<AbortController | null>(null);
  const orderCacheRef = useRef<Record<string, OrdersCacheEntry>>({});
  const orderDetailsRequestRef = useRef<AbortController | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);

  const normalizedOrderId = (orderId || '').trim();
  const resolvedOrderIdForDetails = useMemo(
    () => extractOrderIdFromPublicId(normalizedOrderId),
    [normalizedOrderId]
  );

  const currentStatusSlug = useMemo(
    () => FILTER_SLUG_MAP[resolvedStatusFromUrl] || DEFAULT_STATUS_SLUG,
    [resolvedStatusFromUrl]
  );

  useEffect(() => {
    const suffix = location.search || '';
    const orderSuffix = normalizedOrderId ? `/${encodeURIComponent(normalizedOrderId)}` : '';
    if (!statusParam) {
      navigate(`/seller/manage-orders/${DEFAULT_STATUS_SLUG}${orderSuffix}${suffix}`, { replace: true });
      return;
    }
    const normalized = statusParam.toLowerCase();
    if (!SLUG_FILTER_MAP[normalized]) {
      navigate(`/seller/manage-orders/${DEFAULT_STATUS_SLUG}${orderSuffix}${suffix}`, { replace: true });
    }
  }, [statusParam, normalizedOrderId, navigate, location.search]);

  useEffect(() => {
    if (activeFilter !== resolvedStatusFromUrl) {
      setActiveFilter(resolvedStatusFromUrl);
    }
  }, [resolvedStatusFromUrl, activeFilter]);

  useEffect(() => {
    const trimmed = searchTerm.trim();
    const timer = window.setTimeout(() => setDebouncedSearchTerm(trimmed), 350);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams();
    const trimmed = searchTerm.trim();
    if (trimmed) params.set('q', trimmed);
    if (selectedDate && selectedDate !== DEFAULT_DATE_PRESET) params.set('date', selectedDate);
    if (currentPage > 1) params.set('page', String(currentPage));
    const serialized = params.toString();
    if (serialized === lastQueryAppliedRef.current) return;
    lastQueryAppliedRef.current = serialized;
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedDate, currentPage, setSearchParams]);

  useEffect(() => {
    const serialized = searchParams.toString();
    if (serialized === lastQueryAppliedRef.current) {
      return;
    }
    lastQueryAppliedRef.current = serialized;
    const urlSearch = searchParams.get('q') || '';
    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
      setDebouncedSearchTerm(urlSearch.trim());
    }
    const urlDate = normalizeDateFilterValue(searchParams.get('date'));
    if (urlDate !== selectedDate) {
      setSelectedDate(urlDate);
    }
    const rawPage = Number.parseInt(searchParams.get('page') || '1', 10);
    const normalizedPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    if (normalizedPage !== currentPage) {
      setCurrentPage(normalizedPage);
    }
  }, [searchParams, searchTerm, selectedDate, currentPage]);

  useEffect(() => {
    return () => {
      ordersRequestRef.current?.abort();
      orderDetailsRequestRef.current?.abort();
    };
  }, []);

  const loadOrders = useCallback(async () => {
    setErrorMessage(null);
    const { startDate, endDate } = getDateRange(selectedDate);
    const filters: SellerOrderQuery = {
      searchTerm: debouncedSearchTerm || undefined,
      status: getStatusQuery(activeFilter),
      startDate,
      endDate,
      page: currentPage,
      limit: PAGE_SIZE,
    };

    const cacheKey = JSON.stringify({
      status: filters.status || 'all',
      search: filters.searchTerm || '',
      start: filters.startDate || '',
      end: filters.endDate || '',
      page: filters.page || 1,
      limit: filters.limit || PAGE_SIZE,
    });

    const cachedEntry = orderCacheRef.current[cacheKey];
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      setOrders(cachedEntry.orders);
      setTotalOrders(cachedEntry.total);
      setTotalPages(cachedEntry.totalPages);
      setStats(cachedEntry.stats || DEFAULT_STATS);
      setLoading(false);
      return;
    }

    setLoading(true);
    ordersRequestRef.current?.abort();
    const controller = new AbortController();
    ordersRequestRef.current = controller;

    try {
      const response = await fetchOrdersOverview(filters, { signal: controller.signal });
      const mappedOrders = response.items.map(mapOrderToTable);
      const safeTotalPages = Math.max(1, response.totalPages || 1);
      setOrders(mappedOrders);
      setTotalOrders(response.total);
      setTotalPages(safeTotalPages);
      setStats(response.stats || DEFAULT_STATS);
      orderCacheRef.current[cacheKey] = {
        orders: mappedOrders,
        total: response.total,
        totalPages: safeTotalPages,
        timestamp: Date.now(),
        stats: response.stats || DEFAULT_STATS,
      };
      const cacheEntries = Object.entries(orderCacheRef.current);
      if (cacheEntries.length > CACHE_LIMIT) {
        cacheEntries
          .sort((a, b) => a[1].timestamp - b[1].timestamp)
          .slice(0, cacheEntries.length - CACHE_LIMIT)
          .forEach(([key]) => delete orderCacheRef.current[key]);
      }
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') {
        return;
      }
      console.error('Error loading orders:', error);
      setErrorMessage('Unable to load orders right now. Please try again.');
      showToast({
        type: 'error',
        title: 'Orders not available',
        message: 'We could not load the latest orders. Please refresh.',
      });
    } finally {
      ordersRequestRef.current = null;
      setLoading(false);
      setInitialized(true);
    }
  }, [activeFilter, currentPage, debouncedSearchTerm, selectedDate, showToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleDateFilter = (filter: string) => {
    setSelectedDate(filter);
    setCurrentPage(1);
  };

  const handleStatusChange = (filter: string) => {
    if (filter === activeFilter || !FILTER_SLUG_MAP[filter]) {
      return;
    }
    setActiveFilter(filter);
    setCurrentPage(1);
    const slug = FILTER_SLUG_MAP[filter];
    const suffix = location.search || '';
    navigate(`/seller/manage-orders/${slug}${suffix}`, { replace: false });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to the table area when page changes
    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else {
        // Fallback to scrolling to top if ref not available
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleViewOrder = (orderIdentifier: string) => {
    if (!orderIdentifier) return;
    const slug = FILTER_SLUG_MAP[activeFilter] || DEFAULT_STATUS_SLUG;
    const suffix = location.search || '';
    // Support both orderNumber and id lookup (Daraz/Amazon style)
    const targetOrder = orders.find(
      (entry) => entry.orderNumber === orderIdentifier || entry.id === orderIdentifier
    );
    const publicId =
      targetOrder?.publicId ||
      buildOrderPublicId(targetOrder?.orderNumber || orderIdentifier, orderIdentifier);
    const encodedPublicId = encodeURIComponent(publicId || orderIdentifier);
    navigate(`/seller/manage-orders/${slug}/${encodedPublicId}${suffix}`, { replace: false });
  };

  const handleCloseOrderDetails = () => {
    const suffix = location.search || '';
    setSelectedOrderDetails(null);
    setDetailsLoading(false);
    navigate(`/seller/manage-orders/${currentStatusSlug}${suffix}`, { replace: false });
  };

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const pageRangeStart = totalOrders === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageRangeEnd = Math.min(currentPage * PAGE_SIZE, totalOrders);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedOrderDetails) {
      showToast({
        type: 'info',
        title: 'No order selected',
        message: 'Please select an order before updating status.',
      });
      return;
    }

    if (selectedOrderDetails.statusUpdateLocked) {
      showToast({
        type: 'warning',
        title: 'Status locked',
        message: selectedOrderDetails.statusLockedReason || 'This order cannot be updated after delivery payout.',
      });
      return;
    }

    setDecisionLoading(true);
    try {
      // Use orderNumber as primary identifier (Daraz/Amazon style)
      const orderIdentifier = selectedOrderDetails.orderNumber || selectedOrderDetails.id;
      if (!orderIdentifier) {
        throw new Error('Order identifier is missing');
      }
      console.log('Updating order status:', orderIdentifier, 'to:', status);
      await updateOrderStatus(orderIdentifier, {
        status: status as SellerOrderStatus,
      });
      const refreshed = await getOrderDetails(orderIdentifier);
      setSelectedOrderDetails(mapDetails(refreshed));
      loadOrders();
      showToast({
        type: 'success',
        title: 'Status updated',
        message: `Order status updated to ${status} successfully.`,
      });
    } catch (error: any) {
      console.error('Failed to update order status', error);
      const message = error?.response?.data?.message || error?.message || 'Unable to update order status right now.';
      showToast({
        type: 'error',
        title: 'Update failed',
        message,
      });
    } finally {
      setDecisionLoading(false);
    }
  };

  // Handle orderNumber from query parameter (for notifications - Daraz/Amazon style)
  useEffect(() => {
    const orderNumberFromQuery = searchParams.get('orderNumber');
    if (orderNumberFromQuery && !normalizedOrderId && initialized) {
      // Remove orderNumber from query params
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('orderNumber');
      const cleanSearch = newSearchParams.toString() ? `?${newSearchParams.toString()}` : '';
      
      // Try to find order in current list first
      const order = orders.find((o) => o.orderNumber === orderNumberFromQuery);
      if (order) {
        const orderIdentifier = order.orderNumber || order.id || orderNumberFromQuery;
        const publicId = order.publicId || buildOrderPublicId(order.orderNumber, orderIdentifier);
        const encodedPublicId = encodeURIComponent(publicId || orderNumberFromQuery);
        navigate(`/seller/manage-orders/${currentStatusSlug}/${encodedPublicId}${cleanSearch}`, { replace: true });
        return;
      }
      
      // Order not in current list, load it directly using orderNumber
      const controller = new AbortController();
      orderDetailsRequestRef.current = controller;
      setDetailsLoading(true);
      
      const loadDetails = async () => {
        try {
          const order = await getOrderDetails(orderNumberFromQuery, { signal: controller.signal });
          if (!controller.signal.aborted) {
            setSelectedOrderDetails(mapDetails(order));
            // Update URL to use path parameter (Daraz/Amazon style - use orderNumber)
            const orderIdentifier = order.orderNumber || order.id || orderNumberFromQuery;
            const publicId = buildOrderPublicId(order.orderNumber, orderIdentifier);
            const encodedPublicId = encodeURIComponent(publicId || orderNumberFromQuery);
            navigate(`/seller/manage-orders/${currentStatusSlug}/${encodedPublicId}${cleanSearch}`, { replace: true });
          }
        } catch (error) {
          if ((error as DOMException)?.name === 'AbortError') {
            return;
          }
          console.error('Error loading order details', error);
          showToast({
            type: 'error',
            title: 'Unable to open order',
            message: 'We could not load that order. Please try again.',
          });
          navigate(`/seller/manage-orders/${currentStatusSlug}${cleanSearch}`, { replace: true });
        } finally {
          if (!controller.signal.aborted) {
            setDetailsLoading(false);
          }
        }
      };
      
      loadDetails();
      return () => {
        controller.abort();
      };
    }
  }, [searchParams, normalizedOrderId, orders, currentStatusSlug, navigate, initialized, showToast]);

  useEffect(() => {
    if (!normalizedOrderId) {
      orderDetailsRequestRef.current?.abort();
      orderDetailsRequestRef.current = null;
      setSelectedOrderDetails(null);
      setDetailsLoading(false);
      return;
    }

    const controller = new AbortController();
    orderDetailsRequestRef.current = controller;
    setDetailsLoading(true);
    setSelectedOrderDetails(null);

    const effectiveOrderId = resolvedOrderIdForDetails || normalizedOrderId;

    const loadDetails = async () => {
      try {
        const order = await getOrderDetails(effectiveOrderId, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setSelectedOrderDetails(mapDetails(order));
        }
      } catch (error) {
        if ((error as DOMException)?.name === 'AbortError') {
          return;
        }
        console.error('Error loading order details', error);
        showToast({
          type: 'error',
          title: 'Unable to open order',
          message: 'We could not load that order. Please try again.',
        });
        navigate(`/seller/manage-orders/${currentStatusSlug}${location.search || ''}`, { replace: true });
      } finally {
        if (!controller.signal.aborted) {
          setDetailsLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      controller.abort();
    };
  }, [
    normalizedOrderId,
    resolvedOrderIdForDetails,
    showToast,
    navigate,
    currentStatusSlug,
    location.search,
  ]);

  const handleOrderDecision = useCallback(
    async (nextStatus: SellerOrderStatus, meta?: CancelOrderPayload) => {
      if (!selectedOrderDetails) {
        showToast({
          type: 'info',
          title: 'No order selected',
          message: 'Please select an order before performing this action.',
        });
        return;
      }
      setDecisionLoading(true);
      try {
        // Use orderNumber as primary identifier (Daraz/Amazon style)
        const orderIdentifier = selectedOrderDetails.orderNumber || selectedOrderDetails.id;
        if (!orderIdentifier) {
          throw new Error('Order identifier is missing');
        }
        await updateOrderStatus(orderIdentifier, {
          status: nextStatus,
          reason: meta?.reason,
          note: meta?.note,
        });
        const refreshed = await getOrderDetails(orderIdentifier);
        setSelectedOrderDetails(mapDetails(refreshed));
        loadOrders();
        showToast({
          type: 'success',
          title: nextStatus === 'cancelled' ? 'Order cancelled' : 'Order confirmed',
          message:
            nextStatus === 'cancelled'
              ? 'The buyer has been notified about the cancellation.'
              : 'You can now prepare this order for shipment.',
        });
      } catch (error: any) {
        console.error('Failed to update order status', error);
        const message = error?.response?.data?.message || error?.message || 'Unable to update order right now.';
        showToast({
          type: 'error',
          title: 'Action failed',
          message,
        });
      } finally {
        setDecisionLoading(false);
      }
    },
    [selectedOrderDetails, loadOrders, showToast]
  );

  const handleAcceptOrder = useCallback(() => handleOrderDecision('confirmed'), [handleOrderDecision]);

  const handleCancelOrder = useCallback(
    (payload: CancelOrderPayload) => handleOrderDecision('cancelled', payload),
    [handleOrderDecision]
  );

  if (normalizedOrderId) {
    if (
      detailsLoading ||
      !selectedOrderDetails ||
      selectedOrderDetails.id !== (resolvedOrderIdForDetails || normalizedOrderId)
    ) {
      return (
        <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
          <div className="w-full py-16 text-center text-gray-500">Loading order details…</div>
        </SellerScaffold>
      );
    }

    return (
      <OrderDetailsWrapper
        orderDetails={selectedOrderDetails}
        onUpdateStatus={handleUpdateStatus}
        onAcceptOrder={handleAcceptOrder}
        onCancelOrder={handleCancelOrder}
        decisionLoading={decisionLoading}
        onBack={handleCloseOrderDetails}
      />
    );
  }

  if (!initialized && loading) {
    return (
      <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
        <div className="w-full py-16 text-center text-gray-500">Loading orders…</div>
      </SellerScaffold>
    );
  }

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      <div className="w-full">
        <div className="mb-8 md:py-0 py-3">
          <h1 className="text-[28px] font-bold text-black mb-4 md:text-[40px]">Manage orders</h1>
          <div className="bg-green-50 rounded-[25px] inline-block px-3 py-1">
            <p className="text-[18px] font-medium text-black md:text-[25px]">
              Today, {todayLabel}
            </p>
          </div>
        </div>

        {!paymentNoteDismissed && (
          <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm text-yellow-900 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">Online payments pending gateway keys</p>
              <p className="text-xs md:text-sm text-yellow-800">
                We have wired orders to your dashboard right away. Until you add your JazzCash, EasyPaisa
                or card gateway keys, every prepaid order will show payment status&nbsp;
                <strong>PENDING</strong>. Once keys are configured under Seller Settings → Payments,
                updates will flow automatically.
              </p>
            </div>
            <button
              onClick={() => setPaymentNoteDismissed(true)}
              className="text-xs font-semibold text-yellow-900 hover:text-yellow-700"
            >
              Dismiss
            </button>
          </div>
        )}

        <OrderStatsCards stats={stats} />

        <div
          ref={tableContainerRef}
          className="bg-white rounded-[25px] border border-gray-200 shadow-lg mt-8 p-8"
        >
          <OrderFilters
            searchTerm={searchTerm}
            selectedDate={selectedDate}
            onSearch={handleSearch}
            onDateFilter={handleDateFilter}
            onStatusChange={handleStatusChange}
            activeFilter={activeFilter}
            isLoading={loading}
          />

          {activeFilter === 'Processing' ? (
            <ProcessingOrdersTable
              orders={orders}
              onViewOrder={handleViewOrder}
              loading={loading}
            />
          ) : activeFilter === 'Canceled/Returned' ? (
            <CanceledReturnedOrdersTable
              orders={orders}
              onViewOrder={handleViewOrder}
              loading={loading}
            />
          ) : (
            <OrdersTable
              orders={orders}
              onViewOrder={handleViewOrder}
              loading={loading}
            />
          )}

          {errorMessage && (
            <p className="mt-4 text-sm text-red-500">{errorMessage}</p>
          )}

          <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center mt-8">
            <p className="text-[15px] font-medium text-black">
              Showing {totalOrders === 0 ? 0 : `${pageRangeStart}-${pageRangeEnd}`} of {totalOrders}{' '}
              {activeFilter.toLowerCase()}
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </SellerScaffold>
  );
};

export default ManageOrders;