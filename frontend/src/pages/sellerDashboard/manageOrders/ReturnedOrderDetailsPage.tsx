import React, { useEffect, useMemo, useRef, useState } from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import type { OrderDetails } from './types/orderTypes';
import galleryIcon from "../../../assets/images/Seller/gallery-add.png";

interface ReturnedOrderDetailsPageProps {
  orderDetails: OrderDetails | null;
  onBack?: () => void;
  onDisapprove?: () => void;
}

const ReturnedOrderDetailsPage: React.FC<ReturnedOrderDetailsPageProps> = ({ orderDetails, onDisapprove }) => {
  // Local editable state for backend-friendly updates
  const [orderId, setOrderId] = useState<string>(orderDetails?.id || '');
  const [productName, setProductName] = useState<string>(orderDetails?.productName || '');
  const [returnReason, setReturnReason] = useState<string>(orderDetails?.returnReason || 'It was not working');
  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  const initialImageUrl = orderDetails?.productImage || '';
  const objectUrl = useMemo(() => (productImageFile ? URL.createObjectURL(productImageFile) : ''), [productImageFile]);
  const productImageUrl = objectUrl || galleryIcon || initialImageUrl;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageClick = () => fileInputRef.current?.click();
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) setProductImageFile(file);
  };
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = galleryIcon;
  };

  // Scroll to top on mount so the page starts at the header
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      <div className="w-full px-2 sm:px-4 lg:px-8">
        {/* Header: Title, Date chip, Breadcrumb */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex-1">
              <h1 className="text-[20px] sm:text-[32px] lg:text-[40px] font-bold text-black mb-2">Manage orders</h1>
              <div className="bg-[rgba(46,204,113,0.18)] rounded-[20px] sm:rounded-[25px] inline-block px-3 sm:px-4 py-1.5 sm:py-2">
                <p className="text-[14px] sm:text-[22px] lg:text-[25px] font-medium text-black">Today , 01-09-2025</p>
              </div>
              <p className="text-[12px] sm:text-[16px] lg:text-[20px] font-medium text-gray-500 mt-1">Manage Orders &gt; Returned Order</p>
            </div>
          </div>
        </div>

        {/* Content centered to max width per Figma (852px) */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[852px]">
            {/* Order ID */}
            <div className="text-[16px] sm:text-[28px] lg:text-[35px] font-semibold text-black">Order ID</div>
            <div className="mt-2 bg-white border border-[#E2E0E0] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] h-[56px] sm:h-[80px] flex items-center px-4 sm:px-6">
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-transparent outline-none text-[14px] sm:text-[22px] font-semibold text-black placeholder:text-gray-400"
                placeholder="#D12345U"
              />
            </div>

            {/* Product Name */}
            <div className="mt-6 text-[16px] sm:text-[28px] lg:text-[35px] font-semibold text-black">Product Name</div>
            <div className="mt-2 bg-white border border-[#E2E0E0] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] h-[56px] sm:h-[80px] flex items-center px-4 sm:px-6">
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-transparent outline-none text-[14px] sm:text-[22px] font-semibold text-black placeholder:text-gray-400"
                placeholder="Wireless Bluetooth Earphones..."
              />
            </div>

            {/* Reason For Refund */}
            <div className="mt-6 text-[16px] sm:text-[28px] lg:text-[35px] font-semibold text-black">Reason For Refund</div>
            <div className="mt-2 bg-white border border-[#E2E0E0] rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] min-h-[160px] sm:min-h-[223px] flex items-start px-4 sm:px-6 py-3 sm:py-4">
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full h-[120px] sm:h-[160px] bg-transparent outline-none resize-none text-[14px] sm:text-[20px] font-semibold text-black placeholder:text-gray-400"
                placeholder="Describe the reason for refund"
              />
            </div>

            {/* Product Photo */}
            <div className="mt-6">
              <div className="text-[16px] sm:text-[28px] lg:text-[35px] font-semibold text-black mb-2 sm:mb-3">Product Photo </div>
              <button type="button" onClick={handleImageClick} className="w-[200px] h-[160px] sm:w-[269px] sm:h-[221px] border border-[#B8B1B1] rounded-[16px] sm:rounded-[20px] flex items-center justify-center overflow-hidden bg-white">
                <img
                  src={productImageUrl}
                  alt="Product"
                  className="w-[96px] h-[96px] sm:w-[149px] sm:h-[149px] object-contain"
                  onError={handleImageError}
                />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Action buttons - right aligned on desktop, stacked on mobile */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
              <button className="bg-[#FBBC05] text-black font-bold text-[14px] sm:text-[18px] rounded-[14px] sm:rounded-[20px] px-4 sm:px-6 py-2.5 sm:py-3 hover:brightness-95 w-full sm:w-auto">Approve Return</button>
              <button onClick={onDisapprove} className="bg-[#E5E523] text-black font-bold text-[14px] sm:text-[18px] rounded-[14px] sm:rounded-[20px] px-4 sm:px-6 py-2.5 sm:py-3 hover:brightness-95 w-full sm:w-auto">Disapproved Return</button>
            </div>
          </div>
        </div>
      </div>
    </SellerScaffold>
  );
};

export default ReturnedOrderDetailsPage;


