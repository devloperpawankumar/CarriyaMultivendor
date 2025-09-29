import { BalanceOverview, EarningEntry, WithdrawalHistoryItem, WithdrawalRequestPayload } from '../pages/sellerDashboard/managePayments/types';

export async function getBalanceOverview(): Promise<BalanceOverview> {
  // TODO: replace with real API
  return Promise.resolve({
    currentWalletBalance: 50000,
    availableToWithdraw: 45000,
    pendingEarnings: 5000,
  });
}

export async function getEarningsSummary(): Promise<EarningEntry[]> {
  // TODO: replace with real API
  return Promise.resolve([
    { id: '43433', label: 'Order #43433', amount: 10000, date: '2025-03-25' },
    { id: '34322', label: 'Order #34322', amount: 2000, date: '2025-03-23' },
    { id: '88893', label: 'Order #88893', amount: 5000, date: '2025-03-18' },
    { id: '23222', label: 'Order #23222', amount: 1000, date: '2025-03-16' },
  ]);
}

export async function getWithdrawalHistory(): Promise<WithdrawalHistoryItem[]> {
  // TODO: replace with real API
  return Promise.resolve([
    { requestId: '12234', amount: 50000, date: '2025-04-03' },
    { requestId: '44451', amount: 30000, date: '2025-04-02' },
    { requestId: '55516', amount: 45000, date: '2025-03-31' },
    { requestId: '95411', amount: 10000, date: '2025-03-30' },
    { requestId: '43433', amount: 10000, date: '2025-03-25' },
    { requestId: '34322', amount: 2000, date: '2025-03-23' },
    { requestId: '88893', amount: 5000, date: '2025-03-18' },
    { requestId: '23222', amount: 1000, date: '2025-03-16' },
  ]);
}

export async function createWithdrawalRequest(payload: WithdrawalRequestPayload): Promise<{ success: boolean }>
{
  // TODO: replace with real API
  console.log('createWithdrawalRequest', payload);
  return Promise.resolve({ success: true });
}


