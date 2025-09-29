import { ReportsResponse } from './types/reportTypes';

export const mockReports: ReportsResponse = {
  summary: {
    totalSalesLabel: 'Total Sales',
    totalSalesValue: 'PKR 300K',
    bestSellingProductName: 'T-Shirt',
    refundReturnRateLabel: 'Refund/Return Rate',
    refundReturnRateValue: '12%',
    conversionRateLabel: 'Conversion Rate',
    conversionRateValue: '15%',
  },
  trend: {
    title: 'Sales Report',
    yAxisTicks: [0, 1000, 3000, 5000, 70000],
    xAxisLabels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'],
    primarySeries: [
      { label: 'Jan', value: 1000 },
      { label: 'Feb', value: 1500 },
      { label: 'Mar', value: 2200 },
      { label: 'Apr', value: 2800 },
      { label: 'May', value: 3200 },
      { label: 'Jun', value: 4200 },
      { label: 'Jul', value: 4800 },
      { label: 'Aug', value: 5200 },
      { label: 'Sep', value: 7000 },
    ],
  },
  topProducts: [
    { rank: 1, name: 'Head Phones', popularityPercent: 45, sales: 1321 },
    { rank: 2, name: 'Hoodies', popularityPercent: 29, sales: 321 },
    { rank: 3, name: 'T-Shirt', popularityPercent: 18, sales: 121 },
    { rank: 4, name: 'Coffee Mug', popularityPercent: 25, sales: 91 },
  ],
  refundReturn: [
    { rank: 1, product: 'Head Phones', refundCount: 1321, orderCount: 4500, returnRatePercent: 29 },
    { rank: 2, product: 'Hoodies', refundCount: 321, orderCount: 1100, returnRatePercent: 29 },
    { rank: 3, product: 'T-Shirt', refundCount: 121, orderCount: 700, returnRatePercent: 29 },
    { rank: 4, product: 'Coffee Mug', refundCount: 91, orderCount: 365, returnRatePercent: 29 },
  ],
  demographics: {
    title: 'Customer Demographics',
    genderSplit: { malePercent: 55, femalePercent: 45 },
    ageBands: [
      { band: '10-14', male: 30, female: 25 },
      { band: '14-18', male: 35, female: 28 },
      { band: '18-24', male: 40, female: 32 },
      { band: '24-34', male: 50, female: 42 },
      { band: '34-48', male: 45, female: 38 },
      { band: '48-54', male: 30, female: 22 },
    ],
    topLocationsTitle: 'Top Locations',
    locations: [
      { city: 'Lahore', primaryBar: 100, secondaryBar: 90 },
      { city: 'Karachi', primaryBar: 100, secondaryBar: 72 },
      { city: 'Islamabad', primaryBar: 100, secondaryBar: 60 },
      { city: 'Multan', primaryBar: 100, secondaryBar: 24 },
    ],
  },
};



