import api from './api';
import { AdminSeller, AdminOrder, AdminPayment, AdminBuyer } from '../types/admin';
import { RecentOrder } from '../components/admin/RecentOrdersTable';
import { NewSeller } from '../components/admin/NewSellersList';

// ============================================
// Admin Dashboard Types
// ============================================

export type DashboardStats = {
	totalUsers: number;
	totalSellers: number;
	totalOrders: number;
	platformEarnings: number;
	lastUpdated?: string;
};

export type AdminDashboardOverview = {
	stats: DashboardStats;
	recentOrders: RecentOrder[];
	newSellers: NewSeller[];
	lastUpdated: string;
};

// ============================================
// Admin Settings (Platform Controls)
// ============================================

export type AdminPlatformSettings = {
	platformCommissionPercent: number;
	escrowHoldDays: number;
	minimumWithdrawalAmount: number;
	autoReleasePayouts: boolean;
	manualApprovalRequired: boolean;
	notifications: {
		newOrder: boolean;
		newSeller: boolean;
		paymentRelease: boolean;
		dispute: boolean;
	};
};

export async function fetchAdminSettings(signal?: AbortSignal): Promise<AdminPlatformSettings> {
	const data = await api.get<any>('/api/admin/settings', signal ? { signal } : undefined);
	// backend uses successResponse; handle both shapes
	return (data?.data || data) as AdminPlatformSettings;
}

export async function updateAdminSettings(
	patch: Partial<AdminPlatformSettings>,
	signal?: AbortSignal
): Promise<AdminPlatformSettings> {
	const data = await api.patch<any>('/api/admin/settings', patch, signal ? { signal } : undefined);
	return (data?.data || data) as AdminPlatformSettings;
}

// ============================================
// Admin Dashboard API
// ============================================

/**
 * Fetch admin dashboard overview (stats, recent orders, new sellers)
 * Backend endpoint: GET /api/admin/dashboard
 */
export async function fetchAdminDashboardOverview(
	signal?: AbortSignal
): Promise<AdminDashboardOverview> {
	// 🧪 Use mock data for testing (change USE_MOCK_DATA to false when backend is ready)
	if (USE_MOCK_DATA) {
		console.log('🧪 Using MOCK data for admin dashboard overview');
		return mockFetchAdminDashboardOverview(signal);
	}

	// Real API call
	try {
		const data = await api.get<AdminDashboardOverview>(
			'/api/admin/dashboard',
			signal ? { signal } : undefined
		);
		return data;
	} catch (err: any) {
		console.error('Failed to fetch admin dashboard overview:', err);
		// Return default structure on error (backend-friendly)
		return {
			stats: {
				totalUsers: 0,
				totalSellers: 0,
				totalOrders: 0,
				platformEarnings: 0,
			},
			recentOrders: [],
			newSellers: [],
			lastUpdated: new Date().toISOString(),
		};
	}
}

/**
 * Fetch dashboard statistics only
 * Backend endpoint: GET /api/admin/dashboard/stats
 */
export async function fetchDashboardStats(
	signal?: AbortSignal
): Promise<DashboardStats> {
	try {
		const data = await api.get<DashboardStats>(
			'/api/admin/dashboard/stats',
			signal ? { signal } : undefined
		);
		return data;
	} catch (err: any) {
		console.error('Failed to fetch dashboard stats:', err);
		return {
			totalUsers: 0,
			totalSellers: 0,
			totalOrders: 0,
			platformEarnings: 0,
		};
	}
}

/**
 * Fetch recent orders
 * Backend endpoint: GET /api/admin/orders/recent?limit=5
 */
export async function fetchRecentOrders(
	limit: number = 5,
	signal?: AbortSignal
): Promise<RecentOrder[]> {
	try {
		const queryParams = new URLSearchParams({ limit: String(limit) });
		const data = await api.get<RecentOrder[]>(
			`/api/admin/orders/recent?${queryParams.toString()}`,
			signal ? { signal } : undefined
		);
		return Array.isArray(data) ? data : [];
	} catch (err: any) {
		console.error('Failed to fetch recent orders:', err);
		return [];
	}
}

/**
 * Fetch new sellers list
 * Backend endpoint: GET /api/admin/sellers/new?limit=4
 */
export async function fetchNewSellersList(
	limit: number = 4,
	signal?: AbortSignal
): Promise<NewSeller[]> {
	try {
		const queryParams = new URLSearchParams({ limit: String(limit) });
		const data = await api.get<NewSeller[]>(
			`/api/admin/sellers/new?${queryParams.toString()}`,
			signal ? { signal } : undefined
		);
		return Array.isArray(data) ? data : [];
	} catch (err: any) {
		console.error('Failed to fetch new sellers:', err);
		return [];
	}
}

// ============================================
// Admin Sellers API
// ============================================

/**
 * Fetch new sellers (for seller management page)
 * Backend endpoint: GET /api/admin/sellers?status=new
 */
export async function fetchNewSellers(
	signal?: AbortSignal
): Promise<AdminSeller[]> {
	try {
		const queryParams = new URLSearchParams({ status: 'new' });
		const data = await api.get<AdminSeller[]>(
			`/api/admin/sellers?${queryParams.toString()}`,
			signal ? { signal } : undefined
		);
		return Array.isArray(data) ? data : [];
	} catch (err: any) {
		console.error('Failed to fetch new sellers:', err);
		return [];
	}
}

/**
 * Fetch all sellers with pagination
 * Backend endpoint: GET /api/admin/sellers?page=1&pageSize=10&status=all
 */
export type FetchSellersParams = {
	page?: number;
	pageSize?: number;
	status?: 'all' | 'active' | 'pending' | 'suspended';
	search?: string;
};

export type FetchSellersResponse = {
	items: AdminSeller[];
	total: number;
	page: number;
	pageSize: number;
};

// 🧪 MOCK DATA - Set to true to use mock data for testing
const USE_MOCK_DATA = false; // ✅ Using real backend API

// ============================================
// MOCK DATA - Admin Dashboard Overview
// ============================================

/**
 * Mock implementation of fetchAdminDashboardOverview for frontend testing
 */
