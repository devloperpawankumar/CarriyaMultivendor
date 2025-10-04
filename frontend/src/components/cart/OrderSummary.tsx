import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSummary: React.FC<{
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}> = ({ subtotal, shipping }) => {
  const navigate = useNavigate();
  return (
    <>
      {/* Desktop Layout */}
      <aside className="hidden md:block w-full lg:w-[437px]">
        <div
          className="mx-auto border border-[#E5E8ED] rounded-[12px] p-6 flex flex-col gap-2"
          style={{ width: 437 }}
        >
          <h2 className="text-black text-[20px] font-bold mb-4">Order Summary</h2>
          <div className="flex items-center gap-[10px] p-[10px]">
            <span className="text-black text-[14px]">Subtotal</span>
            <span className="ml-auto text-[#2ECC71] font-bold">PKR {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-[10px] p-[10px]">
            <span className="text-black text-[14px]">Shipping Fee</span>
            <span className="ml-auto text-black font-medium">PKR {shipping}</span>
          </div>
          <div className="mt-6">
            <button onClick={() => navigate('/checkout')} className="w-full h-[48px] bg-[#2ECC71] text-white rounded-[10px] font-bold">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Layout */}
      <aside className="md:hidden w-full">
        <div
          className="border border-[#949494] rounded-[10px] p-4"
          style={{ height: 138 }}
        >
          <h2 className="text-black text-[18px] font-medium mb-4 text-left">Order Summary</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className=" text-[12px]">Subtotal  <span className="text-[#2ECC71]"> (0 items)</span></span>
              <span className="text-black text-[12px]">PKR {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-black text-[12px]">Shipping Fee</span>
              <span className="text-black text-[12px]">PKR {shipping}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default OrderSummary;
