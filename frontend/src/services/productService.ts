export type CreateProductPayload = {
  title: string;
  price: string;
  stock: string;
  discount?: string;
  categoryPath: string;
  description: string;
  images: File[];
  videos: File[];
  unlimitedStock: boolean;
  sizes: string[];
  colors: { name: string; hex: string }[];
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
  fd.append('unlimitedStock', String(payload.unlimitedStock));
  fd.append('action', payload.action);

  payload.sizes.forEach((s, i) => fd.append(`sizes[${i}]`, s));
  payload.colors.forEach((c, i) => {
    fd.append(`colors[${i}][name]`, c.name);
    fd.append(`colors[${i}][hex]`, c.hex);
  });
  payload.images.forEach((file, i) => fd.append('images', file, file.name || `image_${i}.jpg`));
  payload.videos.forEach((file, i) => fd.append('videos', file, file.name || `video_${i}.mp4`));

  return fd;
}

export async function createProduct(payload: CreateProductPayload): Promise<Response> {
  const formData = buildProductFormData(payload);
  // Replace with your real API endpoint and auth headers as needed
  const res = await fetch('/api/products', {
    method: 'POST',
    body: formData,
  });
  return res;
}

// Typed product listing (backend-friendly)
export type ProductListItem = {
  id: string;
  title: string;
  price: number;
  stock: number;
  status: 'active' | 'out_of_stock';
  thumbnailUrl?: string;
};

export type FetchProductsParams = {
  page?: number; // 1-based
  pageSize?: number;
  status?: 'active' | 'out_of_stock' | 'all';
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

  const res = await fetch(`/api/seller/products?${qs.toString()}`);
  if (!res.ok) {
    return { items: [], total: 0, page, pageSize };
  }
  const data = (await res.json()) as FetchProductsResponse;
  return data;
}

