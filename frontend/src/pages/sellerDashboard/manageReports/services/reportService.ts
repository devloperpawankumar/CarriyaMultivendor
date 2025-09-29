import { ReportsResponse } from '../types/reportTypes';
import { mockReports } from '../mockData';

// Backend-friendly service facade. Replace internals with real API calls.

export async function fetchReports(dateRange?: string): Promise<ReportsResponse> {
  // Example: const res = await fetch(`/api/seller/reports?range=${dateRange ?? '30d'}`);
  // return res.json();
  return Promise.resolve(mockReports);
}



