import React from 'react';

type StatCardProps = {
    title: string;
    value: React.ReactNode;
    icon?: string | React.ReactNode;
    iconBgColor?: string;
    progressBar?: boolean;
    progressBarColor?: string;
    progressPercent?: number; // 0-100
    className?: string;
};

const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    icon, 
    iconBgColor = '#F0FDF4',
    progressBar = true,
    progressBarColor = '#2ECC71',
    progressPercent = 100,
    className = ''
}) => {
    const safeProgress = Math.max(0, Math.min(100, Number(progressPercent) || 0));
    
    return (
        <div 
            className={`bg-white border border-[#E5E7EB] rounded-[10px] shadow-sm w-full ${className}`}
            style={{
                borderWidth: '0.909px',
                borderStyle: 'solid',
                paddingTop: 24.901,
                paddingBottom: 16,
                paddingLeft: 24.901,
                paddingRight: 24.901,
                minWidth: 257.557,
                boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)'
            }}
        >
            <div className="flex items-start justify-between w-full gap-4">
                <div className="min-w-0 flex-1">
                    <p
                        className="font-normal text-[#4A5565] text-[14px] leading-[20px]"
                        style={{ fontFamily: 'Arimo, sans-serif' }}
                    >
                        {title}
                    </p>
                    <div
                        className="mt-2 font-bold text-[#101828] leading-tight whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{ fontFamily: 'Arimo, sans-serif', fontSize: 30 }}
                    >
                        {value}
                    </div>
                </div>

                {icon && (
                    <div
                        className="rounded-[10px] shrink-0 flex items-center justify-center"
                        style={{
                            backgroundColor: iconBgColor,
                            width: 47.969,
                            height: 47.969,
                        }}
                    >
                        <div className="w-[24px] h-[24px] flex items-center justify-center overflow-hidden">
                            {typeof icon === 'string' ? (
                                <img src={icon} alt={title} className="w-full h-full object-contain" />
                            ) : (
                                icon
                            )}
                        </div>
                    </div>
                )}
            </div>

            {progressBar && (
                <div className="mt-4 w-full">
                    <div className="h-[4px] w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                        <div
                            className="h-full rounded-full"
                            style={{ width: `${safeProgress}%`, backgroundColor: progressBarColor }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatCard;

