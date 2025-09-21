import React from 'react';

interface CODDetailsProps {
  className?: string;
}

const CODDetails: React.FC<CODDetailsProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Optional helper text for COD */}
      <div className="text-[15px] text-black">
        Cash on Delivery: Pay in cash when your order arrives.
      </div>

      {/* ✅ Responsive Complete Order button */}
      <div
        className="
          flex
          justify-center      /* 📱 center on mobile */
          md:justify-start    /* 💻 align left on desktop */
        "
      >
        <button
          className="
            w-[180px] h-[45px] text-[16px]       /* 📱 default mobile size */
            sm:w-[220px] sm:h-[55px] sm:text-[20px]  /* tablets */
            md:w-[289px] md:h-[70px] md:text-[35px]  /* desktop size */
            bg-[#2ECC71] rounded-[10px] md:rounded-[15px]
            font-semibold text-white
          "
        >
          Complete Order
        </button>
      </div>
    </div>
  );
};

export default CODDetails;
