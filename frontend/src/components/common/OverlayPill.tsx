import React from 'react';

type OverlayPillProps = {
  countLabel: string; // e.g. "1/7" or "0/0"
  onPrev?: () => void;
  onNext?: () => void;
  disableNav?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

const OverlayPill: React.FC<OverlayPillProps> = ({ countLabel, onPrev, onNext, disableNav, style, className }) => {
  // Mobile responsiveness: scale to match Figma on <= 767px
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(('matches' in e ? e.matches : (e as MediaQueryList).matches));
    handler(mq);
    mq.addEventListener?.('change', handler as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener?.('change', handler as (e: MediaQueryListEvent) => void);
  }, []);

  // Mobile sizing widened so chevrons fit; camera icon shown but smaller
  const containerWidth = isMobile ? 82 : 130;
  const containerHeight = isMobile ? 13 : 30;
  const borderRadius = isMobile ? 16 : 40;
  const iconSize = isMobile ? 10 : 20;
  const textFontSize = isMobile ? 10 : 16;
  const arrowSize = isMobile ? 10 : 16;
  const sidePad = isMobile ? 6 : 12;
  const gap = isMobile ? 4 : 8;

  return (
    <div
      className={className || 'absolute flex items-center'}
      style={{
        width: containerWidth,
        height: containerHeight,
        bottom: 8,
        right: 8,
        background: '#FFFFFF',
        border: '1px solid #2ECC71',
        borderRadius,
        boxSizing: 'border-box',
        boxShadow: '0px 1px 2px 0px rgba(16, 185, 129, 0.10)',
        padding: 0,
        zIndex: 2,
        overflow: 'hidden',
        ...style,
      }}
    >
      {iconSize > 0 && (
        <span style={{ display: 'flex', alignItems: 'center', marginLeft: sidePad, marginRight: 0 }}>
          <svg width={iconSize} height={iconSize} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <rect width="20" height="20" fill="none"/>
            <path d="M3.833 7.5A1.667 1.667 0 015.5 5.833h1.833l.833-1.333A1.667 1.667 0 019.5 3.5h1a1.667 1.667 0 011.333.667l.834 1.333H15.5A1.667 1.667 0 0117.167 7.5v6.667A1.667 1.667 0 0115.5 15.833H5.5A1.667 1.667 0 013.833 14.167V7.5z" stroke="#2ECC71" strokeWidth={isMobile ? 1 : 1.5} fill="#FFFFFF"/>
            <circle cx="10.5" cy="11" r="2.25" stroke="#2ECC71" strokeWidth={isMobile ? 1 : 1.5} fill="#FFFFFF"/>
            <circle cx="13.25" cy="8.25" r={isMobile ? 0.4 : 0.5} fill="#2ECC71"/>
          </svg>
        </span>
      )}
      <span style={{
        marginLeft: gap,
        fontFamily: 'Inter, Roboto, Arial, sans-serif',
        fontWeight: 500,
        fontSize: textFontSize,
        lineHeight: `${Math.max(textFontSize + 2, containerHeight)}px`,
        color: '#2ECC71',
        minWidth: isMobile ? 24 : 32,
        textAlign: 'center',
        userSelect: 'none',
      }}>
        {countLabel}
      </span>
      <div style={{ marginLeft: gap, display: 'flex', alignItems: 'center', height: '100%', marginRight: isMobile ? 4 : 6, gap: isMobile ? 4 : 6 }}>
        <button type="button" aria-label="Previous" disabled={disableNav} onClick={onPrev} style={{ background: 'none', border: 'none', padding: 0, cursor: disableNav ? 'default' : 'pointer', display: 'flex', alignItems: 'center', height: containerHeight, width: arrowSize + 4, justifyContent: 'center' }} tabIndex={-1}>
          <svg width={arrowSize} height={arrowSize} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L8.5 10L12.5 5" stroke="#2ECC71" strokeWidth={isMobile ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button type="button" aria-label="Next" disabled={disableNav} onClick={onNext} style={{ background: 'none', border: 'none', padding: 0, cursor: disableNav ? 'default' : 'pointer', display: 'flex', alignItems: 'center', height: containerHeight, width: arrowSize + 4, justifyContent: 'center' }} tabIndex={-1}>
          <svg width={arrowSize} height={arrowSize} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 15L11.5 10L7.5 5" stroke="#2ECC71" strokeWidth={isMobile ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default OverlayPill;


