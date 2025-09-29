import React from 'react';
import { EarningEntry } from './types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

type EarningsSummaryProps = {
  title?: string;
  items: EarningEntry[];
};

export default function EarningsSummary({ title = 'Earnings Summary', items }: EarningsSummaryProps) {
  const monthlyData = [
    { name: 'Jan', value: 1200 },
    { name: 'Feb', value: 1800 },
    { name: 'Mar', value: 900 },
    { name: 'Apr', value: 1400 },
    { name: 'May', value: 2000 },
    { name: 'Jun', value: 2200 },
    { name: 'Jul', value: 1500 },
    { name: 'Aug', value: 1700 },
    { name: 'Sep', value: 2300 },
    { name: 'Oct', value: 1600 },
    { name: 'Nov', value: 1900 },
    { name: 'Dec', value: 2100 },
  ];

  const orders = [
    { id: '#B12345K', date: '3-Sep', product: 'Nokia 4G', amount: 'PKR 45,000', status: 'Paid' },
    { id: '#B12345K', date: '2-Sep', product: 'Nokia 4G', amount: 'PKR 45,000', status: 'Paid' },
    { id: '#B12345K', date: '1-Sep', product: 'Nokia 4G', amount: 'PKR 45,000', status: 'Pending' },
    { id: '#B12345K', date: '31-Aug', product: 'Nokia 4G', amount: 'PKR 45,000', status: 'Paid' },
    { id: '#B12345K', date: '30-Aug', product: 'Nokia 4G', amount: 'PKR 45,000', status: 'Pending' },
    { id: '#B12345K', date: '29-Aug', product: 'Nokia 4G', amount: 'PKR 45,000', status: 'Paid' },
  ];

  return (
    <div className="bg-[white] rounded-xl shadow-sm p-6">
      <div className="mb-4">
        <div className="flex md:gap-6 gap-4 border-b">
          {['Daily', 'Weekly', 'Monthly', 'Custom range'].map((tab) => (
            <button
              key={tab}
              className={
                (tab === 'Daily'
                  ? 'py-2 -mb-px border-b-2 border-[#00C853] text-[#00C853] font-semibold'
                  : 'py-2 text-[#595959]')
                + ' text-[14px] md:text-[22px]'
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: grid, Mobile: stacked cards */}
      <div>
        {/* Desktop view */}
        <div className="hidden md:grid grid-cols-3 md:gap-4 gap-2 mb-6">
          {[
            { label: 'Total Sales', value: 'PKR 150,000' },
            { label: 'Total Sales', value: 'PKR 130,000' },
            { label: 'Pending Earnings', value: 'PKR 5,000' },
          ].map((s, idx) => (
            <div key={idx} className="bg-white rounded-lg p-1">
              <div className="text-[#595959]">{s.label}</div>
              <div className="text-[#00C853] font-semibold">{s.value}</div>
            </div>
          ))}
        </div>
        {/* Mobile view */}
        <div className="md:hidden flex flex-col gap-3 mb-6">
          {[
            { label: 'Total Sales', value: 'PKR 150,000' },
            { label: 'Total Sales', value: 'PKR 130,000' },
            { label: 'Pending Earnings', value: 'PKR 5,000' },
          ].map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm border"
            >
              <div className="text-[#595959] text-[15px]">{s.label}</div>
              <div className="text-[#00C853] font-semibold text-[16px]">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Bar Chart */}
      <div className="h-64 bg-white rounded-lg p-4 mb-6 hidden md:block">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 2500]} />
            <Tooltip />
            <Bar dataKey="value" fill="#00C853" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Mobile Bar Chart */}
      <div className="md:hidden bg-white rounded-lg p-2 mb-6 flex flex-col items-center">
        <div className="w-full" style={{ minHeight: 220 }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={monthlyData}
              margin={{ top: 8, right: 0, left: -20, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid stroke="#F3F3F3" strokeDasharray="2 2" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 2500]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  fontSize: 13,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                }}
                labelStyle={{ fontWeight: 500, color: '#00C853' }}
              />
              <Bar dataKey="value" fill="#00C853" radius={[6, 6, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Optional: Add a subtle legend or summary for mobile */}
        <div className="w-full flex justify-between mt-2 px-1 text-xs text-[#595959]">
          <span>Min: 0</span>
          <span>Max: 2500</span>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="bg-white rounded-lg overflow-hidden hidden md:block">
        <div className="grid grid-cols-5 text-sm text-[#595959] font-medium px-4 py-3 border-b">
          <div>Order ID</div>
          <div>Date</div>
          <div>Product</div>
          <div>Amount</div>
          <div>Status</div>
        </div>
        <div className="divide-y">
          {orders.map((o, idx) => (
            <div key={idx} className="grid grid-cols-5 px-4 py-3 text-sm hover:bg-[#F7FFFA] transition">
              <div className="text-[#00C853]">{o.id}</div>
              <div>{o.date}</div>
              <div>{o.product}</div>
              <div>{o.amount}</div>
              <div>
                <span
                  className={
                    o.status === 'Paid'
                      ? 'text-[#00C853] bg-[#E8FFF2] px-2 py-1 rounded'
                      : 'text-[#FF8A00] bg-[#FFF3E5] px-2 py-1 rounded'
                  }
                >
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Mobile Card List */}
      <div className="md:hidden bg-white rounded-lg overflow-hidden flex flex-col gap-3">
        {orders.length === 0 ? (
          <div className="text-center text-[#949494] py-8">No orders found.</div>
        ) : (
          orders.map((o, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-[#F7FFFA] rounded-xl shadow-sm px-4 py-3 mb-1 border border-[#E8FFF2] transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#00C853] font-semibold text-base">{o.id}</span>
                <span
                  className={
                    o.status === 'Paid'
                      ? 'text-[#00C853] bg-[#E8FFF2] px-2 py-1 rounded text-xs font-medium'
                      : 'text-[#FF8A00] bg-[#FFF3E5] px-2 py-1 rounded text-xs font-medium'
                  }
                >
                  {o.status}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-[14px] text-[#595959]">
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{o.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Product:</span>
                  <span className="truncate max-w-[140px] text-right">{o.product}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="text-[#00C853] font-semibold">{o.amount}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


