export type AdminSeller = {
	id: string;
	firstName: string;
	lastName: string;
	status?: 'new' | 'approved' | 'rejected';
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


