# Homepage Product Sections

This document explains how the homepage sections pull real seller products, how they are curated, and how to customize them.

## Data source
- Public products API: `GET /api/products`
  - Implemented in `backend/src/controllers/productsController.js` (`listProducts`)
  - Returns only published, active products, sorted via `sort` query param
  - Response item includes: `id`, `sellerId`, `title`, `price`, `currentPrice`, `discount`, `thumbnailUrl`, `slug`, `salesCount`, `rating`

Frontend client:
- `frontend/src/services/productService.ts`
  - Function: `fetchPublicProducts({ page, pageSize, category, search, sort })`
  - Types: `PublicProductListItem`, `FetchPublicProductsResponse`

## Sections overview

1) Flash Sale (Deals)
- File: `frontend/src/components/FlashSale.tsx`
- Fetches: `sort: 'popular'`, `pageSize: 24` (client-side shortlist)
- Prefers discounted products (`discount > 0`). If not enough, falls back to popular items.
- Per-seller cap: max 2 items per seller
- Displays up to 12 items

2) New Arrivals
- File: `frontend/src/components/ExploreInterests.tsx` (renamed visually to “New Arrivals”)
- Fetches: `sort: 'newest'`, `pageSize: 24` (client-side shortlist)
- Per-seller cap: max 2 items per seller
- Displays up to 12 items

3) Popular
- File: `frontend/src/components/PopularProducts.tsx`
- Fetches: `sort: 'popular'`, `pageSize: 24` (client-side shortlist)
- Per-seller cap: max 2 items per seller
- Displays up to 12 items

4) More Products (main grid)
- File: `frontend/src/pages/Home.tsx`
- Fetches: `sort: 'popular'`, `pageSize: 16`
- No per-seller cap (acts as a broader feed)

All sections render items using the shared `ProductCard`:
- File: `frontend/src/components/ProductCard.tsx`
- Props: `id`, `name`, `price`, `originalPrice?`, `discount?`, `rating`, `reviews`, `image`

## Why a per-seller cap?
- To avoid any single seller dominating a curated section.
- Implemented in each section by grouping on `sellerId` and limiting to 2 items per seller.
- Note: The cap is enforced client-side using the `sellerId` returned by the API.

## Customization

Change number of items shown:
- In each section component, adjust the final slice length (e.g., from 12 to 8).
- Also adjust the initial `pageSize` if you need a bigger shortlist.

Change sort:
- Allowed sorts: `'newest' | 'price_asc' | 'price_desc' | 'popular'`
- Update the `sort` parameter in each section’s `fetchPublicProducts` call.

Require higher discounts for Flash Sale:
- In `FlashSale.tsx`, change the filter condition:
  ```ts
  const discounted = data.items.filter((p) => p.discount >= 20); // e.g., min 20% off
  ```

Add category-specific rows (e.g., Electronics, Fashion):
- Duplicate one of the section components and pass `category`:
  ```ts
  fetchPublicProducts({ page: 1, pageSize: 24, sort: 'popular', category: 'electronics' })
  ```
- Render with its own heading and optional per-seller cap.

Adjust or remove the per-seller cap:
- In each section component, edit the loop that builds `capped`.
- To remove the cap, simply render `data.items.slice(0, N)` directly.

Increase overall variety:
- Use different `sort` for each section (e.g., Flash Sale: `popular`, New Arrivals: `newest`, Popular: `popular`, More: `newest`).
- Add rotation (e.g., randomize subset) on the client or server.

## Backend notes
- `listProducts` adds `sellerId` to each item and supports:
  - Filtering: published + active
  - Sorting: newest, price_asc, price_desc, popular (by `salesCount` and `views`)
- To add a “deals” sort (e.g., highest discount first), extend the switch in `listProducts`:
  ```js
  case 'discount_desc':
    sortOption = { discount: -1, createdAt: -1 };
    break;
  ```
  Then call `fetchPublicProducts({ sort: 'discount_desc' })` in `FlashSale.tsx`.

## Files touched by these sections
- Frontend:
  - `src/components/FlashSale.tsx`
  - `src/components/ExploreInterests.tsx`
  - `src/components/PopularProducts.tsx`
  - `src/pages/Home.tsx`
  - `src/components/ProductCard.tsx`
  - `src/services/productService.ts`
- Backend:
  - `backend/src/controllers/productsController.js` (public list endpoint: `listProducts`)

## Troubleshooting
- No products appear:
  - Ensure backend is running and frontend’s API base URL is correct.
  - Ensure sellers have published products (`isPublished=true`, `status='active'`).
  - Check browser console/network for API errors.


