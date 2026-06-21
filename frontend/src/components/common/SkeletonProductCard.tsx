import React from 'react';

type Props = {
  compact?: boolean; // match small cards in grids
};

const SkeletonProductCard: React.FC<Props> = ({ compact }) => {
  return (
    <div className="w-full max-w-[121px] lg:max-w-none bg-white border border-[#B8B1B1] rounded-lg overflow-hidden">
      <div className={`relative w-full ${compact ? 'h-[97px]' : 'h-[97px] lg:h-[192px]'} bg-gray-100 animate-pulse`} />
      <div className="px-[10px] py-[4px] lg:px-[17px] lg:py-[17px]">
        <div className="h-[12px] lg:h-[24px] bg-gray-100 rounded w-5/6 mb-2 animate-pulse" />
        <div className="flex items-center space-x-2 h-[10px] lg:h-[23px] mb-2">
          <div className="flex space-x-1">
            <div className="w-4 h-4 bg-gray-100 rounded animate-pulse" />
            <div className="w-4 h-4 bg-gray-100 rounded animate-pulse" />
            <div className="w-4 h-4 bg-gray-100 rounded animate-pulse" />
            <div className="w-4 h-4 bg-gray-100 rounded animate-pulse" />
            <div className="w-4 h-4 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="w-8 h-3 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="flex items-center space-x-[6px] h-[12px] lg:h-[26px]">
          <div className="h-[10px] lg:h-[20px] bg-gray-100 rounded w-16 animate-pulse" />
          <div className="h-[8px] lg:h-[16px] bg-gray-100 rounded w-10 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonProductCard;


