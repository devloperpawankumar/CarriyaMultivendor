import { AdminSeller } from '../types/admin';

// Replace with real API base URL when backend is ready
const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

export async function fetchNewSellers(signal?: AbortSignal): Promise<AdminSeller[]> {
	// Placeholder: swap to real fetch(`${API_BASE}/admin/sellers?status=new`)
	await new Promise((r) => setTimeout(r, 200));
	return [
		{ id: '1', firstName: 'Muhammad', lastName: 'Huzaifa', status: 'new' },
		{ id: '2', firstName: 'Sharjeel', lastName: 'Ahmed', status: 'new' },
		{ id: '3', firstName: 'Ayesha', lastName: 'Khan', status: 'new' },
	];
}


