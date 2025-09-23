import React, { useEffect, useMemo, useRef, useState } from 'react';

type RevealProps = {
  children: React.ReactNode;
  /** Direction of entry: up, down, left, right */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Distance to travel in px */
  distance?: number;
  /** Delay before starting animation (ms) */
  delayMs?: number;
  /** Duration of the animation (ms) */
  durationMs?: number;
  /** Extra class names */
  className?: string;
};

/**
 * Reveal – a polished scroll-reveal animation.
 * Adds a slight blur & scale for a soft, premium look.
 */
const Reveal: React.FC<RevealProps> = ({
  children,
  direction = 'up',
  distance = 40,
  delayMs = 0,
  durationMs = 800,
  className,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => setInView(entry.isIntersecting));
      },
      { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const transformStart = useMemo(() => {
    switch (direction) {
      case 'down': return `translateY(-${distance}px) scale(0.98)`;
      case 'left': return `translateX(${distance}px) scale(0.98)`;
      case 'right': return `translateX(-${distance}px) scale(0.98)`;
      default:     return `translateY(${distance}px) scale(0.98)`; // up
    }
  }, [direction, distance]);

  const style: React.CSSProperties = useMemo(
    () =>
      inView
        ? {
            transform: 'translate3d(0,0,0) scale(1)',
            opacity: 1,
            filter: 'blur(0px)',
            transition: `
              transform ${durationMs}ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms,
              opacity ${durationMs}ms ease ${delayMs}ms,
              filter ${durationMs}ms ease ${delayMs}ms
            `,
            willChange: 'transform, opacity, filter',
          }
        : {
            transform: transformStart,
            opacity: 0,
            filter: 'blur(6px)',
          },
    [inView, transformStart, durationMs, delayMs]
  );

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};

export default Reveal;
