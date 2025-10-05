import React from 'react';
import visaLogo from '../../assets/images/Payment/visaCard.png';
import masterLogo from '../../assets/images/Payment/MasterCard.png';
import whiteLogo from '../../assets/images/Payment/unionPay.png';

interface BankTransferDetailsProps {
  className?: string;
}

const BankTransferDetails: React.FC<BankTransferDetailsProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 mx-auto md:mx-0 w-[352px] md:w-auto ${className}`}>
      {/* Logos row (three logos) */}
      <div className="flex items-center gap-4">
        <img src={visaLogo} alt="Visa" className="w-[46px] h-[46px] object-contain" />
        <img src={masterLogo} alt="Mastercard" className="w-[44.77px] h-[27.74px] object-contain" />
        <img src={whiteLogo} alt="UnionPay" className="w-[32px] h-[32px] object-contain" />
      </div>

      {/* Fields */}
      <div className="space-y-[28px] md:space-y-4">
        <div className="border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] shadow-[1px_2px_4px_rgba(233,255,242,1)] h-[38px] md:h-[67px] flex items-center px-[18px] md:px-7 text-[#B8B1B1] text-[12px] md:text-[25px]">
          Card number
        </div>
        <div className="border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] shadow-[1px_2px_4px_rgba(233,255,242,1)] h-[38px] md:h-[67px] flex items-center px-[18px] md:px-7 text-[#B8B1B1] text-[12px] md:text-[25px]">
          Full name on card
        </div>
        <div className="space-y-[28px] md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
          <div className="border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] shadow-[1px_2px_4px_rgba(233,255,242,1)] h-[38px] md:h-[67px] flex items-center px-[18px] md:px-6 text-[#B8B1B1] text-[12px] md:text-[25px]">
            Expiry date MM/YY
          </div>
          <div className="border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] shadow-[1px_2px_4px_rgba(233,255,242,1)] h-[38px] md:h-[67px] flex items-center px-[18px] md:px-6 text-[#B8B1B1] text-[12px] md:text-[25px]">
            CVV
          </div>
        </div>
      </div>

      {/* ✅ Pay now button: centered on mobile, left on desktop */}
      <div className="pt-2 flex justify-center md:justify-start">
        <button className="block w-[170px] md:w-[250px] h-[35px] md:h-[70px] bg-[#2ECC71] rounded-[5px] md:rounded-[15px] text-[15px] md:text-[35px] font-semibold text-white">
          Pay now
        </button>
      </div>
    </div>
  );
};

export default BankTransferDetails;
