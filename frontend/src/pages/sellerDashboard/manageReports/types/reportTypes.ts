export type DateRange = 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days' | 'This Month' | 'Custom';

export interface SalesSummary {
  totalSalesLabel: string;
  totalSalesValue: string;
  bestSellingProductName: string;
  refundReturnRateLabel: string;
  refundReturnRateValue: string;
  conversionRateLabel: string;
  conversionRateValue: string;
}

export interface TrendPoint {
  label: string; // e.g., Jan, Feb, ...
  value: number;
}

export interface SalesTrend {
  title: string;
  yAxisTicks: number[];
  xAxisLabels: string[];
  primarySeries: TrendPoint[];
  secondarySeries?: TrendPoint[];
}

export interface TopProductRow {
  rank: number;
  name: string;
  popularityPercent: number; // 0-100
  sales: number; // count
}

export interface RefundReturnRow {
  rank: number;
  product: string;
  refundCount: number;
  orderCount: number;
  returnRatePercent: number; // 0-100
}

export interface GenderSplit {
  malePercent: number;
  femalePercent: number;
}

export interface AgeBandShare {
  band: string; // e.g., 18-24
  male: number; // 0-100
  female: number; // 0-100
}

export interface LocationShare {
  city: string;
  primaryBar: number; // 0-100
  secondaryBar: number; // 0-100
}

export interface Demographics {
  title: string;
  genderSplit: GenderSplit;
  ageBands: AgeBandShare[];
  topLocationsTitle: string;
  locations: LocationShare[];
}

export interface ReportsResponse {
  summary: SalesSummary;
  trend: SalesTrend;
  topProducts: TopProductRow[];
  refundReturn: RefundReturnRow[];
  demographics: Demographics;
}