async function mockFetchAdminDashboardOverview(
	signal?: AbortSignal
): Promise<AdminDashboardOverview> {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 800));

	// Check if aborted
	if (signal?.aborted) {
		throw new Error('Request aborted');
	}

	const mockData: AdminDashboardOverview = {
		stats: {
			totalUsers: 1234,
			totalSellers: 156,
			totalOrders: 3456,
			platformEarnings: 125000,
			lastUpdated: new Date().toISOString(),
		},
		recentOrders: [
			{
				orderId: '#ORD-1234',
				buyer: 'John Doe',
				seller: 'Tech Store',
				amount: 'RS 299.99',
				status: 'Completed',
			},
			{
				orderId: '#ORD-1235',
				buyer: 'Jane Smith',
				seller: 'Fashion Hub',
				amount: 'RS 159.50',
				status: 'Paid',
			},
			{
				orderId: '#ORD-1236',
				buyer: 'Mike Johnson',
				seller: 'Book World',
				amount: 'RS 45.00',
				status: 'In Escrow',
			},
			{
				orderId: '#ORD-1237',
				buyer: 'Sarah Williams',
				seller: 'Tech Store',
				amount: 'RS 899.99',
				status: 'Completed',
			},
			{
				orderId: '#ORD-1238',
				buyer: 'Tom Brown',
				seller: 'Home Goods',
				amount: 'RS 234.50',
				status: 'Pending',
			},
			{
				orderId: '#ORD-1239',
				buyer: 'Emily Davis',
				seller: 'Sports Gear',
				amount: 'RS 567.25',
				status: 'Paid',
			},
			{
				orderId: '#ORD-1240',
				buyer: 'Chris Wilson',
				seller: 'Electronics Plus',
				amount: 'RS 1299.00',
				status: 'In Escrow',
			},
			{
				orderId: '#ORD-1241',
				buyer: 'Lisa Anderson',
				seller: 'Beauty Store',
				amount: 'RS 89.99',
				status: 'Completed',
			},
			{
				orderId: '#ORD-1242',
				buyer: 'David Martinez',
				seller: 'Pet Supplies',
				amount: 'RS 156.75',
				status: 'Paid',
			},
			{
				orderId: '#ORD-1243',
				buyer: 'Rachel Green',
				seller: 'Garden Center',
				amount: 'RS 432.00',
				status: 'Pending',
			},
		],
		newSellers: [
			{
				id: 'seller_new_001',
				name: 'Electronics Plus',
				joinedDate: '2026-01-08',
				status: 'Pending',
			},
			{
				id: 'seller_new_002',
				name: 'Organic Foods Co.',
				joinedDate: '2026-01-07',
				status: 'Active',
			},
			{
				id: 'seller_new_003',
				name: 'Sports Gear Pro',
				joinedDate: '2026-01-06',
				status: 'Pending',
			},
			{
				id: 'seller_new_004',
				name: 'Beauty Essentials',
				joinedDate: '2026-01-05',
				status: 'Active',
			},
			{
				id: 'seller_new_005',
				name: 'Home Decor Studio',
				joinedDate: '2026-01-04',
				status: 'Pending',
			},
			{
				id: 'seller_new_006',
				name: 'Tech Gadgets Pro',
				joinedDate: '2026-01-03',
				status: 'Active',
			},
			{
				id: 'seller_new_007',
				name: 'Fashion Trends',
				joinedDate: '2026-01-02',
				status: 'Active',
			},
			{
				id: 'seller_new_008',
				name: 'Book Haven',
				joinedDate: '2026-01-01',
				status: 'Pending',
			},
		],
		lastUpdated: new Date().toISOString(),
	};

	return mockData;
}

// Mock sellers data for testing
const MOCK_SELLERS_DATA: AdminSeller[] = [
	{
		id: 'seller_001',
		storeName: 'Tech Store',
		ownerName: 'John Merchant',
		email: 'john@techstore.com',
		status: 'Active',
		commission: 15,
		createdAt: '2024-01-15T10:30:00Z',
	},
	{
		id: 'seller_002',
		storeName: 'Fashion Hub',
		ownerName: 'Sarah Style',
		email: 'sarah@fashionhub.com',
		status: 'Active',
		commission: 12,
		createdAt: '2024-01-16T14:20:00Z',
	},
	{
		id: 'seller_003',
		storeName: 'Book World',
		ownerName: 'Mike Reader',
		email: 'mike@bookworld.com',
		status: 'Pending',
		commission: 10,
		createdAt: '2024-01-17T09:15:00Z',
	},
	{
		id: 'seller_004',
		storeName: 'Home Goods',
		ownerName: 'Emily Home',
		email: 'emily@homegoods.com',
		status: 'Active',
		commission: 15,
		createdAt: '2024-01-18T11:45:00Z',
	},
	{
		id: 'seller_005',
		storeName: 'Sports Gear Pro',
		ownerName: 'Tom Athlete',
		email: 'tom@sportsgear.com',
		status: 'Suspended',
		commission: 18,
		createdAt: '2024-01-19T08:30:00Z',
	},
	{
		id: 'seller_006',
		storeName: 'Electronics Plus',
		ownerName: 'Chris Tech',
		email: 'chris@electronicsplus.com',
		status: 'Pending',
		commission: 15,
		createdAt: '2024-01-20T16:00:00Z',
	},
	{
		id: 'seller_007',
		storeName: 'Organic Foods Co.',
		ownerName: 'Lisa Green',
		email: 'lisa@organicfoods.com',
		status: 'Active',
		commission: 10,
		createdAt: '2024-01-21T13:20:00Z',
	},
	{
		id: 'seller_008',
		storeName: 'Beauty Essentials',
		ownerName: 'Amanda Glow',
		email: 'amanda@beauty.com',
		status: 'Active',
		commission: 12,
		createdAt: '2024-01-22T10:10:00Z',
	},
	{
		id: 'seller_009',
		storeName: 'Pet Paradise',
		ownerName: 'David Pets',
		email: 'david@petparadise.com',
		status: 'Active',
		commission: 14,
		createdAt: '2024-01-23T09:30:00Z',
	},
	{
		id: 'seller_010',
		storeName: 'Gaming Hub',
		ownerName: 'Alex Player',
		email: 'alex@gaminghub.com',
		status: 'Pending',
		commission: 16,
		createdAt: '2024-01-24T14:45:00Z',
	},
	{
		id: 'seller_011',
		storeName: 'Kitchen World',
		ownerName: 'Maria Chef',
		email: 'maria@kitchenworld.com',
		status: 'Active',
		commission: 11,
		createdAt: '2024-01-25T11:20:00Z',
	},
	{
		id: 'seller_012',
		storeName: 'Auto Parts Plus',
		ownerName: 'Robert Mechanic',
		email: 'robert@autoparts.com',
		status: 'Suspended',
		commission: 13,
		createdAt: '2024-01-26T08:15:00Z',
	},
	{
		id: 'seller_013',
		storeName: 'Garden Center',
		ownerName: 'Linda Green',
		email: 'linda@gardencenter.com',
		status: 'Active',
		commission: 10,
		createdAt: '2024-01-27T15:30:00Z',
	},
	{
		id: 'seller_014',
		storeName: 'Music Store',
		ownerName: 'James Sound',
		email: 'james@musicstore.com',
		status: 'Active',
		commission: 17,
		createdAt: '2024-01-28T12:00:00Z',
	},
	{
		id: 'seller_015',
		storeName: 'Baby World',
		ownerName: 'Nancy Care',
		email: 'nancy@babyworld.com',
		status: 'Pending',
		commission: 12,
		createdAt: '2024-01-29T10:45:00Z',
	},
	{
		id: 'seller_016',
		storeName: 'Furniture Hub',
		ownerName: 'Michael Wood',
		email: 'michael@furniturehub.com',
		status: 'Active',
		commission: 14,
		createdAt: '2024-01-30T09:20:00Z',
	},
	{
		id: 'seller_017',
		storeName: 'Toy Kingdom',
		ownerName: 'Jennifer Play',
		email: 'jennifer@toykingdom.com',
		status: 'Active',
		commission: 13,
		createdAt: '2024-01-31T14:50:00Z',
	},
	{
		id: 'seller_018',
		storeName: 'Jewelry Palace',
		ownerName: 'Patricia Gold',
		email: 'patricia@jewelrypalace.com',
		status: 'Suspended',
		commission: 20,
		createdAt: '2024-02-01T11:15:00Z',
	},
	{
		id: 'seller_019',
		storeName: 'Shoe Store',
		ownerName: 'William Step',
		email: 'william@shoestore.com',
		status: 'Active',
		commission: 11,
		createdAt: '2024-02-02T10:30:00Z',
	},
	{
		id: 'seller_020',
		storeName: 'Watch World',
		ownerName: 'Barbara Time',
		email: 'barbara@watchworld.com',
		status: 'Active',
		commission: 15,
		createdAt: '2024-02-03T13:40:00Z',
	},
	{
		id: 'seller_021',
		storeName: 'Craft Corner',
		ownerName: 'Richard Art',
		email: 'richard@craftcorner.com',
		status: 'Pending',
		commission: 12,
		createdAt: '2024-02-04T15:25:00Z',
	},
	{
		id: 'seller_022',
		storeName: 'Office Supplies',
		ownerName: 'Susan Work',
		email: 'susan@officesupplies.com',
		status: 'Active',
		commission: 10,
		createdAt: '2024-02-05T08:45:00Z',
	},
];

