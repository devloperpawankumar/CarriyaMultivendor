# Manage Reports (Seller Dashboard)

Modular, backend-friendly reports module. Mirrors the structure used in `manageOrders` and `managePayments` for consistency and scalability.

## Structure

```
manageReports/
  components/
    DemographicsCard.tsx
    FiltersBar.tsx
    RefundReturnTable.tsx
    ReportSummaryCards.tsx
    SalesTrendChart.tsx
    TopLocationsCard.tsx
    TopProductsTable.tsx
  services/
    reportService.ts
  types/
    reportTypes.ts
  mockData.ts
  ManageReports.tsx
  index.tsx
  README.md
```

## Notes
- UI references: Figma "Manage Reports" and "Reports & Analytics" screens.
- Service layer is API-ready and typed; replace mock with real endpoints when available.

## Live data integration (already supported)

- `services/reportService.ts` hits `/api/seller/reports?range=`. The backend implementation lives in [`backend/src/controllers/reportsController.js`](../../../backend/src/controllers/reportsController.js) and already supports ranges `today`, `yesterday`, `7d`, `30d`, `month`.
- To switch from mock data to real analytics, ensure:
  1. Sellers authenticate before visiting `/seller/manage-reports`.
  2. Your frontend build has `REACT_APP_API_BASE_URL` pointing at the deployed backend.
  3. The backend `reportsRouter` is registered (see `backend/src/index.js`; it already mounts `/api/reports`).
- The controller pulls pre-aggregated docs from `SellerDailyStats` / `SellerProductStats`, then falls back to live `Order` queries if stats are missing. Populate those collections via your analytics ETL, or let the fallback crunch data on demand for smaller datasets.

### Testing checklist
1. Call `GET /api/seller/reports?range=30d` via Postman while logged in (cookie auth) to confirm numbers.
2. Seed at least one delivered order with `paymentStatus: paid` so summaries render meaningful PKR values.
3. Check browser devtools → Network for `seller/reports` to verify the JSON matches what the widgets display (trend data, refund table, demographics).
4. When switching time ranges, confirm the request param matches the UI selection (e.g., “Last 7 days” → `range=7d`).

With these hooks in place, the reports page mirrors the exact data in `SellerDailyStats` and can go live without further UI changes.


