import React from 'react';
import { PaginationProps } from '../types/orderTypes';

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= maxVisiblePages; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 1) {
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center gap-2 md:gap-4">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`text-[16px] md:text-[20px] font-medium ${
          currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:text-green-500'
        } transition-colors`}
      >
        &lt;
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 md:gap-2">
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`text-[13px] md:text-[15px] font-medium px-2 md:px-3 py-1 rounded transition-colors ${
              page === currentPage
                ? 'bg-green-500 text-white'
                : 'text-gray-600 hover:text-green-500'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`text-[16px] md:text-[20px] font-medium ${
          currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:text-green-500'
        } transition-colors`}
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
