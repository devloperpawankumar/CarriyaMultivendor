import React from 'react';

type AdminSidebarProps = {
	activeKey?: string;
	onMenuClick?: (key: string) => void;
	topLogoSrc?: string;
	bottomLogoSrc?: string;
    isMobile?: boolean;
};

const menuItems: Array<{ key: string; label: string }> = [
    { key: 'new-sellers', label: 'New Sellers' },
    { key: 'edit-content', label: 'Edit Content' },
    { key: 'see-transaction', label: 'See Transaction' },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeKey, onMenuClick, topLogoSrc, bottomLogoSrc, isMobile }) => {
    return (
        <div className="flex flex-col justify-between" style={{ width: isMobile ? '100%' : 366, height: isMobile ? 'auto' : 932 }}>
            {/* Top logo (hide on mobile overlay to avoid duplicate logo in header) */}
            {isMobile ? null : (
                <div style={{ paddingLeft: 33, paddingRight: 33, marginTop: 36 }}>
                    {topLogoSrc && (
                        <img src={topLogoSrc} alt="logo" style={{ width: 204, height: 65 }} />
                    )}
                </div>
            )}

            {/* Menu area */}
            <div className="flex-1" style={{ paddingLeft: 33, paddingRight: 33, marginTop: isMobile ? 24 : 41 }}>
                {menuItems.map((item) => {
                    const isActive = activeKey === item.key;
                    const itemSpacing = 28; // 82 gap between rows minus 54 button height
                    return (
                        <div key={item.key} style={{ marginBottom: itemSpacing }}>
                            <button
                                onClick={() => onMenuClick && onMenuClick(item.key)}
                                className="block text-left"
                                style={{
                                    width: isMobile ? '100%' : 250,
                                    height: isMobile ? 58 : 54,
                                    borderRadius: 25,
                                    paddingLeft: isMobile ? 24 : 30,
                                    paddingRight: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: isActive ? 'rgba(46, 204, 113, 0.18)' : 'transparent',
                                    border: isMobile ? '1px solid rgba(184,177,177,0.5)' : 'none',
                                    boxShadow: isMobile ? '0 1px 2px rgba(0,0,0,0.04)' : 'none'
                                }}
                            >
                                <span className="font-semibold" style={{ fontSize: isMobile ? 22 : 25, color: '#2ECC71', whiteSpace: 'nowrap' }}>{item.label}</span>
                                <span className="font-semibold" style={{ fontSize: isMobile ? 22 : 25, color: '#2ECC71' }}>&gt;</span>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Bottom logo (hidden on mobile for a cleaner full-screen menu) */}
            {isMobile ? null : (
                <div style={{ paddingLeft: 33, paddingRight: 33, marginBottom: 124 }}>
                    {bottomLogoSrc && (
                        <img src={bottomLogoSrc} alt="logo" style={{ width: 204, height: 65 }} />
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminSidebar;


