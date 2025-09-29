import React, { useEffect, useMemo, useState } from 'react';
import { SalesTrend } from '../types/reportTypes';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

type Props = {
  trend: SalesTrend;
};

// Lightweight media query hook for client-only responsiveness
function useMediaQuery(query: string): boolean {
  const getInitial = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState<boolean>(getInitial);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

const SalesReportCard: React.FC<Props> = ({ trend }) => {
  // Below md breakpoint treated as mobile
  const isMobile = useMediaQuery('(max-width: 767.98px)');
  const chartHeight = isMobile ? 190 : 236;
  const tickFont = isMobile ? 10 : 12;
  const strokeWidth = isMobile ? 1.25 : 1.5;
  const chartMargin = isMobile ? { top: 4, right: 8, left: 0, bottom: 0 } : { top: 6, right: 8, left: 8, bottom: 0 };
  const [product, setProduct] = useState<string>('Product');
  const [category, setCategory] = useState<string>('Category');
  const [date, setDate] = useState<string>('Date');

  const maxY = trend.yAxisTicks[trend.yAxisTicks.length - 1] || 0;
  const data = useMemo(
    () =>
      trend.xAxisLabels.map((label) => {
        const point = trend.primarySeries.find((p) => p.label === label);
        return { name: label, value: point ? point.value : 0 };
      }),
    [trend]
  );

  const dataMin = useMemo(() => data.reduce((m, d) => Math.min(m, d.value), Number.POSITIVE_INFINITY), [data]);
  const lowerBound = useMemo(() => {
    if (!isFinite(dataMin)) return 0;
    const padded = Math.max(0, Math.floor(dataMin * 0.85)); // lift the chart by ~15%
    return padded >= maxY ? Math.max(0, maxY - 1) : padded;
  }, [dataMin, maxY]);

  const yTicks = useMemo(() => {
    const provided = trend.yAxisTicks || [];
    const max = maxY || (provided.length ? provided[provided.length - 1] : 0);
    if (!max) return provided;
    const min = lowerBound;
    const desiredCount = 8;
    const span = Math.max(1, max - min);
    // Choose a 1000-multiple step close to target
    const rawStep = Math.ceil(span / (desiredCount - 1));
    const step = Math.max(1000, Math.round(rawStep / 1000) * 1000);
    const start = Math.floor(min / 1000) * 1000;
    const ticks: number[] = [];
    for (let v = start; v <= max; v += step) ticks.push(v);
    if (ticks[ticks.length - 1] !== max) ticks.push(max);
    // ensure at least desiredCount by backfilling downward in 1000s if needed
    while (ticks.length < desiredCount && ticks[0] > 0) {
      ticks.unshift(Math.max(0, ticks[0] - 1000));
    }
    return ticks;
  }, [trend.yAxisTicks, maxY, lowerBound]);

  const formatTick = (v: number) => {
    if (v === 0) return '0.0';
    return v.toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
      <div className="flex md:flex-row flex-col md:items-center items-start justify-between mb-3 gap-2">
        <div className="text-[14px] md:text-[16px] font-semibold text-black whitespace-nowrap md:mb-0">{trend.title}</div>
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap whitespace-nowrap md:overflow-x-auto max-w-full shrink-0 md:self-auto self-start">
          <button
            type="button"
            className="h-5 md:h-7 px-2 md:px-3 inline-flex items-center gap-1.5 md:gap-2 border border-[#E1E1E1] rounded text-[11px] md:text-[13px] text-black bg-white"
            onClick={() => setProduct(product)}
            aria-label="Filter by product"
          >
            <span>Product</span>
            <span className="text-black">›</span>
          </button>
          <button
            type="button"
            className="h-5 md:h-7 px-2 md:px-3 inline-flex items-center gap-1.5 md:gap-2 border border-[#E1E1E1] rounded text-[11px] md:text-[13px] text-black bg-white"
            onClick={() => setCategory(category)}
            aria-label="Filter by category"
          >
            <span>Category</span>
            <span className="text-black">›</span>
          </button>
          <button
            type="button"
            className="h-5 md:h-7 px-2 md:px-3 inline-flex items-center gap-1.5 md:gap-2 border border-[#E1E1E1] rounded text-[11px] md:text-[13px] text-black bg-white"
            onClick={() => setDate(date)}
            aria-label="Filter by date"
          >
            <span>Date</span>
            <span className="text-black">›</span>
          </button>
        </div>
      </div>

      <div className="w-full" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
  <AreaChart data={data} margin={chartMargin}>
    <defs>
      <linearGradient id="salesGradExact" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2ECC71" stopOpacity={0.25} />
        <stop offset="100%" stopColor="#2ECC71" stopOpacity={0} />
      </linearGradient>
    </defs>

    {/* Keep grid horizontal only */}
    <CartesianGrid stroke="#F1F1F1" vertical={false} />

    {/* X Axis */}
    <XAxis
      dataKey="name"
      tick={{ fontSize: tickFont, fill: '#000000' }}
      axisLine={false}
      tickLine={false}
      interval={isMobile ? 'preserveStartEnd' : 0}
      tickMargin={isMobile ? 4 : 8}
    />

    {/* ✅ Add Y Axis back */}
    <YAxis
      hide={isMobile}
      tick={{ fontSize: tickFont, fill: '#000000' }}
      axisLine={false}
      tickLine={false}
      tickFormatter={(v) => v.toLocaleString()}
    />

    <Tooltip
      contentStyle={{ borderRadius: 8, fontSize: tickFont + 1 }}
      labelStyle={{ fontWeight: 600, color: '#2ECC71' }}
      cursor={{ stroke: '#E6E6E6', strokeWidth: 1 }}
    />

    <Area
      type="monotone"
      dataKey="value"
      stroke="#2ECC71"
      strokeWidth={strokeWidth}
      fill="url(#salesGradExact)"
      dot={false}
    />
  </AreaChart>
</ResponsiveContainer>

      </div>
    </div>
  );
};

export default SalesReportCard;


