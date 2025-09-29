import React from 'react';

type InvoiceRow = {
  orderId: string;
  date: string; // display like 15-Sep
  product: string;
  amount: number; // in PKR numeric
};

type Props = {
  title?: string;
  rows: InvoiceRow[];
};

function downloadRowAsCsv(row: InvoiceRow) {
  const headers = ['Order ID', 'Date', 'Product', 'Amount (PKR)'];
  const values = [row.orderId, row.date, row.product, String(row.amount)];
  const csv = `${headers.join(',')}\n${values.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${row.orderId}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DownloadInvoiceTable({ title = 'Download Invoice', rows }: Props) {
  return (
    <div className=" p-4 rounded-[15px]">
      <h3 className="text-lg font-bold mb-8 md:text-[35px]">{title}</h3>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="hidden md:grid md:grid-cols-5 text-sm text-gray-700 font-medium px-2 py-2 border-b">
          <div>Order ID</div>
          <div>Date</div>
          <div>Product</div>
          <div>Amount</div>
          <div className="text-right ">Download Invoice</div>
        </div>
        <div className="divide-y">
          {rows.map((r) => (
            <div key={r.orderId} className="px-2 py-3 hover:bg-[#F7FFFA] transition">
              {/* Desktop layout */}
              <div className="hidden md:grid md:grid-cols-5 items-center text-sm">
                <a className="text-[#22C55E] hover:underline" href="#">{r.orderId}</a>
                <div className="text-gray-700">{r.date}</div>
                <div className="text-gray-700 truncate" title={r.product}>{r.product}</div>
                <div className="text-gray-700">{`PKR ${r.amount.toLocaleString()}`}</div>
                <div className="text-right">
                  <button
                    onClick={() => downloadRowAsCsv(r)}
                    className="inline-flex items-center px-3 py-1.5 bg-[#22C55E] text-white rounded-full text-xs hover:brightness-95"
                  >
                    Download Invoice
                  </button>
                </div>
              </div>
              {/* Mobile stacked layout */}
              <div className="grid grid-cols-1 gap-1 md:hidden text-sm">
                <div className="flex justify-between">
                  <a className="text-[#22C55E] hover:underline" href="#">{r.orderId}</a>
                  <div className="text-gray-700">{r.date}</div>
                </div>
                <div className="text-gray-700 truncate" title={r.product}>{r.product}</div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-700">{`PKR ${r.amount.toLocaleString()}`}</div>
                  <button
                    onClick={() => downloadRowAsCsv(r)}
                    className="inline-flex items-center px-3 py-1.5 bg-[#22C55E] text-white rounded-full text-xs hover:brightness-95"
                  >
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


