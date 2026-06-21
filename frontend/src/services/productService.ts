import api from './api';

export type CreateProductPayload = {
  title: string;
  price: string;
  stock: string;
  discount?: string;
  categoryPath: string;
  description: string;
  keywords?: string[];
  images: File[];
  videos: File[];
  unlimitedStock: boolean;
  sizes: string[];
  colors: { name: string; hex: string }[];
  imageUrls?: string[]; // pre-uploaded Cloudinary URLs
  videoUrls?: string[];
  action: 'publish' | 'draft';
};

export function buildProductFormData(payload: CreateProductPayload): FormData {
  const fd = new FormData();
  fd.append('title', payload.title);
  fd.append('price', payload.price);
  fd.append('stock', payload.stock);
  if (payload.discount) fd.append('discount', payload.discount);
  fd.append('categoryPath', payload.categoryPath);
  fd.append('description', payload.description);
  if (payload.keywords && payload.keywords.length) {
    fd.append('keywords', payload.keywords.join(','));
  }
  fd.append('unlimitedStock', String(payload.unlimitedStock));
  fd.append('action', payload.action);

  const sizes = Array.isArray(payload.sizes) ? payload.sizes.filter(Boolean) : [];
  // Always send sizes (even if empty) so backend knows to update/clear them
  sizes.forEach((s, i) => fd.append(`sizes[${i}]`, s));
  // Always send sizesJson (even if empty array) for fallback parsing
  fd.append('sizesJson', JSON.stringify(sizes));

  const colors = Array.isArray(payload.colors)
    ? payload.colors.filter((c) => c && typeof c.hex === 'string' && c.hex.trim())
    : [];
  
  // Always send colors (even if empty) so backend knows to update/clear them
  colors.forEach((c, i) => {
    fd.append(`colors[${i}][name]`, c.name ?? c.hex ?? '');
    fd.append(`colors[${i}][hex]`, c.hex);
  });
  // Always send colorsJson (even if empty array) for fallback parsing
  fd.append('colorsJson', JSON.stringify(colors));
  // Always send pre-uploaded URLs if they exist (for editing - to preserve existing images)
  payload.imageUrls?.forEach((url, i) => fd.append(`imageUrls[${i}]`, url));
  payload.videoUrls?.forEach((url, i) => fd.append(`videoUrls[${i}]`, url));
  
  // Always send new file uploads if they exist (will be combined with URLs on backend)
  payload.images.forEach((file, i) => fd.append('images', file, file.name || `image_${i}.jpg`));
  payload.videos.forEach((file, i) => fd.append('videos', file, file.name || `video_${i}.mp4`));

  return fd;
}

export async function createProduct(payload: CreateProductPayload): Promise<Response> {
  const formData = buildProductFormData(payload);
  // Using central API client keeps base URL consistent across environments
  return api.post('/api/products', formData);
}

// Immediate media upload to Cloudinary via backend
export async function uploadMedia(file: File): Promise<{ url: string; publicId?: string }> {
  const fd = new FormData();
  fd.append('file', file, file.name);
  return api.post('/api/uploads', fd);
}

// Public product catalog (buyer-facing) - Daraz/Amazon style
export type PublicProductListItem = {
  id: string; // Product slug (public identifier)
  sellerCode?: string; // Public seller code (Daraz/Amazon style) - replaces sellerId in API responses
  sellerId?: string; // Deprecated: kept for backward compatibility, use sellerCode instead
  sellerSlug?: string;
  sellerName?: string;
  title: string;
  price: number; // Original price
  currentPrice: number; // Price after discount (Daraz/Amazon style)
  discount: number;
  // Stock status (Daraz/Amazon style - shows status instead of exact count)
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unlimited';
  thumbnailUrl?: string;
  rating: number;
  reviewCount?: number;
  isAvailable: boolean;
  // Note: Removed internal fields (Daraz/Amazon don't expose these publicly):
  // - finalPrice (redundant with currentPrice)
  // - unlimitedStock (internal flag)
  // - slug (redundant with id)
  // - salesCount (internal metric - they show badges, not exact counts)
};

export type FetchPublicProductsParams = {
  page?: number; // 1-based
  pageSize?: number;
  category?: string;
  search?: string;
  sellerId?: string;
  sellerSlug?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
};

