import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import BalanceOverview from './BalanceOverview';
import EarningsSummary from './EarningsSummary';
import WithdrawalHistory from './WithdrawalHistory';
import WithdrawalRequestCard from './WithdrawalRequestCard';
import {
  EarningEntry,
  WithdrawalHistoryItem,
  BalanceOverview as BalanceOverviewType,
  WithdrawalRequestPayload,
  InvoiceRow,
  PaginatedResult,
} from './types';
import * as paymentService from '../../../services/paymentService';
import DownloadInvoiceTable from './DownloadInvoiceTable';

const EARNINGS_PAGE_SIZE = 12;
const WITHDRAWALS_PAGE_SIZE = 5;

const ManagePayments: React.FC = () => {
  const [balances, setBalances] = useState<BalanceOverviewType | null>(null);
  const [earnings, setEarnings] = useState<EarningEntry[]>([]);
  const [earningsMeta, setEarningsMeta] = useState<PaginatedResult<EarningEntry> | null>(null);
  const [history, setHistory] = useState<WithdrawalHistoryItem[]>([]);
  const [historyMeta, setHistoryMeta] = useState<PaginatedResult<WithdrawalHistoryItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const overviewEtagRef = useRef<string | null>(null);
  const [loadingMoreEarnings, setLoadingMoreEarnings] = useState(false);
  const [loadingMoreWithdrawals, setLoadingMoreWithdrawals] = useState(false);

  const loadData = useCallback(
    async (options?: {
      force?: boolean;
      earningsPage?: number;
      withdrawalsPage?: number;
    }) => {
      const earningsPage = options?.earningsPage ?? 1;
      const withdrawalsPage = options?.withdrawalsPage ?? 1;

      try {
        setLoading(true);
        setError(null);
        const response = await paymentService.getPaymentsOverview(
          {
            earningsPage,
            earningsPageSize: EARNINGS_PAGE_SIZE,
            withdrawalsPage,
            withdrawalsPageSize: WITHDRAWALS_PAGE_SIZE,
          },
          {
            etag: options?.force ? undefined : overviewEtagRef.current || undefined,
          },
        );

        if (response.status === 304) {
          return;
        }

        if (!response.data) {
          return;
        }

        setBalances(response.data.balance);
        setEarnings(response.data.earnings.items);
        setEarningsMeta(response.data.earnings);
        setHistory(response.data.withdrawals.items);
        setHistoryMeta(response.data.withdrawals);

        const etagHeader = response.headers.etag;
        if (etagHeader) {
          overviewEtagRef.current = etagHeader.replace(/"/g, '');
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.error || err?.message || 'Unable to load payment information right now.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleLoadMoreEarnings = useCallback(async () => {
    if (!earningsMeta || earningsMeta.page >= earningsMeta.totalPages) return;
    setLoadingMoreEarnings(true);
    try {
      const nextPage = earningsMeta.page + 1;
      const next = await paymentService.getEarningsSummary({
        page: nextPage,
        pageSize: earningsMeta.pageSize,
      });
      setEarningsMeta(next);
      setEarnings((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const appended = next.items.filter((item) => !existingIds.has(item.id));
        return [...prev, ...appended];
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || 'Unable to load additional earnings right now.';
      setError(message);
    } finally {
      setLoadingMoreEarnings(false);
    }
  }, [earningsMeta]);

  const handleLoadMoreWithdrawals = useCallback(async () => {
    if (!historyMeta || historyMeta.page >= historyMeta.totalPages) return;
    setLoadingMoreWithdrawals(true);
    try {
      const nextPage = historyMeta.page + 1;
      const next = await paymentService.getWithdrawalHistory({
        page: nextPage,
        pageSize: historyMeta.pageSize,
      });
      setHistoryMeta(next);
      setHistory((prev) => {
        const existingIds = new Set(prev.map((item) => item.requestId));
        const appended = next.items.filter((item) => !existingIds.has(item.requestId));
        return [...prev, ...appended];
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || 'Unable to load additional withdrawals right now.';
      setError(message);
    } finally {
      setLoadingMoreWithdrawals(false);
    }
  }, [historyMeta]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const invoiceRows: InvoiceRow[] = useMemo(() => {
    if (!earnings?.length) return [];
    return earnings.map((entry) => {
      const date = entry.date ? new Date(entry.date) : null;
      return {
        orderId: entry.orderNumber || entry.orderId || entry.id || '—', // Use orderNumber as primary identifier (Daraz/Amazon style)
        date: date
          ? date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—',
        product: entry.productName || entry.label || 'Order earnings',
        amount: entry.amount || 0,
      };
    });
  }, [earnings]);

  const handleWithdrawalRequest = async (payload: WithdrawalRequestPayload) => {
    try {
      const res = await paymentService.createWithdrawalRequest(payload);
      if (res.success) {
        await loadData({ force: true });
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Unable to submit withdrawal request right now.';
      setError(message);
    }
  };

  if (loading && !balances) {
    return (
      <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
        <div className="py-12 text-center text-[#6C6C6C] text-[14px]">Loading payout data…</div>
      </SellerScaffold>
    );
  }

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      <h1 className="md:text-[40px] text-[24px]  font-bold text-black text-left w-full">Manage Payments</h1>

      {error && (
        <div className="bg-[#FFF4E5] border border-[#FFC38B] text-[#8B4800] px-4 py-3 rounded-[10px] text-[13px]">
          {error}
        </div>
      )}

      <div className="w-full flex flex-col gap-6">
        <div>
          <h2 className="md:text-[35px] text-[16px] font-medium text-black">Wallet / Balance Overview</h2>
          <div className="mt-3">
            <BalanceOverview
              currentWalletBalance={balances?.currentWalletBalance || 0}
              availableToWithdraw={balances?.availableToWithdraw || 0}
              pendingEarnings={balances?.pendingEarnings || 0}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div>
            <EarningsSummary
              items={earnings}
              hasMore={Boolean(earningsMeta && earningsMeta.page < earningsMeta.totalPages)}
              onLoadMore={handleLoadMoreEarnings}
              loadingMore={loadingMoreEarnings}
            />
          </div>
          <div className="space-y-6">
            <WithdrawalRequestCard onSubmit={handleWithdrawalRequest} />
            <WithdrawalHistory
              items={history}
              hasMore={Boolean(historyMeta && historyMeta.page < historyMeta.totalPages)}
              onLoadMore={handleLoadMoreWithdrawals}
              loadingMore={loadingMoreWithdrawals}
            />
          </div>
        </div>

        <div>
          <DownloadInvoiceTable
            rows={invoiceRows}
            initialCount={6}
            hasMore={Boolean(earningsMeta && earningsMeta.page < earningsMeta.totalPages)}
            onLoadMore={handleLoadMoreEarnings}
            loadingMore={loadingMoreEarnings}
          />
        </div>
      </div>
    </SellerScaffold>
  );
};

export default ManagePayments;




