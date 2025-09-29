import React from 'react';
import OverviewCard from './OverviewCard';

type BalanceOverviewProps = {
  currentWalletBalance: number;
  availableToWithdraw: number;
  pendingEarnings: number;
};

export default function BalanceOverview({
  currentWalletBalance,
  availableToWithdraw,
  pendingEarnings,
}: BalanceOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 gap-4">
      <OverviewCard title="Current Wallet Balance" value={`PKR ${currentWalletBalance.toLocaleString()}`} progressPercent={100} />
      <OverviewCard
        title="Available to Withdraw"
        value={`PKR ${availableToWithdraw.toLocaleString()}`}
        progressPercent={currentWalletBalance > 0 ? (availableToWithdraw / currentWalletBalance) * 100 : 0}
      />
      <OverviewCard
        title="Pending Earnings"
        value={`PKR ${pendingEarnings.toLocaleString()}`}
        progressPercent={currentWalletBalance > 0 ? (pendingEarnings / currentWalletBalance) * 100 : 0}
      />
    </div>
  );
}


