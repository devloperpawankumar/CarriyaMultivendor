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


