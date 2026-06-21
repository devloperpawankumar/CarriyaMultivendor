import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { OrderFiltersProps } from '../types/orderTypes';
import {
  DATE_FILTER_PRESETS,
  DATE_FILTER_PRESET_ORDER,
  DEFAULT_DATE_PRESET,
  DateFilterPresetId,
  resolvePresetIdFromValue,
} from '../constants/dateFilters';
import cartIcon from "../../../../assets/images/Seller/shoppingSeller.png";
import truckIcon from "../../../../assets/images/Seller/ProcessingSeller.png";
import checkIcon from "../../../../assets/images/Seller/completedSeller.png";
import crossIcon from "../../../../assets/images/Seller/CancelledSeller.png";

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  selectedDate,
  onSearch,
  onDateFilter,
  onStatusChange,
  activeFilter = "New Orders",
  isLoading = false,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCustomRangeMode, setIsCustomRangeMode] = useState(false);
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [customRangeError, setCustomRangeError] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0, width: 0 });
  const isMobileView = viewportWidth < 640;

  const quickDateFilters = DATE_FILTER_PRESET_ORDER.map((id) => DATE_FILTER_PRESETS[id]);

  const formatDateLabel = (value: string | Date) => {
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const parseCustomRangeValue = (value: string) => {
    if (!value || !value.startsWith('Custom:')) return null;
    const [, payload] = value.split('Custom:');
    if (!payload) return null;
    const [start, end] = payload.split('|');
    if (!start || !end) return null;
    return { start, end };
  };

  const parsedCustomRange = useMemo(() => parseCustomRangeValue(selectedDate), [selectedDate]);

  useEffect(() => {
    if (parsedCustomRange) {
      setCustomRange({
        start: parsedCustomRange.start,
        end: parsedCustomRange.end,
      });
    }
  }, [parsedCustomRange]);

  const closeCalendar = useCallback(() => {
    setShowCalendar(false);
    setIsCustomRangeMode(false);
    setCustomRangeError(null);
  }, []);

  const resetFilters = useCallback(() => {
    onSearch('');
    onDateFilter(DEFAULT_DATE_PRESET);
    setCustomRange({ start: '', end: '' });
    setCurrentDate(new Date());
    closeCalendar();
  }, [closeCalendar, onDateFilter, onSearch]);

  const handleStatusTabChange = useCallback(
    (status: string) => {
      resetFilters();
      onStatusChange(status);
    },
    [onStatusChange, resetFilters]
  );

  const updateCalendarPosition = useCallback(() => {
    if (!triggerRef.current || typeof window === 'undefined') return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.min(700, window.innerWidth - 32);
    const tentativeLeft = rect.left + rect.width / 2 - width / 2;
    const left = Math.min(Math.max(tentativeLeft, 16), window.innerWidth - width - 16);
    const top = rect.bottom + 12;
    setCalendarPosition({ top, left, width });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!showCalendar || isMobileView) return;
    updateCalendarPosition();
    const handleScroll = () => updateCalendarPosition();
    window.addEventListener('resize', updateCalendarPosition);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('resize', updateCalendarPosition);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showCalendar, isMobileView, updateCalendarPosition]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        closeCalendar();
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const selectedExactDate = useMemo(() => {
    if (!selectedDate) return null;
    if (selectedDate.startsWith('Exact:')) {
      const iso = selectedDate.replace('Exact:', '');
      const parsed = new Date(iso);
      if (Number.isNaN(parsed.getTime())) return null;
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }
    // Legacy exact date stored as locale string (e.g. 11/25/2025)
    if (selectedDate.includes('/')) {
      const parsed = new Date(selectedDate);
      if (Number.isNaN(parsed.getTime())) return null;
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }
    return null;
  }, [selectedDate]);

  const customRangeBoundaries = useMemo(() => {
    if (!parsedCustomRange) return null;
    const start = new Date(parsedCustomRange.start);
    const end = new Date(parsedCustomRange.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return { start, end };
  }, [parsedCustomRange]);

  const today = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    return base;
  }, []);

  const calendarDays = useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const dayOfWeek = (startOfMonth.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    const calendarStart = new Date(startOfMonth);
    calendarStart.setDate(startOfMonth.getDate() - dayOfWeek);
    return Array.from({ length: 42 }, (_, idx) => {
      const date = new Date(calendarStart);
      date.setDate(calendarStart.getDate() + idx);
      return date;
    });
  }, [currentDate]);

  const activePreset = resolvePresetIdFromValue(selectedDate);

  const selectedDateLabel = useMemo(() => {
    if (activePreset) {
      return DATE_FILTER_PRESETS[activePreset].summary;
    }
    if (parsedCustomRange) {
      const startLabel = formatDateLabel(parsedCustomRange.start);
      const endLabel = formatDateLabel(parsedCustomRange.end);
      if (startLabel && endLabel) {
        return `${startLabel} – ${endLabel}`;
      }
      return 'Custom range';
    }
    if (selectedDate.startsWith('Exact:') || selectedDate.includes('/')) {
      const label = selectedExactDate ? formatDateLabel(selectedExactDate) : '';
      return label ? `On ${label}` : 'Exact date';
    }
    return selectedDate;
  }, [selectedDate, parsedCustomRange, selectedExactDate, activePreset]);

  const isQuickFilterActive = (id: DateFilterPresetId) => {
    if (id === 'recent') {
      return !selectedDate || activePreset === 'recent';
    }
    return activePreset === id;
  };

  const handleQuickFilterSelect = (id: DateFilterPresetId) => {
    setCustomRangeError(null);
    setIsCustomRangeMode(false);
    onDateFilter(id);
    closeCalendar();
  };

  const handleCustomRangeOpen = () => {
    const todayIso = today.toISOString().split('T')[0];
    setCustomRange((prev) => ({
      start: prev.start || parsedCustomRange?.start || todayIso,
      end: prev.end || parsedCustomRange?.end || todayIso,
    }));
    const anchor = parsedCustomRange?.end ? new Date(parsedCustomRange.end) : new Date(today);
    setCurrentDate(anchor);
    setIsCustomRangeMode(true);
    setCustomRangeError(null);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const nextMonth = direction === 'next' ? prev.getMonth() + 1 : prev.getMonth() - 1;
      return new Date(prev.getFullYear(), nextMonth, 1);
    });
  };

  const normalizeToLocalIso = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDaySelection = (date: Date) => {
    const localIsoValue = normalizeToLocalIso(date);
    onDateFilter(`Exact:${localIsoValue}`);
    closeCalendar();
  };

  const handleCustomRangeChange = (key: 'start' | 'end', value: string) => {
    setCustomRange((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyCustomRange = () => {
    if (!customRange.start || !customRange.end) {
      setCustomRangeError('Select both start and end dates.');
      return;
    }
    if (customRange.start > customRange.end) {
      setCustomRangeError('End date cannot be before start date.');
      return;
    }
    setCustomRangeError(null);
    onDateFilter(`Custom:${customRange.start}|${customRange.end}`);
    closeCalendar();
  };

  const canApplyCustomRange =
    Boolean(customRange.start && customRange.end) && customRange.start <= customRange.end;

  const renderCalendarContent = () => (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="w-full sm:w-60 flex flex-col border border-gray-200 rounded-2xl p-3 bg-gray-50">
        <p className="text-[11px] uppercase font-semibold text-gray-500 tracking-wider mb-2">
          Quick ranges
        </p>
        <div className="flex-1 space-y-2 overflow-y-auto pr-1 hide-scrollbar">
          {quickDateFilters.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleQuickFilterSelect(preset.id)}
              className={`w-full text-left rounded-xl border px-3 py-2 transition-colors ${
                isQuickFilterActive(preset.id)
                  ? 'border-green-500 bg-green-50 text-green-600'
                  : 'border-transparent hover:border-gray-200 hover:bg-white text-gray-600'
              }`}
            >
              <span className="block text-sm font-semibold">{preset.label}</span>
              <span className="block text-xs text-gray-400">{preset.description}</span>
            </button>
          ))}
        </div>
        <div className="pt-3 mt-3 border-t border-gray-200">
          <button
            onClick={handleCustomRangeOpen}
            className={`w-full rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
              selectedDate?.startsWith('Custom:')
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
            }`}
          >
            Custom range
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => handleMonthChange('prev')}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-100"
            aria-label="Previous month"
          >
            ‹
          </button>
          <h3 className="text-sm md:text-base lg:text-lg font-bold text-black">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => handleMonthChange('next')}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-100"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-[11px] font-semibold text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const normalized = new Date(date);
            normalized.setHours(0, 0, 0, 0);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = normalized.getTime() === today.getTime();
            const isSelected =
              selectedExactDate && normalized.getTime() === selectedExactDate.getTime();
            const isInCustomRange =
              customRangeBoundaries &&
              normalized.getTime() >= customRangeBoundaries.start.getTime() &&
              normalized.getTime() <= customRangeBoundaries.end.getTime();
            const isFuture = normalized.getTime() > today.getTime();

            let stateClasses = '';
            if (isSelected) {
              stateClasses = 'bg-green-500 text-white';
            } else if (isInCustomRange) {
              stateClasses = 'bg-green-100 text-green-700';
            } else if (isToday) {
              stateClasses = 'border border-green-400 text-green-600';
            } else if (isCurrentMonth) {
              stateClasses = 'text-gray-900 hover:bg-gray-100';
            } else {
              stateClasses = 'text-gray-400';
            }

            return (
              <button
                key={`${date.toISOString()}-${index}`}
                onClick={() => handleDaySelection(normalized)}
                disabled={isFuture}
                className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-center text-xs sm:text-sm rounded-full flex items-center justify-center transition ${
                  isFuture ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
                } ${stateClasses}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {isCustomRangeMode && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Custom range
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">From</label>
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) => handleCustomRangeChange('start', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  max={customRange.end || undefined}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">To</label>
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) => handleCustomRangeChange('end', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  min={customRange.start || undefined}
                />
              </div>
            </div>
            {customRangeError && (
              <p className="text-xs text-red-500 mt-2">{customRangeError}</p>
            )}
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setIsCustomRangeMode(false);
                  setCustomRangeError(null);
                }}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomRange}
                disabled={!canApplyCustomRange}
                className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                  canApplyCustomRange
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Apply filter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const handleCalendarToggle = () => {
    if (showCalendar) {
      closeCalendar();
      return;
    }
    if (parsedCustomRange) {
      const anchor = new Date(parsedCustomRange.end);
      if (!Number.isNaN(anchor.getTime())) {
        setCurrentDate(anchor);
      }
      setIsCustomRangeMode(true);
    } else if (selectedExactDate) {
      setCurrentDate(new Date(selectedExactDate));
      setIsCustomRangeMode(false);
    } else {
      setCurrentDate(new Date());
      setIsCustomRangeMode(false);
    }
    setCustomRangeError(null);
    if (!isMobileView) {
      updateCalendarPosition();
    }
    setShowCalendar(true);
  };
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
                  onClick={() => handleStatusTabChange(tab.id)}
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
                onClick={() => handleStatusTabChange(tab.id)}
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
          <div className="relative" ref={triggerRef}>
            <button
              onClick={handleCalendarToggle}
              className="w-full h-[44px] sm:h-[48px] md:h-[55px] pl-4 pr-10 md:pr-12 bg-gray-100 border border-white rounded-[15px] text-[14px] sm:text-[16px] md:text-[20px] text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-left flex items-center"
              aria-busy={isLoading}
            >
              <span className="flex-1 truncate">{selectedDateLabel}</span>
            </button>
            <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2">
              {isLoading ? (
                <span
                  className="inline-block w-5 h-5 md:w-6 md:h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 text-black"
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
              )}
            </div>
          </div>

          {showCalendar &&
            (isMobileView ? (
              <div className="fixed inset-0 z-50 bg-black/40 flex flex-col">
                <div className="flex justify-end p-4">
                  <button
                    onClick={closeCalendar}
                    className="text-white text-sm font-semibold hover:text-green-200"
                  >
                    Close ✕
                  </button>
                </div>
                <div
                  ref={calendarRef}
                  className="mt-auto bg-white rounded-t-3xl p-4 max-h-[85vh] overflow-y-auto"
                >
                  {renderCalendarContent()}
                </div>
              </div>
            ) : (
              <div
                ref={calendarRef}
                className="fixed bg-white border border-gray-300 rounded-2xl shadow-2xl z-50 p-4 overflow-y-auto"
                style={{
                  top: calendarPosition.top,
                  left: calendarPosition.left,
                  width: Math.max(calendarPosition.width, 320),
                  maxHeight: '80vh',
                }}
              >
                {renderCalendarContent()}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
