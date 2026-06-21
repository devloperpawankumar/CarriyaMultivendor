import React, { useState } from 'react';

export type SellerStatus = 'Pending' | 'Active' | 'Inactive';

export type NewSeller = {
    id: string;
    name: string;
    joinedDate: string;
    status: SellerStatus;
};

type NewSellersListProps = {
    sellers?: NewSeller[];
    loading?: boolean;
    emptyMessage?: string;
    itemsPerPage?: number;
};

const getStatusBadgeStyle = (status: SellerStatus) => {
    switch (status) {
        case 'Active':
            return {
                bg: '#DCFCE7',
                border: '#B9F8CF',
                text: '#008236'
            };
        case 'Pending':
            return {
                bg: '#FEF9C2',
                border: '#FFF085',
                text: '#A65F00'
            };
        default:
            return {
                bg: '#F3F4F6',
                border: '#E5E7EB',
                text: '#6A7282'
            };
    }
};

const NewSellersList: React.FC<NewSellersListProps> = ({ 
    sellers = [], 
    loading = false,
    emptyMessage = 'No new sellers',
    itemsPerPage = 4
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    
    // Calculate pagination
    const totalPages = Math.ceil(sellers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displaySellers = sellers.slice(startIndex, endIndex);

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
                    New Sellers
                </h3>
            </div>
            
            {/* Content */}
            <div className="flex flex-col flex-1 px-4 sm:px-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-2 border-[#2ECC71] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : displaySellers.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-[#6A7282] text-sm" style={{ fontFamily: 'Arimo, sans-serif' }}>
                            {emptyMessage}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Sellers List */}
                        <div className="flex flex-col flex-1">
                            {displaySellers.map((seller, index) => {
                                const statusStyle = getStatusBadgeStyle(seller.status);
                                const isLast = index === displaySellers.length - 1;
                                
                                return (
                                    <div
                                        key={seller.id}
                                        className={`flex flex-col gap-2 py-4 ${!isLast ? 'border-b border-[#F3F4F6]' : ''}`}
                                        style={{
                                            paddingTop: 16,
                                            paddingBottom: 16,
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <p 
                                                className="text-[#101828] text-[16px] leading-[24px] font-normal"
                                                style={{ fontFamily: 'Arimo, sans-serif' }}
                                            >
                                                {seller.name}
                                            </p>
                                            <span
                                                className="inline-block px-3 py-1 rounded-full text-[14px] leading-[20px] font-normal shrink-0"
                                                style={{
                                                    backgroundColor: statusStyle.bg,
                                                    border: `0.909px solid ${statusStyle.border}`,
                                                    color: statusStyle.text,
                                                    fontFamily: 'Arimo, sans-serif',
                                                    paddingTop: 4,
                                                    paddingBottom: 4,
                                                    paddingLeft: 12,
                                                    paddingRight: 12
                                                }}
                                            >
                                                {seller.status}
                                            </span>
                                        </div>
                                        <p 
                                            className="text-[#6A7282] text-[14px] leading-[20px] font-normal"
                                            style={{ fontFamily: 'Arimo, sans-serif' }}
                                        >
                                            Joined {seller.joinedDate}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div 
                                className="flex flex-col sm:flex-row items-center justify-between gap-3 px-0 py-3 border-t border-[#E5E7EB] mt-auto"
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
                                    Showing {startIndex + 1}-{Math.min(endIndex, sellers.length)} of {sellers.length}
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

export default NewSellersList;
