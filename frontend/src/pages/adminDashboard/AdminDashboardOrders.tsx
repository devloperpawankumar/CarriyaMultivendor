import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminTopGreenHeader from '../../components/admin/AdminTopGreenHeader';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import Footer from '../../components/Footer';
import { fetchOrders } from '../../services/adminService';
import { AdminOrder } from '../../types/admin';

const AdminDashboardOrders: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const sellerIdFilter = useMemo(() => {
		const params = new URLSearchParams(location.search);
		return params.get('sellerId') || undefined;
	}, [location.search]);
	
	// State management
	const [orders, setOrders] = useState<AdminOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalOrders, setTotalOrders] = useState(0);
	const [pageSize] = useState(10);

	const activeKey = location.pathname.includes('/admin/orders') || location.pathname.includes('/admin/transactions') 
		? 'orders' 
		: 'dashboard';

	// Fetch orders data
	useEffect(() => {
		const controller = new AbortController();
		
		const loadOrders = async () => {
			const startedAt = Date.now();
			try {
				setLoading(true);
				setError(null);
				
				const response = await fetchOrders(
					{
						page: currentPage,
						pageSize: pageSize,
						search: searchQuery || undefined,
						sellerId: sellerIdFilter,
					},
					controller.signal
				);
				
				setOrders(response.items);
				setTotalOrders(response.total);
			} catch (err: any) {
				if (err.name !== 'AbortError') {
					setError('Failed to load orders. Please try again.');
					console.error('Error loading orders:', err);
				}
			} finally {
				// Ensure loader is visible briefly (matches Buyers/Sellers UX)
				const MIN_LOADER_MS = 350;
				const elapsed = Date.now() - startedAt;
				const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
				if (!controller.signal.aborted && remaining > 0) {
					await new Promise((r) => setTimeout(r, remaining));
				}
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			}
		};
		
		loadOrders();
		
		return () => controller.abort();
	}, [currentPage, pageSize, searchQuery, sellerIdFilter]);

	useEffect(() => {
		// If URL filter changes, reset pagination
		setCurrentPage(1);
	}, [sellerIdFilter]);

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

	// Handle search
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
		setCurrentPage(1); // Reset to first page on search
	};

	// Handle pagination
	const totalPages = Math.ceil(totalOrders / pageSize);
	
	const handlePreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};
	
	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	// Get status badge style
	const getStatusStyle = (status: string) => {
		switch (status) {
			case 'Completed':
				return {
					bg: '#DCFCE7',
					color: '#008236',
					border: '#B9F8CF',
				};
			case 'Paid':
				return {
					bg: '#DBEAFE',
					color: '#1D4ED8',
					border: '#BFDBFE',
				};
			case 'Pending':
				return {
					bg: '#FEF9C2',
					color: '#A65F00',
					border: '#FFF085',
				};
			case 'Cancelled':
				return {
					bg: '#FFE2E2',
					color: '#C10007',
					border: '#FFC9C9',
				};
			default:
				return {
					bg: '#F3F4F6',
					color: '#6B7280',
					border: '#E5E7EB',
				};
		}
	};

	// Get escrow status badge style
	const getEscrowStatusStyle = (status: string) => {
		switch (status) {
			case 'In Escrow':
				return {
					bg: '#F3E8FF',
					color: '#7C3AED',
					border: '#E9D5FF',
				};
			case 'Release Available':
				return {
					bg: '#DBEAFE',
					color: '#1D4ED8',
					border: '#BFDBFE',
				};
			case 'Released':
				return {
					bg: '#DCFCE7',
					color: '#008236',
					border: '#B9F8CF',
				};
			case 'Refunded':
				return {
					bg: '#FEE2E2',
					color: '#DC2626',
					border: '#FECACA',
				};
			default:
				return {
					bg: '#F3F4F6',
					color: '#6B7280',
					border: '#E5E7EB',
				};
		}
	};

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
				header={<AdminTopBar title="Orders" />}
			>
				<div className="bg-white flex flex-col gap-4 sm:gap-[23.991px] px-4 py-6 sm:px-8 sm:py-8">
					{/* Search Bar */}
					<div className="relative w-full max-w-[539px]">
						<input
							type="text"
							placeholder="Search by order ID, buyer, or seller..."
							value={searchQuery}
							onChange={handleSearch}
							className="w-full h-[41.8px] pl-10 pr-4 rounded-[10px] border border-[#D1D5DC] text-[14px] sm:text-[16px] text-[#0A0A0A] placeholder:text-[#0A0A0A]/50 outline-none focus:border-[#2ECC71] focus:ring-1 focus:ring-[#2ECC71] transition-colors"
							style={{
								fontFamily: 'Arimo, sans-serif',
								borderWidth: 0.909,
							}}
						/>
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="text-[#6A7282]"
							>
								<path
									d="M11 4a7 7 0 015.657 11.243l2.55 2.55a1 1 0 01-1.414 1.414l-2.55-2.55A7 7 0 1111 4zm0 2a5 5 0 100 10 5 5 0 000-10z"
									fill="currentColor"
								/>
							</svg>
						</div>
					</div>

					{sellerIdFilter && (
						<div className="w-full flex flex-wrap items-center gap-2">
							<span
								className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] border border-[#D1D5DC] bg-white text-[#364153]"
								style={{ fontFamily: 'Arimo, sans-serif' }}
							>
								Filtered by seller
							</span>
							<button
								onClick={() => navigate('/admin/orders')}
								className="text-[12px] underline text-[#364153] hover:text-[#101828]"
								style={{ fontFamily: 'Arimo, sans-serif' }}
							>
								Clear filter
							</button>
						</div>
					)}

					{/* All Orders Card + Table */}
					<div
						className="bg-white w-full rounded-[10px] border border-[#E5E7EB] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden"
						style={{
							borderWidth: 0.909,
						}}
					>
						<div className="p-4 sm:p-6">
							{/* Header row */}
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 sm:mb-6">
								<div>
									<p
										className="text-[16px] sm:text-[18px] font-bold text-[#101828]"
										style={{
											fontFamily: 'Arimo, sans-serif',
											lineHeight: '28px',
										}}
									>
										All Orders
									</p>
								</div>
								<div>
									<p
										className="text-[13px] sm:text-[14px] text-[#6A7282]"
										style={{
											fontFamily: 'Arimo, sans-serif',
											lineHeight: '20px',
										}}
									>
										{totalOrders} total {totalOrders === 1 ? 'order' : 'orders'}
									</p>
								</div>
							</div>

							{/* Error State */}
							{error && (
								<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
									<p className="text-red-600 text-sm">{error}</p>
								</div>
							)}

							{/* Loading State */}
							{loading && (
								<div className="flex justify-center items-center py-20">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ECC71]" aria-label="Loading" />
								</div>
							)}

							{/* Table */}
							{!loading && (
								<div className="w-full overflow-x-auto -mx-4 sm:mx-0">
									<div className="min-w-full inline-block align-middle">
										<div className="overflow-hidden">
											<table className="min-w-[768px] w-full border-separate border-spacing-0">
												<thead>
													<tr
														className="bg-[#F9FAFB]"
														style={{ height: 56.42 }}
													>
														<th className="text-left align-middle">
															<p
																className="text-[12px] text-[#6A7282] uppercase"
																style={{
																	fontFamily: 'Arimo, sans-serif',
																	lineHeight: '16px',
																	letterSpacing: 0.6,
																	marginLeft: 23.99,
																}}
															>
																Order ID
															</p>
														</th>
														<th className="text-left align-middle">
															<p
																className="text-[12px] text-[#6A7282] uppercase"
																style={{
																	fontFamily: 'Arimo, sans-serif',
																	lineHeight: '16px',
																	letterSpacing: 0.6,
																	marginLeft: 23.99,
																}}
															>
																Buyer
															</p>
														</th>
														<th className="text-left align-middle">
															<p
																className="text-[12px] text-[#6A7282] uppercase"
																style={{
																	fontFamily: 'Arimo, sans-serif',
																	lineHeight: '16px',
																	letterSpacing: 0.6,
																	marginLeft: 23.99,
																}}
															>
																Seller
															</p>
														</th>
														<th className="text-left align-middle">
															<p
																className="text-[12px] text-[#6A7282] uppercase"
																style={{
																	fontFamily: 'Arimo, sans-serif',
																	lineHeight: '16px',
																	letterSpacing: 0.6,
																	marginLeft: 23.99,
																}}
															>
																Amount
															</p>
														</th>
														<th className="text-left align-middle">
															<p
																className="text-[12px] text-[#6A7282] uppercase"
																style={{
																	fontFamily: 'Arimo, sans-serif',
																	lineHeight: '16px',
																	letterSpacing: 0.6,
																	marginLeft: 23.99,
																}}
															>
																Status
															</p>
														</th>
														<th className="text-left align-middle">
															<p
																className="text-[12px] text-[#6A7282] uppercase"
																style={{
																	fontFamily: 'Arimo, sans-serif',
																	lineHeight: '16px',
																	letterSpacing: 0.6,
																	marginLeft: 23.99,
																}}
															>
																Escrow Status
															</p>
														</th>
													</tr>
												</thead>
												<tbody>
													{orders.length === 0 ? (
														<tr>
															<td colSpan={6} className="text-center py-10">
																<p
																	className="text-[14px] text-[#6A7282]"
																	style={{
																		fontFamily: 'Arimo, sans-serif',
																		lineHeight: '20px',
																	}}
																>
																	No orders found
																</p>
															</td>
														</tr>
													) : (
														orders.map((order) => {
															const statusStyle = getStatusStyle(order.status);
															const escrowStyle = getEscrowStatusStyle(order.escrowStatus);
															return (
																<tr
																	key={order.id}
																	className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
																	style={{ height: 70.71 }}
																>
																	<td className="align-middle">
																		<div
																			className="flex items-start"
																			style={{ marginLeft: 23.99 }}
																		>
																			<p
																				className="text-[14px] text-[#101828] font-medium"
																				style={{
																					fontFamily: 'Arimo, sans-serif',
																					lineHeight: '20px',
																				}}
																			>
																				{order.orderId}
																			</p>
																		</div>
																	</td>
																	<td className="align-middle">
																		<p
																			className="text-[14px] text-[#101828]"
																			style={{
																				fontFamily: 'Arimo, sans-serif',
																				lineHeight: '20px',
																				marginLeft: 23.99,
																			}}
																		>
																			{order.buyer}
																		</p>
																	</td>
																	<td className="align-middle">
																		<p
																			className="text-[14px] text-[#101828]"
																			style={{
																				fontFamily: 'Arimo, sans-serif',
																				lineHeight: '20px',
																				marginLeft: 23.99,
																			}}
																		>
																			{order.seller}
																		</p>
																	</td>
																	<td className="align-middle">
																		<p
																			className="text-[14px] text-[#101828] font-medium"
																			style={{
																				fontFamily: 'Arimo, sans-serif',
																				lineHeight: '20px',
																				marginLeft: 23.99,
																			}}
																		>
																			{order.currency} {order.amount.toFixed(2)}
																		</p>
																	</td>
																	<td className="align-middle">
																		<div style={{ marginLeft: 23.99 }}>
																			<span
																				className="inline-flex px-3 py-1 rounded-full text-[14px] font-medium"
																				style={{
																					fontFamily: 'Arimo, sans-serif',
																					lineHeight: '20px',
																					backgroundColor: statusStyle.bg,
																					color: statusStyle.color,
																					borderWidth: 0.909,
																					borderStyle: 'solid',
																					borderColor: statusStyle.border,
																				}}
																			>
																				{order.status}
																			</span>
																		</div>
																	</td>
																	<td className="align-middle">
																		<div style={{ marginLeft: 23.99 }}>
																			<span
																				className="inline-flex px-3 py-1 rounded-full text-[14px] font-medium"
																				style={{
																					fontFamily: 'Arimo, sans-serif',
																					lineHeight: '20px',
																					backgroundColor: escrowStyle.bg,
																					color: escrowStyle.color,
																					borderWidth: 0.909,
																					borderStyle: 'solid',
																					borderColor: escrowStyle.border,
																				}}
																			>
																				{order.escrowStatus}
																			</span>
																		</div>
																	</td>
																</tr>
															);
														})
													)}
												</tbody>
											</table>
										</div>
									</div>

									{/* Pagination */}
									{orders.length > 0 && (
										<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-[#E5E7EB] px-2 sm:px-0">
											{/* Results Count */}
											<div className="w-full sm:w-auto text-center sm:text-left">
												<p
													className="text-[13px] sm:text-[14px] text-[#6A7282]"
													style={{
														fontFamily: 'Arimo, sans-serif',
														lineHeight: '20px',
													}}
												>
													Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalOrders)} of {totalOrders} results
												</p>
											</div>
											
											{/* Pagination Controls */}
											<div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
												<button
													type="button"
													onClick={handlePreviousPage}
													disabled={currentPage === 1}
													className="rounded-[10px] border border-[#D1D5DC] h-[37.813px] px-3 sm:px-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
													style={{
														fontFamily: 'Arimo, sans-serif',
														color: '#364153',
														fontSize: 13,
													}}
												>
													Previous
												</button>
												
												<div className="hidden min-[500px]:flex items-center gap-1 sm:gap-2">
													{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
														const pageNumber = i + 1;
														return (
															<button
																key={pageNumber}
																type="button"
																onClick={() => setCurrentPage(pageNumber)}
																className={`rounded-[10px] h-[37.813px] w-[37.813px] transition-colors ${
																	currentPage === pageNumber
																		? 'bg-[#2ECC71] text-white'
																		: 'border border-[#D1D5DC] text-[#364153] hover:bg-gray-50'
																}`}
																style={{
																	fontFamily: 'Arimo, sans-serif',
																	fontSize: 14,
																}}
															>
																{pageNumber}
															</button>
														);
													})}
													{totalPages > 5 && (
														<>
															<span className="text-[#6A7282] px-1">...</span>
															<button
																type="button"
																onClick={() => setCurrentPage(totalPages)}
																className={`rounded-[10px] h-[37.813px] w-[37.813px] transition-colors ${
																	currentPage === totalPages
																		? 'bg-[#2ECC71] text-white'
																		: 'border border-[#D1D5DC] text-[#364153] hover:bg-gray-50'
																}`}
																style={{
																	fontFamily: 'Arimo, sans-serif',
																	fontSize: 14,
																}}
															>
																{totalPages}
															</button>
														</>
													)}
												</div>
												
												<div className="flex min-[500px]:hidden items-center px-3">
													<span
														className="text-[14px] text-[#364153] font-medium"
														style={{
															fontFamily: 'Arimo, sans-serif',
														}}
													>
														Page {currentPage} of {totalPages}
													</span>
												</div>
												
												<button
													type="button"
													onClick={handleNextPage}
													disabled={currentPage === totalPages}
													className="rounded-[10px] border border-[#D1D5DC] h-[37.813px] px-3 sm:px-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
													style={{
														fontFamily: 'Arimo, sans-serif',
														color: '#364153',
														fontSize: 13,
													}}
												>
													Next
												</button>
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</AdminLayout>
			<Footer />
		</div>
	);
};

export default AdminDashboardOrders;

