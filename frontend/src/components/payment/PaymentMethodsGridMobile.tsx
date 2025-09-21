import React from 'react';
import banktransferLogo from '../../assets/images/Payment/bank.png';
import jazzcashLogo from '../../assets/images/Payment/jazzcash.png';
import easypaisaLogo from '../../assets/images/Payment/easypaisa.png';
import cashondeliveryLogo from '../../assets/images/Payment/cash.png';

interface PaymentMethodsGridMobileProps {
  selected: string;
  onSelect: (id: string) => void;
}

const Card: React.FC<{
  id: string;
  title: string;
  src: string;
  selected: string;
  onClick: (id: string) => void;
}> = ({ id, title, src, selected, onClick }) => {
  const isSelected = selected === id;
  return (
    <div
      className={`border rounded-[10px] p-4 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-[#2ECC71] bg-[#2ECC71] shadow-lg'
          : 'border-[#949494] bg-white hover:border-[#2ECC71] hover:shadow-md'
      }`}
      style={{ width: 160, height: 177 }}
      onClick={() => onClick(id)}
    >
      <div className="flex flex-col items-center h-full">
        <div className="w-20 h-20 flex items-center justify-center mb-4">
          <img
            src={src}
            alt={title}
            className={`w-full h-full object-contain ${isSelected ? (id === 'bank-transfer' || id === 'cod' ? 'brightness-0 invert' : '') : ''}`}
          />
        </div>
        <h3 className={`text-[20px] font-semibold text-center ${isSelected ? 'text-white' : 'text-black'}`}>{title}</h3>
      </div>
    </div>
  );
};

const PaymentMethodsGridMobile: React.FC<PaymentMethodsGridMobileProps> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-2 gap-[23px] mx-auto" style={{ width: 343 }}>
      <Card id="bank-transfer" title="Bank Transfer" src={banktransferLogo} selected={selected} onClick={onSelect} />
      <Card id="jazzcash" title="Jazz Cash" src={jazzcashLogo} selected={selected} onClick={onSelect} />
      <Card id="easypaisa" title="Easypaisa Transfer" src={easypaisaLogo} selected={selected} onClick={onSelect} />
      <Card id="cod" title="Cash on Delivery" src={cashondeliveryLogo} selected={selected} onClick={onSelect} />
    </div>
  );
};

export default PaymentMethodsGridMobile;


