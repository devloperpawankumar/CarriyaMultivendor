import React from 'react';
import { TopProductRow } from '../types/reportTypes';

type Props = { rows: TopProductRow[] };

const TopProductsTable: React.FC<Props> = ({ rows }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="bg-white rounded-[20px] border width-full  border-gray-100 shadow">
      {/* Header */}
      <div className="p-3 ">
        <div className="text-[20px] font-semibold text-[#05004E] mb-4">Best Selling Products</div>
        {isMobile ? (
          <div className="grid grid-cols-[24px_1fr_90px] items-center px-2 pb-2 text-[#96A5B8] text-[12px]">
            <span className="text-center">#</span>
            <span className="text-left pl-2">Product</span>
            <span className="text-right pr-1">Popularity</span>
          </div>
        ) : (
          <div className="px-5 pb-3 text-[#96A5B8] text-[13px] flex justify-between">
            <span>#</span>
            <span className="w-[140px] text-left">Product Name</span>
            <span>Popularity</span>
            <span>Sales</span>
          </div>
        )}
        <div className="h-px bg-[#EDF2F6]" />
      </div>

      {/* Body */}
      {isMobile ? (
        <div className="px-3 pb-3 divide-y divide-[#EDF2F6]">
          {rows.map((r) => (
            <div key={r.rank} className="py-3 grid grid-cols-[24px_1fr_60px] items-center gap-2">
              <span className="text-[12px] text-[#05004E] text-center">{r.rank}</span>
              <div className="min-w-0">
                <div className="text-[12px] text-[#444A6D] leading-tight line-clamp-2" title={r.name}>{r.name}</div>
                <div className="mt-2 h-[4px] bg-[#8CFAC7] rounded">
                  <div
                    className="h-full bg-[#00E096] rounded"
                    style={{ width: `${Math.max(0, Math.min(100, r.popularityPercent))}%` }}
                  />
                </div>
              </div>
              <div className="justify-self-end">
                <div className="w-[48px] h-[20px] rounded bg-[#F0FDF4] border border-[#00E096] flex items-center justify-center">
                  <span className="text-[11px] text-[#00E58F]">{r.popularityPercent}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 pb-5 space-y-8 py-2 ">
          {rows.map((r) => (
            <div key={r.rank} className="flex items-center justify-between">
              <span className="w-6">{r.rank}</span>
              <span className="w-[140px] text-[#444A6D]">{r.name}</span>
              <div className="w-[100px] h-[3px] bg-[#8CFAC7] rounded">
                <div
                  className="h-full bg-[#00E096] rounded"
                  style={{ width: `${Math.max(0, Math.min(100, r.popularityPercent))}%` }}
                />
              </div>
              <div className="w-[42px] h-5 rounded bg-[#F0FDF4] border border-[#00E096] flex items-center justify-center">
                <span className="text-[11px] text-[#00E58F]">{r.popularityPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopProductsTable;



