import React, { useState } from 'react';

// Recent Orders Table Component
export type OrderStatus = 'Completed' | 'In Escrow' | 'Paid' | 'Pending' | 'Processing';

export type RecentOrder = {
    orderId: string;
    buyer: string;
    seller: string;
    amount: string;
    status: OrderStatus;
};

type RecentOrdersTableProps = {
    orders?: RecentOrder[];
    loading?: boolean;
    emptyMessage?: string;
    itemsPerPage?: number;
};

const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
        case 'Completed':
            return {
                bg: '#DCFCE7',
                border: '#B9F8CF',
                text: '#008236'
            };
        case 'In Escrow':
            return {
                bg: '#F3E8FF',
                border: '#E9D4FF',
                text: '#8200DB'
            };
        case 'Paid':
            return {
                bg: '#DBEAFE',
                border: '#BEDBFF',
                text: '#1447E6'
            };
        default:
            return {
                bg: '#FEF9C2',
                border: '#FFF085',
                text: '#A65F00'
            };
    }
};

const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ 
    orders = [], 
    loading = false,
    emptyMessage = 'No recent orders',
    itemsPerPage = 5
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    
    // Calculate pagination
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayOrders = orders.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div 
            className="bg-white border border-[#E5E7EB] rounded-[10px] shadow-sm flex flex-col h-full"
            style={{
                borderWidth: '0.909px',
                minHeight: '461px',
            }}
        >
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-6 pb-3 sm:pb-4">
                <h3 
                    className="font-bold text-[#101828] text-[16px] sm:text-[18px] leading-[24px] sm:leading-[28px]"
                    style={{ fontFamily: 'Arimo, sans-serif' }}
                >
                    Recent Orders
                </h3>
            </div>
            
            {/* Table / Cards */}
            <div className="px-4 sm:px-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-2 border-[#2ECC71] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : displayOrders.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-[#6A7282] text-sm" style={{ fontFamily: 'Arimo, sans-serif' }}>
                            {emptyMessage}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-x-auto -mx-6">
                            <div className="min-w-full inline-block align-middle">
                                <div className="overflow-hidden">
                                <table className="min-w-[600px] w-full">
                                    <thead>
                                        <tr className="bg-[#F9FAFB]" style={{ height: 44 }}>
                                            <th className="text-left align-middle">
                                                <p
                                                    className="text-[12px] text-[#6A7282] uppercase"
                                                    style={{
                                                        fontFamily: 'Arimo, sans-serif',
                                                        lineHeight: '16px',
                                                        letterSpacing: 0.6,
                                                        marginLeft: 24,
                                                    }}
                                                >
                                                    ORDER ID
                                                </p>
                                            </th>
                                            <th className="text-left align-middle">
                                                <p
                                                    className="text-[12px] text-[#6A7282] uppercase"
                                                    style={{
                                                        fontFamily: 'Arimo, sans-serif',
                                                        lineHeight: '16px',
                                                        letterSpacing: 0.6,
                                                        marginLeft: 24,
                                                    }}
                                                >
                                                    BUYER
                                                </p>
                                            </th>
                                            <th className="text-left align-middle">
                                                <p
                                                    className="text-[12px] text-[#6A7282] uppercase"
                                                    style={{
                                                        fontFamily: 'Arimo, sans-serif',
                                                        lineHeight: '16px',
                                                        letterSpacing: 0.6,
                                                        marginLeft: 24,
                                                    }}
                                                >
                                                    SELLER
                                                </p>
                                            </th>
                                            <th className="text-left align-middle">
                                                <p
                                                    className="text-[12px] text-[#6A7282] uppercase"
                                                    style={{
                                                        fontFamily: 'Arimo, sans-serif',
                                                        lineHeight: '16px',
                                                        letterSpacing: 0.6,
                                                        marginLeft: 24,
                                                    }}
                                                >
                                                    AMOUNT
                                                </p>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayOrders.map((order, index) => {
                                            const statusStyle = getStatusBadgeStyle(order.status);
                                            const isLastRow = index === displayOrders.length - 1;
                                            return (
                                                <tr 
                                                    key={order.orderId || index}
                                                    className={`${!isLastRow ? 'border-b border-[#E5E7EB]' : ''}`}
                                                    style={{ height: 63 }}
                                                >
                                                    <td className="align-middle">
                                                        <p
                                                            className="text-[14px] text-[#101828]"
                                                            style={{
                                                                fontFamily: 'Arimo, sans-serif',
                                                                lineHeight: '20px',
                                                                marginLeft: 24,
                                                            }}
                                                        >
                                                            {order.orderId}
                                                        </p>
                                                    </td>
                                                    <td className="align-middle">
                                                        <p
                                                            className="text-[14px] text-[#101828]"
                                                            style={{
                                                                fontFamily: 'Arimo, sans-serif',
                                                                lineHeight: '20px',
                                                                marginLeft: 24,
                                                            }}
                                                        >
                                                            {order.buyer}
                                                        </p>
                                                    </td>
                                                    <td className="align-middle">
                                                        <p
                                                            className="text-[14px] text-[#101828]"
                                                            style={{
                                                                fontFamily: 'Arimo, sans-serif',
                                                                lineHeight: '20px',
                                                                marginLeft: 24,
                                                            }}
                                                        >
                                                            {order.seller}
                                                        </p>
                                                    </td>
                                                    <td className="align-middle">
                                                        <p
                                                            className="text-[14px] text-[#101828]"
                                                            style={{
                                                                fontFamily: 'Arimo, sans-serif',
                                                                lineHeight: '20px',
                                                                marginLeft: 24,
                                                            }}
                                                        >
                                                            {order.amount}
                                                        </p>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                        <div className="sm:hidden flex flex-col flex-1">
                            {displayOrders.map((order, index) => {
                                const isLast = index === displayOrders.length - 1;
                                
                                return (
                                    <div
                                        key={order.orderId || index}
                                        className={`flex flex-col gap-2 py-4 ${!isLast ? 'border-b border-[#F3F4F6]' : ''}`}
                                        style={{
                                            paddingTop: 16,
                                            paddingBottom: 16,
                                        }}
                                    >
                                        {/* Order ID */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p 
                                                    className="text-[12px] text-[#6A7282] uppercase mb-1"
                                                    style={{
                                                        fontFamily: 'Arimo, sans-serif',
                                                        letterSpacing: 0.6,
                                                    }}
                                                >
                                                    ORDER ID
                                                </p>
                                                <p 
                                                    className="text-[#101828] text-[16px] leading-[24px] font-medium"
                                                    style={{ fontFamily: 'Arimo, sans-serif' }}
                                                >
                                                    {order.orderId}
                                                </p>
                                            </div>
                                            <p 
                                                className="text-[#101828] text-[16px] leading-[24px] font-semibold"
                                                style={{ fontFamily: 'Arimo, sans-serif' }}
                                            >
                                                {order.amount}
                                            </p>
                                        </div>

                                        {/* Buyer */}
                                        <div>
                                            <p 
                                                className="text-[12px] text-[#6A7282] uppercase mb-1"
                                                style={{
                                                    fontFamily: 'Arimo, sans-serif',
                                                    letterSpacing: 0.6,
                                                }}
                                            >
                                                BUYER
                                            </p>
                                            <p 
                                                className="text-[#101828] text-[14px] leading-[20px]"
                                                style={{ fontFamily: 'Arimo, sans-serif' }}
                                            >
                                                {order.buyer}
                                            </p>
                                        </div>

                                        {/* Seller */}
                                        <div>
                                            <p 
                                                className="text-[12px] text-[#6A7282] uppercase mb-1"
                                                style={{
                                                    fontFamily: 'Arimo, sans-serif',
                                                    letterSpacing: 0.6,
                                                }}
                                            >
                                                SELLER
                                            </p>
                                            <p 
                                                className="text-[#101828] text-[14px] leading-[20px]"
                                                style={{ fontFamily: 'Arimo, sans-serif' }}
                                            >
                                                {order.seller}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div 
                                className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 border-t border-[#E5E7EB] -mx-4 sm:-mx-6 px-4 sm:px-6"
                                style={{
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                }}
                            >
                                <p
                                    className="text-[12px] sm:text-[13px] text-[#6A7282] text-center sm:text-left"
                                    style={{
                                        fontFamily: 'Arimo, sans-serif',
                                        lineHeight: '20px',
                                    }}
                                >
                                    Showing {startIndex + 1}-{Math.min(endIndex, orders.length)} of {orders.length}
                                </p>

                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <button
                                        type="button"
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        className="rounded-[8px] border border-[#D1D5DC] h-[32px] px-2.5 sm:px-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-[12px] sm:text-[13px] whitespace-nowrap"
                                        style={{
                                            fontFamily: 'Arimo, sans-serif',
                                            color: '#364153',
                                        }}
                                    >
                                        Previous
                                    </button>
                                    
                                    <span
                                        className="text-[12px] sm:text-[13px] text-[#6A7282] px-1 sm:px-2 whitespace-nowrap"
                                        style={{
                                            fontFamily: 'Arimo, sans-serif',
                                        }}
                                    >
                                        {currentPage} of {totalPages}
                                    </span>
                                    
                                    <button
                                        type="button"
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="rounded-[8px] border border-[#D1D5DC] h-[32px] px-2.5 sm:px-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-[12px] sm:text-[13px] whitespace-nowrap"
                                        style={{
                                            fontFamily: 'Arimo, sans-serif',
                                            color: '#364153',
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RecentOrdersTable;
