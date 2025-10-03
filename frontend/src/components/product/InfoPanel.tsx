import React, { useState } from 'react';
import Stars from './Stars';
import saleIcon from '../../assets/images/Icon (Stroke).png';
import favIcon from '../../assets/images/outline.png';
import cartIcon from '../../assets/images/Cart.png';
import Arrows from '../../assets/images/Vector.png';
import { useNavigate } from 'react-router-dom';

const InfoPanel: React.FC<{
  price: number;
  compareAt: number;
  currency: string;
  sales: number;
  rating: number;
  reviews: number;
  colors: string[];
  sizes: string[];
  onAddToCart?: (details: { quantity: number; color?: string; size?: string }) => void;
}> = ({ price, compareAt, currency, sales, rating, reviews, colors, sizes, onAddToCart }) => {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [dropdownColor, setDropdownColor] = useState(colors[0]);
  const [dropdownSize, setDropdownSize] = useState(sizes[0]);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div className="flex items-end gap-3">
          <div className="text-[24px] font-bold text-[#2ECC71]">{currency} {price}</div>
          <div className="text-[18px] text-[#787A80] line-through">-{compareAt}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 px-0 py-1">
            <img src={saleIcon} alt="icon" className="w-5 h-5 object-contain" />
            <span className="text-[12px] font-medium text-[#949494]">{sales.toLocaleString()} Sales</span>
          </div>
          <div className="flex items-center gap-1 px-0 py-1">
            <Stars rating={rating} size="sm" />
            <span className="text-[12px] font-medium text-[#949494]">({reviews})</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div className="text-[14px] font-normal text-[#424551]">Color</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            {colors.map((c) => (
              <button key={c} onClick={() => setSelectedColor(c)} className={`w-6 h-6 rounded-full border-2 ${selectedColor === c ? 'border-[#17696A]' : 'border-[#D7DADD]'}`} title={c} style={{ backgroundColor: c.toLowerCase() === 'pink' ? '#FFB6C1' : c.toLowerCase() === 'blue' ? '#C0DDED' : c.toLowerCase() === 'yellow' ? '#FEDE41' : '#eee' }} />
            ))}
          </div>
          
          <span className="text-[14px] font-normal text-[#9A9CA5]">{selectedColor}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {/* Size custom dropdown */}
        <div className="border border-[#D7DADD] rounded-[10px] overflow-hidden">
          <button type="button" onClick={() => setSizeOpen(v => !v)} className="w-full h-11 px-4 flex items-center justify-between">
            <span className="text-[14px] text-[#424551]">Size</span>
            <span className="text-[14px] text-[#9A9CA5]">{dropdownSize}</span>
          </button>
          {sizeOpen && (
            <div className="border-t border-[#E0E0E0] py-1">
              {sizes.map((s) => (
                <button key={s} type="button" onClick={() => { setDropdownSize(s); setSizeOpen(false); }} className={`w-full text-left px-4 py-2 text-[14px] ${dropdownSize === s ? 'bg-[#F5F5F5]' : ''}`}>{s}</button>
              ))}
            </div>
          )}
        </div>

        {/* Color custom dropdown */}
        <div className="border border-[#D7DADD] rounded-[10px] overflow-hidden">
          <button type="button" onClick={() => setColorOpen(v => !v)} className="w-full h-11 px-4 flex items-center justify-between">
            <span className="text-[14px] text-[#424551]">Color</span>
            <span className="text-[14px] text-[#9A9CA5]">{dropdownColor}</span>
          </button>
          {colorOpen && (
            <div className="border-t border-[#E0E0E0] py-1">
              {colors.map((c) => (
                <button key={c} type="button" onClick={() => { setDropdownColor(c); setColorOpen(false); }} className={`w-full text-left px-4 py-2 text-[14px] ${dropdownColor === c ? 'bg-[#F5F5F5]' : ''}`}>{c}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-20 h-11 border border-[#D7DADD] rounded flex items-center justify-between px-4">
            <span className="text-[14px] text-[#424551]">{quantity}</span>
            <div className="flex flex-col">
              <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity" className="w-3 h-3 bg-no-repeat bg-center" style={{ backgroundImage: `url(${Arrows})`, backgroundSize: '100% 200%', backgroundPosition: 'top center' }} />
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="w-3 h-3 bg-no-repeat bg-center" style={{ backgroundImage: `url(${Arrows})`, backgroundSize: '100% 200%', backgroundPosition: 'bottom center' }} />
            </div>
          </div>

          <button className="flex-1 h-11 bg-[#2ECC71] text-white rounded flex items-center justify-center gap-2" onClick={() => onAddToCart?.({ quantity, color: dropdownColor, size: dropdownSize })}>
            <img src={cartIcon} alt="icon" className="w-5 h-5 object-contain" />
            <span className="text-[14px] font-bold tracking-[0.5px]">Add to cart</span>
          </button>

          <button className="h-11 border border-[#2ECC71] text-[#2ECC71] rounded flex items-center justify-center gap-2 px-8">
            <img src={favIcon} alt="icon" className="w-5 h-5 object-contain" />
            <span className="text-[14px] font-bold tracking-[0.5px]">Favorite</span>
          </button>
        </div>

        <button
          className="w-full h-11 bg-[#2ECC71] text-white rounded flex items-center justify-center"
          onClick={() => navigate('/sellerstore')}
        >
          <span className="text-[14px] font-bold tracking-[0.5px]">See Seller Store</span>
        </button>
      </div>
    </div>
  );
};

export default InfoPanel;


