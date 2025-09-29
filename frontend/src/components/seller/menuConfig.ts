export const sellerMenuIcons = [
  { key: 'dashboard', src: require('../../assets/images/Seller/manageProducts.png'), label: 'Dashboard' },
  { key: 'products', src: require('../../assets/images/Seller/manageProducts.png'), label: 'Manage Products' },
  { key: 'orders', src: require('../../assets/images/Seller/manageOders.png'), label: 'Manage orders' },

  { key: 'payments', src: require('../../assets/images/Seller/managePayments.png'), label: 'Manage Payments' },
  { key: 'reports', src: require('../../assets/images/Seller/manageReports.png'), label: 'Manage Reports' },
  { key: 'settings', src: require('../../assets/images/Seller/manageSettings.png'), label: 'Settings' },
];

export const sellerMenuRoutes: Record<string, string> = {
  dashboard: '/seller/dashboard',
  products: '/seller/manage-products',
  orders: '/seller/manage-orders',
  payments: '/seller/manage-payments',
  reports: '/seller/manage-reports',
  settings: '/seller/settings',
};


