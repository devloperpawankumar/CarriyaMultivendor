import React from 'react';

interface PaymentOrderSummaryProps {
  subtotalLabel?: string;
  subtotalAmount?: string;
  shippingLabel?: string;
  shippingAmount?: string;
  onProceed?: () => void;
  showProceedButton?: boolean;
  className?: string;
}

const PaymentOrderSummary: React.FC<PaymentOrderSummaryProps> = ({
  subtotalLabel = 'Subtotal (0 items)',
  subtotalAmount = 'PKR.0',
  shippingLabel = 'Shipping Fee',
  shippingAmount = 'PKR.0',
  onProceed,
  showProceedButton = true,
  className = ''
}) => {
  return (
    <div className={`bg-[#FFFDFD] border border-[#949494] rounded-[12px] p-6 ${className}`}>
      <h2 className="text-black text-[25px] font-medium mb-6 text-left">Order Summary</h2>
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
        <span className="text-[15px] text-black">
    Subtotal{' '}
    <span className="text-[#2ECC71]">
      (0 items)
    </span>
  </span>
          <span className="text-[15px] font-semibold text-black ">    {subtotalAmount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[15px] text-black">{shippingLabel}</span>
          <span className="text-[15px] font-semibold text-black">{shippingAmount}</span>
        </div>
      </div>
      {showProceedButton && (
        <button
          onClick={onProceed}
          className="w-full bg-[#2ECC71] text-white rounded-[10px] py-3 text-[20px] font-semibold"
        >
          Proceed to checkout
        </button>
      )}
    </div>
  );
};

export default PaymentOrderSummary;


