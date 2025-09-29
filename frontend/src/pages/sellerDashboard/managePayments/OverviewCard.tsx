import React from 'react';

type OverviewCardProps = {
  title: string;
  value: string;
  progressPercent?: number; // 0 - 100
};

export default function OverviewCard({ title, value, progressPercent }: OverviewCardProps) {
  return (
    <div className="bg-white rounded-[15px] border border-[#EDEDED] p-4">
      <div className="text-[#949494] md:text-[20px] text-[16px] font-medium mb-3">{title}</div>
      <div className="text-[#2ECC71] md:text-[30px] text-[21px] font-semibold mb-3">{value}</div>
      {typeof progressPercent === 'number' ? (
        <div className="md:h-4 h-2 bg-[#F3F3F3] rounded-full overflow-hidden" aria-label={`${title} progress`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0, Math.min(100, Math.round(progressPercent)))}>
          <div
            className="h-full bg-[#2ECC71]"
            style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}


