import React, { useEffect, useState } from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';

interface DisapproveReturnPageProps {
  onSubmit?: () => void;
  onBack?: () => void;
}

const DisapproveReturnPage: React.FC<DisapproveReturnPageProps> = ({ onSubmit }) => {
  const [reason, setReason] = useState<string>('');
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      <div className="w-full px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[20px] sm:text-[32px] lg:text-[40px] font-bold text-black mb-2">Manage orders</h1>
          <div className="bg-[rgba(46,204,113,0.18)] rounded-[20px] sm:rounded-[25px] inline-block px-3 sm:px-4 py-1.5 sm:py-2">
            <p className="text-[14px] sm:text-[22px] lg:text-[25px] font-medium text-black">Today , 01-09-2025</p>
          </div>
          <p className="text-[12px] sm:text-[16px] lg:text-[20px] font-medium text-gray-500 mt-1">Manage Orders &gt; Reason For Disapproval</p>
        </div>

        {/* Content centered (852px) */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[852px]">
            <div className="text-[16px] sm:text-[28px] lg:text-[35px] font-semibold text-black">Reason For Disapproval</div>
            <div className="mt-2 bg-white border border-[#E2E0E0] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.18)] ring-1 ring-[rgba(46,204,113,0.20)] min-h-[200px] sm:min-h-[223px] p-3 sm:p-4">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for disapproval"
                className="w-full h-[130px] sm:h-[180px] bg-transparent outline-none resize-none text-[14px] sm:text-[20px] font-semibold text-black placeholder:text-gray-400"
              />
            </div>
            <div className="flex justify-end mt-3">
              <button onClick={onSubmit} className="bg-green-500 hover:bg-green-600 text-white font-bold text-[14px] sm:text-[18px] rounded-[12px] sm:rounded-[15px] px-4 sm:px-6 py-2 sm:py-2.5">Submit</button>
            </div>
          </div>
        </div>
      </div>
    </SellerScaffold>
  );
};

export default DisapproveReturnPage;


