import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminTopGreenHeader from '../../components/admin/AdminTopGreenHeader';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import Footer from '../../components/Footer';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  approveBuyer,
  blockBuyer,
  BuyerDetailsResponse,
  fetchBuyerDetails,
  unblockBuyer,
} from '../../services/adminService';
import { useToast } from '../../contexts/ToastContext';

const BuyerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [buyer, setBuyer] = useState<BuyerDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmBlockOpen, setConfirmBlockOpen] = useState(false);

  const activeKey = 'users';

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

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBuyerDetails(id, ac.signal);
        if (!mounted) return;
        if (!data) {
          setError('Buyer not found');
          setBuyer(null);
        } else {
          setBuyer(data);
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load buyer details');
        setBuyer(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      ac.abort();
    };
  }, [id]);

  const statusBadgeClass = useMemo(() => {
    switch (buyer?.status) {
      case 'Active':
        return 'bg-[#DCFCE7] text-[#008236] border border-[#B9F8CF]';
      case 'Pending':
        return 'bg-[#FEF9C2] text-[#A65F00] border border-[#FFF085]';
      case 'Suspended':
        return 'bg-[#FFE2E2] text-[#C10007] border border-[#FFC9C9]';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-300';
    }
  }, [buyer?.status]);

  const joinedDate = useMemo(() => {
    const raw: any = (buyer as any)?.createdAt || (buyer as any)?.joinedDate;
    if (!raw) return 'N/A';
    try {
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return String(raw);
      return d.toISOString().split('T')[0];
    } catch {
      return String(raw);
    }
  }, [buyer]);

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading('approve');
    try {
      await approveBuyer(id);
      const updated = await fetchBuyerDetails(id);
      if (updated) setBuyer(updated);
      showToast({ type: 'success', title: 'Approved', message: 'Buyer approved successfully!' });
    } catch (e: any) {
      showToast({ type: 'error', title: 'Error', message: e?.message || 'Failed to approve buyer' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlock = async () => {
    if (!id) return;
    setConfirmBlockOpen(true);
  };

  const confirmBlock = async () => {
    if (!id) return;
    setActionLoading('block');
    try {
      await blockBuyer(id);
      const updated = await fetchBuyerDetails(id);
      if (updated) setBuyer(updated);
      setConfirmBlockOpen(false);
      showToast({ type: 'success', title: 'Suspended', message: 'Buyer blocked successfully!' });
    } catch (e: any) {
      showToast({ type: 'error', title: 'Error', message: e?.message || 'Failed to block buyer' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async () => {
    if (!id) return;
    setActionLoading('unblock');
    try {
      await unblockBuyer(id);
      const updated = await fetchBuyerDetails(id);
      if (updated) setBuyer(updated);
      showToast({ type: 'success', title: 'Reactivated', message: 'Buyer reactivated successfully!' });
    } catch (e: any) {
      showToast({ type: 'error', title: 'Error', message: e?.message || 'Failed to reactivate buyer' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
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
          header={<AdminTopBar title="Buyer Details" />}
        >
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ECC71]" />
          </div>
        </AdminLayout>
        <Footer />
      </div>
    );
  }

  if (error) {
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
          header={<AdminTopBar title="Buyer Details" />}
        >
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button onClick={() => navigate('/admin/buyers')} className="text-[#2ECC71] hover:underline">
              Back to Buyers
            </button>
          </div>
        </AdminLayout>
        <Footer />
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading buyer...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AdminTopGreenHeader />
      <AdminLayout
        sidebar={
          <AdminSidebar
            topLogoSrc={require('../../assets/images/Carriya logo 1.png')}
            activeKey={activeKey}
            onMenuClick={handleMenuClick}
          />
        }
        header={<AdminTopBar title="Buyer Details" />}
      >
        <ConfirmModal
          open={confirmBlockOpen}
          title="Block buyer?"
          message="Blocked buyers will be logged out immediately and cannot log back in until reactivated."
          confirmText="Block buyer"
          cancelText="Cancel"
          danger
          loading={actionLoading === 'block'}
          onConfirm={confirmBlock}
          onClose={() => setConfirmBlockOpen(false)}
        />
        <div className="bg-white flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/admin/buyers')}
            className="flex items-center gap-2 text-[#6A7282] hover:text-[#2ECC71] transition-colors"
            style={{ fontFamily: 'Arimo, sans-serif' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[14px]">Back to Buyers</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1
                className="text-[24px] sm:text-[32px] font-bold text-[#101828] mb-2"
                style={{ fontFamily: 'Arimo, sans-serif' }}
              >
                {buyer.name || 'Buyer'}
              </h1>
              <p className="text-[14px] sm:text-[16px] text-[#6A7282]" style={{ fontFamily: 'Arimo, sans-serif' }}>
                {buyer.email || buyer.phone || 'N/A'}
              </p>
            </div>
            <div>
              <span
                className={`inline-flex px-4 py-2 rounded-full text-[14px] font-medium ${statusBadgeClass}`}
                style={{ fontFamily: 'Arimo, sans-serif' }}
              >
                {buyer.status}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {buyer.status === 'Pending' && (
              <button
                onClick={handleApprove}
                disabled={actionLoading === 'approve'}
                className="px-6 py-2.5 bg-[#2ECC71] text-white rounded-lg font-medium text-[14px] hover:bg-[#27AE60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Arimo, sans-serif' }}
              >
                {actionLoading === 'approve' ? 'Approving...' : 'Approve Buyer'}
              </button>
            )}
            {buyer.status === 'Active' && (
              <button
                onClick={handleBlock}
                disabled={actionLoading === 'block'}
                className="px-6 py-2.5 bg-white border-2 border-[#FF0000] text-[#FF0000] rounded-lg font-medium text-[14px] hover:bg-[#FFF5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Arimo, sans-serif' }}
              >
                {actionLoading === 'block' ? 'Blocking...' : 'Block Buyer'}
              </button>
            )}
            {buyer.status === 'Suspended' && (
              <button
                onClick={handleUnblock}
                disabled={actionLoading === 'unblock'}
                className="px-6 py-2.5 bg-[#2ECC71] text-white rounded-lg font-medium text-[14px] hover:bg-[#27AE60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Arimo, sans-serif' }}
              >
                {actionLoading === 'unblock' ? 'Reactivating...' : 'Reactivate Buyer'}
              </button>
            )}
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
            <h2
              className="text-[18px] sm:text-[20px] font-bold text-[#101828] mb-6"
              style={{ fontFamily: 'Arimo, sans-serif' }}
            >
              Buyer Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
                  Email
                </p>
                <p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
                  {buyer.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
                  Phone
                </p>
                <p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
                  {buyer.phone || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
                  Joined Date
                </p>
                <p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
                  {joinedDate}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
                  Total Orders
                </p>
                <p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
                  {Number(buyer.totalOrders || 0).toLocaleString('en-PK')}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
                  Total Spent (Delivered)
                </p>
                <p className="text-[20px] sm:text-[24px] text-[#2ECC71] font-bold" style={{ fontFamily: 'Arimo, sans-serif' }}>
                  PKR {Number(buyer.totalSpent || 0).toLocaleString('en-PK')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
            <h2
              className="text-[18px] sm:text-[20px] font-bold text-[#101828] mb-4"
              style={{ fontFamily: 'Arimo, sans-serif' }}
            >
              Recent Orders
            </h2>
            {buyer.recentOrders && buyer.recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[12px] text-[#6A7282] border-b border-[#E5E7EB]">
                      <th className="py-2 pr-4" style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Order
                      </th>
                      <th className="py-2 pr-4" style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Amount
                      </th>
                      <th className="py-2 pr-4" style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Status
                      </th>
                      <th className="py-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyer.recentOrders.slice(0, 10).map((o, idx) => (
                      <tr
                        key={`${o.orderNumber || idx}`}
                        className="border-b border-[#F3F4F6] text-[14px]"
                        style={{ fontFamily: 'Arimo, sans-serif' }}
                      >
                        <td className="py-3 pr-4 text-[#101828]">{o.orderNumber || 'N/A'}</td>
                        <td className="py-3 pr-4 text-[#101828]">
                          PKR {Number(o.total || 0).toLocaleString('en-PK')}
                        </td>
                        <td className="py-3 pr-4 text-[#364153]">{o.status || 'N/A'}</td>
                        <td className="py-3 text-[#364153]">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-PK') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[14px] text-[#6A7282]" style={{ fontFamily: 'Arimo, sans-serif' }}>
                No recent orders found.
              </p>
            )}
          </div>
        </div>
      </AdminLayout>
      <Footer />
    </div>
  );
};

export default BuyerDetails;


  