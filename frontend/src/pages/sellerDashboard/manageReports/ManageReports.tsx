import React, { useEffect, useState } from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import ReportSummaryCards from './components/ReportSummaryCards';
import SalesTrendChart from './components/SalesTrendChart';
import SalesReportCard from './components/SalesReportCard';
import TopProductsTable from './components/TopProductsTable';
import RefundReturnTable from './components/RefundReturnTable';
import DemographicsCard from './components/DemographicsCard';
import FiltersBar from './components/FiltersBar';
import { ReportsResponse } from './types/reportTypes';
import { fetchReports } from './services/reportService';

const ManageReports: React.FC = () => {
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [range, setRange] = useState<string>('Today');

  useEffect(() => {
    (async () => {
      const res = await fetchReports(range);
      setData(res);
    })();
  }, [range]);

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      <div className="w-full ">
        <div className="mb-8 md:py-0 py-3">
          <h1 className="text-[28px] font-bold text-black mb-2 md:text-[40px] ">Manage Reports</h1>
          <p className="text-[16px] md:text-[30px] text-gray-600">Reports & Analytics</p>
          {/* <FiltersBar selected={range} onChange={setRange} /> */}
        </div>

        {data && (
          <>
            <div className="mb-8">
              <ReportSummaryCards summary={data.summary} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-3">
                <SalesReportCard trend={data.trend} />
              </div>
            </div>


            <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="flex flex-col gap-6 xl:col-span-2">
                <TopProductsTable rows={data.topProducts} />
                <RefundReturnTable rows={data.refundReturn} />
              </div>
              <div className="xl:col-span-1">
                <DemographicsCard data={data.demographics} />
              </div>
            </div>
          </>
        )}
      </div>
    </SellerScaffold>
  );
};

export default ManageReports;



