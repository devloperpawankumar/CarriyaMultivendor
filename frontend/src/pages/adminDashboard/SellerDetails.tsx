import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminTopGreenHeader from '../../components/admin/AdminTopGreenHeader';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import Footer from '../../components/Footer';
import { fetchSellerDetails, approveSeller, suspendSeller, reactivateSeller, SellerDetailsResponse } from '../../services/adminService';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/common/ConfirmModal';

const SellerDetails: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { showToast } = useToast();
	
	const [seller, setSeller] = useState<SellerDetailsResponse | null>(null);
	console.log('seller data', seller);		 	
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [confirmSuspendOpen, setConfirmSuspendOpen] = useState(false);


	useEffect(() => {
		console.log("UPDATED seller:", seller);
	  }, [seller]);
	// Fetch seller details
	useEffect(() => {
		if (!id) return;
		
		
		// const controller = new AbortController();
		
		const loadSellerDetails = async () => {
			try {
				setLoading(true);
				setError(null);
				
				const data = await fetchSellerDetails(id);
				console.log("API response:", data);
				
			
				
				if (data) {
					console.log('before setSeller', data);
					setSeller(data);
					console.log('after setSeller', data);
				} else {
					setError('Seller not found');
				}
			} catch (err: any) {
				if (err.name !== 'AbortError') {
					setError('Failed to load seller details');
					console.error('Error loading seller details:', err);
				}
			} finally {
				setLoading(false);
			}
		};
		
		loadSellerDetails();
		
		// return () => controller.abort();
	}, [id]);

	

	// Handle menu navigation
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

	// Handle approve seller
	const handleApproveSeller = async () => {
		if (!id || !seller) return;
		
		setActionLoading('approve');
		try {
			const result = await approveSeller(id);
			if (result.success) {
				// Refresh seller details
				const updated = await fetchSellerDetails(id);
				if (updated) setSeller(updated);
				showToast({ type: 'success', title: 'Approved', message: 'Seller approved successfully!' });
			} else {
				showToast({ type: 'error', title: 'Error', message: result.message || 'Failed to approve seller' });
			}
		} catch (err) {
			showToast({ type: 'error', title: 'Error', message: 'Failed to approve seller' });
		} finally {
			setActionLoading(null);
		}
	};

	// Handle suspend seller
	const handleSuspendSeller = async () => {
		if (!id || !seller) return;
		setConfirmSuspendOpen(true);
	};

	const confirmSuspendSeller = async () => {
		if (!id || !seller) return;
		setActionLoading('suspend');
		try {
			const result = await suspendSeller(id);
			if (result.success) {
				// Refresh seller details
				const updated = await fetchSellerDetails(id);
				if (updated) setSeller(updated);
				setConfirmSuspendOpen(false);
				showToast({ type: 'success', title: 'Suspended', message: 'Seller suspended successfully!' });
			} else {
				showToast({ type: 'error', title: 'Error', message: result.message || 'Failed to suspend seller' });
			}
		} catch (err) {
			showToast({ type: 'error', title: 'Error', message: 'Failed to suspend seller' });
		} finally {
			setActionLoading(null);
		}
	};

	// Handle reactivate seller
	const handleReactivateSeller = async () => {
		if (!id || !seller) return;

		// const confirmed = window.confirm('Are you sure you want to reactivate this seller?');
		// if (!confirmed) return;

		setActionLoading('reactivate');
		try {
			const result = await reactivateSeller(id);
			if (result.success) {
				const updated = await fetchSellerDetails(id);
				if (updated) setSeller(updated);
				showToast({ type: 'success', title: 'Reactivated', message: 'Seller reactivated successfully!' });
			} else {
				showToast({ type: 'error', title: 'Error', message: result.message || 'Failed to reactivate seller' });
			}
		} catch (err) {
			showToast({ type: 'error', title: 'Error', message: 'Failed to reactivate seller' });
		} finally {
			setActionLoading(null);
		}
	};

	// Get status badge style
	const getStatusBadgeStyle = (status: string) => {
		switch (status) {
			case 'Active':
				return 'bg-[#DCFCE7] text-[#008236] border border-[#B9F8CF]';
			case 'Pending':
				return 'bg-[#FEF9C2] text-[#A65F00] border border-[#FFF085]';
			case 'Suspended':
				return 'bg-[#FFE2E2] text-[#C10007] border border-[#FFC9C9]';
			default:
				return 'bg-gray-100 text-gray-600 border border-gray-300';
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
							activeKey="sellers"
							onMenuClick={handleMenuClick}
						/>
					}
					header={<AdminTopBar title="Seller Details" />}
				>
					<div className="flex justify-center items-center py-20">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ECC71]"></div>
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
							activeKey="sellers"
							onMenuClick={handleMenuClick}
						/>
					}
					header={<AdminTopBar title="Seller Details" />}
				>
					<div className="flex flex-col items-center justify-center py-20">
						<p className="text-red-600 text-lg mb-4">{error || 'Seller not found'}</p>
						<button
							onClick={() => navigate('/admin/sellers')}
							className="text-[#2ECC71] hover:underline"
						>
							Back to Sellers
						</button>
					</div>
				</AdminLayout>
				<Footer />
			</div>
		);
	}
	if (!seller) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p>Loading seller...</p>
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
						activeKey="sellers"
						onMenuClick={handleMenuClick}
					/>
				}
				header={<AdminTopBar title="Seller Details" />}
			>
				<ConfirmModal
					open={confirmSuspendOpen}
					title="Suspend seller?"
					message="Suspending will immediately log the seller out and archive their active listings. You can reactivate the seller later."
					confirmText="Suspend seller"
					cancelText="Cancel"
					danger
					loading={actionLoading === 'suspend'}
					onConfirm={confirmSuspendSeller}
					onClose={() => setConfirmSuspendOpen(false)}
				/>
				<div className="bg-white flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6">
					{/* Back Button */}
					<button
						onClick={() => navigate('/admin/sellers')}
						className="flex items-center gap-2 text-[#6A7282] hover:text-[#2ECC71] transition-colors"
						style={{ fontFamily: 'Arimo, sans-serif' }}
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
						<span className="text-[14px]">Back to Sellers</span>
					</button>

					{/* Header Section */}
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
						<div className="flex-1">
							<h1
								className="text-[24px] sm:text-[32px] font-bold text-[#101828] mb-2"
								style={{ fontFamily: 'Arimo, sans-serif' }}
							>
								{seller.storeName}
								
							</h1>
							
							<p
								className="text-[14px] sm:text-[16px] text-[#6A7282]"
								style={{ fontFamily: 'Arimo, sans-serif' }}
							>
								Owner: {seller.ownerName}
							</p>
						</div>
						<div>
							<span
								className={`inline-flex px-4 py-2 rounded-full text-[14px] font-medium ${getStatusBadgeStyle(seller.status)}`}
								style={{ fontFamily: 'Arimo, sans-serif' }}
							>
								{seller.status}
							</span>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-wrap gap-3">
						{seller.status === 'Pending' && (
							<button
								onClick={handleApproveSeller}
								disabled={actionLoading === 'approve'}
								className="px-6 py-2.5 bg-[#2ECC71] text-white rounded-lg font-medium text-[14px] hover:bg-[#27AE60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								style={{ fontFamily: 'Arimo, sans-serif' }}
							>
								{actionLoading === 'approve' ? 'Approving...' : 'Approve Seller'}
							</button>
						)}
						{seller.status !== 'Suspended' && (
							<button
								onClick={handleSuspendSeller}
								disabled={actionLoading === 'suspend'}
								className="px-6 py-2.5 bg-white border-2 border-[#FF0000] text-[#FF0000] rounded-lg font-medium text-[14px] hover:bg-[#FFF5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								style={{ fontFamily: 'Arimo, sans-serif' }}
							>
								{actionLoading === 'suspend' ? 'Suspending...' : 'Suspend Seller'}
							</button>
						)}
						{seller.status === 'Suspended' && (
							<button
								onClick={handleReactivateSeller}
								disabled={actionLoading === 'reactivate'}
								className="px-6 py-2.5 bg-[#2ECC71] text-white rounded-lg font-medium text-[14px] hover:bg-[#27AE60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								style={{ fontFamily: 'Arimo, sans-serif' }}
							>
								{actionLoading === 'reactivate' ? 'Reactivating...' : 'Reactivate Seller'}
							</button>
						)}
						<button
							onClick={() => navigate(`/admin/orders?sellerId=${encodeURIComponent(id || '')}`)}
							disabled={!id}
							className="px-6 py-2.5 bg-white border border-[#D1D5DC] text-[#364153] rounded-lg font-medium text-[14px] hover:bg-gray-50 transition-colors"
							style={{ fontFamily: 'Arimo, sans-serif' }}
						>
							Manage Orders
						</button>
						<button
							onClick={() => navigate(`/admin/payments?sellerId=${encodeURIComponent(id || '')}`)}
							disabled={!id}
							className="px-6 py-2.5 bg-white border border-[#D1D5DC] text-[#364153] rounded-lg font-medium text-[14px] hover:bg-gray-50 transition-colors"
							style={{ fontFamily: 'Arimo, sans-serif' }}
						>
							Manage Payments
						</button>
					</div>

					{/* Store & Owner Details Card */}
					<div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
						<h2
							className="text-[18px] sm:text-[20px] font-bold text-[#101828] mb-6"
							style={{ fontFamily: 'Arimo, sans-serif' }}
						>
							Store & Owner Details
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							<div>
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Store Name
								</p>
								<p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
									{seller.storeName}
								</p>
							</div>
							<div>
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Owner Name
								</p>
								<p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
									{seller.ownerName}
								</p>
							</div>
							<div>
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Email
								</p>
								<p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
									{seller.email}
								</p>
							</div>
							<div>
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Contact Number
								</p>
								<p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
									{seller.contactNumber}
								</p>
							</div>
							<div>
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Seller Status
								</p>
								<span
									className={`inline-flex px-3 py-1 rounded-full text-[14px] font-medium ${getStatusBadgeStyle(seller.status)}`}
									style={{ fontFamily: 'Arimo, sans-serif' }}
								>
									{seller.status}
								</span>
							</div>
							<div>
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Commission Percentage
								</p>
								<p className="text-[20px] sm:text-[24px] text-[#2ECC71] font-bold" style={{ fontFamily: 'Arimo, sans-serif' }}>
									{seller.commission}%
								</p>
							</div>
						</div>
					</div>

					{/* Address Information Card */}
					<div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
						<h2
							className="text-[18px] sm:text-[20px] font-bold text-[#101828] mb-6"
							style={{ fontFamily: 'Arimo, sans-serif' }}
						>
							Address Information
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							<div>
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Pickup Address
								</p>
								<p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
									{seller.pickupAddress}
								</p>
							</div>
							<div>
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Return Address
								</p>
								<p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
									{seller.returnAddress}
								</p>
							</div>
						</div>
					</div>

					{/* Identity Verification Card */}
					<div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
						<h2
							className="text-[18px] sm:text-[20px] font-bold text-[#101828] mb-6"
							style={{ fontFamily: 'Arimo, sans-serif' }}
						>
							Identity Verification
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
							<div>
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Name on ID Card
								</p>
								<p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
									{seller.nameOnIdCard}
								</p>
							</div>
							<div>
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									ID Card Number
								</p>
								<p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
									{seller.idCardNumber}
								</p>
							</div>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* ID Front */}
							<div>
								<p className="text-[12px] text-[#6A7282] mb-3" style={{ fontFamily: 'Arimo, sans-serif' }}>
									ID Card Front
								</p>
								<div
									role="button"
									tabIndex={0}
									onClick={() => seller.idCardFrontUrl && window.open(seller.idCardFrontUrl, '_blank', 'noopener,noreferrer')}
									onKeyDown={(e) => {
										if ((e.key === 'Enter' || e.key === ' ') && seller.idCardFrontUrl) {
											e.preventDefault();
											window.open(seller.idCardFrontUrl, '_blank', 'noopener,noreferrer');
										}
									}}
									className="relative border-2 border-dashed border-[#D1D5DC] rounded-lg bg-[#F9FAFB] hover:border-[#2ECC71] transition-colors cursor-pointer w-full aspect-[4/3] overflow-hidden"
								>
									{seller.idCardFrontUrl ? (
										<img
											src={seller.idCardFrontUrl}
											alt="ID Card Front"
											className="absolute inset-0 w-full h-full object-contain p-4"
										/>
									) : (
										<div className="absolute inset-0 flex items-center justify-center text-[12px] text-[#9CA3AF]" style={{ fontFamily: 'Arimo, sans-serif' }}>
											No document uploaded
										</div>
									)}
								</div>
							</div>

							{/* ID Back */}
							<div>
								<p className="text-[12px] text-[#6A7282] mb-3" style={{ fontFamily: 'Arimo, sans-serif' }}>
									ID Card Back
								</p>
								<div
									role="button"
									tabIndex={0}
									onClick={() => seller.idCardBackUrl && window.open(seller.idCardBackUrl, '_blank', 'noopener,noreferrer')}
									onKeyDown={(e) => {
										if ((e.key === 'Enter' || e.key === ' ') && seller.idCardBackUrl) {
											e.preventDefault();
											window.open(seller.idCardBackUrl, '_blank', 'noopener,noreferrer');
										}
									}}
									className="relative border-2 border-dashed border-[#D1D5DC] rounded-lg bg-[#F9FAFB] hover:border-[#2ECC71] transition-colors cursor-pointer w-full aspect-[4/3] overflow-hidden"
								>
									{seller.idCardBackUrl ? (
										<img
											src={seller.idCardBackUrl}
											alt="ID Card Back"
											className="absolute inset-0 w-full h-full object-contain p-4"
										/>
									) : (
										<div className="absolute inset-0 flex items-center justify-center text-[12px] text-[#9CA3AF]" style={{ fontFamily: 'Arimo, sans-serif' }}>
											No document uploaded
										</div>
									)}
								</div>
							</div>

						</div>
					</div>

					{/* Bank/Account Details Card */}
					<div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
						<h2
							className="text-[18px] sm:text-[20px] font-bold text-[#101828] mb-6"
							style={{ fontFamily: 'Arimo, sans-serif' }}
						>
							Bank / Account Details
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
							<div>
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Account Holder Name
								</p>
								<p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
									{seller.accountHolderName}
								</p>
							</div>
							<div>
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									IBAN Number
								</p>
								<p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
									{seller.ibanNumber}
								</p>
							</div>
							<div>
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Account Number
								</p>
								<p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
									{seller.accountNumber}
								</p>
							</div>
							<div>
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Bank Name
								</p>
								<p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
									{seller.bankName}
								</p>
							</div>
							<div className="sm:col-span-2">
								<p className="text-[12px] text-[#6A7282] mb-2" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Branch Code
								</p>
								<p className="text-[14px] sm:text-[16px] text-[#101828] font-medium" style={{ fontFamily: 'Arimo, sans-serif' }}>
									{seller.branchCode}
								</p>
							</div>
						</div>
						<div>
							<p className="text-[12px] text-[#6A7282] mb-3" style={{ fontFamily: 'Arimo, sans-serif' }}>
								Bank Document Upload
							</p>
							<div
								role="button"
								tabIndex={0}
								onClick={() => seller.bankDocumentUrl && window.open(seller.bankDocumentUrl, '_blank', 'noopener,noreferrer')}
								onKeyDown={(e) => {
									if ((e.key === 'Enter' || e.key === ' ') && seller.bankDocumentUrl) {
										e.preventDefault();
										window.open(seller.bankDocumentUrl, '_blank', 'noopener,noreferrer');
									}
								}}
								className="relative border-2 border-dashed border-[#D1D5DC] rounded-lg bg-[#F9FAFB] hover:border-[#2ECC71] transition-colors cursor-pointer w-full max-w-md aspect-[4/3] overflow-hidden"
							>
								{seller.bankDocumentUrl ? (
									<img
										src={seller.bankDocumentUrl}
										alt="Bank Document"
										className="absolute inset-0 w-full h-full object-contain p-4"
									/>
								) : (
									<div className="absolute inset-0 flex items-center justify-center text-[12px] text-[#9CA3AF]" style={{ fontFamily: 'Arimo, sans-serif' }}>
										No document uploaded
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</AdminLayout>
			<Footer />
		</div>
	);
};

export default SellerDetails;
