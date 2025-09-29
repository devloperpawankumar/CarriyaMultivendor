import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SellerScaffold from '../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../components/seller/menuConfig';
import Footer from '../../components/Footer';
import TopGreenHeader from '../../components/seller/TopGreenHeader';
import Sidebar from '../../components/seller/Sidebar';
import HeroBanner from '../../components/seller/HeroBanner';
import RightMiniBar from '../../components/seller/RightMiniBar';
import SellerLayout from '../../components/seller/SellerLayout';
import MetricCard from '../../components/seller/MetricCard';
// ManageProducts is routed separately via /seller/manage-products

const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey = location.pathname.includes('/seller/manage-products')
    ? 'products'
    : 'dashboard';

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'dashboard':
        navigate('/seller/dashboard');
        break;
      case 'products':
        navigate('/seller/manage-products');
        break;
      case 'orders':
        navigate('/seller/dashboard');
        break;
      case 'payments':
        navigate('/seller/dashboard');
        break;
      case 'reports':
        navigate('/seller/manage-reports');
        break;
      case 'settings':
        navigate('/seller/dashboard');
        break;
      default:
        navigate('/seller/dashboard');
    }
  };

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes} onMenuClick={handleMenuClick}>
      <div className="w-full flex justify-center">
        <HeroBanner src={require('../../assets/images/Colorful Illustrated Online Business and E-Commerce Blog Banner 1.png')} />
      </div>
      {/* Mobile responsive work: one card per row on mobile; keep 3 columns on desktop */}
      <div
        className="grid grid-cols-1 items-center gap-5 lg:[grid-template-columns:repeat(3,235px)] lg:[gap:50px] lg:justify-items-start"
      >
        {/* Mobile responsive work: center card and set mobile width to match Figma */}
        <div className="w-full  max-w-[307px] lg:w-[235px]">
          <MetricCard
            title="Toady Sales"
            value="PKR 15000.00"
            icon={<img src={require('../../assets/images/Seller/iconSales.png')} alt="" className="w-18 h-14" />}
            cardStyle={{ width: '100%' }}
          />
        </div>

        {/* Mobile responsive work: center card and set mobile width to match Figma */}
        <div className="w-full max-w-[307px] lg:w-[235px]">
          <MetricCard
            title="Total Orders"
            value="35"
            icon={<img src={require('../../assets/images/Seller/iconOrders.png')} alt="" className="w-18 h-14" />}
            cardStyle={{ width: '100%' }}
          />
        </div>

        {/* Mobile responsive work: center card and set mobile width to match Figma */}
        <div className="w-full max-w-[307px] lg:w-[235px]">
          <MetricCard
            title="Pending Orders"
            value="20"
            icon={<img src={require('../../assets/images/Seller/iconPending.png')} alt="" className="w-18 h-14" />}
            cardStyle={{ width: '100%' }}
          />
        </div>

        {/* Mobile responsive work: center card; desktop stays centered via lg:col-start-2 */}
        <div className="w-full max-w-[307px] lg:w-[235px] lg:col-start-2">
          <MetricCard
            title="Wallet Balance"
            value="PKR 25000.00"
            icon={<img src={require('../../assets/images/Seller/iconPayment.png')} alt="" className="w-18 h-14" />}
            cardStyle={{ width: '100%' }}
          />
        </div>
      </div>
    </SellerScaffold>
  );
};

export default SellerDashboard;


