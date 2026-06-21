import api from './api';
import {
  BalanceOverview,
  EarningEntry,
  PaginatedResult,
  WithdrawalHistoryItem,
  WithdrawalRequestPayload,
  PaymentsOverviewResponse,
} from '../pages/sellerDashboard/managePayments/types';

const PAYMENTS_BASE = '/api/payments';

type PaginationParams = {
  page?: number;
  pageSize?: number;
};

type OverviewParams = {
  earningsPage?: number;
  earningsPageSize?: number;
  withdrawalsPage?: number;
  withdrawalsPageSize?: number;
};

function buildQuery(params?: Record<string, number | string | undefined>) {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.append(key, String(value));
  });
  const queryString = search.toString();
  return queryString ? `?${queryString}` : '';
}

export async function getBalanceOverview(): Promise<BalanceOverview> {
  return api.get<BalanceOverview>(`${PAYMENTS_BASE}/balance-overview`);
}

export async function getEarningsSummary(params?: PaginationParams): Promise<PaginatedResult<EarningEntry>> {
  return api.get<PaginatedResult<EarningEntry>>(`${PAYMENTS_BASE}/earnings${buildQuery(params)}`);
}

export async function getWithdrawalHistory(
  params?: PaginationParams,
): Promise<PaginatedResult<WithdrawalHistoryItem>> {
  return api.get<PaginatedResult<WithdrawalHistoryItem>>(`${PAYMENTS_BASE}/withdrawals${buildQuery(params)}`);
}

export async function createWithdrawalRequest(
  payload: WithdrawalRequestPayload,
): Promise<{ success: boolean }> {
  return api.post<{ success: boolean }>(`${PAYMENTS_BASE}/withdrawals`, payload);
}

export async function getPaymentsOverview(
  params?: OverviewParams,
  options?: { etag?: string },
): Promise<{ data: PaymentsOverviewResponse | null; status: number; headers: Record<string, string> }> {
  const headers: HeadersInit = {};
  if (options?.etag) {
    headers['If-None-Match'] = options.etag;
  }

  return api.getWithMeta<PaymentsOverviewResponse>(`${PAYMENTS_BASE}/overview${buildQuery(params)}`, {
    headers,
  });
}

