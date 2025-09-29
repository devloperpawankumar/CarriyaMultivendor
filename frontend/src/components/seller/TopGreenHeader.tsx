import React from 'react';

const TopGreenHeader: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-center md:h-[49px] h-[30px]" style={{ backgroundColor: '#2ECC71' }}>
      <span className="text-white md:text-[20px] text-[12px]" style={{ fontFamily: 'Roboto', fontWeight: 500 }}>
        Carryia - Buy , Sell And Carry
      </span>
    </div>
  );
};

export default TopGreenHeader;


