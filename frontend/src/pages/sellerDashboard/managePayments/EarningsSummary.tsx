import React, { useEffect, useMemo, useState } from 'react';
import { EarningEntry } from './types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const currencyFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
});

const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
});

const monthFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: '2-digit',
});

type RangeKey = 'daily' | 'weekly' | 'monthly' | 'custom';
const PAGE_SIZE = 6;

type EarningsSummaryProps = {
  title?: string;
  items: EarningEntry[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function parseDate(dateString: string): Date | null {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return 'PKR 0';
  return currencyFormatter.format(Math.max(0, Math.round(value)));
}

function formatDisplayDate(dateString: string) {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return shortDateFormatter.format(parsed);
}

function buildMonthlyData(items: EarningEntry[]) {
  const map = new Map<
    string,
    {
      name: string;
      value: number;
      sortKey: number;
    }
  >();

  items.forEach((item) => {
    const parsed = new Date(item.date);
    if (Number.isNaN(parsed.getTime())) return;
    const key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
    const bucket = map.get(key);
    const timestamp = Date.UTC(parsed.getFullYear(), parsed.getMonth(), 1);

    if (bucket) {
      bucket.value += item.amount;
    } else {
      map.set(key, {
        name: monthFormatter.format(parsed),
        value: item.amount,
        sortKey: timestamp,
      });
    }
  });

  // Pad to last 6 months so chart always has multiple bars (like Amazon/Daraz)
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!map.has(key)) {
      map.set(key, {
        name: monthFormatter.format(date),
        value: 0,
        sortKey: Date.UTC(date.getFullYear(), date.getMonth(), 1),
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
}

function classifyStatus(status?: EarningEntry['status']) {
  switch (status) {
    case 'Pending':
      return { label: 'Pending', className: 'text-[#FF8A00] bg-[#FFF3E5]' };
    case 'Processing':
      return { label: 'Processing', className: 'text-[#2563EB] bg-[#E0ECFF]' };
    case 'Failed':
      return { label: 'Failed', className: 'text-[#DC2626] bg-[#FEE2E2]' };
    default:
      return { label: 'Paid', className: 'text-[#00C853] bg-[#E8FFF2]' };
  }
}

export default function EarningsSummary({
  title = 'Earnings Summary',
  items,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: EarningsSummaryProps) {
  const tabs: { label: string; value: RangeKey }[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Custom range', value: 'custom' },
  ];

  const [activeRange, setActiveRange] = useState<RangeKey>('daily');
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const safeItems = useMemo(
    () =>
      Array.isArray(items)
        ? items.filter((entry): entry is EarningEntry => Boolean(entry && (entry.orderNumber || entry.id) && entry.date))
        : [],
    [items],
  );

  const customRangeError = useMemo(() => {
    if (activeRange !== 'custom' || !customRange.start || !customRange.end) return '';
    const start = parseDate(customRange.start);
    const end = parseDate(customRange.end);
    if (!start || !end) return '';
    if (start > end) return 'Start date must be before end date.';
    return '';
  }, [activeRange, customRange]);

  const filteredItems = useMemo(() => {
    const now = new Date();
    let rangeStart: Date | null = null;
    let rangeEnd: Date | null = endOfDay(now);

    if (safeItems.length === 0) return safeItems;

    if (activeRange === 'daily') {
      rangeStart = startOfDay(now);
    } else if (activeRange === 'weekly') {
      const start = startOfDay(new Date(now));
      start.setDate(start.getDate() - 6);
      rangeStart = start;
    } else if (activeRange === 'monthly') {
      const start = startOfDay(new Date(now));
      start.setDate(start.getDate() - 29);
      rangeStart = start;
    } else if (activeRange === 'custom') {
      if (!customRange.start || !customRange.end || customRangeError) {
        return [];
      }
      const start = parseDate(customRange.start);
      const end = parseDate(customRange.end);
      if (!start || !end) {
        return [];
      }
      rangeStart = startOfDay(start);
      rangeEnd = endOfDay(end);
    }

    if (!rangeStart) return safeItems;

    return safeItems.filter((item) => {
      const parsed = parseDate(item.date);
      if (!parsed) return false;
      return parsed >= rangeStart! && parsed <= rangeEnd!;
    });
  }, [safeItems, activeRange, customRange]);

  const totalSales = filteredItems.reduce((sum, item) => sum + (item?.amount || 0), 0);
  const pendingEarnings = filteredItems.reduce((sum, item) => {
    if (!item) return sum;
    const isPending = item.status && item.status !== 'Paid';
    return isPending ? sum + item.amount : sum;
  }, 0);
  const completedSales = Math.max(totalSales - pendingEarnings, 0);

  const summaryCards = [
    { label: 'Total Sales', value: formatCurrency(totalSales) },
    { label: 'Completed Sales', value: formatCurrency(completedSales) },
    { label: 'Pending Earnings', value: formatCurrency(pendingEarnings) },
  ];

  const monthlyData = buildMonthlyData(filteredItems);
  const chartMaxValue = monthlyData.reduce((max, entry) => Math.max(max, entry.value), 0);
  const yAxisCeil = chartMaxValue > 0 ? Math.ceil(chartMaxValue * 1.2) : 1000;

  const orderedItems = useMemo(
    () =>
      filteredItems
        .map((item) => {
          const timestamp = Date.parse(item.date);
          return { ...item, timestamp: Number.isNaN(timestamp) ? 0 : timestamp };
        })
        .sort((a, b) => b.timestamp - a.timestamp),
    [filteredItems],
  );
  const recentOrders = useMemo(() => orderedItems.slice(0, visibleCount), [orderedItems, visibleCount]);
  const hasLocalMore = visibleCount < orderedItems.length;
  const canLoadMore = hasLocalMore || hasMore || loadingMore;
  const disableLoadMore = loadingMore && !hasLocalMore;
  const loadMoreLabel = disableLoadMore ? 'Loading…' : 'View more orders';

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeRange, customRange.start, customRange.end]);

  const handleLoadMore = () => {
    if (hasLocalMore) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, orderedItems.length));
      return;
    }
    if (onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <div className="bg-[white] rounded-xl shadow-sm p-6">
      <div className="mb-4">
        <div className="flex md:gap-6 gap-4 border-b">
          {tabs.map((tab) => {
            const isActive = tab.value === activeRange;
            return (
            <button
                key={tab.value}
                type="button"
                onClick={() => setActiveRange(tab.value)}
                className={`py-2 text-[14px] md:text-[22px] whitespace-nowrap ${
                  isActive
                    ? '-mb-px border-b-2 border-[#00C853] text-[#00C853] font-semibold'
                    : 'text-[#595959]'
                }`}
              >
                {tab.label}
            </button>
            );
          })}
        </div>
        {activeRange === 'custom' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col text-sm text-[#595959]">
              <span className="mb-1 font-medium">Start date</span>
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00C853] bg-white"
              />
            </label>
            <label className="flex flex-col text-sm text-[#595959]">
              <span className="mb-1 font-medium">End date</span>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00C853] bg-white"
              />
            </label>
            <div className="flex items-end text-xs text-[#949494]">
              Select start & end dates to view earnings within that window.
            </div>
            {customRangeError && (
              <div className="md:col-span-3 text-xs text-[#DC2626]">{customRangeError}</div>
            )}
          </div>
        )}
      </div>

      {/* Desktop: grid, Mobile: stacked cards */}
      <div>
        {/* Desktop view */}
        <div className="hidden md:grid grid-cols-3 md:gap-4 gap-2 mb-6">
          {summaryCards.map((s, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3">
              <div className="text-[#595959]">{s.label}</div>
              <div className="text-[#00C853] font-semibold text-lg">{s.value}</div>
            </div>
          ))}
        </div>
        {/* Mobile view */}
        <div className="md:hidden flex flex-col gap-3 mb-6">
          {summaryCards.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm border"
            >
              <div className="text-[#595959] text-[15px]">{s.label}</div>
              <div className="text-[#00C853] font-semibold text-[16px]">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Bar Chart */}
      <div className="h-64 bg-white rounded-lg p-4 mb-6 hidden md:block">
        {monthlyData.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
            <XAxis dataKey="name" />
              <YAxis domain={[0, yAxisCeil]} />
            <Tooltip />
            <Bar dataKey="value" fill="#00C853" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-[#949494]">
            No earnings data available yet.
          </div>
        )}
      </div>
      {/* Mobile Bar Chart */}
      <div className="md:hidden bg-white rounded-lg p-2 mb-6 flex flex-col items-center">
        {monthlyData.length ? (
          <>
        <div className="w-full" style={{ minHeight: 220 }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={monthlyData}
              margin={{ top: 8, right: 0, left: -20, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid stroke="#F3F3F3" strokeDasharray="2 2" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, yAxisCeil]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  fontSize: 13,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                }}
                labelStyle={{ fontWeight: 500, color: '#00C853' }}
              />
              <Bar dataKey="value" fill="#00C853" radius={[6, 6, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full flex justify-between mt-2 px-1 text-xs text-[#595959]">
          <span>Min: 0</span>
              <span>{`Max: ${formatCurrency(yAxisCeil)}`}</span>
            </div>
          </>
        ) : (
          <div className="w-full h-[220px] flex items-center justify-center text-[#949494] text-sm">
            No earnings data available yet.
        </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="bg-white rounded-lg overflow-hidden hidden md:block">
        <div className="grid grid-cols-5 text-sm text-[#595959] font-medium px-4 py-3 border-b">
          <div>Order ID</div>
          <div>Date</div>
          <div>Product</div>
          <div>Amount</div>
          <div>Status</div>
        </div>
        <div className="divide-y">
          {recentOrders.length === 0 ? (
            <div className="px-4 py-6 text-center text-[#949494]">
              No earnings found for this range.
            </div>
          ) : (
            recentOrders.map((order) => {
              const { label: statusLabel, className: statusClass } = classifyStatus(order.status);
              // Use orderNumber as primary identifier (Daraz/Amazon style)
              const orderId = order.orderNumber || order.orderId || order.id || '—';
              const product = order.productName || order.label;
              // Use orderNumber as key, fallback to date+amount for uniqueness
              const rowKey = order.orderNumber || `${order.date}-${order.amount}`;

              return (
                <div
                  key={rowKey}
                  className="grid grid-cols-5 px-4 py-3 text-sm hover:bg-[#F7FFFA] transition"
                >
                  <div className="text-[#00C853]">{orderId}</div>
                  <div>{formatDisplayDate(order.date)}</div>
                  <div className="truncate">{product}</div>
                  <div>{formatCurrency(order.amount)}</div>
                  <div>
                    <span className={`${statusClass} px-2 py-1 rounded`}>{statusLabel}</span>
              </div>
            </div>
              );
            })
          )}
        </div>
      </div>
      {canLoadMore && (
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={disableLoadMore}
            className={`text-[#00C853] text-[12px] font-semibold hover:underline ${
              disableLoadMore ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {loadMoreLabel}
          </button>
        </div>
      )}
      {/* Mobile Card List */}
      <div className="md:hidden bg-white rounded-lg overflow-hidden flex flex-col gap-3">
        {recentOrders.length === 0 ? (
          <div className="text-center text-[#949494] py-8">No earnings found for this range.</div>
        ) : (
          recentOrders.map((order) => {
            const { label: statusLabel, className: statusClass } = classifyStatus(order.status);
            // Use orderNumber as primary identifier (Daraz/Amazon style)
            const orderId = order.orderNumber || order.orderId || order.id || '—';
            const product = order.productName || order.label;
            // Use orderNumber as key, fallback to date+amount for uniqueness
            const rowKey = order.orderNumber || `${order.date}-${order.amount}`;

            return (
              <div
                key={rowKey}
                className="flex flex-col bg-[#F7FFFA] rounded-xl shadow-sm px-4 py-3 mb-1 border border-[#E8FFF2] transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#00C853] font-semibold text-base">{orderId}</span>
                  <span className={`${statusClass} px-2 py-1 rounded text-xs font-medium`}>{statusLabel}</span>
                </div>
                <div className="flex flex-col gap-1 text-[14px] text-[#595959]">
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{formatDisplayDate(order.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Product:</span>
                    <span className="truncate max-w-[140px] text-right">{product}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span className="text-[#00C853] font-semibold">{formatCurrency(order.amount)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {canLoadMore && (
        <div className="pt-4 flex justify-center md:hidden">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={disableLoadMore}
            className={`text-[#00C853] text-[12px] font-semibold hover:underline ${
              disableLoadMore ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {loadMoreLabel}
          </button>
        </div>
      )}
    </div>
  );
}


