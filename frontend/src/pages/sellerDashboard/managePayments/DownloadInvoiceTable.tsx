import React, { useEffect, useMemo, useRef, useState } from 'react';
import { InvoiceRow } from './types';

type Props = {
  title?: string;
  rows: InvoiceRow[];
  initialCount?: number;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
};

function downloadRowAsCsv(row: InvoiceRow) {
  const headers = ['Order ID', 'Date', 'Product', 'Amount (PKR)'];
  const values = [row.orderId, row.date, row.product, String(row.amount)];
  const csv = `${headers.join(',')}\n${values.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${row.orderId}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function handleDownload(row: InvoiceRow) {
  if (row.downloadUrl) {
    window.open(row.downloadUrl, '_blank', 'noopener,noreferrer');
    return;
  }
  downloadRowAsCsv(row);
}

export default function DownloadInvoiceTable({
  title = 'Download Invoice',
  rows,
  initialCount = 6,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: Props) {
  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const prevRowsLengthRef = useRef(safeRows.length);
  const displayRows = safeRows.slice(0, visibleCount);
  const hasLocalMore = visibleCount < safeRows.length;
  const canLoadMore = hasLocalMore || hasMore || loadingMore;
  const disableLoadMore = loadingMore && !hasLocalMore;
  const loadMoreLabel = disableLoadMore ? 'Loading…' : 'View more';

  useEffect(() => {
    // Only reset visibleCount if:
    // 1. initialCount changed, OR
    // 2. rows length decreased (data was cleared/reloaded), OR
    // 3. rows length is 0 (initial load with no data)
    // Do NOT reset when rows length increases (new data loaded)
    const prevLength = prevRowsLengthRef.current;
    if (safeRows.length === 0 || safeRows.length < prevLength) {
      setVisibleCount(initialCount);
    }
    prevRowsLengthRef.current = safeRows.length;
  }, [initialCount, safeRows.length]);

  const handleLoadMore = () => {
    if (hasLocalMore) {
      setVisibleCount((count) => Math.min(count + initialCount, safeRows.length));
      return;
    }
    if (onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <div className=" p-4 rounded-[15px]">
      <h3 className="text-lg font-bold mb-8 md:text-[35px]">{title}</h3>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="hidden md:grid md:grid-cols-5 text-sm text-gray-700 font-medium px-2 py-2 border-b">
          <div>Order ID</div>
          <div>Date</div>
          <div>Product</div>
          <div>Amount</div>
          <div className="text-right ">Download Invoice</div>
        </div>
        <div className="divide-y">
          {displayRows.map((r) => (
            <div key={`${r.orderId}-${r.date}`} className="px-2 py-3 hover:bg-[#F7FFFA] transition">
              {/* Desktop layout */}
              <div className="hidden md:grid md:grid-cols-5 items-center text-sm">
                <a className="text-[#22C55E] hover:underline" href="#">{r.orderId}</a>
                <div className="text-gray-700">{r.date}</div>
                <div className="text-gray-700 truncate" title={r.product}>{r.product}</div>
                <div className="text-gray-700">{`PKR ${r.amount.toLocaleString()}`}</div>
                <div className="text-right">
                  <button
                    onClick={() => handleDownload(r)}
                    className="inline-flex items-center px-3 py-1.5 bg-[#22C55E] text-white rounded-full text-xs hover:brightness-95"
                  >
                    Download Invoice
                  </button>
                </div>
              </div>
              {/* Mobile stacked layout */}
              <div className="grid grid-cols-1 gap-1 md:hidden text-sm">
                <div className="flex justify-between">
                  <a className="text-[#22C55E] hover:underline" href="#">{r.orderId}</a>
                  <div className="text-gray-700">{r.date}</div>
                </div>
                <div className="text-gray-700 truncate" title={r.product}>{r.product}</div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-700">{`PKR ${r.amount.toLocaleString()}`}</div>
                  <button
                    onClick={() => handleDownload(r)}
                    className="inline-flex items-center px-3 py-1.5 bg-[#22C55E] text-white rounded-full text-xs hover:brightness-95"
                  >
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!displayRows.length && (
            <div className="text-center text-[#949494] py-6 text-sm">No invoices available yet.</div>
          )}
        </div>
        {canLoadMore && (
          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={disableLoadMore}
              className={`text-[#00C853] text-sm font-semibold hover:underline ${
                disableLoadMore ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {loadMoreLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


