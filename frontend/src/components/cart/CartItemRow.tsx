import React from 'react';
import heartIcon from '../../assets/images/Favourite Products icon (1).png';
import deleteIcon from '../../assets/images/Layer_1.png';
type Props = {
  id: string;
  title: string;
  image: string;
  price: number;
  compareAt?: number;
  color?: string;
  size?: string;
  qty: number;
  shopName?: string;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
};

const CartItemRow: React.FC<Props> = ({ id, title, image, price, compareAt, color, size, qty, shopName = 'My Shop', onIncrease, onDecrease, onRemove }) => {
  return (
    <div className="relative border border-[#949494] rounded-[10px] w-full">
      {/* Desktop Layout */}
      <div className="hidden md:block" style={{ width: 793, height: 187 }}>
        {/* Top header row: left small box + shop name; right heart and delete */}
        <div className="absolute left-[23px] top-[18px] h-[26px] w-[144px] flex items-center gap-2">
          <div className="w-[26px] h-[26px] border border-[#949494] rounded-[5px] bg-white" />
          <span className="text-[20px] leading-[1.3] text-black">{shopName}</span>
        </div>
        <div className="absolute right-[24px] top-[25px] h-[25px] flex items-center gap-3">
          <button aria-label="Add to favorites" className="leading-none">
            <img src={heartIcon} alt="heart" className="w-[25px] h-[25px] object-contain" />
          </button>
          <button aria-label="Delete item" onClick={() => onRemove(id)} className="leading-none">
            <img src={deleteIcon} alt="delete" className="w-[20px] h-[20px] object-contain" />
          </button>
        </div>
        <div className="absolute left-0 right-0 top-[61px] h-px bg-[#B8B1B1]" />
        {/* Left-side empty box beside  */}
        <div className="absolute left-[23px] top-[111px] w-[26px] h-[26px] border border-[#949494] rounded-[5px] bg-white" />
        <div className="absolute left-[60px] top-[76px] w-[96px] h-[96px] rounded border border-[#2ECC71] bg-[#C7FFDF] overflow-hidden flex items-center justify-center">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
        <div className="absolute left-[167px] top-[76px] w-[314px]">
          <div className="text-[#2ECC71] font-medium text-[20px] leading-[1.3] truncate">{title}</div>
        </div>
        <div className="absolute left-[167px] top-[109px] w-[314px] text-[12px] leading-[1.3] text-black">
          {color ? `Black color , ${size ?? ''} Size , for men` : 'Black color , XL Size , for men'}
        </div>
        <div className="absolute left-[524px] top-[89px] w-[106px] text-[20px] font-normal text-black">PKR {price}</div>
        {typeof compareAt === 'number' && (
          <div className="absolute left-[524px] top-[115px] w-[106px] text-[20px] text-[#787A80] line-through">PKR -{compareAt}</div>
        )}
        {/* Quantity controls: column +, qty (green), - */}
        <div className="absolute right-[40px] top-[78px] flex flex-col items-center gap-2">
          <button aria-label="Increase" onClick={() => onIncrease(id)} className="text-[18px] text-black leading-none">+</button>
          <span className="text-[18px] font-semibold text-[#2ECC71] leading-none">{qty}</span>
          <button aria-label="Decrease" onClick={() => onDecrease(id)} className="text-[18px] text-black leading-none">-</button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-4" style={{ height: 142 }}>
        {/* Top row: checkbox + shop name + heart + delete */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-[18px] h-[18px] border border-[#949494] rounded-[3px] bg-white" />
            <span className="text-[10px] text-[#4D4D4D]">{shopName}</span>
          </div>
          <div className="flex items-center gap-3">
            <button aria-label="Add to favorites" className="leading-none">
              <img src={heartIcon} alt="heart" className="w-[18px] h-[18px] object-contain" />
            </button>
            <button aria-label="Delete item" onClick={() => onRemove(id)} className="leading-none">
              <img src={deleteIcon} alt="delete" className="w-[16px] h-[16px] object-contain" />
            </button>
          </div>
        </div>

        {/* Divider line */}
        <div className="w-full h-px bg-[#949494] mb-4" />

        {/* Main content row: checkbox + image + details + quantity */}
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="w-[18px] h-[18px] border border-[#949494] rounded-[3px] bg-white mt-2" />
          
          {/* Product image */}
          <div className="w-[76px] h-[73px] rounded border border-[#2ECC71] bg-[#C7FFDF] overflow-hidden flex items-center justify-center">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
          
          {/* Product details */}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-[#2ECC71] leading-[1.3] mb-1 truncate">{title}</div>
            <div className="text-[10px] text-[#949494] leading-[1.3] mb-3">
              {color ? `Black color , ${size ?? ''} Size , for men` : 'Black color , XL Size , for men'}
            </div>
            
            {/* Price row */}
            <div className="flex items-end gap-3 mb-2">
              <div className="text-[12px] font-bold text-black">PKR {price}</div>
              {typeof compareAt === 'number' && (
                <div className="text-[5px] text-[#787A80] line-through">PKR -{compareAt}</div>
              )}
            </div>
          </div>
          
          {/* Quantity controls */}
          <div className="flex flex-col items-center gap-1">
            <button aria-label="Increase" onClick={() => onIncrease(id)} className="text-[12px] text-black leading-none">+</button>
            <span className="text-[10px] font-normal text-[#2ECC71] leading-[1.5]">{qty}</span>
            <button aria-label="Decrease" onClick={() => onDecrease(id)} className="text-[12px] text-black leading-none">-</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemRow;