// Mock fetch function for testing
async function mockFetchSellers(params: FetchSellersParams = {}): Promise<FetchSellersResponse> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 800));

	const { page = 1, pageSize = 10, status, search = '' } = params;

	// Filter by status
	let filteredSellers = [...MOCK_SELLERS_DATA];
	
	if (status && status !== 'all') {
		const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
		filteredSellers = filteredSellers.filter(
			(seller) => seller.status === statusCapitalized
		);
	}

	// Filter by search query
	if (search) {
		const searchLower = search.toLowerCase();
		filteredSellers = filteredSellers.filter(
			(seller) =>
				seller.storeName.toLowerCase().includes(searchLower) ||
				seller.ownerName.toLowerCase().includes(searchLower) ||
				seller.email.toLowerCase().includes(searchLower)
		);
	}

	// Calculate pagination
	const total = filteredSellers.length;
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const items = filteredSellers.slice(startIndex, endIndex);

	console.log('🧪 Mock Data:', { page, pageSize, status, search, total, itemsCount: items.length });

	return {
		items,
		total,
		page,
		pageSize,
	};
}

// ============================================
// Seller Details API
// ============================================

export type SellerDetailsResponse = {
	id: string;
	storeName: string;
	ownerName: string;
	email: string;
	contactNumber: string;
	status: 'Active' | 'Pending' | 'Suspended';
	commission: number;
	pickupAddress: string;
	returnAddress: string;
	nameOnIdCard: string;
	idCardNumber: string;
	idCardFrontUrl?: string;
	idCardBackUrl?: string;
	accountHolderName: string;
	ibanNumber: string;
	accountNumber: string;
	bankName: string;
	branchCode: string;
	bankDocumentUrl?: string;
	createdAt?: string;
};

// ============================================
// Buyer Details API
// ============================================

export type BuyerDetailsResponse = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'Active' | 'Pending' | 'Suspended';
  joinedDate?: string;
  totalOrders: number;
  totalSpent: number;
  recentOrders: Array<{
    orderNumber?: string;
    total?: number;
    status?: string;
    createdAt?: string;
  }>;
};

/**
 * Fetch buyer details by ID
 * Backend endpoint: GET /api/admin/buyers/:id
 */
export async function fetchBuyerDetails(
  buyerId: string,
  signal?: AbortSignal
): Promise<BuyerDetailsResponse | null> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: buyerId,
      name: 'N/A',
      email: 'N/A',
      phone: 'N/A',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
      recentOrders: [],
    };
  }

  try {
    const data = await api.get<BuyerDetailsResponse>(
      `/api/admin/buyers/${buyerId}`,
      signal ? { signal } : undefined
    );
    return data;
  } catch (err: any) {
    console.error('Failed to fetch buyer details:', err);
    return null;
  }
}

// Mock seller details data
const MOCK_SELLER_DETAILS: Record<string, SellerDetailsResponse> = {
	seller_001: {
		id: 'seller_001',
		storeName: 'Tech Store',
		ownerName: 'John Merchant',
		email: 'john@techstore.com',
		contactNumber: '+1 (555) 123-4567',
		status: 'Active',
		commission: 15,
		pickupAddress: '123 Main St, Tech District, NY 10001',
		returnAddress: '123 Main St, Tech District, NY 10001',
		nameOnIdCard: 'John Michael Merchant',
		idCardNumber: 'ID-4521-8976-3421',
		accountHolderName: 'John Merchant',
		ibanNumber: 'US12 3456 7890 1234 5678 90',
		accountNumber: '1234567890',
		bankName: 'Global Bank',
		branchCode: 'GB-001',
		createdAt: '2024-01-15T10:30:00Z',
	},
	seller_002: {
		id: 'seller_002',
		storeName: 'Fashion Hub',
		ownerName: 'Sarah Style',
		email: 'sarah@fashionhub.com',
		contactNumber: '+1 (555) 234-5678',
		status: 'Active',
		commission: 12,
		pickupAddress: '456 Fashion Ave, Style District, CA 90210',
		returnAddress: '456 Fashion Ave, Style District, CA 90210',
		nameOnIdCard: 'Sarah Marie Style',
		idCardNumber: 'ID-9876-5432-1098',
		accountHolderName: 'Sarah Style',
		ibanNumber: 'US98 7654 3210 9876 5432 10',
		accountNumber: '9876543210',
		bankName: 'Fashion Bank',
		branchCode: 'FB-002',
		createdAt: '2024-01-16T14:20:00Z',
	},
	seller_003: {
		id: 'seller_003',
		storeName: 'Book World',
		ownerName: 'Mike Reader',
		email: 'mike@bookworld.com',
		contactNumber: '+1 (555) 345-6789',
		status: 'Pending',
		commission: 10,
		pickupAddress: '789 Book St, Reading District, TX 75001',
		returnAddress: '789 Book St, Reading District, TX 75001',
		nameOnIdCard: 'Michael Anthony Reader',
		idCardNumber: 'ID-1234-5678-9012',
		accountHolderName: 'Mike Reader',
		ibanNumber: 'US11 2233 4455 6677 8899 00',
		accountNumber: '1122334455',
		bankName: 'Book Bank',
		branchCode: 'BB-003',
		createdAt: '2024-01-17T09:15:00Z',
	},
	seller_006: {
		id: 'seller_006',
		storeName: 'Electronics Plus',
		ownerName: 'Chris Tech',
		email: 'chris@electronicsplus.com',
		contactNumber: '+1 (555) 678-9012',
		status: 'Pending',
		commission: 15,
		pickupAddress: '987 Tech Blvd, Electronic District, WA 98101',
		returnAddress: '987 Tech Blvd, Electronic District, WA 98101',
		nameOnIdCard: 'Christopher David Tech',
		idCardNumber: 'ID-2222-3333-4444',
		accountHolderName: 'Chris Tech',
		ibanNumber: 'US44 5566 7788 9900 1122 33',
		accountNumber: '4455667788',
		bankName: 'Tech Bank',
		branchCode: 'TB-006',
		createdAt: '2024-01-20T16:00:00Z',
	},
	// Add more as needed...
};

/**
 * Fetch seller details by ID
 * Backend endpoint: GET /api/admin/sellers/:id
 */
