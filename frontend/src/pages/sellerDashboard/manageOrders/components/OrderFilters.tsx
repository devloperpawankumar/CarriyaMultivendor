import React, { useState, useEffect, useRef } from 'react';
import { OrderFiltersProps } from '../types/orderTypes';
import cartIcon from "../../../../assets/images/Seller/shoppingSeller.png";
import truckIcon from "../../../../assets/images/Seller/ProcessingSeller.png";
import checkIcon from "../../../../assets/images/Seller/completedSeller.png";
import crossIcon from "../../../../assets/images/Seller/CancelledSeller.png";

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  selectedDate,
  onSearch,
  onDateFilter,
  activeFilter = "New Orders",
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showRecentOrderDropdown, setShowRecentOrderDropdown] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
        setShowRecentOrderDropdown(false);
      }
    };

    if (showCalendar || showRecentOrderDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar, showRecentOrderDropdown]);
  const filterTabs = [
    { id: "New Orders", icon: cartIcon, label: "New Orders" },
    { id: "Processing", icon: truckIcon, label: "Processing" },
    { id: "Completed", icon: checkIcon, label: "Completed" },
    { id: "Canceled/Returned", icon: crossIcon, label: "Canceled/Returned" },
  ];

  return (
    <div className="mb-8">
      <style dangerouslySetInnerHTML={{
        __html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `
      }} />
      {/* Filter Tabs */}
      <div className="mb-4 md:mb-6">
        {/* Mobile: 2x2 Grid Layout */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              const isCross = tab.id === "Canceled/Returned";

              // icon color filter
              let iconStyle: React.CSSProperties = {};
              if (isActive && !isCross) {
                // Active green
                iconStyle = {
                  filter:
                    "brightness(0) saturate(100%) invert(48%) sepia(87%) saturate(423%) hue-rotate(82deg) brightness(95%) contrast(90%)",
                };
              } else {
                // Gray inactive (including cross)
                iconStyle = {
                  filter:
                    "brightness(0) saturate(100%) invert(46%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(83%) contrast(92%)",
                };
              }

              return (
                <div
                  key={tab.id}
                  onClick={() => onDateFilter(tab.id)}
                  className={`flex flex-col items-center justify-center gap-2 cursor-pointer px-2 py-3 rounded-lg transition-colors border min-h-[70px] ${
                    isActive 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {/* Text on top - centered */}
                  <span
                    className={`text-[10px] font-semibold text-center leading-tight ${
                      isActive && !isCross
                        ? "text-green-500"
                        : isActive && isCross
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                    style={{ wordBreak: 'break-word', lineHeight: '1.2' }}
                  >
                    {tab.label}
                  </span>
                  
                  {/* Icon below - centered */}
                  {isCross ? (
                    // Show cross icon for Canceled/Returned
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-red-500' : 'bg-gray-500'
                      }`}
                    >
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 12 12" 
                        fill="none"
                        className="text-white"
                      >
                        <path 
                          d="M1 1L11 11M11 1L1 11" 
                          stroke="white" 
                          strokeWidth="2" 
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  ) : (
                    // Show regular icons for other filters
                    <img
                      src={tab.icon}
                      alt={tab.label}
                      className="w-6 h-6"
                      style={iconStyle}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop: Original layout */}
        <div className="hidden md:flex items-center justify-between py-1 gap-4">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            const isCross = tab.id === "Canceled/Returned";

            // icon color filter
            let iconStyle: React.CSSProperties = {};
            if (isActive && !isCross) {
              // Active green
              iconStyle = {
                filter:
                  "brightness(0) saturate(100%) invert(48%) sepia(87%) saturate(423%) hue-rotate(82deg) brightness(95%) contrast(90%)",
              };
            } else {
              // Gray inactive (including cross)
              iconStyle = {
                filter:
                  "brightness(0) saturate(100%) invert(46%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(83%) contrast(92%)",
              };
            }

            return (
              <div
                key={tab.id}
                onClick={() => onDateFilter(tab.id)}
                className="flex items-center gap-2 cursor-pointer flex-shrink-0 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isCross ? (
                  // Show cross icon for Canceled/Returned
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-red-500' : 'bg-gray-500'
                    }`}
                  >
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 12 12" 
                      fill="none"
                      className="text-white"
                    >
                      <path 
                        d="M1 1L11 11M11 1L1 11" 
                        stroke="white" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                ) : (
                  // Show regular icons for other filters
                  <img
                    src={tab.icon}
                    alt={tab.label}
                    className="w-6 h-6"
                    style={iconStyle}
                  />
                )}
                <span
                  className={`text-[18px] font-semibold whitespace-nowrap ${
                    isActive && !isCross
                      ? "text-green-500"
                      : isActive && isCross
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Separator Line */}
      <div className="w-full h-px bg-green-500 mb-4 md:mb-6"></div>

      {/* Search and Date Filters */}
      <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <label className="block text-[14px] sm:text-[16px] md:text-[23px] font-semibold text-gray-500 mb-1 md:mb-2">
            Search Order
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search ..."
              className="w-full h-[44px] sm:h-[48px] md:h-[55px] pl-10 md:pl-12 pr-4 border border-gray-300 rounded-[15px] text-[14px] md:text-[18px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex-1 relative">
          <label className="block text-[14px] sm:text-[16px] md:text-[23px] font-semibold text-gray-500 mb-1 md:mb-2">
            Order Date
          </label>
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full h-[44px] sm:h-[48px] md:h-[55px] pl-4 pr-10 md:pr-12 bg-gray-100 border border-white rounded-[15px] text-[14px] sm:text-[16px] md:text-[20px] text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-left flex items-center"
            >
              {selectedDate || "Recent Order"}
            </button>
            <svg
              className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Calendar with Right-Side Dropdown */}
          {showCalendar && (
            <div 
              ref={calendarRef}
              className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-[85vw] max-w-[300px] sm:w-[394px]"
              style={{ height: 'auto', maxHeight: '400px' }}
            >
              <div className="relative w-full h-full p-3 md:p-4">
                {/* Calendar Header with Navigation */}
                <div className="flex items-center justify-between mb-3 md:mb-4 pr-12 sm:pr-20 md:pr-44">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold text-black">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center text-xs text-gray-500 py-1 md:py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                  {Array.from({ length: 42 }, (_, i) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 6);
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          onDateFilter(date.toLocaleDateString());
                          setShowCalendar(false);
                        }}
                        className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-center text-xs sm:text-sm rounded hover:bg-gray-100 ${
                          isCurrentMonth ? 'text-black' : 'text-gray-400'
                        } ${isToday ? 'bg-blue-100 text-blue-600' : ''}`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>

                 {/* Right-Side Dropdown - Mobile Responsive */}
                 <div 
                   className="absolute bg-gray-100 border border-gray-300 rounded-lg"
                   style={{
                     top: '16px',
                     right: '4px',
                     width: '90px',
                     height: '28px'
                   }}
                 >
                   <button
                     onClick={() => setShowRecentOrderDropdown(!showRecentOrderDropdown)}
                     className="w-full h-full flex items-center justify-between px-1 text-xs hover:bg-gray-200 rounded-lg"
                   >
                     <span className="text-black text-xs">Recent</span>
                     <span className="text-black text-xs">&gt;</span>
                   </button>
                 </div>

                 {/* Recent Order Dropdown - Mobile Responsive */}
                 {showRecentOrderDropdown && (
                   <div 
                     className="absolute bg-gray-100 border border-gray-300 rounded-lg shadow-lg z-20"
                     style={{
                       top: '44px', // 16px + 28px (button height)
                       right: '4px',
                       width: '35%',
                       height: 'auto'
                     }}
                   >
                     {/* Options */}
                     <div className="py-1">
                       <button
                         onClick={() => {
                           onDateFilter('Recent Order');
                           setShowRecentOrderDropdown(false);
                           setShowCalendar(false);
                         }}
                         className="w-full text-left text-black font-bold text-xs hover:bg-gray-200 px-2 py-1"
                       >
                         1. Recent Order
                       </button>
                       <button
                         onClick={() => {
                           onDateFilter('Last Week');
                           setShowRecentOrderDropdown(false);
                           setShowCalendar(false);
                         }}
                         className="w-full text-left text-black font-normal text-xs hover:bg-gray-200 px-2 py-1"
                       >
                         2. Last Week
                       </button>
                       <button
                         onClick={() => {
                           onDateFilter('Last Month');
                           setShowRecentOrderDropdown(false);
                           setShowCalendar(false);
                         }}
                         className="w-full text-left text-black font-normal text-xs hover:bg-gray-200 px-2 py-1"
                       >
                         3. Last Month
                       </button>
                       <button
                         onClick={() => {
                           onDateFilter('Last Year');
                           setShowRecentOrderDropdown(false);
                           setShowCalendar(false);
                         }}
                         className="w-full text-left text-black font-normal text-xs hover:bg-gray-200 px-2 py-1"
                       >
                         4. Last Year
                       </button>
                     </div>
                     
                     {/* Bottom Button
                     <div className="px-3 pb-2">
                       <button
                         onClick={() => {
                           onDateFilter('See Order');
                           setShowRecentOrderDropdown(false);
                           setShowCalendar(false);
                         }}
                         className="w-full bg-green-500 text-white font-bold text-xs py-1 px-3 rounded hover:bg-green-600"
                       >
                         See Order &gt;
                       </button>
                     </div> */}
                   </div>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
