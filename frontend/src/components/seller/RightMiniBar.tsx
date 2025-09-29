import React from 'react';

type RightMiniBarProps = {
  topIconSrc?: string;
  bottomIconSrc?: string;
};

const RightMiniBar: React.FC<RightMiniBarProps> = ({ topIconSrc, bottomIconSrc }) => {
  return (
    <div
      className="flex flex-col items-center h-full sticky top-0"
      style={{ width: 122, height: '100vh' }}
    >
      <div className="w-full h-full bg-white flex flex-col items-center justify-start pt-10 gap-6">
        {topIconSrc && <img src={topIconSrc} alt="icon" style={{ width: 50, height: 50 }} />}
        {bottomIconSrc && <img src={bottomIconSrc} alt="icon" style={{ width: 50, height: 50 }} />}
      </div>
    </div>
  );
};

export default RightMiniBar;