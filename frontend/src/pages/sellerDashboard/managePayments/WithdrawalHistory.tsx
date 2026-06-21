import React from 'react';
import { WithdrawalHistoryItem } from './types';

type WithdrawalHistoryProps = {
  items: WithdrawalHistoryItem[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
};

function formatCurrency(amount: number) {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusBadge(status?: string) {
  switch ((status || '').toLowerCase()) {
    case 'completed':
      return { label: 'Completed', className: 'text-[#00C853] bg-[#E8FFF2]' };
    case 'processing':
      return { label: 'Processing', className: 'text-[#2563EB] bg-[#E0ECFF]' };
    case 'failed':
    case 'cancelled':
      return { label: 'Failed', className: 'text-[#DC2626] bg-[#FEE2E2]' };
    default:
      return { label: 'Pending', className: 'text-[#FF8A00] bg-[#FFF4E5]' };
  }
}

export default function WithdrawalHistory({
  items,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: WithdrawalHistoryProps) {
  const rows = Array.isArray(items) ? items : [];

  return (
    <div className="bg-white rounded-[15px] border border-[#E0E0E0] shadow-[2px_3px_4px_rgba(46,204,113,0.1)] p-4 space-y-4">
      <h3 className="text-[15px] font-semibold mb-4">Withdrawal History</h3>
      <div className="hidden md:grid grid-cols-[1.2fr_1fr_0.9fr_1fr_1fr] text-[12px] text-[#595959] mb-2">
        <div>Request ID</div>
        <div>Amount</div>
        <div>Method</div>
        <div>Status</div>
        <div>Date</div>
      </div>
      <div className="space-y-4 text-[12px]">
        {rows.map((row) => {
          const badge = statusBadge(row.status);
          return (
            <div
              key={row.requestId}
              className="grid grid-cols-1 gap-2 border border-[#F0F0F0] rounded-lg p-3 md:grid-cols-[1.2fr_1fr_0.9fr_1fr_1fr]"
            >
              <div className="text-[#2e2e2e] font-semibold">{row.requestId}</div>
              <div className="text-[#00C853] font-semibold">{formatCurrency(row.amount)}</div>
              <div className="text-[#6C6C6C]">{row.method || '—'}</div>
              <div>
                <span className={`px-2 py-1 rounded ${badge.className}`}>{badge.label}</span>
              </div>
              <div className="text-[#6C6C6C]">{formatDate(row.date)}</div>
            </div>
          );
        })}
        {!rows.length && <div className="text-center text-[#9E9E9E] py-4">No withdrawals yet.</div>}
      </div>
      {(hasMore || loadingMore) && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className={`text-[#00C853] text-[12px] font-semibold hover:underline ${loadingMore ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loadingMore ? 'Loading…' : 'View more'}
          </button>
        </div>
      )}
    </div>
  );
}


