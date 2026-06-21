import React from 'react';

// Import admin icons
import dashboardIcon from '../../assets/images/Admin/ad-dashbord.png';
import usersIcon from '../../assets/images/Admin/ad-users.png';
import sellersIcon from '../../assets/images/Admin/ad-seller.png';
import buyerIcon from '../../assets/images/Admin/ad-buyer.png';
import paymentsIcon from '../../assets/images/Admin/ad-paymets.png';
import settingsIcon from '../../assets/images/Admin/ad-setting.png';

type AdminSidebarProps = {
	activeKey?: string;
	onMenuClick?: (key: string) => void;
	topLogoSrc?: string;
	bottomLogoSrc?: string;
    isMobile?: boolean;
};

type MenuItem = {
    key: string;
    label: string;
    icon: string;
    iconActive?: string;
};

const menuItems: MenuItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: dashboardIcon },
    { key: 'users', label: 'Users', icon: usersIcon },
    { key: 'sellers', label: 'Sellers', icon: sellersIcon },
    { key: 'orders', label: 'Orders', icon: buyerIcon },
    { key: 'payments', label: 'Payments', icon: paymentsIcon },
    { key: 'settings', label: 'Settings', icon: settingsIcon },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeKey, onMenuClick, topLogoSrc, bottomLogoSrc, isMobile }) => {
    return (
        <div 
            className="flex flex-col bg-white border-r border-[#E5E7EB] shadow-sm" 
            style={{ 
                width: isMobile ? '100%' : 256, 
                height: isMobile ? 'auto' : '100vh',
                minHeight: isMobile ? 'auto' : 526
            }}
        >
            {/* Top section with logo - Hidden on mobile since logo is in header */}
            {!isMobile && (
                <div 
                    className="border-b border-[#E5E7EB] flex flex-col items-start pb-[0.909px] pt-[23.991px] px-[23.991px]"
                    style={{ height: 105 }}
                >
                    <div className="flex items-center gap-2">
                        {topLogoSrc && (
                            <img 
                                src={topLogoSrc} 
                                alt="Carriya logo" 
                                className="h-[31px] w-auto"
                                style={{ maxWidth: 99 }}
                            />
                        )}
                    </div>
                    <div className="mt-2">
                        <p className="font-bold text-[#101828] text-[24px] leading-[32px]" style={{ fontFamily: 'Arimo, sans-serif' }}>
                            MarketAdmin
                        </p>
                    </div>
                </div>
            )}

            {/* Menu area */}
            <div 
                className="flex-1 flex flex-col gap-1 pt-4 px-4"
                style={{ paddingTop: 16, paddingLeft: 16, paddingRight: 16 }}
            >
                {menuItems.map((item) => {
                    const isActive = activeKey === item.key;
                    return (
                        <button
                            key={item.key}
                            onClick={() => onMenuClick && onMenuClick(item.key)}
                            className={`flex items-center gap-3 h-12 px-4 rounded-[10px] transition-colors ${
                                isActive ? 'bg-[#F0FDF4]' : 'bg-transparent hover:bg-gray-50'
                            }`}
                            style={{
                                fontFamily: 'Arimo, sans-serif'
                            }}
                        >
                            {/* Icon */}
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                <img 
                                    src={item.icon} 
                                    alt={item.label}
                                    className="w-5 h-5 object-contain transition-all duration-200"
                                    style={{
                                        opacity: isActive ? 1 : 0.6,
                                        filter: isActive 
                                            ? 'none' 
                                            : 'brightness(0) saturate(100%) invert(22%) sepia(5%) saturate(1000%) hue-rotate(180deg) brightness(95%) contrast(85%)'
                                    }}
                                />
                            </div>
                            <span 
                                className={`text-base leading-6 ${
                                    isActive ? 'text-[#2ECC71]' : 'text-[#364153]'
                                }`}
                                style={{ fontFamily: 'Arimo, sans-serif' }}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminSidebar;


