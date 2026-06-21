import React from 'react';

type LoadingStateProps = {
    message?: string;
};

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-[#2ECC71] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">{message}</p>
            </div>
        </div>
    );
};

export default LoadingState;

