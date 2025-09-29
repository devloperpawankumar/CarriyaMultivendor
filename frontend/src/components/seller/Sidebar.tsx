import React from 'react';
import { Link } from 'react-router-dom';

type SidebarProps = {
  topLogoSrc?: string;
  bottomLogoSrc?: string;
  menuIcons?: Array<{ key: string; src: string; label: string }>;
  activeKey?: string;
  menuRoutes?: Record<string, string>;
  onMenuClick?: (key: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ topLogoSrc, bottomLogoSrc, menuIcons = [], activeKey, menuRoutes, onMenuClick }) => {
  return (
    <div className="flex flex-col" style={{ width: 366, height: 873 }}>
      <div className="px-8 pt-[36px] pb-4">
        {topLogoSrc && (
          <img src={topLogoSrc} alt="logo" style={{ width: 204, height: 65 }} />
        )}
      </div>
      <div className="flex-1  pt-10" style={{ paddingLeft: 33, paddingRight: 33 }}>
            {menuIcons.map((mi) => {
          const isActive = activeKey === mi.key;
              const to = menuRoutes?.[mi.key];
              const content = (
                <div 
                  className={`flex items-center justify-between cursor-pointer ${isActive ? 'rounded-[30px]' : ''}`}
                  style={{ 
                    marginBottom: 32, 
                    height: 55,
                    ...(isActive ? { 
                      backgroundColor: 'rgba(46, 204, 113, 0.17)', 
                      padding: '10px 12px',
                      marginLeft: '-12px',
                      marginRight: '-12px'
                    } : {})
                  }}
                  onClick={() => onMenuClick?.(mi.key)}
                >
                  <div className="flex items-center" style={{ gap: 36 }}>
                    <img src={mi.src} alt={mi.label} style={{ width: 32, height: 32 }} />
                    <span className="text-[25px] font-semibold" style={{ color: '#2ECC71' }}>{mi.label}</span>
                  </div>
                  <img src={require('../../assets/images/Seller/_ (1).png')} alt="arrow" style={{ width: 13, height: 13 }} />
                </div>
              );
              return (
                <div key={mi.key}>
                  {to ? (
                    <Link to={to} style={{ textDecoration: 'none' }}>
                      {content}
                    </Link>
                  ) : content}
                </div>
              );
        })}
      </div>
      <div className="px-8 pb-[36px] mt-auto">
        {bottomLogoSrc && (
          <img src={bottomLogoSrc} alt="logo" style={{ width: 204, height: 65 }} />
        )}
      </div>
    </div>
  );
};

export default Sidebar;


