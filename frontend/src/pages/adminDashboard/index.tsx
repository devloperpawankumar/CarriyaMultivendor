import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminTopGreenHeader from '../../components/admin/AdminTopGreenHeader';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import StatCard from '../../components/admin/StatCard';
import RecentOrdersTable, { RecentOrder } from '../../components/admin/RecentOrdersTable';
import NewSellersList, { NewSeller } from '../../components/admin/NewSellersList';
import LoadingState from '../../components/admin/LoadingState';
import ErrorState from '../../components/admin/ErrorState';
import Footer from '../../components/Footer';
import { 
    fetchAdminDashboardOverview,
    DashboardStats 
} from '../../services/adminService';

const AdminDashboard: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [newSellers, setNewSellers] = useState<NewSeller[]>([]);

    useEffect(() => {
        let mounted = true;
        const ac = new AbortController();

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const overview = await fetchAdminDashboardOverview(ac.signal);
                if (!mounted) return;
                
                setStats(overview.stats);
                setRecentOrders(overview.recentOrders);
                setNewSellers(overview.newSellers);
            } catch (err: any) {
                if (!mounted) return;
                console.error('Failed to load admin dashboard:', err);
                setError(err?.message || 'Failed to load dashboard data');
                // Set defaults on error (backend-friendly)
                setStats({
                    totalUsers: 0,
                    totalSellers: 0,
                    totalOrders: 0,
                    platformEarnings: 0,
                });
                setRecentOrders([]);
                setNewSellers([]);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            mounted = false;
            ac.abort();
        };
    }, []);

    const activeKey =
        location.pathname.includes('/admin/settings') ? 'settings' :
        location.pathname.includes('/admin/transactions') ? 'payments' :
        location.pathname.includes('/admin/buyers') ? 'users' :
        location.pathname.includes('/admin/sellers') ? 'sellers' :
        location.pathname.includes('/admin/orders') ? 'orders' :
        location.pathname.includes('/admin/payments') ? 'payments' :
        location.pathname.includes('/admin/settings') ? 'settings' :
        'dashboard';

    const handleMenuClick = (key: string) => {
        switch (key) {
            case 'dashboard':
                navigate('/admin/dashboard');
                break;
            case 'users':
                navigate('/admin/buyers');
                break;
            case 'sellers':
                navigate('/admin/sellers');
                break;
            case 'orders':
                navigate('/admin/orders');
                break;
            case 'payments':
                navigate('/admin/payments');
                break;
            case 'settings':
                navigate('/admin/settings');
                break;
            default:
                break;
        }
    };

    // Import stat card icons
    const usersIcon = require('../../assets/images/Admin/ad-state-user.png');
    const sellersIcon = require('../../assets/images/Admin/ad-state-seller.png');
    const ordersIcon = require('../../assets/images/Admin/ad-state-orders.png');
    const earningsIcon = require('../../assets/images/Admin/ad-earning.png');

    return (
        <div className="min-h-screen bg-white">
            <AdminTopGreenHeader />
            <AdminLayout
                sidebar={
                    <AdminSidebar 
                        topLogoSrc={require('../../assets/images/Carriya logo 1.png')}
                        activeKey={activeKey}
                        onMenuClick={handleMenuClick}
                    />
                }
                header={<AdminTopBar title="Dashboard" />}
            >
                <div className="bg-white" style={{ paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32 }}>
                    {loading ? (
                        <LoadingState message="Loading dashboard..." />
                    ) : error ? (
                        <ErrorState 
                            message={error} 
                            onRetry={() => window.location.reload()} 
                        />
                    ) : (
                        <div className="flex flex-col gap-8" style={{ gap: 32 }}>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8" style={{ gap: 24 }}>
                                <StatCard 
                                    title="Total Users" 
                                    value={stats?.totalUsers.toLocaleString('en-PK') || '0'} 
                                    icon={usersIcon}
                                    iconBgColor="#F0FDF4"
                                />
                                <StatCard 
                                    title="Total Sellers" 
                                    value={stats?.totalSellers.toLocaleString('en-PK') || '0'} 
                                    icon={sellersIcon}
                                    iconBgColor="#F0FDF4"
                                />
                                <StatCard 
                                    title="Total Orders" 
                                    value={stats?.totalOrders.toLocaleString('en-PK') || '0'} 
                                    icon={ordersIcon}
                                    iconBgColor="#F0FDF4"
                                />
                                <StatCard 
                                    title="Platform Earnings" 
                                    value={`PKR ${stats?.platformEarnings.toLocaleString('en-PK') || '0'}`} 
                                    icon={earningsIcon}
                                    iconBgColor="#F0FDF4"
                                />
                            </div>

                            {/* Recent Orders and New Sellers */}
                            <div className="flex flex-col gap-6 lg:gap-8">
                                <div className="w-full">
                                    <RecentOrdersTable orders={recentOrders} />
                                </div>
                                <div className="w-full">
                                    <NewSellersList sellers={newSellers} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AdminLayout>
            <Footer />
        </div>
    );
};

export default AdminDashboard;