export async function fetchSellerDetails(
	sellerId: string,
	signal?: AbortSignal
): Promise<SellerDetailsResponse | null> {
	// 🧪 Use mock data for testing
	if (USE_MOCK_DATA) {
		console.log('🧪 Using MOCK data for seller details:', sellerId);
		await new Promise((resolve) => setTimeout(resolve, 500));
		return MOCK_SELLER_DETAILS[sellerId] || null;
	}

	// Real API call
	try {
		// Backend returns complete seller details with onboarding data
		const data = await api.get<SellerDetailsResponse>(
			`/api/admin/sellers/${sellerId}`,
			signal ? { signal } : undefined
		
		);
		
		// Ensure all fields are present (backend might return different field names)
		return {
			id: data.id,
			storeName: data.storeName || 'N/A',
			ownerName: data.ownerName || 'N/A',
			email: data.email || 'N/A',
			contactNumber: data.contactNumber || 'N/A',
			status: data.status,
			commission: data.commission || 15,
			pickupAddress: data.pickupAddress || 'N/A',
			returnAddress: data.returnAddress || 'N/A',
			nameOnIdCard: data.nameOnIdCard || 'N/A',
			idCardNumber: data.idCardNumber || 'N/A',
			idCardFrontUrl: data.idCardFrontUrl,
			idCardBackUrl: data.idCardBackUrl,
			accountHolderName: data.accountHolderName || 'N/A',
			ibanNumber: data.ibanNumber || 'N/A',
			accountNumber: data.accountNumber || 'N/A',
			bankName: data.bankName || 'N/A',
			branchCode: data.branchCode || 'N/A',
			bankDocumentUrl: data.bankDocumentUrl,
			createdAt: data.createdAt,
		};
	} catch (err: any) {
		console.error('Failed to fetch seller details:', err);
		const errorMessage = err.response?.data?.error || 'Failed to fetch seller details';
		console.error(errorMessage);
		return null;
	}
}

/**
 * Approve seller
 * Backend endpoint: POST /api/admin/sellers/:id/approve
 */
export async function approveSeller(
	sellerId: string,
	signal?: AbortSignal
): Promise<{ success: boolean; message?: string }> {
	if (USE_MOCK_DATA) {
		await new Promise(resolve => setTimeout(resolve, 500));
		console.log(`Mock: Seller ${sellerId} approved`);
		return { success: true, message: 'Seller approved successfully' };
	}

	try {
		// Backend returns: { message: "Seller approved successfully", seller: {...} }
		const response = await api.post<{ message: string; seller: any }>(
			`/api/admin/sellers/${sellerId}/approve`,
			{},
			signal ? { signal } : undefined
		);
		return { success: true, message: response.message };
	} catch (err: any) {
		console.error('Failed to approve seller:', err);
		const errorMessage = err.response?.data?.error || 'Failed to approve seller';
		throw new Error(errorMessage);
	}
}

/**
 * Suspend seller
 * Backend endpoint: POST /api/admin/sellers/:id/suspend
 */
export async function suspendSeller(
	sellerId: string,
	reason?: string,
	signal?: AbortSignal
): Promise<{ success: boolean; message?: string }> {
	if (USE_MOCK_DATA) {
		await new Promise(resolve => setTimeout(resolve, 500));
		console.log(`Mock: Seller ${sellerId} suspended. Reason: ${reason || 'N/A'}`);
		return { success: true, message: 'Seller suspended successfully' };
	}

	try {
		// Backend returns: { message: "Seller suspended successfully", seller: {...} }
		const response = await api.post<{ message: string; seller: any }>(
			`/api/admin/sellers/${sellerId}/suspend`,
			{ reason },
			signal ? { signal } : undefined
		);
		return { success: true, message: response.message };
	} catch (err: any) {
		console.error('Failed to suspend seller:', err);
		const errorMessage = err.response?.data?.error || 'Failed to suspend seller';
		throw new Error(errorMessage);
	}
}

/**
 * Reactivate seller
 * Backend endpoint: POST /api/admin/sellers/:id/reactivate
 */
export async function reactivateSeller(
	sellerId: string,
	signal?: AbortSignal
): Promise<{ success: boolean; message?: string }> {
	if (USE_MOCK_DATA) {
		await new Promise(resolve => setTimeout(resolve, 500));
		console.log(`Mock: Seller ${sellerId} reactivated`);
		return { success: true, message: 'Seller reactivated successfully' };
	}

	try {
		// Backend returns: { message: "Seller reactivated successfully", seller: {...} }
		const response = await api.post<{ message: string; seller: any }>(
			`/api/admin/sellers/${sellerId}/reactivate`,
			{},
			signal ? { signal } : undefined
		);
		return { success: true, message: response.message };
	} catch (err: any) {
		console.error('Failed to reactivate seller:', err);
		const errorMessage = err.response?.data?.error || 'Failed to reactivate seller';
		throw new Error(errorMessage);
	}
}

export async function fetchSellers(
	params: FetchSellersParams = {},
	signal?: AbortSignal
): Promise<FetchSellersResponse> {
	// 🧪 Use mock data for testing (change USE_MOCK_DATA to false when backend is ready)
	if (USE_MOCK_DATA) {
		console.log('🧪 Using MOCK data for sellers');
		return mockFetchSellers(params);
	}

	// Real API call
	try {
		const queryParams = new URLSearchParams();
		queryParams.set('page', String(params.page || 1));
		queryParams.set('pageSize', String(params.pageSize || 10));
		// Backend expects 'active', 'pending', 'suspended' (lowercase)
		if (params.status && params.status !== 'all') {
			queryParams.set('status', params.status.toLowerCase());
		}
		if (params.search) queryParams.set('search', params.search);

		// Backend returns { items, total, page, pageSize, totalPages }
		const response = await api.get<FetchSellersResponse>(
			`/api/admin/sellers?${queryParams.toString()}`,
			signal ? { signal } : undefined
		);
		
		return {
			items: response.items || [],
			total: response.total || 0,
			page: response.page || params.page || 1,
			pageSize: response.pageSize || params.pageSize || 10,
		};
	} catch (err: any) {
		console.error('Failed to fetch sellers:', err);
		return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 10 };
	}
}

// ============================================
// Orders/Transactions API
// ============================================

