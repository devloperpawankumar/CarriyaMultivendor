import React from 'react';

interface CODDetailsProps {
  className?: string;
}

const CODDetails: React.FC<CODDetailsProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Optional helper text for COD */}
      <div className="text-[14px] text-black">
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

 {/* ✅ Mobile Pay now button: centered
 <div className="pt-2 flex justify-center md:hidden">
        <button className="w-[69px] h-[26px] bg-[#2ECC71] rounded-[5px] text-[13px] font-semibold text-white">
          Pay now
        </button>
      </div> */}


        <button
          className="
            w-[170px] h-[35px] text-[15px]       /* 📱 default mobile size */
            sm:w-[220px] sm:h-[55px] sm:text-[20px]  /* tablets */
            md:w-[250px] md:h-[70px] md:text-[35px]  /* desktop size */
            bg-[#2ECC71] rounded-[5px] md:rounded-[15px]
            font-semibold text-white
          "
        >
          Complete
        </button>
      </div>
    </div>
  );
};

export default CODDetails;
