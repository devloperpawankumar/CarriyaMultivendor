import React from 'react';

// Import admin icons
import notificationIcon from '../../assets/images/Admin/ad-Icon.png';
import profileIcon from '../../assets/images/Admin/ad-profile.png';

type AdminTopBarProps = {
    title?: string;
    userName?: string;
    userRole?: string;
};

const AdminTopBar: React.FC<AdminTopBarProps> = ({ 
    title = 'Dashboard',
    userName = 'Admin User',
    userRole = 'Super Admin'
}) => {
    return (
        <div 
            className="bg-white border-b border-black flex items-center justify-between h-[68px] px-8 shadow-sm"
            style={{ 
                borderBottomWidth: '0.909px',
                paddingLeft: 32,
                paddingRight: 32,
                paddingTop: 0,
                paddingBottom: '0.909px'
            }}
        >
            <div>
                <h2 
                    className="font-bold text-[#101828] text-[24px] leading-[32px]"
                    style={{ fontFamily: 'Arimo, sans-serif' }}
                >
                    {title}
                </h2>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Notification icon */}
                <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-9 h-9 flex items-center justify-center">
                        <img 
                            src={notificationIcon} 
                            alt="Notifications"
                            className="w-5 h-5 object-contain"
                        />
                    </div>
                    <div className="absolute top-1 right-1 w-2 h-2 bg-[#2ECC71] rounded-full border border-white" />
                </div>
                
                {/* User profile */}
                <div className="flex items-center gap-3 border-l border-[#E5E7EB] pl-4">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <img 
                            src={profileIcon} 
                            alt="User Profile"
                            className="w-8 h-8 object-contain rounded-full"
                        />
                    </div>
                    <div>
                        <p 
                            className="text-[#101828] text-sm leading-5 font-normal"
                            style={{ fontFamily: 'Arimo, sans-serif' }}
                        >
                            {userName}
                        </p>
                        <p 
                            className="text-[#6A7282] text-xs leading-4 font-normal"
                            style={{ fontFamily: 'Arimo, sans-serif' }}
                        >
                            {userRole}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTopBar;

