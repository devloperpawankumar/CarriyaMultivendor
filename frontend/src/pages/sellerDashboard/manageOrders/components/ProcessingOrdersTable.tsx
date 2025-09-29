import React from 'react';
import { OrderTableProps } from '../types/orderTypes';

const ProcessingOrdersTable: React.FC<OrderTableProps> = ({ orders, onViewOrder, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Table Header - Exact Figma Design */}
      <div className="bg-green-100 rounded-[10px] px-4 md:px-8 py-3 md:py-4 mb-3 md:mb-4" style={{ backgroundColor: 'rgba(46, 204, 113, 0.17)' }}>
        <div className="hidden sm:grid grid-cols-9 gap-1 text-[12px] md:text-[15px] font-extrabold text-gray-500">
          <div className="col-span-1">Order ID</div>
          <div className="col-span-1">Customer</div>
          <div className="col-span-2">Product</div>
          <div className="col-span-1">Photo</div>
          <div className="col-span-1">Date</div>
          <div className="col-span-1">Payment</div>
          <div className="col-span-1">Amount</div>
          <div className="col-span-1"></div> {/* Empty column for See Order button */}
        </div>
        {/* Mobile header */}
        <div className="sm:hidden flex items-center justify-between">
          <span className="text-[14px] font-bold text-gray-700">Processing Orders</span>
          <span className="text-[12px] text-gray-500">{orders.length} items</span>
        </div>
      </div>

      {/* Table Body - Exact Figma Design with rounded container */}
      <div className="bg-white rounded-[10px] overflow-hidden border border-gray-200">
        {orders.map((order, index) => (
          <div
            key={`${order.id}-${index}`}
            className={`px-3 md:px-8 py-4 md:py-4 hover:bg-gray-50 transition-colors ${
              index !== orders.length - 1 ? 'border-b border-gray-200' : ''
            }`}
          >
            <div className="hidden sm:grid grid-cols-9 gap-1 items-center">
              {/* Order ID - Green color as per Figma */}
              <div className="col-span-1">
                <span className="text-[12px] font-extrabold text-green-500">
                  {order.id}
                </span>
              </div>

              {/* Customer - Allow text wrapping to show full name */}
              <div className="col-span-1 min-w-0">
                <span className="text-[12px] font-extrabold text-gray-500 block leading-tight">
                  {order.customer}
                </span>
              </div>

              {/* Product - Allow text wrapping to show full product name */}
              <div className="col-span-2 min-w-0">
                <div className="text-[11px] font-extrabold text-gray-500 leading-tight">
                  {order.product}
                </div>
              </div>

              {/* Photo */}
              <div className="col-span-1">
                <div className="w-[50px] h-[50px] rounded-[10px] border border-[#B8B1B1] bg-[rgba(46,204,113,0.28)] flex items-center justify-center overflow-hidden">
                  <img
                    src={order.photo}
                    alt="Product"
                    className="w-[35px] h-[35px] object-cover rounded-[5px]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/static/media/prodcut1.6413c0aafe4eecade91e.png';
                    }}
                  />
                </div>
              </div>

              {/* Date */}
              <div className="col-span-1">
                <span className="text-[12px] font-extrabold text-gray-500">
                  {order.date.replace(/,/g, '')}
                </span>
              </div>

              {/* Payment */}
              <div className="col-span-1">
                <span className="text-[12px] font-extrabold text-gray-500">
                  {order.payment}
                </span>
              </div>

              {/* Amount */}
              <div className="col-span-1">
                <span className="text-[12px] font-extrabold text-gray-500">
                  {order.amount}
                </span>
              </div>

              {/* See Order Button */}
              <div className="col-span-1">
                <button
                  onClick={() => onViewOrder(order.id)}
                  className="bg-green-500 text-white px-1 py-2 rounded-[5px] text-[12px] font-bold hover:bg-green-600 transition-colors whitespace-nowrap w-[80px]"
                >
                  See Order &gt;
                </button>
              </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="sm:hidden flex flex-col gap-3">
              {/* Header Row - Order ID, Date, and Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-extrabold text-green-500">{order.id}</span>
                  {/* Status Badge */}
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-600">
                    Processing
                  </span>
                </div>
                <span className="text-[10px] font-medium text-gray-500">{order.date.replace(/,/g, '')}</span>
              </div>

              {/* Product Row - Image and Details */}
              <div className="flex items-start gap-3">
                <div className="w-[50px] h-[50px] rounded-[10px] border border-[#B8B1B1] bg-[rgba(46,204,113,0.28)] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src={order.photo} 
                    alt="Product" 
                    className="w-[36px] h-[36px] object-cover rounded-[5px]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/static/media/prodcut1.6413c0aafe4eecade91e.png';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-gray-700 mb-1">{order.customer}</div>
                  <div className="text-[11px] font-medium text-gray-600 leading-tight line-clamp-2">{order.product}</div>
                </div>
              </div>

              {/* Footer Row - Payment, Amount, and Action */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500">Payment</span>
                  <span className="text-[12px] font-bold text-gray-700">{order.payment}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-500">Amount</span>
                  <span className="text-[12px] font-bold text-gray-900">{order.amount}</span>
                </div>
                <button
                  onClick={() => onViewOrder(order.id)}
                  className="bg-green-500 text-white px-3 py-2 rounded-[8px] text-[11px] font-bold hover:bg-green-600 transition-colors shadow-sm"
                >
                  View Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No processing orders found</div>
          <div className="text-gray-400 text-sm mt-2">
            Try adjusting your search or filter criteria
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingOrdersTable;
