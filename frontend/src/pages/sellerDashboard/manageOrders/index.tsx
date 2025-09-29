import React, { useState, useEffect, useRef } from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import OrderStatsCards from './components/OrderStatsCards';
import OrderFilters from './components/OrderFilters';
import OrdersTable from './components/OrdersTable';
import ProcessingOrdersTable from './components/ProcessingOrdersTable';
import CanceledReturnedOrdersTable from './components/CanceledReturnedOrdersTable';
import Pagination from './components/Pagination';
import OrderDetailsWrapper from './OrderDetailsWrapper';
import { Order, OrderStats, OrderDetails } from './types/orderTypes';
import { fetchOrders, fetchOrderStats, OrderFilters as ServiceOrderFilters } from './services/orderService';
import { getAllMockOrders } from './mockData';

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
  const [activeFilter, setActiveFilter] = useState('New Orders');
  const [loading, setLoading] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetails | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    loadOrders();
    loadStats();
  }, []);

  // Load orders when filters change
  useEffect(() => {
    loadOrders();
  }, [activeFilter, searchTerm, selectedDate, currentPage]);

  // Filter and paginate orders when state changes
  useEffect(() => {
    filterAndPaginateOrders();
  }, [activeFilter, searchTerm, selectedDate, currentPage]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const filters: ServiceOrderFilters = {
        searchTerm: searchTerm || undefined,
        dateFilter: selectedDate !== 'Recent Order' ? selectedDate : undefined,
        status: getStatusFromFilter(activeFilter),
        page: currentPage,
        limit: 10, // Adjust as needed
      };

      const response = await fetchOrders(filters);
      setOrders(response.orders);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading orders:', error);
      // Fallback to mock data for development
      filterAndPaginateOrders();
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on active filter and pagination
  const filterAndPaginateOrders = () => {
    const allOrdersData = getAllMockOrders();

    // Filter orders based on active filter
    let filteredOrders = allOrdersData.filter(order => {
      const statusMatch = getStatusFromFilter(activeFilter) ? 
        order.status === getStatusFromFilter(activeFilter) : true;
      
      const searchMatch = searchTerm ? 
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      
      return statusMatch && searchMatch;
    });

    // Calculate pagination
    const itemsPerPage = 6; // Show 6 items per page
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    setTotalPages(totalPages);

    // Get orders for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    setOrders(paginatedOrders);
  };

  const loadStats = async () => {
    try {
      const response = await fetchOrderStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Keep default stats for development
    }
  };

  const getStatusFromFilter = (filter: string): 'new' | 'processing' | 'completed' | 'canceled' | undefined => {
    switch (filter) {
      case 'New Orders': return 'new';
      case 'Processing': return 'processing';
      case 'Completed': return 'completed';
      case 'Canceled/Returned': return 'canceled';
      default: return undefined;
    }
  };


  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDateFilter = (filter: string) => {
    // Check if it's a filter tab click (New Orders, Processing, etc.)
    if (['New Orders', 'Processing', 'Completed', 'Canceled/Returned'].includes(filter)) {
      setActiveFilter(filter);
      setCurrentPage(1); // Reset to first page when changing filters
    } else {
      // It's a date filter
      setSelectedDate(filter);
      setCurrentPage(1); // Reset to first page when changing date
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to the table area when page changes
    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else {
        // Fallback to scrolling to top if ref not available
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100); // Small delay to ensure state update is complete
  };

  const handleViewOrder = (orderId: string) => {
    // Find the order and create detailed order information
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const orderDetails: OrderDetails = {
        id: order.id,
        customerName: order.customerName || order.customer,
        address: order.address || 'Wapdatown Phase 2 Block D2 house number 246',
        paymentMethod: order.paymentMethod || order.payment,
        paymentStatus: order.paymentStatus || 'Not paid',
        orderDate: order.orderDate || order.date,
        shippingCharges: order.shippingCharges || 'PKR 250',
        productName: order.productName || order.product,
        unitPrice: order.unitPrice || 'PKR 55,000',
        quantity: order.quantity || 1,
        platformCommission: order.platformCommission || '2,250',
        discount: order.discount || '45,000',
        sellerPayout: order.sellerPayout || 'PKR 42,750',
        productImage: order.photo,
        // infer canceled/returned view flags by id prefix used in table
        isReturned: order.id.startsWith('#E'),
        isCanceled: order.id.startsWith('#D'),
        returnReason: (order.id.startsWith('#E') || order.id.startsWith('#D')) ? 'It was not working' : undefined,
      };
      setSelectedOrderDetails(orderDetails);
      setShowOrderDetails(true);
    }
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrderDetails(null);
  };

  const handleUpdateStatus = () => {
    // TODO: Implement update status functionality
    console.log('Update status for order:', selectedOrderDetails?.id);
  };

  const handleTrackOrder = () => {
    // TODO: Implement track order functionality
    console.log('Track order:', selectedOrderDetails?.id);
  };

  // Show order details page if an order is selected
  if (showOrderDetails && selectedOrderDetails) {
    return (
      <OrderDetailsWrapper
        orderDetails={selectedOrderDetails}
        onUpdateStatus={handleUpdateStatus}
        onBack={handleCloseOrderDetails}
      />
    );
  }

  // Orders are already filtered by the backend based on activeFilter

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      <div className="w-full">
        {/* Header Section */}
        <div className="mb-8 md:py-0 py-3">
          <h1 className="text-[28px] font-bold text-black mb-4 md:text-[40px] ">Manage orders</h1>
          <div className="bg-green-50 rounded-[25px]  inline-block ">
            <p className="text-[18px] font-medium text-black md:text-[25px] md:px-0 px-2  ">Today , 01-09-2025</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <OrderStatsCards stats={stats} />

        {/* Main Content Container */}
        <div ref={tableContainerRef} className="bg-white rounded-[25px] border border-gray-200 shadow-lg mt-8 p-8">
          {/* Filter Section */}
          <OrderFilters
            searchTerm={searchTerm}
            selectedDate={selectedDate}
            onSearch={handleSearch}
            onDateFilter={handleDateFilter}
            activeFilter={activeFilter}
          />

          {/* Orders Table - Show different table based on active filter */}
          {activeFilter === 'Processing' ? (
            <ProcessingOrdersTable
              orders={orders}
              onViewOrder={handleViewOrder}
              loading={loading}
            />
          ) : activeFilter === 'Canceled/Returned' ? (
            <CanceledReturnedOrdersTable
              orders={orders}
              onViewOrder={handleViewOrder}
              loading={loading}
            />
          ) : (
            <OrdersTable
              orders={orders}
              onViewOrder={handleViewOrder}
              loading={loading}
            />
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-8">
            <p className="text-[15px] font-medium text-black">
              Showing {orders.length} of {totalPages * 6} {activeFilter}
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