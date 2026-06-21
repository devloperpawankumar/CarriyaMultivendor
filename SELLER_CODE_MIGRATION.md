# Seller Code Migration - Daraz/Amazon Style Public IDs

## Overview

This update implements **public seller codes** (like Daraz/Amazon) to replace raw MongoDB ObjectIds in API responses. Instead of exposing internal database IDs like `6915d31da554c678af5f1464`, your API now returns numeric public codes like `6005013990165`.

## What Changed

### 1. **Database Schema** (`backend/src/models/SellerSettings.js`)
- Added `sellerCode` field (13-digit numeric string, e.g., `"6005013990165"`)
- Auto-generates unique code when seller account is created
- Indexed for fast lookups

### 2. **API Responses** (`backend/src/controllers/productsController.js`)
- `GET /api/products` now returns `sellerCode` instead of `sellerId`
- `GET /api/products/:id` now returns `sellerCode` instead of `sellerId`
- Raw ObjectIds are no longer exposed in public endpoints

### 3. **Frontend Types** (`frontend/src/services/productService.ts`)
- Updated `PublicProductListItem` to include `sellerCode`
- Kept `sellerId` as deprecated for backward compatibility

## Migration Steps

### Step 1: Run the Migration Script

For existing sellers, you need to backfill `sellerCode` values:

```bash
cd backend
node scripts/migrate-seller-codes.js
```

This script will:
- Find all sellers without `sellerCode`
- Generate unique codes for each
- Update the database
- Verify completion

### Step 2: Verify Migration

Check that all sellers have codes:

```javascript
// In MongoDB shell or via your admin tool
db.sellersettings.countDocuments({ sellerCode: { $exists: true } })
// Should match total seller count
```

### Step 3: Test API Responses

```bash
# Should now return sellerCode instead of sellerId
curl http://localhost:4000/api/products | jq '.items[0] | {sellerCode, sellerSlug, sellerName}'
```

Expected response:
```json
{
  "sellerCode": "6005013990165",
  "sellerSlug": "my-store-abc123",
  "sellerName": "My Store"
}
```

## Code Format

- **Format**: 13-digit numeric string
- **Pattern**: `6005` (region prefix) + 9 random digits
- **Example**: `6005013990165`
- **Uniqueness**: Guaranteed by database index + collision detection

## Backward Compatibility

- Frontend types still accept `sellerId` (deprecated) for smooth transition
- Internal database operations still use ObjectId (`sellerId` field)
- Only public API responses changed to use `sellerCode`

## Security Benefits

✅ **No internal IDs exposed**: Attackers can't guess or enumerate seller ObjectIds  
✅ **Professional appearance**: Matches industry standards (Daraz/Amazon)  
✅ **URL-safe**: Numeric codes work well in URLs and API responses  
✅ **Audit-friendly**: Public codes can be shared in logs without exposing internal structure

## Testing Checklist

- [ ] Run migration script for existing sellers
- [ ] Verify new sellers auto-get `sellerCode` on account creation
- [ ] Test `GET /api/products` returns `sellerCode`
- [ ] Test `GET /api/products/:id` returns `sellerCode`
- [ ] Confirm frontend displays seller info correctly
- [ ] Check seller profile pages still work (using `sellerSlug`)

## Notes

- **New sellers**: Automatically get `sellerCode` when `SellerSettings` is created
- **Existing sellers**: Run migration script once to backfill
- **No breaking changes**: Frontend gracefully handles both `sellerCode` and deprecated `sellerId`
- **Internal operations**: Still use ObjectId (`sellerId`) for database queries

---

**Your API responses now match Daraz/Amazon's professional format!** 🎉

