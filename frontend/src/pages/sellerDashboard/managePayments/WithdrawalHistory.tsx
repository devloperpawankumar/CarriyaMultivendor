import React from 'react';
import { WithdrawalHistoryItem } from './types';

type WithdrawalHistoryProps = {
  items: WithdrawalHistoryItem[];
};

export default function WithdrawalHistory({ items }: WithdrawalHistoryProps) {
  return (
    <div className="bg-white rounded-[15px] border border-[#E0E0E0] shadow-[2px_3px_4px_rgba(46,204,113,0.1)] p-4 space-y-4">
      <h3 className="text-[15px] font-semibold mb-4">Withdrawal History</h3>
      <div className="grid grid-cols-3 text-[12px] text-[#595959] mb-2">
        <div>Request ID</div>
        <div>Amount</div>
        <div>Date</div>
      </div>
      <div className="space-y-8 text-[12px]">
        {items.map((row) => (
          <div key={row.requestId} className="grid grid-cols-3">
            <div className="text-[#949494]">{row.requestId}</div>
            <div className="text-[#949494]">{row.amount.toLocaleString()}</div>
            <div className="text-[#949494]">{new Date(row.date).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


