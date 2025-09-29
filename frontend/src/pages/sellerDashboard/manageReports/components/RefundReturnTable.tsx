import React from 'react';
import { RefundReturnRow } from '../types/reportTypes';

type Props = { rows: RefundReturnRow[] };

const RefundReturnTable: React.FC<Props> = ({ rows }) => {
  return (
    <div className="bg-white rounded-[20px] border border-gray-100 shadow">
      <div className="p-3">
        <div className="text-[18px] md:text-[20px] font-semibold text-[#05004E] mb-3 md:mb-4">Refund / Return Rate</div>
        <div className="h-px bg-[#EDF2F6]" />
      </div>

      {/* Mobile table: compact grid, no horizontal scroll */}
      <div className="md:hidden px-3 pb-4 space-y-4">
        <div className="grid text-[#96A5B8] text-[11px]" style={{ gridTemplateColumns: '24px 1fr 60px 60px 70px' }}>
          <span>#</span>
          <span>Product</span>
          <span>Order</span>
          <span>Refund</span>
          <span>Return</span>
        </div>
        <div className="h-px bg-[#EDF2F6]" />
        <div className="space-y-4 pt-2">
          {rows.map((r) => {
            const refundPercent = Math.max(0, Math.min(100, Math.round((r.orderCount > 0 ? (r.refundCount / r.orderCount) * 100 : 0))));
            const returnPercent = Math.max(0, Math.min(100, Math.round(r.returnRatePercent)));
            return (
              <div key={r.rank} className="grid items-center" style={{ gridTemplateColumns: '24px 1fr 60px 60px 70px' }}>
                <span className="text-[11px]">{r.rank}</span>
                <span className="text-[#444A6D] text-[11px] truncate pr-2">{r.product}</span>
                <span className="text-[#444A6D] text-[11px]">{r.orderCount}</span>
                <div className="w-[46px] h-5 rounded bg-[#F0FDF4] border border-[#00E58F] flex items-center justify-center">
                  <span className="text-[11px] text-[#00E58F]">{refundPercent}%</span>
                </div>
                <div className="w-[46px] h-5 rounded bg-[#F0FDF4] border border-[#00E58F] flex items-center justify-center">
                  <span className="text-[11px] text-[#00E58F]">{returnPercent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop table: unchanged */}
      <div className="hidden md:block px-5 pb-5">
        <div className="px-0 pb-3 text-[#96A5B8] text-[13px] grid" style={{ gridTemplateColumns: '30px 1fr 70px 88px 95px' }}>
          <span>#</span>
          <span>Product</span>
          <span>Order</span>
          <span>Refund</span>
          <span>Return</span>
        </div>
        <div className="h-px bg-[#EDF2F6]" />
        <div className="space-y-6 pt-4">
          {rows.map((r) => {
            const refundPercent = Math.max(0, Math.min(100, Math.round((r.orderCount > 0 ? (r.refundCount / r.orderCount) * 100 : 0))));
            const returnPercent = Math.max(0, Math.min(100, Math.round(r.returnRatePercent)));
            return (
              <div key={r.rank} className="grid items-center" style={{ gridTemplateColumns: '24px 1fr 80px 80px 110px' }}>
                <span>{r.rank}</span>
                <span className="text-[#444A6D]">{r.product}</span>
                <span className="text-[#444A6D]">{r.orderCount}</span>
                <div className="w-[46px] h-5 rounded bg-[#F0FDF4] border border-[#00E58F] flex items-center justify-center">
                  <span className="text-[11px] text-[#00E58F]">{refundPercent}%</span>
                </div>
                <div className="w-[46px] h-5 rounded bg-[#F0FDF4] border border-[#00E58F] flex items-center justify-center">
                  <span className="text-[11px] text-[#00E58F]">{returnPercent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RefundReturnTable;



