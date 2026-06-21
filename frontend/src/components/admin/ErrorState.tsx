import React from 'react';

type ErrorStateProps = {
    message?: string;
    onRetry?: () => void;
};

const ErrorState: React.FC<ErrorStateProps> = ({ 
    message = 'Failed to load data', 
    onRetry 
}) => {
    return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="text-red-500 text-center">
                <svg 
                    className="w-12 h-12 mx-auto mb-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                </svg>
                <p className="text-lg font-medium">{message}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-6 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-colors font-medium"
                >
                    Retry
                </button>
            )}
        </div>
    );
};

export default ErrorState;

