import React from 'react';

interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
  logo?: string;
  description: string;
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ 
  method, 
  isSelected, 
  onSelect 
}) => {
  const renderIcon = () => {
    if (method.logo) {
      return (
        <img 
          src={method.logo} 
          alt={method.name}
          className="w-16 h-16 object-contain"
        />
      );
    }

    if (method.icon === 'bank') {
      return (
        <div className="w-16 h-16 bg-[#2ECC71] rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2 20h20v-4H2v4zm2-10h2v4H4v-4zm4 0h2v4H8v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4zM2 6h20V4H2v2z"/>
          </svg>
        </div>
      );
    }

    if (method.icon === 'truck') {
      return (
        <div className="w-16 h-16 bg-[#2ECC71] rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </div>
      );
    }

    return null;
  };

  return (
    <div 
      className={`
        border rounded-[10px] p-4 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-[#2ECC71] bg-green-50 shadow-lg' 
          : 'border-[#949494] bg-white hover:border-[#2ECC71] hover:shadow-md'
        }
      `}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {renderIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[20px] font-semibold text-black mb-1">
            {method.name}
          </h3>
          <p className="text-[14px] text-gray-600">
            {method.description}
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center
            ${isSelected 
              ? 'border-[#2ECC71] bg-[#2ECC71]' 
              : 'border-gray-300'
            }
          `}>
            {isSelected && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodCard;
