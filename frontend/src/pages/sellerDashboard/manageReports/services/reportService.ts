import api from '../../../../services/api';
import { ReportsResponse } from '../types/reportTypes';

// Backend-friendly service facade with real API integration only (no mock fallback)
export async function fetchReports(dateRange?: string): Promise<ReportsResponse> {
  const rangeMap: Record<string, string> = {
    Today: 'today',
    Yesterday: 'yesterday',
    'Last 7 Days': '7d',
    'Last 30 Days': '30d',
    'This Month': 'month',
  };

  const backendRange = rangeMap[dateRange || 'Last 30 Days'] || '30d';
  const response = await api.get<ReportsResponse>(`/api/seller/reports?range=${backendRange}`);

  if (response && typeof response === 'object') {
    return response;
  }

  throw new Error('Invalid reports response format');
}

