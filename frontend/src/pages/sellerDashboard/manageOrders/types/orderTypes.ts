export interface Order {
  id: string;
  customer: string;
  product: string;
  photo: string;
  date: string;
  payment: string;
  amount: string;
  status: 'new' | 'processing' | 'completed' | 'canceled';
  // Additional fields for detailed view
  customerName?: string;
  address?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  orderDate?: string;
  shippingCharges?: string;
  productName?: string;
  unitPrice?: string;
  quantity?: number;
  platformCommission?: string;
  discount?: string;
  sellerPayout?: string;
  // Return/Canceled specific
  returnReason?: string;
}

export interface OrderDetails {
  id: string;
  customerName: string;
  address: string;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;
  shippingCharges: string;
  productName: string;
  unitPrice: string;
  quantity: number;
  platformCommission: string;
  discount: string;
  sellerPayout: string;
  productImage?: string;
  // Return/Cancellation specific (for Canceled/Returned flow)
  isReturned?: boolean;
  isCanceled?: boolean;
  returnReason?: string;
}

export interface OrderStats {
  newOrders: number;
  processing: number;
  completed: number;
  canceled: number;
}

export interface OrderFilters {
  searchTerm: string;
  selectedDate: string;
  status?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface OrderTableProps {
  orders: Order[];
  onViewOrder: (orderId: string) => void;
  loading: boolean;
}

export interface OrderStatsCardsProps {
  stats: OrderStats;
}

export interface OrderFiltersProps {
  searchTerm: string;
  selectedDate: string;
  onSearch: (term: string) => void;
  onDateFilter: (date: string) => void;
  activeFilter?: string;
}
