import React from 'react';
import OverlayPill from './OverlayPill';

type Props = {
  urls: string[];
  index: number;
  setIndex: (updater: (i: number) => number) => void;
  cardStyle?: React.CSSProperties;
};

const ImagePreviewCard: React.FC<Props> = ({ urls, index, setIndex, cardStyle }) => {
  const len = urls.length;
  // Enable chevrons on mobile even with a single image
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(('matches' in e ? e.matches : (e as MediaQueryList).matches));
    handler(mq);
    mq.addEventListener?.('change', handler as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener?.('change', handler as (e: MediaQueryListEvent) => void);
  }, []);
  return (
    <div
      className="w-[142.69px] h-[117.23px] md:w-[258px] md:h-[255px] rounded-[20px] relative flex items-center justify-center"
      style={{ backgroundColor: 'rgba(46,204,113,0.28)', border: '1px solid #B8B1B1', ...(cardStyle || {}) }}
    >
      {len > 0 ? (
        <img src={urls[index]} alt={`Preview ${index + 1}`} className="w-[62.55px] h-[62.55px] md:w-[139px] md:h-[139px] object-contain" style={{ background: 'transparent' }} />
      ) : (
        <div className="flex items-center justify-center w-[40px] h-[40px] md:w-[139px] md:h-[139px] rounded-[10px]">
          <div className="flex flex-col items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 56 56"
              fill="none"
              className="md:w-[75px] md:h-[75px]"
            >
              <rect width="56" height="56" rx="12" fill="#F3F3F3" />
              <path d="M16 38L24.5858 29.4142C25.3668 28.6332 26.6332 28.6332 27.4142 29.4142L32 34L36.5858 29.4142C37.3668 28.6332 38.6332 28.6332 39.4142 29.4142L44 34V36C44 37.1046 43.1046 38 42 38H18C16.8954 38 16 37.1046 16 36V38Z" fill="#B8B1B1" />
              <circle cx="21" cy="23" r="3" fill="#B8B1B1" />
            </svg>
            <span className="mt-1 hidden md:inline text-[#B8B1B1] text-[8px] md:mt-2 md:text-[14px]">No image selected</span>
          </div>
        </div>
      )}

      <OverlayPill
        countLabel={len > 0 ? `${index + 1}/${len}` : '0/0'}
        onPrev={() => setIndex((i) => (len ? (i - 1 + len) % len : 0))}
        onNext={() => setIndex((i) => (len ? (i + 1) % len : 0))}
        disableNav={isMobile ? false : len <= 1}
      />
    </div>
  );
};

export default ImagePreviewCard;


