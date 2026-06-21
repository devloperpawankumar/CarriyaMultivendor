import React from 'react';
import { Toast as ToastType } from '../../contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const getToastStyles = (type: ToastType['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-[#2ECC71]',
          icon: '✓',
          iconBg: 'bg-white',
        };
      case 'error':
        return {
          bg: 'bg-[#E74C3C]',
          icon: '✕',
          iconBg: 'bg-white',
        };
      case 'warning':
        return {
          bg: 'bg-[#F39C12]',
          icon: '⚠',
          iconBg: 'bg-white',
        };
      case 'info':
        return {
          bg: 'bg-[#3498DB]',
          icon: 'ℹ',
          iconBg: 'bg-white',
        };
      default:
        return {
          bg: 'bg-[#2ECC71]',
          icon: '✓',
          iconBg: 'bg-white',
        };
    }
  };

  const styles = getToastStyles(toast.type);

  return (
    <div className={`${styles.bg} text-white rounded-lg shadow-lg max-w-sm px-4 py-3 flex items-start gap-3 animate-slide-in`}>
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <div className={`w-5 h-5 ${styles.iconBg} rounded-sm flex items-center justify-center text-xs font-bold text-gray-800`}>
          {styles.icon}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold leading-tight">{toast.title}</div>
        {toast.message && (
          <div className="text-xs opacity-90 mt-1 leading-tight">{toast.message}</div>
        )}
      </div>
      
      {/* Close button */}
      <button 
        aria-label="Close" 
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
