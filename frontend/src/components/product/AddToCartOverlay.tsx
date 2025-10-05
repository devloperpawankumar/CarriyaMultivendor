import React, { useEffect } from 'react';
import cartIcon from '../../assets/images/Cart.png';
import crossIcon from "../../assets/images/1.png"

const AddToCartOverlay: React.FC<{
  open: boolean;
  onClose: () => void;
  message: string;
  onViewCart?: () => void;
}> = ({ open, onClose, message, onViewCart }) => {
  // Auto-close after 3 seconds
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-auto">
      <div className="bg-[#2ECC71] text-white rounded-lg shadow-lg max-w-sm px-4 py-3 flex items-start gap-3 animate-slide-in">
        {/* Cart icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div
            className="w-5 h-5 bg-white rounded-sm"
            style={{
              WebkitMaskImage: `url(${cartIcon})`,
              maskImage: `url(${cartIcon})`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
            }}
            aria-hidden="true"
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-tight">{message}</div>
          {onViewCart && (
            <button 
              onClick={onViewCart} 
              className="mt-2 text-xs font-medium text-white underline hover:no-underline"
            >
              View Cart →
            </button>
          )}
        </div>
        
        {/* Close button */}
        <button 
          aria-label="Close" 
          onClick={onClose} 
          className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <svg 
            className="w-3 h-3" 
            viewBox="0 0 20 20" 
            fill="none" 
            stroke="white" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="6" y1="6" x2="14" y2="14" />
            <line x1="14" y1="6" x2="6" y2="14" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AddToCartOverlay;