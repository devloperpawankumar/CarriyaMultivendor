import React from 'react';
import cartIcon from '../../assets/images/Cart.png';
import crossIcon from "../../assets/images/1.png"

const AddToCartOverlay: React.FC<{
  open: boolean;
  onClose: () => void;
  message: string;
  onViewCart?: () => void;
}> = ({ open, onClose, message, onViewCart }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Desktop overlay (hidden on small screens) */}
      <div className="hidden sm:flex relative w-[778px] max-w-[90%] h-[203px] rounded-[25px] bg-[#2ECC71] flex-col items-center justify-center text-white">
        <button aria-label="Close" onClick={onClose} className="absolute top-[6px] right-[6px] w-[23px] h-[23px] rounded-full bg-white flex items-center justify-center pointer-events-auto">
          <svg className="w-[13px] h-[13px]" viewBox="0 0 20 20" fill="#2ECC71"><path d="M14.348 5.652a.8.8 0 00-1.132 0L10 8.869 6.784 5.652a.8.8 0 10-1.132 1.132L8.869 10l-3.217 3.216a.8.8 0 101.132 1.132L10 11.131l3.216 3.217a.8.8 0 101.132-1.132L11.131 10l3.217-3.216a.8.8 0 000-1.132z"/></svg>
        </button>
        <div className="w-[90%] h-px bg-white/80 absolute top-[32px] left-1/2 -translate-x-1/2" />
        <div className="text-center px-6">
          <div className="text-[22px] sm:text-[26px] font-bold leading-tight">{message}</div>
        </div>
        <div className="w-[90%] h-px bg-white/80 absolute bottom-[32px] left-1/2 -translate-x-1/2" />
        <div className="mt-4 flex items-center">
          <button onClick={onViewCart} className="pointer-events-auto mx-auto inline-flex items-center gap-2 border border-white rounded-full px-4 py-2 bg-white">
            <div
              className="w-5 h-5 bg-[#2ECC71]"
              style={{
                WebkitMaskImage: `url(${cartIcon})`,
                maskImage: `url(${cartIcon})`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
              }}
              aria-hidden="true"
            />
            <span className="text-[16px] sm:text-[18px] font-semibold text-[#2ECC71]">view your cart</span>
          </button>
        </div>
      </div>
{/* Mobile toast (visible only on small screens) */}
<div
  className="sm:hidden pointer-events-auto fixed top-4 left-1/2 -translate-x-1/2 z-[60]"
  style={{ width: 250, height: 60 }}
>
  <div className="relative bg-[#2ECC71] text-white w-full h-full rounded-[10px] shadow-lg flex items-center justify-center px-6 top-20 right-3">
    
    {/* Message */}
    <span className="text-[12px] font-semibold text-center leading-none">
      {message}
    </span>

    {/* Close button in top-right corner */}
    <button
      aria-label="Close"
      onClick={onClose}
      className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full border border-white flex items-center justify-center"
    >
      <svg
        className="w-3.5 h-3.5"
        viewBox="0 0 20 20"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="6" y1="6" x2="14" y2="14" />
        <line x1="14" y1="6" x2="6" y2="14" />
      </svg>
    </button>
  </div>
</div>




    </div>
  );
};

export default AddToCartOverlay;


