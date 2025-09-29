export type BalanceOverview = {
  currentWalletBalance: number;
  availableToWithdraw: number;
  pendingEarnings: number;
};

export type EarningEntry = {
  id: string;
  label: string;
  amount: number;
  date: string; // ISO date
};

export type WithdrawalHistoryItem = {
  requestId: string;
  amount: number;
  date: string; // ISO date
};

export type WithdrawalRequestPayload = {
  amount: number;
  method: 'Bank' | 'JazzCash' | 'Easypaisa' | 'COD';
  note?: string;
};