// Mock orders data
const MOCK_ORDERS_DATA: AdminOrder[] = [
	{
		id: 'order_001',
		orderId: '#ORD-1234',
		buyer: 'John Doe',
		seller: 'Tech Store',
		amount: 299.99,
		currency: 'RS',
		status: 'Completed',
		escrowStatus: 'Completed',
		createdAt: '2024-01-15T10:30:00Z',
	},
	{
		id: 'order_002',
		orderId: '#ORD-1235',
		buyer: 'Jane Smith',
		seller: 'Fashion Hub',
		amount: 159.50,
		currency: 'RS',
		status: 'Paid',
		escrowStatus: 'In Escrow',
		createdAt: '2024-01-15T11:45:00Z',
	},
	{
		id: 'order_003',
		orderId: '#ORD-1236',
		buyer: 'Mike Johnson',
		seller: 'Book World',
		amount: 45.00,
		currency: 'RS',
		status: 'Paid',
		escrowStatus: 'In Escrow',
		createdAt: '2024-01-15T12:20:00Z',
	},
	{
		id: 'order_004',
		orderId: '#ORD-1237',
		buyer: 'Sarah Williams',
		seller: 'Tech Store',
		amount: 899.99,
		currency: 'RS',
		status: 'Completed',
		escrowStatus: 'Completed',
		createdAt: '2024-01-15T14:30:00Z',
	},
	{
		id: 'order_005',
		orderId: '#ORD-1238',
		buyer: 'Tom Brown',
		seller: 'Home Goods',
		amount: 234.50,
		currency: 'RS',
		status: 'Paid',
		escrowStatus: 'In Escrow',
		createdAt: '2024-01-15T15:10:00Z',
	},
	{
		id: 'order_006',
		orderId: '#ORD-1239',
		buyer: 'Emily Davis',
		seller: 'Sports Gear Pro',
		amount: 125.00,
		currency: 'RS',
		status: 'Completed',
		escrowStatus: 'Completed',
		createdAt: '2024-01-15T16:45:00Z',
	},
	{
		id: 'order_007',
		orderId: '#ORD-1240',
		buyer: 'Chris Wilson',
		seller: 'Beauty Essentials',
		amount: 78.99,
		currency: 'RS',
		status: 'Paid',
		escrowStatus: 'In Escrow',
		createdAt: '2024-01-16T09:15:00Z',
	},
	{
		id: 'order_008',
		orderId: '#ORD-1241',
		buyer: 'Lisa Anderson',
		seller: 'Organic Foods Co.',
		amount: 189.50,
		currency: 'RS',
		status: 'Paid',
		escrowStatus: 'In Escrow',
		createdAt: '2024-01-16T10:30:00Z',
	},
	{
		id: 'order_009',
		orderId: '#ORD-1242',
		buyer: 'David Miller',
		seller: 'Pet Paradise',
		amount: 67.25,
		currency: 'RS',
		status: 'Completed',
		escrowStatus: 'Completed',
		createdAt: '2024-01-16T11:20:00Z',
	},
	{
		id: 'order_010',
		orderId: '#ORD-1243',
		buyer: 'Jennifer Taylor',
		seller: 'Gaming Hub',
		amount: 449.00,
		currency: 'RS',
		status: 'Paid',
		escrowStatus: 'In Escrow',
		createdAt: '2024-01-16T13:45:00Z',
	},
	{
		id: 'order_011',
		orderId: '#ORD-1244',
		buyer: 'Robert Martinez',
		seller: 'Kitchen World',
		amount: 156.75,
		currency: 'RS',
		status: 'Completed',
		escrowStatus: 'Completed',
		createdAt: '2024-01-16T14:30:00Z',
	},
	{
		id: 'order_012',
		orderId: '#ORD-1245',
		buyer: 'Patricia Garcia',
		seller: 'Auto Parts Plus',
		amount: 325.50,
		currency: 'RS',
		status: 'Paid',
		escrowStatus: 'In Escrow',
		createdAt: '2024-01-16T16:00:00Z',
	},
	{
		id: 'order_013',
		orderId: '#ORD-1246',
		buyer: 'Michael Rodriguez',
		seller: 'Garden Center',
		amount: 92.30,
		currency: 'RS',
		status: 'Completed',
		escrowStatus: 'Completed',
		createdAt: '2024-01-17T09:30:00Z',
	},
	{
		id: 'order_014',
		orderId: '#ORD-1247',
		buyer: 'Linda Wilson',
		seller: 'Music Store',
		amount: 275.00,
		currency: 'RS',
		status: 'Paid',
		escrowStatus: 'In Escrow',
		createdAt: '2024-01-17T11:15:00Z',
	},
	{
		id: 'order_015',
		orderId: '#ORD-1248',
		buyer: 'James Anderson',
		seller: 'Baby World',
		amount: 134.99,
		currency: 'RS',
		status: 'Completed',
		escrowStatus: 'Completed',
		createdAt: '2024-01-17T13:20:00Z',
	},
	{
		id: 'order_016',
		orderId: '#ORD-1249',
		buyer: 'Barbara Thomas',
		seller: 'Furniture Hub',
		amount: 599.00,
		currency: 'RS',
		status: 'Paid',
		escrowStatus: 'In Escrow',
		createdAt: '2024-01-17T15:45:00Z',
	},
	{
		id: 'order_017',
		orderId: '#ORD-1250',
		buyer: 'William Jackson',
		seller: 'Toy Kingdom',
		amount: 87.50,
		currency: 'RS',
		status: 'Completed',
		escrowStatus: 'Completed',
		createdAt: '2024-01-18T10:00:00Z',
	},
	{
		id: 'order_018',
		orderId: '#ORD-1251',
		buyer: 'Elizabeth White',
		seller: 'Jewelry Palace',
		amount: 1250.00,
		currency: 'RS',
		status: 'Paid',
		escrowStatus: 'In Escrow',
		createdAt: '2024-01-18T11:30:00Z',
	},
	{
		id: 'order_019',
		orderId: '#ORD-1252',
		buyer: 'Richard Harris',
		seller: 'Shoe Store',
		amount: 165.75,
		currency: 'RS',
		status: 'Completed',
		escrowStatus: 'Completed',
		createdAt: '2024-01-18T13:15:00Z',
	},
	{
		id: 'order_020',
		orderId: '#ORD-1253',
		buyer: 'Susan Martin',
		seller: 'Watch World',
		amount: 425.00,
		currency: 'RS',
		status: 'Paid',
		escrowStatus: 'In Escrow',
		createdAt: '2024-01-18T15:00:00Z',
	},
];

export type FetchOrdersParams = {
	page?: number;
	pageSize?: number;
	status?: 'all' | 'completed' | 'paid' | 'pending' | 'cancelled';
	escrowStatus?: 'all' | 'completed' | 'in_escrow' | 'released' | 'refunded';
	search?: string;
	sellerId?: string;
};

export type FetchOrdersResponse = {
	items: AdminOrder[];
	total: number;
	page: number;
	pageSize: number;
};

// Mock fetch function for testing
async function mockFetchOrders(params: FetchOrdersParams = {}): Promise<FetchOrdersResponse> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 800));

	const { page = 1, pageSize = 10, status, escrowStatus, search = '' } = params;

	// Filter by status
	let filteredOrders = [...MOCK_ORDERS_DATA];

	// Filter by sellerId (best-effort for mock data)
	if (params.sellerId) {
		const sellerIdLower = params.sellerId.toLowerCase();
		filteredOrders = filteredOrders.filter((order) => order.seller.toLowerCase().includes(sellerIdLower));
	}
	
	if (status && status !== 'all') {
		const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
		filteredOrders = filteredOrders.filter(
			(order) => order.status === statusCapitalized
		);
	}

	// Filter by escrow status
	if (escrowStatus && escrowStatus !== 'all') {
		if (escrowStatus === 'in_escrow') {
			filteredOrders = filteredOrders.filter(
				(order) => order.escrowStatus === 'In Escrow'
			);
		} else {
			const escrowStatusCapitalized = escrowStatus.charAt(0).toUpperCase() + escrowStatus.slice(1);
			filteredOrders = filteredOrders.filter(
				(order) => order.escrowStatus === escrowStatusCapitalized
			);
		}
	}

	// Filter by search query
	if (search) {
		const searchLower = search.toLowerCase();
		filteredOrders = filteredOrders.filter(
			(order) =>
				order.orderId.toLowerCase().includes(searchLower) ||
				order.buyer.toLowerCase().includes(searchLower) ||
				order.seller.toLowerCase().includes(searchLower)
		);
	}

	// Calculate pagination
	const total = filteredOrders.length;
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const items = filteredOrders.slice(startIndex, endIndex);

	console.log('🧪 Mock Data - Orders:', { page, pageSize, status, escrowStatus, search, total, itemsCount: items.length });

	return {
		items,
		total,
		page,
		pageSize,
	};
}

