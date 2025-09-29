import React from 'react';
import { SalesSummary } from '../types/reportTypes';
import salesIcon from "../../../../assets/images/Seller/library_add_check.png";
import bestSellingProductIcon from "../../../../assets/images/Seller/hourglass.png";
import refundReturnRateIcon from "../../../../assets/images/Seller/cancel.png";
import conversionRateIcon from "../../../../assets/images/Seller/person.png";

type Props = {
  summary: SalesSummary;
};

const Card: React.FC<{ icon?: React.ReactNode; title: string; value: string }> = ({ icon, title, value }) => (
  <div className="flex items-center gap-[33px] p-[30px] bg-white rounded-[14px] shadow border border-gray-100">
    <div className="w-[70px] h-[70px] rounded-[8px] bg-green-100 flex items-center justify-center">
      {icon}
    </div>
    <div className="flex flex-col gap-1">
      <div className="text-[16px] md:text-[22px] font-semibold text-[#949494]">{title}</div>
      <div className="text-[22px] md:text-[32px] font-bold text-[#2ECC71]">{value}</div>
    </div>
  </div>
);

const ReportSummaryCards: React.FC<Props> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[25px]">
      <Card
        icon={<img src={salesIcon} alt="total sales" className="md:w-[22px] md:h-[22px] w-[18px] h-[18px]" />}
        title={summary.totalSalesLabel}
        value={summary.totalSalesValue}
      />
      <Card
        icon={<img src={bestSellingProductIcon} alt="best selling" className="md:w-[22px] md:h-[22px] w-[18px] h-[18px]" />}
        title="Best Selling Product"
        value={summary.bestSellingProductName}
      />
    
      <Card
        icon={<img src={conversionRateIcon} alt="conversion rate" className="md:w-[22px] md:h-[22px] w-[18px] h-[18px]" />}
        title={summary.conversionRateLabel}
        value={summary.conversionRateValue}
      />

<Card
        icon={<img src={refundReturnRateIcon} alt="refund return rate" className="md:w-[22px] md:h-[22px] w-[18px] h-[18px]" />}
        title={summary.refundReturnRateLabel}
        value={summary.refundReturnRateValue}
      />
    </div>
  );
};

export default ReportSummaryCards;



