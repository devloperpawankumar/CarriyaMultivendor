import React from 'react';
import deleteIcon from '../../assets/images/Layer_1.png';
import heartIcon from '../../assets/images/Favourite Products icon (1).png';
const CartHeader: React.FC<{
  count: number;
  onSelectAll?: () => void;
  onDeleteAll?: () => void;
}>= ({ count, onSelectAll, onDeleteAll }) => {
  return (
    <>
      {/* Desktop Layout */}
      <section
        className="hidden md:flex border border-[#949494] rounded-[12px] mb-6 items-center justify-between"
        style={{ padding: '16px 23px', width: 793, height: 59 }}
      >
        {/* Left: empty box + Select all */}
        <div className="flex items-center gap-2">
          <button aria-label="Select all" onClick={onSelectAll} className="w-[26px] h-[26px] border border-[#949494] rounded-[5px] bg-white" />
          <span className="text-black font-bold text-[20px] leading-[1.3]">Select all ({count})</span>
        </div>

        {/* Right: delete icon + Delete all */}
        <button aria-label="Delete all" onClick={onDeleteAll} className="flex items-center gap-2 text-[#333333]">
          <span className="text-[18px] leading-none">  <img src={deleteIcon} alt="Delete" />   </span>
          <span className="text-[16px] font-medium text-black">Delete all</span>
        </button>
      </section>

      {/* Mobile Layout - matches Figma design */}
      <section
        className="md:hidden border border-[#949494] rounded-[10px] mb-4 flex items-center justify-between"
        style={{ padding: '14px 15px', height: 44 }}
      >
        {/* Left: checkbox + Select all */}
        <div className="flex items-center gap-3">
          <button aria-label="Select all" onClick={onSelectAll} className="w-[18px] h-[18px] border border-[#949494] rounded-[3px] bg-white" />
          <span className="text-[10px]   leading-[1.5]">Select All   <span className="text-[#2ECC71]"> ({count} items)</span></span>
        </div>

        {/* Right: delete icon + Delete all */}
        <button aria-label="Delete all" onClick={onDeleteAll} className="flex items-center gap-2">
          <img src={deleteIcon} alt="Delete" className="w-[16px] h-[16px] object-contain" />
          <span className="text-[#949494] text-[10px] leading-[1.5]">Delete All</span>
        </button>
      </section>
    </>
  );
};

export default CartHeader;


