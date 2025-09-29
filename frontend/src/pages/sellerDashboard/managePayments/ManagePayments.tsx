import React, { useEffect, useState } from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import BalanceOverview from './BalanceOverview';
import EarningsSummary from './EarningsSummary';
import WithdrawalHistory from './WithdrawalHistory';
import WithdrawalRequestCard from './WithdrawalRequestCard';
import { EarningEntry, WithdrawalHistoryItem, BalanceOverview as BalanceOverviewType, WithdrawalRequestPayload } from './types';
import * as paymentService from '../../../services/paymentService';
import DownloadInvoiceTable from './DownloadInvoiceTable';

const ManagePayments: React.FC = () => {
  const [balances, setBalances] = useState<BalanceOverviewType | null>(null);
  const [earnings, setEarnings] = useState<EarningEntry[]>([]);
  const [history, setHistory] = useState<WithdrawalHistoryItem[]>([]);

  useEffect(() => {
    paymentService.getBalanceOverview().then(setBalances);
    paymentService.getEarningsSummary().then(setEarnings);
    paymentService.getWithdrawalHistory().then(setHistory);
  }, []);


  function handleWithdrawalRequest(payload: WithdrawalRequestPayload) {
    paymentService.createWithdrawalRequest(payload).then((res) => {
      if (res.success) {
        paymentService.getWithdrawalHistory().then(setHistory);
        paymentService.getBalanceOverview().then(setBalances);
      }
    });
  }

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      <h1 className="md:text-[40px] text-[24px]  font-bold text-black text-left w-full">Manage Payments</h1>

      <div className="w-full flex flex-col gap-6">
        <div>
          <h2 className="md:text-[35px] text-[16px] font-medium text-black">Wallet / Balance Overview</h2>
          <div className="mt-3">
            <BalanceOverview
              currentWalletBalance={balances?.currentWalletBalance || 0}
              availableToWithdraw={balances?.availableToWithdraw || 0}
              pendingEarnings={balances?.pendingEarnings || 0}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div>
            <EarningsSummary items={earnings} />
          </div>
          <div className="space-y-6">
            <WithdrawalRequestCard onSubmit={handleWithdrawalRequest} />
            <WithdrawalHistory items={history} />
          </div>
        </div>

        <div>
          <DownloadInvoiceTable
            rows={[
              { orderId: '#C98765K', date: '15-Sep', product: 'Samsung Galaxy A54', amount: 78000 },
              { orderId: '#C98764K', date: '14-Sep', product: 'Apple AirPods Pro 2', amount: 55000 },
              { orderId: '#C98763K', date: '13-Sep', product: 'HP Pavilion Laptop', amount: 120000 },
              { orderId: '#C98762K', date: '12-Sep', product: 'Sony WH-1000XM5', amount: 95000 },
              { orderId: '#C98761K', date: '11-Sep', product: 'Logitech MX Master 3S', amount: 22000 },
              { orderId: '#C98760K', date: '10-Sep', product: 'Canon EOS M50 Camera', amount: 150000 },
            ]}
          />
        </div>
      </div>
    </SellerScaffold>
  );
};

export default ManagePayments;




