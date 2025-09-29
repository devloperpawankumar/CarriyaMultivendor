import React from 'react';
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

type Props = { trend: SalesTrend };

const SalesTrendChart: React.FC<Props> = ({ trend }) => {
  const maxY = trend.yAxisTicks[trend.yAxisTicks.length - 1] || 0;
  const data = trend.xAxisLabels.map((label) => {
    const point = trend.primarySeries.find((p) => p.label === label);
    return { name: label, value: point ? point.value : 0 };
  });

  return (
    <div className="bg-white rounded-[18px] p-5 border border-gray-100">
      <div className="text-[14px] font-semibold text-black mb-3">{trend.title}</div>
      <div className="h-[236px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2ECC71" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#2ECC71" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F1F1F1" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#000000' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, maxY]}
              ticks={trend.yAxisTicks}
              tick={{ fontSize: 12, fill: '#000000' }}
              tickFormatter={(v) => (v === 0 ? '0.0' : String(v))}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              labelStyle={{ fontWeight: 600, color: '#2ECC71' }}
              cursor={{ stroke: '#E6E6E6', strokeWidth: 1 }}
            />
            <Area type="monotone" dataKey="value" stroke="#2ECC71" strokeWidth={1.5} fill="url(#salesGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesTrendChart;



