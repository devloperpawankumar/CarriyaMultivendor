import React, { useEffect, useMemo, useState } from 'react';
import { SalesTrend } from '../types/reportTypes';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
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
  const chartHeight = isMobile ? 220 : 300;
  const tickFont = isMobile ? 10 : 12;
  const strokeWidth = isMobile ? 1.5 : 2;
  const chartMargin = isMobile ? { top: 10, right: 12, left: 0, bottom: 0 } : { top: 16, right: 24, left: 8, bottom: 0 };
  const currency = useMemo(
    () =>
      new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 0,
      }),
    []
  );

  const chartData = useMemo(() => {
    const primaryMap = new Map(trend.primarySeries?.map((p) => [p.label, p.value]));
    const secondaryMap = new Map(trend.secondarySeries?.map((p) => [p.label, p.value]));

    return trend.xAxisLabels.map((label) => ({
      label,
      sales: primaryMap.get(label) ?? 0,
      orders: secondaryMap.get(label) ?? null,
    }));
  }, [trend]);

  const peakValue = chartData.reduce((max, point) => Math.max(max, point.sales || 0, point.orders || 0), 0);
  const yDomainMax = Math.ceil((peakValue * 1.15) / 1000) * 1000 || 1000;
  const hasOrdersSeries = chartData.some((point) => typeof point.orders === 'number');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const salesPoint = payload.find((p: any) => p.dataKey === 'sales');
    const ordersPoint = payload.find((p: any) => p.dataKey === 'orders');

    return (
      <div className="rounded-xl border border-[#E3E6EB] bg-white px-3 py-2 shadow-md text-xs text-[#1F2933]">
        <div className="font-semibold mb-1 text-[#111827]">{label}</div>
        {salesPoint && (
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#2ECC71]" />
            <span>Sales</span>
            <span className="font-semibold">{currency.format(Number(salesPoint.value) || 0)}</span>
          </div>
        )}
        {ordersPoint && typeof ordersPoint.value === 'number' && (
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[#1D4ED8]" />
            <span>Orders</span>
            <span className="font-semibold">{Number(ordersPoint.value).toLocaleString('en-PK')}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
      <div className="flex md:flex-row flex-col md:items-center items-start justify-between mb-6 gap-3">
        <div className="text-[16px] md:text-[20px] font-semibold text-[#111827]">{trend.title}</div>
        <div className="flex items-center gap-3 text-xs text-[#6B7280]">
          <div className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#2ECC71]" />
            <span>Sales</span>
          </div>
          {hasOrdersSeries && (
            <div className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#1D4ED8]" />
              <span>Orders</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={chartMargin}>
            <defs>
              <linearGradient id="salesGradExact" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#EEF2F6" vertical={false} />

            <XAxis
              dataKey="label"
              tick={{ fontSize: tickFont, fill: '#4B5563' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />

            <YAxis
              tick={{ fontSize: tickFont, fill: '#4B5563' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString())}
              domain={[0, yDomainMax]}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }} />

            {hasOrdersSeries && (
              <Bar
                dataKey="orders"
                barSize={isMobile ? 18 : 24}
                fill="#1D4ED8"
                radius={[6, 6, 0, 0]}
                opacity={0.8}
              />
            )}

            <Area
              type="monotone"
              dataKey="sales"
              stroke="#18B368"
              strokeWidth={strokeWidth}
              fill="url(#salesGradExact)"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesReportCard;