/**
 * Fetch orders with pagination and filters
 * Backend endpoint: GET /api/admin/orders
 */
export async function fetchOrders(
	params: FetchOrdersParams = {},
	signal?: AbortSignal
): Promise<FetchOrdersResponse> {
	// 🧪 Use mock data for testing (change USE_MOCK_DATA to false when backend is ready)
	if (USE_MOCK_DATA) {
		console.log('🧪 Using MOCK data for orders');
		return mockFetchOrders(params);
	}

	// Real API call
	try {
		const queryParams = new URLSearchParams();
		queryParams.set('page', String(params.page || 1));
		queryParams.set('pageSize', String(params.pageSize || 10));
		if (params.status) queryParams.set('status', params.status);
		if (params.escrowStatus) queryParams.set('escrowStatus', params.escrowStatus);
		if (params.search) queryParams.set('search', params.search);
		if (params.sellerId) queryParams.set('sellerId', params.sellerId);

		const data = await api.get<FetchOrdersResponse>(
			`/api/admin/orders?${queryParams.toString()}`,
			signal ? { signal } : undefined
		);
		return data;
	} catch (err: any) {
		console.error('Failed to fetch orders:', err);
		return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 10 };
	}
}

// ============================================
// Payments/Escrow API
// ============================================

// Mock payments data
const MOCK_PAYMENTS_DATA: AdminPayment[] = [
	{
		id: 'payment_001',
		orderId: '#ORD-1235',
		seller: 'Fashion Hub',
		amount: 159.50,
		currency: 'RS',
		escrowStatus: 'In Escrow',
		daysHeld: 3,
		createdAt: '2024-01-15T11:45:00Z',
	},
	{
		id: 'payment_002',
		orderId: '#ORD-1236',
		seller: 'Book World',
		amount: 45.00,
		currency: 'RS',
		escrowStatus: 'In Escrow',
		daysHeld: 5,
		createdAt: '2024-01-15T12:20:00Z',
	},
	{
		id: 'payment_003',
		orderId: '#ORD-1238',
		seller: 'Home Goods',
		amount: 234.50,
		currency: 'RS',
		escrowStatus: 'In Escrow',
		daysHeld: 2,
		createdAt: '2024-01-15T15:10:00Z',
	},
	{
		id: 'payment_004',
		orderId: '#ORD-1240',
		seller: 'Beauty Essentials',
		amount: 78.99,
		currency: 'RS',
		escrowStatus: 'In Escrow',
		daysHeld: 4,
		createdAt: '2024-01-16T09:15:00Z',
	},
	{
		id: 'payment_005',
		orderId: '#ORD-1241',
		seller: 'Organic Foods Co.',
		amount: 189.50,
		currency: 'RS',
		escrowStatus: 'In Escrow',
		daysHeld: 1,
		createdAt: '2024-01-16T10:30:00Z',
	},
	{
		id: 'payment_006',
		orderId: '#ORD-1234',
		seller: 'Tech Store',
		amount: 299.99,
		currency: 'RS',
		escrowStatus: 'Released',
		daysHeld: 0,
		createdAt: '2024-01-15T10:30:00Z',
		releasedAt: '2024-01-18T10:30:00Z',
	},
	{
		id: 'payment_007',
		orderId: '#ORD-1237',
		seller: 'Tech Store',
		amount: 899.99,
		currency: 'RS',
		escrowStatus: 'Released',
		daysHeld: 0,
		createdAt: '2024-01-15T14:30:00Z',
		releasedAt: '2024-01-18T14:30:00Z',
	},
	{
		id: 'payment_008',
		orderId: '#ORD-1242',
		seller: 'Pet Paradise',
		amount: 67.25,
		currency: 'RS',
		escrowStatus: 'In Escrow',
		daysHeld: 6,
		createdAt: '2024-01-16T11:20:00Z',
	},
	{
		id: 'payment_009',
		orderId: '#ORD-1243',
		seller: 'Gaming Hub',
		amount: 449.00,
		currency: 'RS',
		escrowStatus: 'In Escrow',
		daysHeld: 7,
		createdAt: '2024-01-16T13:45:00Z',
	},
	{
		id: 'payment_010',
		orderId: '#ORD-1245',
		seller: 'Auto Parts Plus',
		amount: 325.50,
		currency: 'RS',
		escrowStatus: 'In Escrow',
		daysHeld: 3,
		createdAt: '2024-01-16T16:00:00Z',
	},
	{
		id: 'payment_011',
		orderId: '#ORD-1239',
		seller: 'Sports Gear Pro',
		amount: 125.00,
		currency: 'RS',
		escrowStatus: 'Released',
		daysHeld: 0,
		createdAt: '2024-01-15T16:45:00Z',
		releasedAt: '2024-01-19T16:45:00Z',
	},
	{
		id: 'payment_012',
		orderId: '#ORD-1247',
		seller: 'Music Store',
		amount: 275.00,
		currency: 'RS',
		escrowStatus: 'In Escrow',
		daysHeld: 2,
		createdAt: '2024-01-17T11:15:00Z',
	},
	{
		id: 'payment_013',
		orderId: '#ORD-1244',
		seller: 'Kitchen World',
		amount: 156.75,
		currency: 'RS',
		escrowStatus: 'Released',
		daysHeld: 0,
		createdAt: '2024-01-16T14:30:00Z',
		releasedAt: '2024-01-20T14:30:00Z',
	},
	{
		id: 'payment_014',
		orderId: '#ORD-1249',
		seller: 'Furniture Hub',
		amount: 599.00,
		currency: 'RS',
		escrowStatus: 'In Escrow',
		daysHeld: 4,
		createdAt: '2024-01-17T15:45:00Z',
	},
	{
		id: 'payment_015',
		orderId: '#ORD-1246',
		seller: 'Garden Center',
		amount: 92.30,
		currency: 'RS',
		escrowStatus: 'Released',
		daysHeld: 0,
		createdAt: '2024-01-17T09:30:00Z',
		releasedAt: '2024-01-21T09:30:00Z',
	},
	{
		id: 'payment_016',
		orderId: '#ORD-1251',
		seller: 'Jewelry Palace',
		amount: 1250.00,
		currency: 'RS',
		escrowStatus: 'In Escrow',
		daysHeld: 5,
		createdAt: '2024-01-18T11:30:00Z',
	},
	{
		id: 'payment_017',
		orderId: '#ORD-1248',
		seller: 'Baby World',
		amount: 134.99,
		currency: 'RS',
		escrowStatus: 'Released',
		daysHeld: 0,
		createdAt: '2024-01-17T13:20:00Z',
		releasedAt: '2024-01-21T13:20:00Z',
	},
	{
		id: 'payment_018',
		orderId: '#ORD-1253',
		seller: 'Watch World',
		amount: 425.00,
		currency: 'RS',
		escrowStatus: 'In Escrow',
		daysHeld: 1,
		createdAt: '2024-01-18T15:00:00Z',
	},
	{
		id: 'payment_019',
		orderId: '#ORD-1250',
		seller: 'Toy Kingdom',
		amount: 87.50,
		currency: 'RS',
		escrowStatus: 'Released',
		daysHeld: 0,
		createdAt: '2024-01-18T10:00:00Z',
		releasedAt: '2024-01-22T10:00:00Z',
	},
	{
		id: 'payment_020',
		orderId: '#ORD-1252',
		seller: 'Shoe Store',
		amount: 165.75,
		currency: 'RS',
		escrowStatus: 'Released',
		daysHeld: 0,
		createdAt: '2024-01-18T13:15:00Z',
		releasedAt: '2024-01-22T13:15:00Z',
	},
];

