import React from 'react';

const Stars: React.FC<{ rating: number; size?: 'sm' | 'md' | 'card'; showHalfStars?: boolean }> = ({ 
  rating, 
  size = 'md',
  showHalfStars = true // Enable half stars by default (Amazon/Daraz style)
}) => {
  // Size options:
  // 'sm': Small (10.8px) - used in InfoPanel
  // 'md': Medium (20px/5) - default
  // 'card': Responsive card size (7.94px mobile, 20.42px desktop) - used in ProductCard
  const starSize = size === 'sm' 
    ? 'w-[10.8px] h-[10.8px]' 
    : size === 'card'
    ? 'w-[7.94px] h-[8.94px] lg:w-[20.42px] lg:h-[23px]'
    : 'w-5 h-5';
  const normalizedRating = Math.max(0, Math.min(5, rating || 0)); // Clamp between 0-5
  
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const starRating = normalizedRating - i; // Rating for this specific star (0-1 range)
        
        let starState: 'full' | 'half' | 'empty';
        if (showHalfStars) {
          // Amazon/Daraz style: Show half stars for decimals
          if (starRating >= 1) {
            starState = 'full';
          } else if (starRating >= 0.5) {
            starState = 'half';
          } else if (starRating > 0) {
            starState = 'half'; // Show half for any partial (0.1-0.49)
          } else {
            starState = 'empty';
          }
        } else {
          // Simple style: Only full or empty
          starState = normalizedRating >= starValue ? 'full' : 'empty';
        }
        
        return (
          <div key={i} className="relative inline-block">
            {/* Background (empty) star */}
            <svg 
              className={`${starSize} text-gray-300`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            
            {/* Foreground (filled/half) star */}
            {starState !== 'empty' && (
              <svg 
                className={`${starSize} text-[#E5E523] absolute top-0 left-0`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
                style={starState === 'half' ? { clipPath: 'inset(0 50% 0 0)' } : {}}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stars;