export type FetchPublicProductsResponse = {
  items: PublicProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function fetchPublicProducts(params: FetchPublicProductsParams = {}): Promise<FetchPublicProductsResponse> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('pageSize', String(pageSize));
  if (params.category) qs.set('category', params.category);
  if (params.search) qs.set('search', params.search);
  if (params.sellerId) qs.set('sellerId', params.sellerId);
  if (params.sellerSlug) qs.set('sellerSlug', params.sellerSlug);
  if (params.sort) qs.set('sort', params.sort);

  try {
    const data = await api.get<FetchPublicProductsResponse>(`/api/products?${qs.toString()}`);
    return data;
  } catch (err) {
    console.error('Failed to fetch public products:', err);
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  }
}

// Typed product listing (backend-friendly)
export type ProductListItem = {
  id: string;
  title: string;
  price: number;
  currentPrice: number;
  finalPrice?: number;
  stock: number;
  discount: number;
  status: 'active' | 'out_of_stock' | 'draft' | 'archived';
  thumbnailUrl?: string;
  unlimitedStock?: boolean;
  publicId?: string;
};

export type FetchProductsParams = {
  page?: number; // 1-based
  pageSize?: number;
  status?: 'active' | 'out_of_stock' | 'draft' | 'archived' | 'all' | 'low_stock';
};

export type FetchProductsResponse = {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export async function fetchProducts(params: FetchProductsParams = {}): Promise<FetchProductsResponse> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const status = params.status ?? 'all';
  const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize), status });

  try {
    const data = await api.get<FetchProductsResponse>(`/api/seller/products?${qs.toString()}`);
    return data;
  } catch (err: any) {
    console.error('Failed to fetch products:', err);
    return { items: [], total: 0, page, pageSize };
  }
}

// Get single product by ID (for editing)
// Note: Internal fields (unlimitedStock, slug, status, isPublished, views, salesCount, keywords)
// are only returned for seller/admin routes, not public buyer endpoints
export type ProductDetail = {
  id: string; // Product slug (public identifier)
  sellerCode?: string; // Public seller code (Daraz/Amazon style)
  sellerId?: string; // Deprecated: kept for backward compatibility
  sellerName?: string;
  sellerSlug?: string;
  storeName?: string;
  title: string;
  description: string;
  categoryPath: string;
  price: number; // Original price
  originalPrice?: number;
  currentPrice?: number; // Price after discount (Daraz/Amazon style)
  discount: number;
  // Stock status (Daraz/Amazon style - shows status instead of exact count for public)
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unlimited';
  // Stock count (only returned for seller/admin routes, not public buyer endpoints)
  stock?: number;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  videos: string[];
  thumbnailUrl?: string;
  isAvailable?: boolean;
  rating?: number;
  reviewCount?: number;
  salesCount?: number; // Sales count (public - users can see how popular a product is)
  createdAt?: string;
  updatedAt?: string;
  // Internal fields (only for seller/admin routes):
  unlimitedStock?: boolean;
  slug?: string;
  status?: 'active' | 'out_of_stock' | 'draft' | 'archived';
  isPublished?: boolean;
  views?: number;
  keywords?: string[];
  // Note: Removed finalPrice (redundant with currentPrice)
};

export async function getProduct(productId: string, isSeller = false): Promise<ProductDetail> {
  try {
    // Use seller-specific route if editing (requires auth and allows drafts)
    const endpoint = isSeller ? `/api/seller/products/${productId}` : `/api/products/${productId}`;
    const data = await api.get<ProductDetail>(endpoint);
    return data;
  } catch (err: any) {
    console.error('Failed to fetch product:', err);
    throw err;
  }
}

// Update product
export type UpdateProductPayload = CreateProductPayload & {
  productId: string;
};

export async function updateProduct(payload: UpdateProductPayload): Promise<Response> {
  const formData = buildProductFormData(payload);
  return api.put(`/api/products/${payload.productId}`, formData);
}

// Restock product - simplified function to update stock only
export type RestockProductPayload = {
  productId: string;
  stock: number; // New total stock quantity (not amount to add)
};

export async function restockProduct(payload: RestockProductPayload): Promise<Response> {
  const formData = new FormData();
  formData.append('stock', String(payload.stock));
  return api.put(`/api/products/${payload.productId}`, formData);
}

// Delete product
export async function deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
  return api.delete(`/api/products/${productId}`);
}

