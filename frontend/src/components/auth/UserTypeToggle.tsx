import React from 'react';

export interface UserTypeToggleProps {
  userType: 'buyer' | 'seller';
  onUserTypeChange: (type: 'buyer' | 'seller') => void;
  className?: string;
}

const UserTypeToggle: React.FC<UserTypeToggleProps> = ({
  userType,
  onUserTypeChange,
  className = ''
}) => {
  return (
    <div className={`relative w-full max-w-[302px] md:max-w-[469px] h-[41px] md:h-[64px] border border-[#4B4B4B] rounded-[45px] bg-white ${className}`}>
      {/* Background slider */}
      <div
        className={
          `absolute top-[4.5px] left-[4.5px] md:top-[7px] md:left-[9px]
           h-[32px] md:h-[49px] bg-[#2ECC71] rounded-[45px] transition-transform duration-300 w-[calc(50%-9px)] md:w-[221px]
           ${userType === 'buyer' ? 'translate-x-0' : 'translate-x-[calc(100%+9px)]'}`
        }
        aria-hidden
      />

      {/* Labels row */}
      <div className="relative z-10 grid grid-cols-2 h-full">
        <button
          type="button"
          onClick={() => onUserTypeChange('buyer')}
          className={`flex items-center justify-center text-[20px] md:text-[30px] font-normal transition-colors duration-300 ${
            userType === 'buyer' ? 'text-white' : 'text-black'
          }`}
          aria-pressed={userType === 'buyer'}
        >
          Buyer
        </button>
        <button
          type="button"
          onClick={() => onUserTypeChange('seller')}
          className={`flex items-center justify-center text-[20px] md:text-[30px] font-normal transition-colors duration-300 ${
            userType === 'seller' ? 'text-white' : 'text-black'
          }`}
          aria-pressed={userType === 'seller'}
        >
          Seller
        </button>
      </div>
    </div>
  );
};

export default UserTypeToggle;
