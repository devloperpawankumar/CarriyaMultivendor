import { Order } from './types/orderTypes';

export const getAllMockOrders = (): Order[] => [
  // NEW ORDERS - 12 orders for testing pagination
  {
    id: '#A12345J',
    customer: 'Wasif Bhatti',
    product: "Men's Casual Cotton Slim Fit Shirt – Blue Long Sleeve",
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 4:21',
    payment: 'COD',
    amount: 'PKR 1200',
    status: 'new' as const,
    // Detailed information for modal
    customerName: 'Muhammad Huzaifa',
    address: 'Wapdatown Phase 2 Block D2 house number 246',
    paymentMethod: 'Cash on delivery',
    paymentStatus: 'Not paid',
    orderDate: '02-09-2025',
    shippingCharges: 'PKR 250',
    productName: 'Nokia 4G Mobile Phone - 64 GB',
    unitPrice: 'PKR 55,000',
    quantity: 1,
    platformCommission: '2,250',
    discount: '45,000',
    sellerPayout: 'PKR 42,750'
  },
  {
    id: '#A12346K',
    customer: 'Ali Ahmed',
    product: 'Samsung Galaxy S21 - 128GB',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 5:30',
    payment: 'JazzCash',
    amount: 'PKR 85,000',
    status: 'new' as const,
    // Detailed information for modal
    customerName: 'Ali Ahmed',
    address: 'Gulberg Phase 3 Block A house number 123',
    paymentMethod: 'JazzCash',
    paymentStatus: 'Paid',
    orderDate: '01-09-2025',
    shippingCharges: 'PKR 300',
    productName: 'Samsung Galaxy S21 - 128GB',
    unitPrice: 'PKR 85,000',
    quantity: 1,
    platformCommission: '4,250',
    discount: '5,000',
    sellerPayout: 'PKR 80,750'
  },
  {
    id: '#A12347L',
    customer: 'Fatima Khan',
    product: 'Nike Air Max 270 - Size 8',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 6:15',
    payment: 'EasyPaisa',
    amount: 'PKR 15,000',
    status: 'new' as const
  },
  {
    id: '#A12348M',
    customer: 'Hassan Ali',
    product: 'Dell Inspiron 15 Laptop - 8GB RAM',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 7:20',
    payment: 'Card',
    amount: 'PKR 65,000',
    status: 'new' as const
  },
  {
    id: '#A12349N',
    customer: 'Ayesha Malik',
    product: 'Apple AirPods Pro 2nd Generation',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 8:45',
    payment: 'EasyPaisa',
    amount: 'PKR 35,000',
    status: 'new' as const
  },
  {
    id: '#A12350O',
    customer: 'Omar Sheikh',
    product: 'Sony PlayStation 5 Console',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 9:30',
    payment: 'COD',
    amount: 'PKR 95,000',
    status: 'new' as const
  },
  {
    id: '#A12351P',
    customer: 'Nadia Ahmed',
    product: 'Canon EOS M50 Mark II Camera',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 10:15',
    payment: 'JazzCash',
    amount: 'PKR 75,000',
    status: 'new' as const
  },
  {
    id: '#A12352Q',
    customer: 'Usman Khan',
    product: 'LG 55" 4K Smart TV',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 11:00',
    payment: 'Card',
    amount: 'PKR 120,000',
    status: 'new' as const
  },
  {
    id: '#A12353R',
    customer: 'Saima Ali',
    product: 'Apple MacBook Air M2 - 256GB',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 12:30',
    payment: 'EasyPaisa',
    amount: 'PKR 200,000',
    status: 'new' as const
  },
  {
    id: '#A12354S',
    customer: 'Bilal Ahmed',
    product: 'Samsung Galaxy Buds Pro 2',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 13:45',
    payment: 'COD',
    amount: 'PKR 25,000',
    status: 'new' as const
  },
  {
    id: '#A12355T',
    customer: 'Hina Sheikh',
    product: 'Dyson V15 Detect Vacuum Cleaner',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 14:20',
    payment: 'Card',
    amount: 'PKR 85,000',
    status: 'new' as const
  },
  {
    id: '#A12356U',
    customer: 'Tariq Khan',
    product: 'Xbox Series X Console',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 15:10',
    payment: 'JazzCash',
    amount: 'PKR 90,000',
    status: 'new' as const
  },

  // PROCESSING ORDERS - 12 orders for testing pagination
  {
    id: '#B12345K',
    customer: 'Muhammad Huzaifa',
    product: 'Nokia 4G Mobile Phone - 64 GB',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 9:50',
    payment: 'COD',
    amount: 'PKR 45,000',
    status: 'processing' as const
  },
  {
    id: '#B12346L',
    customer: 'Sara Ali',
    product: 'MacBook Pro 13" - 256GB',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 10:30',
    payment: 'Card',
    amount: 'PKR 250,000',
    status: 'processing' as const
  },
  {
    id: '#B12347M',
    customer: 'Ahmed Hassan',
    product: 'Canon EOS R5 Camera',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 11:45',
    payment: 'Jazzcash',
    amount: 'PKR 180,000',
    status: 'processing' as const
  },
  {
    id: '#B12348N',
    customer: 'Zainab Malik',
    product: 'iPhone 14 Pro - 256GB',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 12:20',
    payment: 'EasyPaisa',
    amount: 'PKR 220,000',
    status: 'processing' as const
  },
  {
    id: '#B12349O',
    customer: 'Ahmed Raza',
    product: 'Microsoft Surface Pro 9 - 256GB',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 13:30',
    payment: 'Card',
    amount: 'PKR 180,000',
    status: 'processing' as const
  },
  {
    id: '#B12350P',
    customer: 'Sara Khan',
    product: 'Bose QuietComfort 45 Headphones',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 14:15',
    payment: 'JazzCash',
    amount: 'PKR 45,000',
    status: 'processing' as const
  },
  {
    id: '#B12351Q',
    customer: 'Imran Ali',
    product: 'Samsung Galaxy Watch 5 Pro',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 15:00',
    payment: 'EasyPaisa',
    amount: 'PKR 55,000',
    status: 'processing' as const
  },
  {
    id: '#B12352R',
    customer: 'Fatima Sheikh',
    product: 'iPad Pro 12.9" - 128GB',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 16:30',
    payment: 'COD',
    amount: 'PKR 150,000',
    status: 'processing' as const
  },
  {
    id: '#B12353S',
    customer: 'Usman Ahmed',
    product: 'Gaming PC - RTX 4070, 32GB RAM',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 17:45',
    payment: 'Card',
    amount: 'PKR 300,000',
    status: 'processing' as const
  },
  {
    id: '#B12354T',
    customer: 'Aisha Khan',
    product: 'Sony WH-1000XM5 Headphones',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 18:20',
    payment: 'EasyPaisa',
    amount: 'PKR 50,000',
    status: 'processing' as const
  },
  {
    id: '#B12355U',
    customer: 'Hassan Raza',
    product: 'Dell XPS 13 Laptop - 16GB RAM',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 19:00',
    payment: 'JazzCash',
    amount: 'PKR 140,000',
    status: 'processing' as const
  },
  {
    id: '#B12356V',
    customer: 'Nida Ali',
    product: 'Apple Watch Ultra 2',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '01/09/2025 , 20:15',
    payment: 'Card',
    amount: 'PKR 80,000',
    status: 'processing' as const
  },

  // COMPLETED ORDERS - 8 orders for testing pagination
  {
    id: '#C12345O',
    customer: 'Hassan Sheikh',
    product: 'Dell XPS 15 Laptop',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '30/08/2025 , 2:15',
    payment: 'Card',
    amount: 'PKR 120,000',
    status: 'completed' as const
  },
  {
    id: '#C12346P',
    customer: 'Ayesha Khan',
    product: 'Sony WH-1000XM4 Headphones',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '30/08/2025 , 3:45',
    payment: 'COD',
    amount: 'PKR 25,000',
    status: 'completed' as const
  },
  {
    id: '#C12347Q',
    customer: 'Omar Farooq',
    product: 'Samsung Galaxy S23 Ultra',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '30/08/2025 , 4:30',
    payment: 'EasyPaisa',
    amount: 'PKR 180,000',
    status: 'completed' as const
  },
  {
    id: '#C12348R',
    customer: 'Nadia Ahmed',
    product: 'MacBook Air M2 - 512GB',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '30/08/2025 , 5:15',
    payment: 'Card',
    amount: 'PKR 220,000',
    status: 'completed' as const
  },
  {
    id: '#C12349S',
    customer: 'Usman Khan',
    product: 'Nintendo Switch OLED',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '30/08/2025 , 6:00',
    payment: 'COD',
    amount: 'PKR 60,000',
    status: 'completed' as const
  },
  {
    id: '#C12350T',
    customer: 'Saima Ali',
    product: 'AirPods Max - Space Gray',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '30/08/2025 , 7:30',
    payment: 'JazzCash',
    amount: 'PKR 70,000',
    status: 'completed' as const
  },
  {
    id: '#C12351U',
    customer: 'Bilal Ahmed',
    product: 'Samsung 65" QLED 4K TV',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '30/08/2025 , 8:45',
    payment: 'Card',
    amount: 'PKR 150,000',
    status: 'completed' as const
  },
  {
    id: '#C12352V',
    customer: 'Hina Sheikh',
    product: 'iPad Air 5th Gen - 256GB',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '30/08/2025 , 9:20',
    payment: 'EasyPaisa',
    amount: 'PKR 90,000',
    status: 'completed' as const
  },

  // CANCELED/RETURNED ORDERS - Mixed for better testing
  {
    id: '#D12345Q',
    customer: 'Omar Farooq',
    product: 'Samsung 55" Smart TV',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 1:30',
    payment: 'Card',
    amount: 'PKR 95,000',
    status: 'canceled' as const
  },
  {
    id: '#E12345LL',
    customer: 'Muhammad Sarim',
    product: 'Wireless Bluetooth Earphones with Mic – Deep Bass, Long Battery',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '28/08/2025 , 10:07',
    payment: 'COD',
    amount: 'PKR 700',
    status: 'canceled' as const // Using 'canceled' status for returned items 
  },
  {
    id: '#D12346R',
    customer: 'Nadia Ahmed',
    product: 'Apple Watch Series 8',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 4:20',
    payment: 'EasyPaisa',
    amount: 'PKR 45,000',
    status: 'canceled' as const,
    returnReason: 'It was not working'
  },
  {
    id: '#E12346MM',
    customer: 'Ayesha Khan',
    product: 'Samsung Galaxy Buds Live',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '28/08/2025 , 11:20',
    payment: 'EasyPaisa',
    amount: 'PKR 18,000',
    status: 'canceled' as const,
    returnReason: 'It was not working'
  },
  {
    id: '#D12347S',
    customer: 'Ahmed Ali',
    product: 'Sony PlayStation 5 Digital Edition',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 5:30',
    payment: 'COD',
    amount: 'PKR 85,000',
    status: 'canceled' as const
  },
  {
    id: '#E12347NN',
    customer: 'Hassan Ali',
    product: 'Apple AirPods 3rd Generation',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '28/08/2025 , 12:45',
    payment: 'Card',
    amount: 'PKR 35,000',
    status: 'canceled' as const
  },
  {
    id: '#D12351W',
    customer: 'Muhammad Sarim',
    product: 'Wireless Bluetooth Earphones with Mic – Deep Bass, Long Battery',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 9:15',
    payment: 'COD',
    amount: 'PKR 700',
    status: 'canceled' as const
  },
  {
    id: '#D12352X',
    customer: 'Ayesha Sheikh',
    product: 'Samsung Galaxy Buds Pro 2',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 10:00',
    payment: 'Card',
    amount: 'PKR 25,000',
    status: 'canceled' as const
  },
  {
    id: '#D12353Y',
    customer: 'Usman Ahmed',
    product: 'LG 65" OLED Smart TV',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 11:30',
    payment: 'JazzCash',
    amount: 'PKR 180,000',
    status: 'canceled' as const
  },
  {
    id: '#D12354Z',
    customer: 'Hina Khan',
    product: 'Dyson V15 Detect Cordless Vacuum',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 12:45',
    payment: 'EasyPaisa',
    amount: 'PKR 85,000',
    status: 'canceled' as const
  },
  {
    id: '#D12355AA',
    customer: 'Ali Raza',
    product: 'Nintendo Switch Lite - Turquoise',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 13:20',
    payment: 'COD',
    amount: 'PKR 45,000',
    status: 'canceled' as const
  },
  {
    id: '#D12356BB',
    customer: 'Fatima Ali',
    product: 'Apple MacBook Pro 14" M3 Pro',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 14:10',
    payment: 'Card',
    amount: 'PKR 350,000',
    status: 'canceled' as const
  },
  {
    id: '#D12357CC',
    customer: 'Hassan Malik',
    product: 'Sony A7R V Mirrorless Camera',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 15:30',
    payment: 'JazzCash',
    amount: 'PKR 450,000',
    status: 'canceled' as const
  },
  {
    id: '#D12358DD',
    customer: 'Nida Sheikh',
    product: 'Bose QuietComfort 45 Headphones',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 16:45',
    payment: 'EasyPaisa',
    amount: 'PKR 40,000',
    status: 'canceled' as const
  },
  {
    id: '#D12359EE',
    customer: 'Omar Khan',
    product: 'Samsung Galaxy Tab S9 Ultra',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 17:20',
    payment: 'COD',
    amount: 'PKR 120,000',
    status: 'canceled' as const
  },
  {
    id: '#D12360FF',
    customer: 'Aisha Ahmed',
    product: 'Dell Alienware m15 R7 Gaming Laptop',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 18:00',
    payment: 'Card',
    amount: 'PKR 280,000',
    status: 'canceled' as const
  },
  {
    id: '#D12361GG',
    customer: 'Usman Raza',
    product: 'Apple iPhone 15 Pro Max - 256GB',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 19:15',
    payment: 'JazzCash',
    amount: 'PKR 200,000',
    status: 'canceled' as const
  },
  {
    id: '#D12362HH',
    customer: 'Hina Ali',
    product: 'Sony WH-1000XM5 Wireless Headphones',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 20:30',
    payment: 'EasyPaisa',
    amount: 'PKR 55,000',
    status: 'canceled' as const
  },
  {
    id: '#D12363II',
    customer: 'Ahmed Sheikh',
    product: 'Microsoft Surface Pro 9 - 512GB',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 21:00',
    payment: 'Card',
    amount: 'PKR 180,000',
    status: 'canceled' as const
  },
  {
    id: '#D12364JJ',
    customer: 'Sara Khan',
    product: 'Canon EOS R6 Mark II Camera',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 22:15',
    payment: 'COD',
    amount: 'PKR 320,000',
    status: 'canceled' as const
  },
  {
    id: '#D12365KK',
    customer: 'Hassan Ahmed',
    product: 'Samsung Galaxy S24 Ultra - 512GB',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '29/08/2025 , 23:30',
    payment: 'JazzCash',
    amount: 'PKR 250,000',
    status: 'canceled' as const
  },

  // RETURNED ORDERS - 8 orders for testing pagination
  {
    id: '#E12345LL',
    customer: 'Muhammad Sarim',
    product: 'Wireless Bluetooth Earphones with Mic – Deep Bass, Long Battery',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '28/08/2025 , 10:07',
    payment: 'COD',
    amount: 'PKR 700',
    status: 'canceled' as const // Using 'canceled' status for returned items 
  },
  {
    id: '#E12346MM',
    customer: 'Ayesha Khan',
    product: 'Samsung Galaxy Buds Live',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '28/08/2025 , 11:20',
    payment: 'EasyPaisa',
    amount: 'PKR 18,000',
    status: 'canceled' as const
  },
  {
    id: '#E12347NN',
    customer: 'Hassan Ali',
    product: 'Apple AirPods 3rd Generation',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '28/08/2025 , 12:45',
    payment: 'Card',
    amount: 'PKR 35,000',
    status: 'canceled' as const
  },
  {
    id: '#E12348OO',
    customer: 'Fatima Sheikh',
    product: 'Sony WF-1000XM4 Earbuds',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '28/08/2025 , 13:30',
    payment: 'JazzCash',
    amount: 'PKR 28,000',
    status: 'canceled' as const
  },
  {
    id: '#E12349PP',
    customer: 'Usman Malik',
    product: 'Bose Sport Earbuds',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '28/08/2025 , 14:15',
    payment: 'COD',
    amount: 'PKR 22,000',
    status: 'canceled' as const
  },
  {
    id: '#E12350QQ',
    customer: 'Nida Ahmed',
    product: 'JBL Live Pro 2 TWS',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '28/08/2025 , 15:00',
    payment: 'EasyPaisa',
    amount: 'PKR 15,000',
    status: 'canceled' as const
  },
  {
    id: '#E12351RR',
    customer: 'Omar Raza',
    product: 'Sennheiser Momentum True Wireless 3',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '28/08/2025 , 16:20',
    payment: 'Card',
    amount: 'PKR 45,000',
    status: 'canceled' as const
  },
  {
    id: '#E12352SS',
    customer: 'Hina Khan',
    product: 'Anker Soundcore Liberty 3 Pro',
    photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
    date: '28/08/2025 , 17:45',
    payment: 'JazzCash',
    amount: 'PKR 12,000',
    status: 'canceled' as const
  }
];
