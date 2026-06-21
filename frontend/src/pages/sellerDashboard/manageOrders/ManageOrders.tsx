import React, { useState, useMemo } from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import OrderStatsCards from './components/OrderStatsCards';
import OrderFilters from './components/OrderFilters';
import OrdersTable from './components/OrdersTable';
import Pagination from './components/Pagination';
import { Order, OrderStats } from './types/orderTypes';
import {
  DEFAULT_DATE_PRESET,
  getDateRangeForPreset,
  normalizeDateFilterValue,
  resolvePresetIdFromValue,
} from './constants/dateFilters';

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const endOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const ManageOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    newOrders: 0,
    processing: 0,
    completed: 0,
    canceled: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(9);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(DEFAULT_DATE_PRESET);
  const [activeFilter, setActiveFilter] = useState('New Orders');
  const [loading, setLoading] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // TODO: Implement search functionality
  };

  const handleDateFilter = (date: string) => {
    setSelectedDate(normalizeDateFilterValue(date));
    // TODO: Implement date filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // TODO: Implement pagination
  };

  const handleStatusChange = (status: string) => {
    setActiveFilter(status);
    // TODO: Implement status-specific filtering
  };

  const parseOrderDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const [datePart, timePart] = dateString.split(',');
    if (!datePart) return null;

    const [month, day, year] = datePart
      .trim()
      .split('/')
      .map((value) => parseInt(value, 10));

    if (!month || !day || !year) return null;

    let hours = 0;
    let minutes = 0;

    if (timePart) {
      const [timeHours, timeMinutes] = timePart.trim().split(':').map((value) => parseInt(value, 10));
      hours = Number.isFinite(timeHours) ? timeHours : 0;
      minutes = Number.isFinite(timeMinutes) ? timeMinutes : 0;
    }

    return new Date(year, month - 1, day, hours, minutes);
  };

  const getPresetRange = (value: string): { start: Date; end: Date } | null => {
    if (!value) return null;
    const normalized = normalizeDateFilterValue(value);

    if (normalized.startsWith('Custom:')) {
      const payload = normalized.replace('Custom:', '');
      const [startStr, endStr] = payload.split('|');
      const start = startStr ? new Date(startStr) : null;
      const end = endStr ? new Date(endStr) : null;
      if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        return { start: startOfDay(start), end: endOfDay(end) };
      }
      return null;
    }

    if (normalized.startsWith('Exact:')) {
      const iso = normalized.replace('Exact:', '');
      const parsed = new Date(iso);
      if (!Number.isNaN(parsed.getTime())) {
        return { start: startOfDay(parsed), end: endOfDay(parsed) };
      }
      return null;
    }

    const resolved = resolvePresetIdFromValue(normalized);
    if (resolved) {
      const presetRange = getDateRangeForPreset(resolved);
      if (!presetRange?.startDate || !presetRange?.endDate) {
        return null;
      }
      return {
        start: new Date(presetRange.startDate),
        end: new Date(presetRange.endDate),
      };
    }

    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) {
      return { start: startOfDay(parsed), end: endOfDay(parsed) };
    }
    return null;
  };

  const filteredOrders = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();
    const allowedStatuses: Record<string, Order['status'][]> = {
      'New Orders': ['new'],
      Processing: ['processing'],
      Completed: ['completed'],
      'Canceled/Returned': ['canceled'],
    };

    const selectedStatuses = activeFilter ? allowedStatuses[activeFilter] : undefined;
    const presetRange = getPresetRange(selectedDate);

    const matchesDateFilter = (orderDate: Date | null): boolean => {
      if (!orderDate) return false;
      if (!presetRange) return true;
      return orderDate >= presetRange.start && orderDate <= presetRange.end;
    };

    return orders.filter((order) => {
      const orderDate = parseOrderDate(order.date);
      const matchesSearch =
        !searchValue ||
        [order.id, order.orderNumber, order.customer, order.product]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(searchValue));

      const matchesStatus =
        !selectedStatuses || selectedStatuses.includes(order.status);

      return matchesSearch && matchesStatus && matchesDateFilter(orderDate);
    });
  }, [orders, searchTerm, activeFilter, selectedDate]);

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
            onStatusChange={handleStatusChange}
            activeFilter={activeFilter}
            isLoading={loading}
          />

          {/* Orders Table */}
          <OrdersTable
            orders={filteredOrders}
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