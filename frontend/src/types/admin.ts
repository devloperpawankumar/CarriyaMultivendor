export type AdminSeller = {
	id: string;
	storeName: string;
	ownerName: string;
	firstName?: string;
	lastName?: string;
	email: string;
	status: 'Active' | 'Pending' | 'Suspended';
	commission: number;
	createdAt?: string;
};

// Extended details used specifically by the admin Seller Details screen
export type AdminSellerDetails = AdminSeller & {
    phone?: string;
    email?: string;
    company?: string;
    pickupAddress?: string;
    returnAddress?: string;
    idCardNumber?: string;
    iban?: string;
    accountNumber?: string;
    bankName?: string;
    branchCode?: string;
};

// Order/Transaction types
export type AdminOrder = {
	id: string;
	orderId: string;
	buyer: string;
	seller: string;
	amount: number;
	currency: string;
	status: 'Completed' | 'Paid' | 'Pending' | 'Cancelled';
	escrowStatus: 'Completed' | 'In Escrow' | 'Release Available' | 'Released' | 'Refunded';
	createdAt?: string;
};

// Payment/Escrow types
export type AdminPayment = {
	id: string;
	orderId: string;
	seller: string;
	amount: number;
	currency: string;
	escrowStatus: 'In Escrow' | 'Release Available' | 'Released' | 'Refunded';
	daysHeld: number;
	holdDays?: number;
	availableInDays?: number;
	canRelease?: boolean;
	releaseAvailableAt?: string | null;
	createdAt?: string;
	releasedAt?: string;
};

// Buyer types
export type AdminBuyer = {
	id: string;
	name: string;
	email: string;
	phone?: string;
	status: 'Active' | 'Pending' | 'Suspended';
	joinedDate: string;
	totalOrders?: number;
	totalSpent?: number;
};

export type AdminBuyerDetails = AdminBuyer & {
	address?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country?: string;
	lastOrderDate?: string;
};