export type FetchPaymentsParams = {
	page?: number;
	pageSize?: number;
	escrowStatus?: 'all' | 'in_escrow' | 'released' | 'refunded';
	search?: string;
	sellerId?: string;
};

export type FetchPaymentsResponse = {
	items: AdminPayment[];
	total: number;
	page: number;
	pageSize: number;
};

// Mock fetch function for testing
async function mockFetchPayments(params: FetchPaymentsParams = {}): Promise<FetchPaymentsResponse> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 800));

	const { page = 1, pageSize = 10, escrowStatus, search = '' } = params;

	// Filter by escrow status
	let filteredPayments = [...MOCK_PAYMENTS_DATA];

	// Filter by sellerId (best-effort for mock data)
	if (params.sellerId) {
		const sellerIdLower = params.sellerId.toLowerCase();
		filteredPayments = filteredPayments.filter((payment) => payment.seller.toLowerCase().includes(sellerIdLower));
	}
	
	if (escrowStatus && escrowStatus !== 'all') {
		if (escrowStatus === 'in_escrow') {
			filteredPayments = filteredPayments.filter(
				(payment) => payment.escrowStatus === 'In Escrow'
			);
		} else {
			const escrowStatusCapitalized = escrowStatus.charAt(0).toUpperCase() + escrowStatus.slice(1);
			filteredPayments = filteredPayments.filter(
				(payment) => payment.escrowStatus === escrowStatusCapitalized
			);
		}
	}

	// Filter by search query
	if (search) {
		const searchLower = search.toLowerCase();
		filteredPayments = filteredPayments.filter(
			(payment) =>
				payment.orderId.toLowerCase().includes(searchLower) ||
				payment.seller.toLowerCase().includes(searchLower)
		);
	}

	// Calculate pagination
	const total = filteredPayments.length;
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const items = filteredPayments.slice(startIndex, endIndex);

	console.log('🧪 Mock Data - Payments:', { page, pageSize, escrowStatus, search, total, itemsCount: items.length });

	return {
		items,
		total,
		page,
		pageSize,
	};
}

/**
 * Fetch payments with pagination and filters
 * Backend endpoint: GET /api/admin/payments
 */
export async function fetchPayments(
	params: FetchPaymentsParams = {},
	signal?: AbortSignal
): Promise<FetchPaymentsResponse> {
	// 🧪 Use mock data for testing (change USE_MOCK_DATA to false when backend is ready)
	if (USE_MOCK_DATA) {
		console.log('🧪 Using MOCK data for payments');
		return mockFetchPayments(params);
	}

	// Real API call
	try {
		const queryParams = new URLSearchParams();
		queryParams.set('page', String(params.page || 1));
		queryParams.set('pageSize', String(params.pageSize || 10));
		if (params.escrowStatus) queryParams.set('escrowStatus', params.escrowStatus);
		if (params.search) queryParams.set('search', params.search);
		if (params.sellerId) queryParams.set('sellerId', params.sellerId);

		const data = await api.get<FetchPaymentsResponse>(
			`/api/admin/payments?${queryParams.toString()}`,
			signal ? { signal } : undefined
		);
		return data;
	} catch (err: any) {
		console.error('Failed to fetch payments:', err);
		return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 10 };
	}
}

/**
 * Release payment from escrow
 * Backend endpoint: POST /api/admin/payments/:paymentId/release
 */
export async function releasePayment(paymentId: string): Promise<void> {
	// 🧪 Use mock data for testing
	if (USE_MOCK_DATA) {
		console.log('🧪 Mock: Releasing payment', paymentId);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		
		// Update mock data
		const payment = MOCK_PAYMENTS_DATA.find(p => p.id === paymentId);
		if (payment) {
			payment.escrowStatus = 'Released';
			payment.daysHeld = 0;
			payment.releasedAt = new Date().toISOString();
		}
		return;
	}

	// Real API call
	try {
		await api.post(`/api/admin/payments/${paymentId}/release`);
	} catch (err: any) {
		console.error('Failed to release payment:', err);
		throw err;
	}
}

// ============================================
// Buyers Management API
// ============================================

export type FetchBuyersParams = {
	page?: number;
	pageSize?: number;
	status?: 'active' | 'pending' | 'suspended';
	search?: string;
};

export type FetchBuyersResponse = {
	items: AdminBuyer[];
	total: number;
	page: number;
	pageSize: number;
};

/**
 * Fetch buyers list with pagination, filtering, and search
 * Backend endpoint: GET /api/admin/buyers
 */
export async function fetchBuyers(
	params: FetchBuyersParams = {},
	signal?: AbortSignal
): Promise<FetchBuyersResponse> {
	// 🧪 Use mock data for testing (change USE_MOCK_DATA to false when backend is ready)
	if (USE_MOCK_DATA) {
		return mockFetchBuyers(params, signal);
	}

	// Real API call
	try {
		const queryParams = new URLSearchParams();
		if (params.page) queryParams.append('page', params.page.toString());
		if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
		if (params.status) queryParams.append('status', params.status);
		if (params.search) queryParams.append('search', params.search);

		// Backend returns { items, total, page, pageSize, totalPages }
		const response = await api.get<FetchBuyersResponse>(
			`/api/admin/buyers?${queryParams.toString()}`,
			signal ? { signal } : undefined
		);
		
		return {
			items: response.items || [],
			total: response.total || 0,
			page: response.page || params.page || 1,
			pageSize: response.pageSize || params.pageSize || 10,
		};
	} catch (err: any) {
		console.error('Failed to fetch buyers:', err);
		// Return empty response on error instead of throwing
		return {
			items: [],
			total: 0,
			page: params.page || 1,
			pageSize: params.pageSize || 10,
		};
	}
}

