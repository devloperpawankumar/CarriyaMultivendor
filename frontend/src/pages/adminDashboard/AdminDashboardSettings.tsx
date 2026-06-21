import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminTopGreenHeader from '../../components/admin/AdminTopGreenHeader';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import Footer from '../../components/Footer';
import { fetchAdminSettings, updateAdminSettings, AdminPlatformSettings } from '../../services/adminService';
import { useToast } from '../../contexts/ToastContext';

const AdminDashboardSettings: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { showToast } = useToast();

	// State for settings
	const [settings, setSettings] = useState<AdminPlatformSettings | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Loading states for individual save buttons
	const [savingCommission, setSavingCommission] = useState(false);
	const [savingEscrow, setSavingEscrow] = useState(false);
	const [savingWithdrawal, setSavingWithdrawal] = useState(false);
	const [savingToggles, setSavingToggles] = useState(false);

	// Load settings on mount
	useEffect(() => {
		const controller = new AbortController();
		(async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await fetchAdminSettings(controller.signal);
				if (!controller.signal.aborted) setSettings(data);
			} catch (e: any) {
				if (!controller.signal.aborted) {
					setError(e?.message || 'Failed to load settings.');
				}
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		})();
		return () => controller.abort();
	}, []);

	// Determine active sidebar key
	const activeKey = location.pathname.includes('/admin/settings') ? 'settings' : 'dashboard';

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

	// Handle commission save
	const handleSaveCommission = async () => {
		if (!settings) return;
		setSavingCommission(true);
		try {
			const next = await updateAdminSettings(
				{ platformCommissionPercent: settings.platformCommissionPercent },
			);
			setSettings(next);
			showToast({ type: 'success', title: 'Saved', message: 'Platform commission updated successfully!' });
		} catch (error) {
			console.error('Error saving commission:', error);
			showToast({ type: 'error', title: 'Error', message: 'Failed to save commission. Please try again.' });
		} finally {
			setSavingCommission(false);
		}
	};

	// Handle escrow save
	const handleSaveEscrow = async () => {
		if (!settings) return;
		setSavingEscrow(true);
		try {
			const next = await updateAdminSettings(
				{ escrowHoldDays: settings.escrowHoldDays },
			);
			setSettings(next);
			showToast({ type: 'success', title: 'Saved', message: 'Escrow settings updated successfully!' });
		} catch (error) {
			console.error('Error saving escrow settings:', error);
			showToast({ type: 'error', title: 'Error', message: 'Failed to save escrow settings. Please try again.' });
		} finally {
			setSavingEscrow(false);
		}
	};

	// Handle minimum withdrawal save
	const handleSaveMinimumWithdrawal = async () => {
		if (!settings) return;
		setSavingWithdrawal(true);
		try {
			const next = await updateAdminSettings(
				{ minimumWithdrawalAmount: settings.minimumWithdrawalAmount },
			);
			setSettings(next);
			showToast({ type: 'success', title: 'Saved', message: 'Minimum withdrawal amount updated successfully!' });
		} catch (error) {
			console.error('Error saving minimum withdrawal:', error);
			showToast({ type: 'error', title: 'Error', message: 'Failed to save minimum withdrawal amount. Please try again.' });
		} finally {
			setSavingWithdrawal(false);
		}
	};

	const handleToggleAutoRelease = () => {
		if (!settings) return;
		const nextLocal = { ...settings, autoReleasePayouts: !settings.autoReleasePayouts };
		setSettings(nextLocal);
		setSavingToggles(true);
		updateAdminSettings({ autoReleasePayouts: nextLocal.autoReleasePayouts })
			.then((next) => setSettings(next))
			.catch((e) => {
				console.error('Error updating auto release setting:', e);
				showToast({ type: 'error', title: 'Error', message: 'Failed to update setting. Please try again.' });
				setSettings(settings);
			})
			.finally(() => setSavingToggles(false));
	};

	// Handle toggle changes
	const handleToggleManualApproval = () => {
		if (!settings) return;
		const nextLocal = { ...settings, manualApprovalRequired: !settings.manualApprovalRequired };
		setSettings(nextLocal);
		setSavingToggles(true);
		updateAdminSettings({ manualApprovalRequired: nextLocal.manualApprovalRequired })
			.then((next) => setSettings(next))
			.catch((e) => {
				console.error('Error updating manual approval setting:', e);
				showToast({ type: 'error', title: 'Error', message: 'Failed to update setting. Please try again.' });
				setSettings(settings);
			})
			.finally(() => setSavingToggles(false));
	};

	const handleToggleNotification = (key: keyof AdminPlatformSettings['notifications']) => {
		if (!settings) return;
		const nextLocal = {
			...settings,
			notifications: { ...settings.notifications, [key]: !settings.notifications[key] },
		};
		setSettings(nextLocal);
		setSavingToggles(true);
		updateAdminSettings({ notifications: nextLocal.notifications })
			.then((next) => setSettings(next))
			.catch((e) => {
				console.error('Error updating notifications:', e);
				showToast({ type: 'error', title: 'Error', message: 'Failed to update setting. Please try again.' });
				setSettings(settings);
			})
			.finally(() => setSavingToggles(false));
	};

	return (
		<div className="min-h-screen bg-white">
			<AdminTopGreenHeader />
			<AdminLayout
				sidebar={
					<AdminSidebar
						activeKey={activeKey}
						topLogoSrc={require('../../assets/images/Carriya logo 1.png')}
						bottomLogoSrc={require('../../assets/images/Carriya logo 1.png')}
						onMenuClick={handleMenuClick}
					/>
				}
				header={<AdminTopBar title="Settings" />}
			>
				<div className="bg-white flex flex-col gap-4 sm:gap-[23.991px] px-4 py-6 sm:px-8 sm:py-8">
					{error && (
						<div className="w-full max-w-[850px] mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-red-600 text-sm" style={{ fontFamily: 'Arimo, sans-serif' }}>
								{error}
							</p>
						</div>
					)}

					{loading && (
						<div className="flex justify-center items-center py-20">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ECC71]" aria-label="Loading" />
						</div>
					)}

					{/* Settings Cards Container */}
					{!loading && settings && (
					<div className="space-y-6 w-full max-w-[850px] mx-auto">
						{/* Platform Commission */}
						<div
							className="bg-white rounded-[16px] p-6 sm:p-8"
							style={{
								boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
							}}
						>
							<h2
								className="text-[20px] font-bold text-[#101828] mb-2"
								style={{
									fontFamily: 'Arimo, sans-serif',
									lineHeight: '28px',
								}}
							>
								Platform Commission
							</h2>
							<p
								className="text-[14px] text-[#6A7282] mb-6"
								style={{
									fontFamily: 'Arimo, sans-serif',
									lineHeight: '20px',
								}}
							>
								Set the default commission percentage charged to sellers on each transaction.
							</p>

							<div className="mb-4">
								<label
									htmlFor="commission"
									className="block text-[14px] font-medium text-[#364153] mb-2"
									style={{
										fontFamily: 'Arimo, sans-serif',
										lineHeight: '20px',
									}}
								>
									Commission Percentage
								</label>
								<div className="flex items-center gap-3">
									<div className="relative flex-1 max-w-[200px]">
										<input
											type="number"
											id="commission"
											value={settings.platformCommissionPercent}
											onChange={(e) => setSettings(prev => prev ? ({ ...prev, platformCommissionPercent: Number(e.target.value) }) : prev)}
											className="w-full h-[44px] px-4 pr-10 rounded-[8px] border border-[#D1D5DC] text-[14px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
											style={{
												fontFamily: 'Arimo, sans-serif',
											}}
											min="0"
											max="100"
										/>
										<span
											className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#6A7282]"
											style={{
												fontFamily: 'Arimo, sans-serif',
											}}
										>
											%
										</span>
									</div>
									<button
										type="button"
										onClick={handleSaveCommission}
										disabled={savingCommission}
										className="px-6 py-2.5 rounded-[8px] text-[14px] font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										style={{
											fontFamily: 'Arimo, sans-serif',
											backgroundColor: '#2ECC71',
											lineHeight: '20px',
										}}
										onMouseEnter={(e) => {
											if (!savingCommission) {
												e.currentTarget.style.backgroundColor = '#27AE60';
											}
										}}
										onMouseLeave={(e) => {
											if (!savingCommission) {
												e.currentTarget.style.backgroundColor = '#2ECC71';
											}
										}}
									>
										{savingCommission ? 'Saving...' : 'Save'}
									</button>
								</div>
							</div>
						</div>

						{/* Escrow Settings */}
						<div
							className="bg-white rounded-[16px] p-6 sm:p-8"
							style={{
								boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
							}}
						>
							<h2
								className="text-[20px] font-bold text-[#101828] mb-2"
								style={{
									fontFamily: 'Arimo, sans-serif',
									lineHeight: '28px',
								}}
							>
								Escrow Settings
							</h2>
							<p
								className="text-[14px] text-[#6A7282] mb-6"
								style={{
									fontFamily: 'Arimo, sans-serif',
									lineHeight: '20px',
								}}
							>
								Configure how long payments are held in escrow before being released to sellers.
							</p>

							<div className="mb-4">
								<label
									htmlFor="escrow"
									className="block text-[14px] font-medium text-[#364153] mb-2"
									style={{
										fontFamily: 'Arimo, sans-serif',
										lineHeight: '20px',
									}}
								>
									Escrow Holding Days
								</label>
								<div className="flex items-center gap-3">
									<input
										type="number"
										id="escrow"
										value={settings.escrowHoldDays}
										onChange={(e) => setSettings(prev => prev ? ({ ...prev, escrowHoldDays: Number(e.target.value) }) : prev)}
										className="flex-1 max-w-[200px] h-[44px] px-4 rounded-[8px] border border-[#D1D5DC] text-[14px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
										style={{
											fontFamily: 'Arimo, sans-serif',
										}}
										min="0"
										max="60"
									/>
									<button
										type="button"
										onClick={handleSaveEscrow}
										disabled={savingEscrow}
										className="px-6 py-2.5 rounded-[8px] text-[14px] font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										style={{
											fontFamily: 'Arimo, sans-serif',
											backgroundColor: '#2ECC71',
											lineHeight: '20px',
										}}
										onMouseEnter={(e) => {
											if (!savingEscrow) {
												e.currentTarget.style.backgroundColor = '#27AE60';
											}
										}}
										onMouseLeave={(e) => {
											if (!savingEscrow) {
												e.currentTarget.style.backgroundColor = '#2ECC71';
											}
										}}
									>
										{savingEscrow ? 'Saving...' : 'Save'}
									</button>
								</div>
							</div>
						</div>

						{/* Seller Approval */}
						<div
							className="bg-white rounded-[16px] p-6 sm:p-8"
							style={{
								boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
							}}
						>
							<h2
								className="text-[20px] font-bold text-[#101828] mb-2"
								style={{
									fontFamily: 'Arimo, sans-serif',
									lineHeight: '28px',
								}}
							>
								Seller Approval
							</h2>
							<p
								className="text-[14px] text-[#6A7282] mb-6"
								style={{
									fontFamily: 'Arimo, sans-serif',
									lineHeight: '20px',
								}}
							>
								Choose whether new sellers require manual approval or are automatically approved.
							</p>

							<div className="flex items-center justify-between mb-3">
								<span
									className="text-[14px] font-medium text-[#364153]"
									style={{
										fontFamily: 'Arimo, sans-serif',
										lineHeight: '20px',
									}}
								>
									Manual Approval Required
								</span>
								<button
									type="button"
									onClick={handleToggleManualApproval}
									className={`relative inline-flex h-[24px] w-[44px] items-center rounded-full transition-colors ${
										settings.manualApprovalRequired ? 'bg-[#2ECC71]' : 'bg-[#D1D5DC]'
									}`}
								>
									<span
										className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white transition-transform ${
											settings.manualApprovalRequired ? 'translate-x-[22px]' : 'translate-x-[2px]'
										}`}
									/>
								</button>
							</div>
							<p
								className="text-[13px] text-[#6A7282]"
								style={{
									fontFamily: 'Arimo, sans-serif',
									lineHeight: '18px',
								}}
							>
								When enabled, new seller registrations will require admin approval before they can start selling.
							</p>
							{savingToggles && (
								<p className="mt-2 text-[12px] text-[#6A7282]" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Saving...
								</p>
							)}
						</div>

						{/* Withdrawal & Payout Controls */}
						<div
							className="bg-white rounded-[16px] p-6 sm:p-8"
							style={{
								boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
							}}
						>
							<h2
								className="text-[20px] font-bold text-[#101828] mb-2"
								style={{
									fontFamily: 'Arimo, sans-serif',
									lineHeight: '28px',
								}}
							>
								Withdrawal & Payout Controls
							</h2>
							<p
								className="text-[14px] text-[#6A7282] mb-6"
								style={{
									fontFamily: 'Arimo, sans-serif',
									lineHeight: '20px',
								}}
							>
								Control minimum withdrawal and whether escrow payouts auto-release when eligible.
							</p>

							<div className="mb-6">
								<label
									htmlFor="min_withdrawal"
									className="block text-[14px] font-medium text-[#364153] mb-2"
									style={{
										fontFamily: 'Arimo, sans-serif',
										lineHeight: '20px',
									}}
								>
									Minimum Withdrawal Amount (PKR)
								</label>
								<div className="flex items-center gap-3">
									<input
										type="number"
										id="min_withdrawal"
										value={settings.minimumWithdrawalAmount}
										onChange={(e) =>
											setSettings((prev) =>
												prev ? { ...prev, minimumWithdrawalAmount: Number(e.target.value) } : prev
											)
										}
										className="flex-1 max-w-[260px] h-[44px] px-4 rounded-[8px] border border-[#D1D5DC] text-[14px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
										style={{ fontFamily: 'Arimo, sans-serif' }}
										min="0"
										step="100"
									/>
									<button
										type="button"
										onClick={handleSaveMinimumWithdrawal}
										disabled={savingWithdrawal}
										className="px-6 py-2.5 rounded-[8px] text-[14px] font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										style={{
											fontFamily: 'Arimo, sans-serif',
											backgroundColor: '#2ECC71',
											lineHeight: '20px',
										}}
										onMouseEnter={(e) => {
											if (!savingWithdrawal) {
												e.currentTarget.style.backgroundColor = '#27AE60';
											}
										}}
										onMouseLeave={(e) => {
											if (!savingWithdrawal) {
												e.currentTarget.style.backgroundColor = '#2ECC71';
											}
										}}
									>
										{savingWithdrawal ? 'Saving...' : 'Save'}
									</button>
								</div>
							</div>

							<div className="flex items-center justify-between mb-3">
								<span
									className="text-[14px] font-medium text-[#364153]"
									style={{ fontFamily: 'Arimo, sans-serif', lineHeight: '20px' }}
								>
									Auto‑release payouts
								</span>
								<button
									type="button"
									onClick={handleToggleAutoRelease}
									className={`relative inline-flex h-[24px] w-[44px] items-center rounded-full transition-colors ${
										settings.autoReleasePayouts ? 'bg-[#2ECC71]' : 'bg-[#D1D5DC]'
									}`}
								>
									<span
										className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white transition-transform ${
											settings.autoReleasePayouts ? 'translate-x-[22px]' : 'translate-x-[2px]'
										}`}
									/>
								</button>
							</div>
							<p className="text-[13px] text-[#6A7282]" style={{ fontFamily: 'Arimo, sans-serif', lineHeight: '18px' }}>
								When enabled, payouts automatically move to <span className="font-medium">Released</span> after the escrow holding period.
								When disabled, admin must manually release payouts from the Payments screen.
							</p>
							{savingToggles && (
								<p className="mt-2 text-[12px] text-[#6A7282]" style={{ fontFamily: 'Arimo, sans-serif' }}>
									Saving...
								</p>
							)}
						</div>

						{/* Notification Settings */}
						<div
							className="bg-white rounded-[16px] p-6 sm:p-8"
							style={{
								boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
							}}
						>
							<h2
								className="text-[20px] font-bold text-[#101828] mb-2"
								style={{
									fontFamily: 'Arimo, sans-serif',
									lineHeight: '28px',
								}}
							>
								Notification Settings
							</h2>
							<p
								className="text-[14px] text-[#6A7282] mb-6"
								style={{
									fontFamily: 'Arimo, sans-serif',
									lineHeight: '20px',
								}}
							>
								Configure platform notification preferences.
							</p>

							<div className="space-y-4">
								{/* New Order Notifications */}
								<div className="flex items-center justify-between">
									<span
										className="text-[14px] font-medium text-[#364153]"
										style={{
											fontFamily: 'Arimo, sans-serif',
											lineHeight: '20px',
										}}
									>
										New Order Notifications
									</span>
									<button
										type="button"
										onClick={() => handleToggleNotification('newOrder')}
										className={`relative inline-flex h-[24px] w-[44px] items-center rounded-full transition-colors ${
											settings.notifications.newOrder ? 'bg-[#2ECC71]' : 'bg-[#D1D5DC]'
										}`}
									>
										<span
											className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white transition-transform ${
												settings.notifications.newOrder ? 'translate-x-[22px]' : 'translate-x-[2px]'
											}`}
										/>
									</button>
								</div>

								{/* New Seller Notifications */}
								<div className="flex items-center justify-between">
									<span
										className="text-[14px] font-medium text-[#364153]"
										style={{
											fontFamily: 'Arimo, sans-serif',
											lineHeight: '20px',
										}}
									>
										New Seller Notifications
									</span>
									<button
										type="button"
										onClick={() => handleToggleNotification('newSeller')}
										className={`relative inline-flex h-[24px] w-[44px] items-center rounded-full transition-colors ${
											settings.notifications.newSeller ? 'bg-[#2ECC71]' : 'bg-[#D1D5DC]'
										}`}
									>
										<span
											className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white transition-transform ${
												settings.notifications.newSeller ? 'translate-x-[22px]' : 'translate-x-[2px]'
											}`}
										/>
									</button>
								</div>

								{/* Payment Release Notifications */}
								<div className="flex items-center justify-between">
									<span
										className="text-[14px] font-medium text-[#364153]"
										style={{
											fontFamily: 'Arimo, sans-serif',
											lineHeight: '20px',
										}}
									>
										Payment Release Notifications
									</span>
									<button
										type="button"
										onClick={() => handleToggleNotification('paymentRelease')}
										className={`relative inline-flex h-[24px] w-[44px] items-center rounded-full transition-colors ${
											settings.notifications.paymentRelease ? 'bg-[#2ECC71]' : 'bg-[#D1D5DC]'
										}`}
									>
										<span
											className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white transition-transform ${
												settings.notifications.paymentRelease ? 'translate-x-[22px]' : 'translate-x-[2px]'
											}`}
										/>
									</button>
								</div>

								{/* Dispute Notifications */}
								<div className="flex items-center justify-between">
									<span
										className="text-[14px] font-medium text-[#364153]"
										style={{
											fontFamily: 'Arimo, sans-serif',
											lineHeight: '20px',
										}}
									>
										Dispute Notifications
									</span>
									<button
										type="button"
										onClick={() => handleToggleNotification('dispute')}
										className={`relative inline-flex h-[24px] w-[44px] items-center rounded-full transition-colors ${
											settings.notifications.dispute ? 'bg-[#2ECC71]' : 'bg-[#D1D5DC]'
										}`}
									>
										<span
											className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white transition-transform ${
												settings.notifications.dispute ? 'translate-x-[22px]' : 'translate-x-[2px]'
											}`}
										/>
									</button>
								</div>
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

export default AdminDashboardSettings;

