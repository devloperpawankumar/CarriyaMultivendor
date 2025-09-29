import React from 'react';
import TopGreenHeader from './TopGreenHeader';
import MobileSellerHeader from './MobileSellerHeader';
import SellerLayoutWithSidebars from './SellerLayoutWithSidebars';
import Footer from '../Footer';
import { useLocation } from 'react-router-dom';

type SellerScaffoldProps = {
  children: React.ReactNode;
  menuIcons: Array<{ key: string; src: string; label: string }>;
  menuRoutes: Record<string, string>;
  onMenuClick?: (key: string) => void;
};

const SellerScaffold: React.FC<SellerScaffoldProps> = ({ children, menuIcons, menuRoutes, onMenuClick }) => {
  const location = useLocation();
  const activeKey =
    location.pathname.includes('/seller/manage-products') || location.pathname.includes('/seller/add-product') ? 'products' :
    location.pathname.includes('/seller/manage-orders') ? 'orders' :
    location.pathname.includes('/seller/manage-payments') ? 'payments' :
    location.pathname.includes('/seller/manage-reports') ? 'reports' :
    location.pathname.includes('/seller/settings') ? 'settings' :
    'dashboard';

  return (
    <div className="min-h-screen bg-white lg:bg-[#F0FFF7]">
      <TopGreenHeader />
      <MobileSellerHeader />
      <SellerLayoutWithSidebars
        menuIcons={menuIcons}
        menuRoutes={menuRoutes}
        activeKey={activeKey}
        onMenuClick={onMenuClick}
        topIconSrc={require('../../assets/images/Seller/rightTop.png')}
        bottomIconSrc={require('../../assets/images/Seller/rightBottom.png')}
      >
        {children}
      </SellerLayoutWithSidebars>
      <Footer />
    </div>
  );
};

export default SellerScaffold;


