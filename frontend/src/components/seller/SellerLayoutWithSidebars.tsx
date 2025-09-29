import React from 'react';
import Sidebar from './Sidebar';
import RightMiniBar from './RightMiniBar';

type SellerLayoutWithSidebarsProps = {
  children: React.ReactNode;
  menuIcons: Array<{ key: string; src: string; label: string }>;
  menuRoutes: Record<string, string>;
  activeKey: string;
  onMenuClick?: (key: string) => void;
  topIconSrc?: string;
  bottomIconSrc?: string;
};

const SellerLayoutWithSidebars: React.FC<SellerLayoutWithSidebarsProps> = ({
  children,
  menuIcons,
  menuRoutes,
  activeKey,
  onMenuClick,
  topIconSrc,
  bottomIconSrc,
}) => {
  return (
    <div className="min-h-screen bg-white lg:bg-[#F0FFF7]">
      {/* Main layout grid with 3 columns: left sidebar, content, right sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[366px_1fr_122px] gap-0 min-h-screen">
        {/* Left Sidebar */}
        <aside className="bg-white overflow-hidden hidden lg:block">
          <Sidebar
            topLogoSrc={require('../../assets/images/Carriya logo 1.png')}
            bottomLogoSrc={require('../../assets/images/Carriya logo 1.png')}
            menuIcons={menuIcons}
            activeKey={activeKey}
            menuRoutes={menuRoutes}
            onMenuClick={onMenuClick}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex flex-col items-center gap-6 pt-6 pb-10 md:pt-10 px-8">
          {children}
        </main>

        {/* Right Mini Sidebar */}
        <aside className="bg-white overflow-hidden hidden lg:block">
          <RightMiniBar 
            topIconSrc={topIconSrc} 
            bottomIconSrc={bottomIconSrc} 
          />
        </aside>
      </div>
    </div>
  );
};

export default SellerLayoutWithSidebars;
