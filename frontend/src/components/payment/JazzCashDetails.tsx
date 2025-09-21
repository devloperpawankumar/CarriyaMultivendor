import React from 'react';

interface JazzCashDetailsProps {
  className?: string;
}

const JazzCashDetails: React.FC<JazzCashDetailsProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top helper/instructions text (above inputs) */}
      <div className="text-[13px] md:text-[15px] text-black whitespace-pre-line">
        {`At checkout, select JazzCash.\n\nEnter your 11-digit JazzCash number.\n\nYou’ll get an OTP on your phone.\n\nEnter OTP → Payment Successful.\n\nYour order will be processed & tracked in Carryia.`}
      </div>

      {/* Enter number field */}
      <div className="border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] shadow-[1px_2px_4px_rgba(233,255,242,1)] h-[38px] md:h-[67px] flex items-center px-[18px] md:px-7">
        <span className="text-[10px] md:text-[25px] text-[#B8B1B1]">
          Enter JazzCash number
        </span>
      </div>

      {/* OTP label */}
      <div className="text-[10px] md:text-[20px] text-[#B8B1B1]">
        Enter OTP sent to your Device
      </div>

      {/* 4 OTP boxes */}
      <div className="flex items-center gap-4 md:gap-[52px] w-full md:w-[360.73px] max-w-full">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-[27px] h-[27px] md:w-[51px] md:h-[51px] border border-[#949494] rounded-[5px] md:rounded-[6px]"
          />
        ))}
      </div>

      {/* ✅ Desktop Pay now button: left aligned */}
      <div className="hidden md:flex md:justify-start pt-2">
        <button className="w-[250px] h-[70px] bg-[#2ECC71] rounded-[15px] text-[35px] font-semibold text-white">
          Pay now
        </button>
      </div>

      {/* ✅ Mobile Pay now button: centered */}
      <div className="pt-2 flex justify-center md:hidden">
        <button className="w-[69px] h-[26px] bg-[#2ECC71] rounded-[5px] text-[13px] font-semibold text-white">
          Pay now
        </button>
      </div>
    </div>
  );
};

export default JazzCashDetails;