// Mock buyers data
const mockBuyersData: AdminBuyer[] = [
	{
		id: 'buyer_001',
		name: 'John Doe',
		email: 'john.doe@email.com',
		phone: '+1 (555) 123-4567',
		status: 'Active',
		joinedDate: '2025-11-15',
		totalOrders: 12,
		totalSpent: 1250.50,
	},
	{
		id: 'buyer_002',
		name: 'Jane Smith',
		email: 'jane.smith@email.com',
		phone: '+1 (555) 234-5678',
		status: 'Active',
		joinedDate: '2025-12-01',
		totalOrders: 8,
		totalSpent: 890.25,
	},
	{
		id: 'buyer_003',
		name: 'Mike Johnson',
		email: 'mike.j@email.com',
		phone: '+1 (555) 345-6789',
		status: 'Suspended',
		joinedDate: '2025-10-20',
		totalOrders: 3,
		totalSpent: 245.00,
	},
	{
		id: 'buyer_004',
		name: 'Sarah Williams',
		email: 'sarah.w@email.com',
		phone: '+1 (555) 456-7890',
		status: 'Active',
		joinedDate: '2025-12-10',
		totalOrders: 15,
		totalSpent: 2100.75,
	},
	{
		id: 'buyer_005',
		name: 'Tom Brown',
		email: 'tom.brown@email.com',
		phone: '+1 (555) 567-8901',
		status: 'Pending',
		joinedDate: '2026-01-05',
		totalOrders: 0,
		totalSpent: 0,
	},
	{
		id: 'buyer_006',
		name: 'Emily Davis',
		email: 'emily.d@email.com',
		phone: '+1 (555) 678-9012',
		status: 'Active',
		joinedDate: '2025-11-28',
		totalOrders: 20,
		totalSpent: 3250.00,
	},
	{
		id: 'buyer_007',
		name: 'Chris Wilson',
		email: 'chris.w@email.com',
		phone: '+1 (555) 789-0123',
		status: 'Active',
		joinedDate: '2025-12-15',
		totalOrders: 6,
		totalSpent: 675.50,
	},
	{
		id: 'buyer_008',
		name: 'Lisa Anderson',
		email: 'lisa.a@email.com',
		phone: '+1 (555) 890-1234',
		status: 'Suspended',
		joinedDate: '2025-09-10',
		totalOrders: 2,
		totalSpent: 180.00,
	},
	{
		id: 'buyer_009',
		name: 'David Martinez',
		email: 'david.m@email.com',
		phone: '+1 (555) 901-2345',
		status: 'Pending',
		joinedDate: '2026-01-08',
		totalOrders: 0,
		totalSpent: 0,
	},
	{
		id: 'buyer_010',
		name: 'Rachel Green',
		email: 'rachel.g@email.com',
		phone: '+1 (555) 012-3456',
		status: 'Active',
		joinedDate: '2025-11-20',
		totalOrders: 10,
		totalSpent: 1450.25,
	},
	{
		id: 'buyer_011',
		name: 'Kevin Lee',
		email: 'kevin.l@email.com',
		phone: '+1 (555) 112-3456',
		status: 'Active',
		joinedDate: '2025-10-05',
		totalOrders: 18,
		totalSpent: 2890.00,
	},
	{
		id: 'buyer_012',
		name: 'Amanda White',
		email: 'amanda.w@email.com',
		phone: '+1 (555) 212-3456',
		status: 'Active',
		joinedDate: '2025-12-20',
		totalOrders: 5,
		totalSpent: 540.75,
	},
	{
		id: 'buyer_013',
		name: 'Brian Taylor',
		email: 'brian.t@email.com',
		phone: '+1 (555) 312-3456',
		status: 'Suspended',
		joinedDate: '2025-08-15',
		totalOrders: 1,
		totalSpent: 95.00,
	},
	{
		id: 'buyer_014',
		name: 'Nicole Harris',
		email: 'nicole.h@email.com',
		phone: '+1 (555) 412-3456',
		status: 'Active',
		joinedDate: '2025-11-10',
		totalOrders: 14,
		totalSpent: 1850.50,
	},
	{
		id: 'buyer_015',
		name: 'Jason Clark',
		email: 'jason.c@email.com',
		phone: '+1 (555) 512-3456',
		status: 'Active',
		joinedDate: '2025-12-05',
		totalOrders: 9,
		totalSpent: 1120.00,
	},
];

/**
 * Mock implementation of fetchBuyers for frontend testing
 */
async function mockFetchBuyers(
	params: FetchBuyersParams = {},
	signal?: AbortSignal
): Promise<FetchBuyersResponse> {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 800));

	// Check if aborted
	if (signal?.aborted) {
		throw new Error('Request aborted');
	}

	let filteredBuyers = [...mockBuyersData];

	// Apply status filter
	if (params.status) {
		const statusMap: Record<string, string> = {
			active: 'Active',
			pending: 'Pending',
			suspended: 'Suspended',
		};
		const mappedStatus = statusMap[params.status.toLowerCase()];
		filteredBuyers = filteredBuyers.filter(
			buyer => buyer.status === mappedStatus
		);
	}

	// Apply search filter
	if (params.search) {
		const searchLower = params.search.toLowerCase();
		filteredBuyers = filteredBuyers.filter(
			buyer =>
				buyer.name.toLowerCase().includes(searchLower) ||
				buyer.email.toLowerCase().includes(searchLower)
		);
	}

	// Calculate pagination
	const page = params.page || 1;
	const pageSize = params.pageSize || 10;
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedBuyers = filteredBuyers.slice(startIndex, endIndex);

	return {
		items: paginatedBuyers,
		total: filteredBuyers.length,
		page,
		pageSize,
	};
}

/**
 * Block a buyer
 * Backend endpoint: POST /api/admin/buyers/:id/block
 */
export async function blockBuyer(buyerId: string): Promise<void> {
	if (USE_MOCK_DATA) {
		await new Promise(resolve => setTimeout(resolve, 500));
		console.log(`Mock: Buyer ${buyerId} blocked`);
		return;
	}

	try {
		// Backend returns: { message: "Buyer blocked successfully", buyer: {...} }
		await api.post(`/api/admin/buyers/${buyerId}/block`, {});
	} catch (err: any) {
		console.error('Failed to block buyer:', err);
		// Extract error message from response
		const errorMessage = err.response?.data?.error || 'Failed to block buyer';
		throw new Error(errorMessage);
	}
}

/**
 * Unblock a buyer
 * Backend endpoint: POST /api/admin/buyers/:id/unblock
 */
export async function unblockBuyer(buyerId: string): Promise<void> {
	if (USE_MOCK_DATA) {
		await new Promise(resolve => setTimeout(resolve, 500));
		console.log(`Mock: Buyer ${buyerId} unblocked`);
		return;
	}

	try {
		// Backend returns: { message: "Buyer unblocked successfully", buyer: {...} }
		await api.post(`/api/admin/buyers/${buyerId}/unblock`, {});
	} catch (err: any) {
		console.error('Failed to unblock buyer:', err);
		const errorMessage = err.response?.data?.error || 'Failed to unblock buyer';
		throw new Error(errorMessage);
	}
}

/**
 * Approve a pending buyer
 * Backend endpoint: POST /api/admin/buyers/:id/approve
 */
export async function approveBuyer(buyerId: string): Promise<void> {
	if (USE_MOCK_DATA) {
		await new Promise(resolve => setTimeout(resolve, 500));
		console.log(`Mock: Buyer ${buyerId} approved`);
		return;
	}

	try {
		// Backend returns: { message: "Buyer approved successfully", buyer: {...} }
		await api.post(`/api/admin/buyers/${buyerId}/approve`, {});
	} catch (err: any) {
		console.error('Failed to approve buyer:', err);
		const errorMessage = err.response?.data?.error || 'Failed to approve buyer';
		throw new Error(errorMessage);
	}
}

