import React, { useState, useEffect } from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import OrderStatsCards from './components/OrderStatsCards';
import OrderFilters from './components/OrderFilters';
import OrdersTable from './components/OrdersTable';
import Pagination from './components/Pagination';
import { Order, OrderStats } from './types/orderTypes';

const ManageOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    newOrders: 50,
    processing: 20,
    completed: 10,
    canceled: 10
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(9);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('Recent Order');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: '#A12345J',
        customer: 'Wasif Bhatti',
        product: "Men's Casual Cotton Slim Fit Shirt – Blue Long Sleeve",
        photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
        date: '01/09/2025 , 4:21',
        payment: 'COD',
        amount: 'PKR 1200',
        status: 'new'
      },
      {
        id: '#A12345J',
        customer: 'Wasif Bhatti',
        product: "Men's Casual Cotton Slim Fit Shirt – Blue Long Sleeve",
        photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
        date: '01/09/2025 , 4:21',
        payment: 'JazzCash',
        amount: 'PKR 1200',
        status: 'processing'
      },
      {
        id: '#A12345J',
        customer: 'Wasif Bhatti',
        product: "Men's Casual Cotton Slim Fit Shirt – Blue Long Sleeve",
        photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
        date: '01/09/2025 , 4:21',
        payment: 'COD',
        amount: 'PKR 1200',
        status: 'completed'
      },
      {
        id: '#A12345J',
        customer: 'Wasif Bhatti',
        product: "Men's Casual Cotton Slim Fit Shirt – Blue Long Sleeve",
        photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
        date: '01/09/2025 , 4:21',
        payment: 'Card',
        amount: 'PKR 1200',
        status: 'processing'
      },
      {
        id: '#A12345J',
        customer: 'Wasif Bhatti',
        product: "Men's Casual Cotton Slim Fit Shirt – Blue Long Sleeve",
        photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
        date: '01/09/2025 , 4:21',
        payment: 'Easypaisa',
        amount: 'PKR 1200',
        status: 'processing'
      },
      {
        id: '#A12345J',
        customer: 'Wasif Bhatti',
        product: "Men's Casual Cotton Slim Fit Shirt – Blue Long Sleeve",
        photo: '/static/media/prodcut1.6413c0aafe4eecade91e.png',
        date: '01/09/2025 , 4:21',
        payment: 'COD',
        amount: 'PKR 1200',
        status: 'processing'
      }
    ];
    setOrders(mockOrders);
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // TODO: Implement search functionality
  };

  const handleDateFilter = (date: string) => {
    setSelectedDate(date);
    // TODO: Implement date filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // TODO: Implement pagination
  };

  const handleViewOrder = (orderId: string) => {
    // TODO: Navigate to order details
    console.log('View order:', orderId);
  };

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      <div className="w-full">
        {/* Header Section
        <div className="mb-8">
          <h1 className="text-[40px] font-bold text-black mb-4 ">Manage orders</h1>
          <div className="bg-green-50 rounded-[25px] px-8 py-4 inline-block ">
            <p className="text-[25px] font-medium text-black">Today , 01-09-2025</p>
          </div>
        </div> */}

        {/* Statistics Cards */}
        <OrderStatsCards stats={stats} />

        {/* Main Content Container */}
        <div className="bg-white rounded-[25px] border border-gray-200 shadow-lg mt-6 md:mt-8 p-4 md:p-8">
          {/* Filter Section */}
          <OrderFilters
            searchTerm={searchTerm}
            selectedDate={selectedDate}
            onSearch={handleSearch}
            onDateFilter={handleDateFilter}
          />

          {/* Orders Table */}
          <OrdersTable
            orders={orders}
            onViewOrder={handleViewOrder}
            loading={loading}
          />

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-6 md:mt-8">
            <p className="text-[13px] md:text-[15px] font-medium text-black">
              Showing 1- 6 of 50 Products
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </SellerScaffold>
  );
};

export default ManageOrders;