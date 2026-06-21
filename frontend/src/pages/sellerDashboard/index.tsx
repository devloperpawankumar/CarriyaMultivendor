import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SellerScaffold from '../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../components/seller/menuConfig';
import HeroBanner from '../../components/seller/HeroBanner';
import MetricCard from '../../components/seller/MetricCard';
import { fetchSellerDashboardOverview } from '../../services/dashboardService';

type DashboardMetrics = {
  todaySales: string;
  todaySalesGross?: string;
  todayCommission?: string;
  totalOrders: number;
  pendingOrders: number;
  walletBalance: number;
};

const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const overview = await fetchSellerDashboardOverview();
        if (!mounted) return;
        const grossToday = overview.metrics.todaySales ?? 0;
        const netToday = overview.metrics.todayNetSales ?? grossToday;
        const commissionToday =
          overview.metrics.todayCommission ?? Math.max(0, grossToday - netToday);
        setMetrics({
          todaySales: `PKR ${netToday.toLocaleString('en-PK')}`,
          todaySalesGross: `PKR ${grossToday.toLocaleString('en-PK')}`,
          todayCommission: `PKR ${commissionToday.toLocaleString('en-PK')}`,
          totalOrders: overview.metrics.totalOrders,
          pendingOrders: overview.metrics.pendingOrders,
          walletBalance: overview.metrics.walletBalance,
        });
      } catch {
        if (!mounted) return;
        setMetrics({
          todaySales: 'PKR 0',
          todaySalesGross: 'PKR 0',
          todayCommission: 'PKR 0',
          totalOrders: 0,
          pendingOrders: 0,
          walletBalance: 0,
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const formatNumber = (value?: number) =>
    typeof value === 'number' ? value.toLocaleString('en-PK') : '0';

  const navigateToOrders = (statusSlug?: string) => {
    if (statusSlug) {
      navigate(`/seller/manage-orders/${statusSlug}`);
    } else {
      navigate('/seller/manage-orders');
    }
  };

  const navigateToPayments = () => {
    navigate('/seller/manage-payments');
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
        {/* Mobile responsive work: center card and set mobile width  */}
        <div className="w-full  max-w-[307px] lg:w-[235px]">
          <MetricCard
            title="Today Sales"
            value={metrics?.todaySalesGross || (loading ? 'Loading…' : 'PKR 0')}
            icon={<img src={require('../../assets/images/Seller/iconSales.png')} alt="" className="w-18 h-14" />}
            cardStyle={{ width: '100%' }}
            onButtonClick={() => navigateToOrders('completed')}
          />
        </div>

        {/* Mobile responsive work: center card and set mobile width  */}
        <div className="w-full max-w-[307px] lg:w-[235px]">
          <MetricCard
            title="Total Orders"
            value={metrics ? formatNumber(metrics.totalOrders) : loading ? 'Loading…' : '0'}
            icon={<img src={require('../../assets/images/Seller/iconOrders.png')} alt="" className="w-18 h-14" />}
            cardStyle={{ width: '100%' }}
            onButtonClick={() => navigateToOrders()}
          />
        </div>

        {/* Mobile responsive work: center card and set mobile width*/}
        <div className="w-full max-w-[307px] lg:w-[235px]">
          <MetricCard
            title="Pending Orders"
            value={metrics ? formatNumber(metrics.pendingOrders) : loading ? 'Loading…' : '0'}
            icon={<img src={require('../../assets/images/Seller/iconPending.png')} alt="" className="w-18 h-14" />}
            cardStyle={{ width: '100%' }}
            onButtonClick={() => navigateToOrders('new')}
          />
        </div>

        {/* Mobile responsive work: center card; desktop stays centered via lg:col-start-2 */}
        <div className="w-full max-w-[307px] lg:w-[235px] lg:col-start-2">
          <MetricCard
            title="Wallet Balance"
            value={
              metrics
                ? `PKR ${formatNumber(metrics.walletBalance)}`
                : loading
                ? 'Loading…'
                : 'PKR 0'
            }
            icon={<img src={require('../../assets/images/Seller/iconPayment.png')} alt="" className="w-18 h-14" />}
            cardStyle={{ width: '100%' }}
            onButtonClick={navigateToPayments}
          />
        </div>
      </div>
    </SellerScaffold>
  );
};

export default SellerDashboard;


