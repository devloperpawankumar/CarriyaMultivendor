/**
 * Mock Seller Data Generator
 * 
 * This file provides mock data for testing the Admin Sellers Dashboard
 * until the real backend API is implemented.
 * 
 * Usage:
 * - Import and use in development/testing
 * - Remove once real API is ready
 */

import { AdminSeller } from '../types/admin';
import { FetchSellersResponse } from './adminService';

// Sample seller data
const MOCK_SELLERS: AdminSeller[] = [
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
];

/**
 * Mock fetch sellers function
 * Simulates backend API with filtering, searching, and pagination
 */
export async function mockFetchSellers(params: {
	page?: number;
	pageSize?: number;
	status?: 'all' | 'active' | 'pending' | 'suspended';
	search?: string;
}): Promise<FetchSellersResponse> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	const { page = 1, pageSize = 10, status = 'all', search = '' } = params;

	// Filter by status
	let filteredSellers = MOCK_SELLERS;
	
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

	return {
		items,
		total,
		page,
		pageSize,
	};
}

/**
 * Generate random sellers for testing large datasets
 */
export function generateMockSellers(count: number): AdminSeller[] {
	const firstNames = [
		'John', 'Sarah', 'Mike', 'Emily', 'Tom', 'Chris', 'Lisa', 'Amanda',
		'David', 'Alex', 'Maria', 'Robert', 'Linda', 'James', 'Nancy',
	];
	const lastNames = [
		'Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
		'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
	];
	const storeTypes = [
		'Store', 'Shop', 'Hub', 'Center', 'World', 'Plus', 'Pro', 'Express',
		'Mart', 'Outlet', 'Emporium', 'Bazaar', 'Market', 'Co.', 'Group',
	];
	const industries = [
		'Tech', 'Fashion', 'Book', 'Home', 'Sports', 'Electronics', 'Food',
		'Beauty', 'Pet', 'Gaming', 'Kitchen', 'Auto', 'Garden', 'Music', 'Baby',
	];
	const statuses: Array<'Active' | 'Pending' | 'Suspended'> = [
		'Active', 'Active', 'Active', 'Active', 'Pending', 'Suspended',
	];

	const sellers: AdminSeller[] = [];

	for (let i = 0; i < count; i++) {
		const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
		const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
		const industry = industries[Math.floor(Math.random() * industries.length)];
		const storeType = storeTypes[Math.floor(Math.random() * storeTypes.length)];
		const status = statuses[Math.floor(Math.random() * statuses.length)];
		const commission = Math.floor(Math.random() * 10) + 10; // 10-20%

		sellers.push({
			id: `seller_${String(i + 1).padStart(3, '0')}`,
			storeName: `${industry} ${storeType}`,
			ownerName: `${firstName} ${lastName}`,
			email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${industry.toLowerCase()}${storeType.toLowerCase()}.com`,
			status,
			commission,
			createdAt: new Date(2024, 0, Math.floor(Math.random() * 28) + 1).toISOString(),
		});
	}

	return sellers;
}

/**
 * Example: Replace real API call with mock in development
 * 
 * In adminService.ts, you can temporarily use this:
 * 
 * import { mockFetchSellers } from './mockSellerData';
 * 
 * export async function fetchSellers(params, signal) {
 *   if (process.env.NODE_ENV === 'development') {
 *     return mockFetchSellers(params);
 *   }
 *   // ... real API call
 * }
 */

