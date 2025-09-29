import React from 'react';

type HeroBannerProps = {
  src: string;
};

const HeroBanner: React.FC<HeroBannerProps> = ({ src }) => {
  return (
    <div className="overflow-hidden rounded-[15px] md:rounded-[25px] w-full max-w-[307px] h-[158px] md:max-w-[484px] md:h-[249px] py-0.5">
      <img src={src} alt="banner" className="w-full h-full object-contain md:object-cover bg-white" />
    </div>
  );
};

export default HeroBanner;


