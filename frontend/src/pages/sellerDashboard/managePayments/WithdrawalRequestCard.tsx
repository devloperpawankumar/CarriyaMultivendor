import React, { useState } from 'react';
import { WithdrawalRequestPayload } from './types';
import banktransferLogo from '../../../assets/images/Payment/bank.png';
import jazzcashLogo from '../../../assets/images/Payment/jazzcash.png';
import easypaisaLogo from '../../../assets/images/Payment/easypaisa.png';

type Props = {
  onSubmit: (payload: WithdrawalRequestPayload) => void;
};

export default function WithdrawalRequestCard({ onSubmit }: Props) {
  const [method, setMethod] = useState<WithdrawalRequestPayload['method']>('Bank');

  return (
    <div className="bg-white rounded-[15px] border border-[#E0E0E0] shadow-[2px_3px_4px_rgba(46,204,113,0.1)] p-6">
      <h3 className="text-[15px] font-semibold mb-4">Withdrawal Request</h3>
      <div className="space-y-3">
        {([
          { key: 'Bank', label: 'Bank Transfer', icon: banktransferLogo },
          { key: 'JazzCash', label: 'Jazz Cash', icon: jazzcashLogo },
          { key: 'Easypaisa', label: 'Easypaisa Transfer', icon: easypaisaLogo },
        ] as Array<{ key: WithdrawalRequestPayload['method']; label: string; icon: string }>).map((opt) => {
          const isActive = method === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => setMethod(opt.key)}
              className="w-full flex items-center gap-3 rounded-[12px] px-4 py-3 bg-[#2ECC71] text-white hover:brightness-95"
            >
              <span className="h-8 w-8 shrink-0 inline-flex items-center justify-center">
                <img
                  src={opt.icon}
                  alt={opt.label}
                  className={
                    'h-8 w-8 object-contain ' + (opt.key === 'Bank' ? 'brightness-0 invert' : '')
                  }
                />
              </span>
              <span className="font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


