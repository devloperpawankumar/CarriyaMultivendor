export type BalanceOverview = {
  currentWalletBalance: number;
  availableToWithdraw: number;
  pendingEarnings: number;
  minimumWithdrawal?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type EarningStatus = 'Paid' | 'Pending' | 'Processing' | 'Failed';

export type EarningEntry = {
  id?: string; // Deprecated - use orderNumber instead (Daraz/Amazon style)
  orderNumber: string; // Primary identifier (Daraz/Amazon style)
  orderId?: string; // Deprecated - use orderNumber instead
  label: string;
  amount: number;
  date: string; // ISO date
  productName?: string;
  status?: EarningStatus;
};

export type WithdrawalHistoryItem = {
  requestId: string;
  amount: number;
  date: string; // ISO date
  method?: string;
  status?: string;
  processedAt?: string | null;
  completedAt?: string | null;
};

export type WithdrawalRequestPayload = {
  amount: number;
  method: 'Bank' | 'JazzCash' | 'Easypaisa' | 'COD';
  note?: string;
};

export type InvoiceRow = {
  orderId: string;
  date: string;
  product: string;
  amount: number;
  downloadUrl?: string;
};

export type PaymentsOverviewResponse = {
  balance: BalanceOverview;
  earnings: PaginatedResult<EarningEntry>;
  withdrawals: PaginatedResult<WithdrawalHistoryItem>;
};


