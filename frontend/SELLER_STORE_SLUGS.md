# Seller Store Slugs - How they work and how to use them

This document explains how the seller store slug (e.g. `/seller/pawan-store`) is generated, routed, and used across the backend and frontend, plus industry best practices.

## What is a slug?
- A slug is a human-readable, SEO-friendly identifier shown in the URL.
- Example: `http://localhost:3000/seller/pawan-store`
- Slugs help with discoverability and are commonly used by professional marketplaces (Etsy, Amazon brand pages, Shopify stores).

## Where the slug comes from
- Model: `backend/src/models/SellerSettings.js`
- Field: `storeSlug` (unique, lowercase)
- Generation: When a seller profile is saved, a slug is auto-generated from `storeName`. If the name changes, the slug is regenerated (ensuring uniqueness by adding a short suffix only when needed).
- Fallbacks: If no `storeName` exists, a safe default is created using the seller ID suffix.

## Backend: Public endpoints that use slugs
1) Seller profile (public)
   - Route: `GET /api/sellers/:identifier/profile`
   - Identifier can be either a `storeSlug` or a seller ObjectId (legacy).
   - Returns safe public fields:
     - `sellerId`, `storeSlug`, `storeName`, `storeDescription`, `storeLogo`, `storeBanner`, `isActive`, `sellerName`
   - File: `backend/src/controllers/sellerSettingsController.js` → `getPublicSellerProfile`
   - Notes: Adds `Cache-Control: public, max-age=60, s-maxage=300`

2) Product catalog filtered by seller
   - Route: `GET /api/products?sellerSlug=:slug&sort=popular&page=1&pageSize=12`
   - Also accepts `sellerId` for backward compatibility
   - File: `backend/src/controllers/productsController.js` → `listProducts`
   - Notes:
     - Verifies `sellerSlug` → resolves to sellerId before querying
     - Only returns published, active products
     - Adds `sellerSlug` and `sellerName` per item
     - Adds simple cache headers and rate limiting

3) Product detail payload
   - Route: `GET /api/products/:productIdOrSlug`
   - Response includes: `sellerId`, `sellerSlug`, `storeName`
   - File: `backend/src/controllers/productsController.js` → `getProduct`
   - Notes: Adds short cache headers

## Backend: Performance, security, rate limiting
- Caching: Public endpoints set `Cache-Control` headers for short-term caching and CDN friendliness.
- Rate limiting: Lightweight in `backend/src/middleware/rateLimit.js` and applied in `backend/src/routes/products.js` to:
  - `/api/products` (catalog)
  - `/api/products/:id` (detail)
  - `/api/sellers/:identifier/profile` (seller profile)
- Data safety: Public endpoints return only safe, explicitly whitelisted fields.

## Frontend: Routing and data flow
1) Route
   - Path: `/seller/:sellerSlug`
   - File: `frontend/src/App.tsx`
   - Page: `frontend/src/pages/SellerStore.tsx`

2) Data fetching on Seller Store page
   - Profile: `getPublicSellerProfile(sellerSlug)` from `frontend/src/services/sellerSettingsService.ts`
   - Products: `fetchPublicProducts({ sellerSlug, page, pageSize, sort })` from `frontend/src/services/productService.ts`
   - Sort options: `popular | newest | price_asc | price_desc`
   - Pagination: `page`, `pageSize`, and `totalPages` are handled and reflected in the UI
   - Skeletons: Page shows skeletons for banner, logo, text, and product cards while fetching for a fast, polished feel

3) Navigation to the Seller Store
   - Product Detail page buttons now use `sellerSlug` when present, falling back to `sellerId`
   - Files:
     - `frontend/src/pages/ProductDetail.tsx` (mobile button)
     - `frontend/src/components/product/InfoPanel.tsx` (desktop button)

## Example: How it looks end-to-end
1) A buyer opens a product page:
   - `GET /api/products/<productId>` returns `sellerSlug: "pawan-store"`
2) Buyer clicks “See Seller Store”:
   - Browser navigates to `http://localhost:3000/seller/pawan-store`
3) Seller Store page loads:
   - `GET /api/sellers/pawan-store/profile`
   - `GET /api/products?sellerSlug=pawan-store&page=1&pageSize=12&sort=popular`
4) UI shows:
   - Banner, logo, store name, description (from profile)
   - Paginated product grid with sort control (from catalog)

## How professionals handle it (we align with this)
- Public-facing slugs for store identity and SEO
- Server-side safety: return only public fields; never trust URL for authorization
- Short-term caching and rate limits for speed + abuse protection
- Product-first homepage; dedicated seller pages for aggregation
- Pagination and sorting for scalable catalogs

## Customization and tips
- Set a custom store name in Seller Settings to influence the slug (it’s auto-generated from `storeName`).
- If you need explicit manual slug control (lock/unlock), we can add a protected update endpoint and UI in Seller Settings.
- To further harden performance:
  - Introduce ETag/If-None-Match or `Last-Modified` headers
  - Add CDN in front of the backend
  - Implement server-side pagination cursors for very large catalogs

## Files touched by slug feature
- Backend:
  - `src/models/SellerSettings.js` (storeSlug generation and indexes)
  - `src/controllers/sellerSettingsController.js` (public profile)
  - `src/controllers/productsController.js` (sellerSlug in list/detail)
  - `src/routes/products.js` (public routes + rate limiting)
  - `src/middleware/rateLimit.js`
- Frontend:
  - `src/App.tsx` (route `/seller/:sellerSlug`)
  - `src/pages/SellerStore.tsx` (slug-based fetch, pagination, sort, skeletons)
  - `src/components/product/InfoPanel.tsx` (navigate using sellerSlug)
  - `src/pages/ProductDetail.tsx` (navigate using sellerSlug)
  - `src/services/productService.ts` (sellerSlug param and fields)
  - `src/services/sellerSettingsService.ts` (public profile by slug)


