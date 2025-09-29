import React from 'react';
import OverlayPill from './OverlayPill';

type Props = {
  urls: string[];
  index: number;
  setIndex: (updater: (i: number) => number) => void;
  cardStyle?: React.CSSProperties;
};

const VideoPreviewCard: React.FC<Props> = ({ urls, index, setIndex, cardStyle }) => {
  const len = urls.length;
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => 
      setIsMobile(('matches' in e ? e.matches : (e as MediaQueryList).matches));
    handler(mq);
    mq.addEventListener?.('change', handler as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener?.('change', handler as (e: MediaQueryListEvent) => void);
  }, []);

  // Fullscreen change handler
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setHasError(false);
  }, [index, len]);

  const handleVideoError = () => {
    setHasError(true);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    videoRef.current?.play().catch(() => setHasError(true));
  };

  const handlePause = () => {
    videoRef.current?.pause();
  };

  const handleReset = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const buttonSize = isMobile ? 28 : 36;
  const iconSize = isMobile ? 14 : 18;
  const centralButtonSize = isMobile ? 40 : 60;

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-hidden rounded-[20px] transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'w-[142.69px] h-[117.23px] md:w-[258px] md:h-[255px]'
      }`}
      style={{ 
        backgroundColor: 'rgba(46, 204, 113, 0.28)', 
        border: '1px solid #B8B1B1',
        ...(isFullscreen ? {} : cardStyle || {})
      }}
    >
      {len > 0 && !hasError ? (
        <>
          <video
            ref={videoRef}
            src={urls[index]}
            className={`rounded-[10px] object-cover md:object-contain ${
              isFullscreen ? 'w-full h-full' : 'w-full h-full'
            }`}
            controls={isFullscreen || isMobile}
            muted
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={handleVideoError}
          />
          
          {/* Overlay controls - hidden when video is playing in fullscreen or when native controls are active */}
          {(!isPlaying || !isFullscreen) && !(isMobile && !isFullscreen) && (
            <div className={`absolute inset-0 bg-black/20 flex items-center justify-center ${
              isFullscreen ? 'bg-black/40' : ''
            }`}>
              {/* Central Play Button */}
              {!isPlaying && (
                <button
                  type="button"
                  aria-label="Play video"
                  className="flex items-center justify-center bg-white/80 hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  style={{
                    width: isFullscreen ? 80 : centralButtonSize,
                    height: isFullscreen ? 80 : centralButtonSize,
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)'
                  }}
                  onClick={handlePlay}
                >
                  <svg 
                    width={isFullscreen ? 32 : 24} 
                    height={isFullscreen ? 32 : 24} 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    className="text-green-600 ml-1"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Control Bar - Only show when not in fullscreen or on mobile without native controls */}
          {(!isFullscreen || (isFullscreen && !isMobile)) && (
            <div className={`absolute flex items-center justify-between ${
              isFullscreen ? 'bottom-6 left-6 right-6' : 'left-3 right-3 bottom-3'
            }`}>
             <div className="flex items-center gap-1">
  {!isFullscreen && (
    <>
      <button 
        type="button" 
        aria-label="Play" 
        className="flex items-center justify-center bg-white/80 hover:bg-white transition-all duration-200 shadow-md"
        style={{ 
          width: isMobile ? 20 : 36, 
          height: isMobile ? 20 : 36, 
          borderRadius: '50%',
          backdropFilter: 'blur(8px)'
        }} 
        onClick={handlePlay}
      >
        <svg 
          width={isMobile ? 10 : 18} 
          height={isMobile ? 10 : 18} 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="text-gray-700 ml-0.5"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
      
      <button 
        type="button" 
        aria-label="Pause" 
        className="flex items-center justify-center bg-white/80 hover:bg-white transition-all duration-200 shadow-md"
        style={{ 
          width: isMobile ? 20 : 36, 
          height: isMobile ? 20 : 36, 
          borderRadius: '50%',
          backdropFilter: 'blur(8px)'
        }} 
        onClick={handlePause}
      >
        <svg 
          width={isMobile ? 10 : 18} 
          height={isMobile ? 10 : 18} 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="text-gray-700"
        >
          <rect x="7" y="7" width="3" height="10" rx="1" />
          <rect x="14" y="7" width="3" height="10" rx="1" />
        </svg>
      </button>
    </>
  )}
  
  <button 
    type="button" 
    aria-label="Fullscreen" 
    className="flex items-center justify-center bg-white/80 hover:bg-white transition-all duration-200 shadow-md"
    style={{ 
      width: isMobile ? 20 : 36, 
      height: isMobile ? 20 : 36, 
      borderRadius: '50%',
      backdropFilter: 'blur(8px)'
    }} 
    onClick={toggleFullscreen}
  >
    <svg 
      width={isMobile ? 10 : 18} 
      height={isMobile ? 10 : 18} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className="text-gray-700"
    >
      {isFullscreen ? (
        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
      ) : (
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
      )}
    </svg>
  </button>
</div>
              
              {/* Video counter */}
              {!isFullscreen && (
                <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                  {index + 1}/{len}
                </div>
              )}
            </div>
          )}

          {/* Exit fullscreen button for mobile */}
          {isFullscreen && isMobile && (
            <button 
              type="button"
              aria-label="Exit fullscreen"
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full z-10"
              onClick={toggleFullscreen}
            >
              <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
        </>
      ) : (
        /* Fallback when no videos or error */
        <div className="flex flex-col items-center justify-center text-center p-4">
          <div className="w-[62px] h-[62px] md:w-[200px] md:h-[200px] rounded-[10px] flex items-center justify-center">
            <img
              src={require('../../assets/images/Seller/Group 1000002858.png')}
              alt="Play"
              className="w-[103px] h-[103px] object-contain"
              draggable={false}
            />
          </div>
          
          {hasError && (
            <button 
              onClick={() => setHasError(false)}
              className="mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Navigation Overlay - Only show when not in fullscreen
      {!isFullscreen && (
        <OverlayPill
          countLabel={len > 0 ? `${index + 1}/${len}` : '0/0'}
          onPrev={() => setIndex((i) => (len ? (i - 1 + len) % len : 0))}
          onNext={() => setIndex((i) => (i + 1) % len)}
          disableNav={len <= 1}
        />
      )} */}
    </div>
  );
};

export default VideoPreviewCard;