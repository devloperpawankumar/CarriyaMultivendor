import api from './api';

export type SubmitReviewPayload = {
  productRating: number; // Required: 1-5
  productReview?: string; // Optional text review
  sellerRating?: number; // Optional: 1-5
  sellerReview?: string; // Optional text review
};

export type ReviewResponse = {
  success: boolean;
  review: {
    id: string;
    orderId: string;
    productId: string;
    sellerId: string;
    productRating: number;
    productReview?: string;
    sellerRating?: number;
    sellerReview?: string;
    buyer: {
      name: string;
    };
    createdAt: string;
  };
};

export type ProductReview = {
  // Note: Review ID removed from public API (Daraz/Amazon style - reviews don't have public IDs)
  // Product ID replaced with slug (public identifier)
  productSlug: string;
  productRating: number;
  productReview?: string;
  buyer: {
    name: string;
    // Note: buyer.id removed from public API (privacy - buyer IDs should never be exposed)
  };
  orderItem: {
    title: string;
    color?: string;
    size?: string;
    quantity: number;
  };
  helpfulCount: number;
  createdAt: string;
};

export type SellerReview = {
  // Note: Review ID removed from public API (Daraz/Amazon style - reviews don't have public IDs)
  // Product ID replaced with slug (public identifier)
  productSlug?: string;
  product?: {
    title: string;
    thumbnailUrl?: string;
    slug?: string;
  };
  sellerRating: number;
  sellerReview?: string;
  buyer: {
    name: string;
    // Note: buyer.id removed from public API (privacy - buyer IDs should never be exposed)
  };
  helpfulCount: number;
  createdAt: string;
};

export type ReviewsResponse<T> = {
  success: boolean;
  reviews: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CheckReviewResponse = {
  success: boolean;
  hasReview: boolean;
  canReview: boolean;
  review: {
    id: string;
    productRating: number;
    sellerRating?: number;
    createdAt: string;
  } | null;
};

/**
 * Submit a review for an order (product and/or seller)
 */
export function submitReview(orderId: string, payload: SubmitReviewPayload) {
  return api.post<ReviewResponse>(`/api/orders/${orderId}/review`, payload);
}

/**
 * Check if an order has been reviewed
 */
export function checkOrderReview(orderId: string) {
  return api.get<CheckReviewResponse>(`/api/orders/${orderId}/review`);
}

/**
 * Get reviews for a product
 */
export function getProductReviews(
  productId: string,
  params: {
    page?: number;
    limit?: number;
    rating?: number;
  } = {}
) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.rating) search.set('rating', String(params.rating));
  const suffix = search.toString() ? `?${search.toString()}` : '';
  return api.get<ReviewsResponse<ProductReview>>(`/api/products/${productId}/reviews${suffix}`);
}

/**
 * Get reviews for a seller
 */
export function getSellerReviews(
  sellerId: string,
  params: {
    page?: number;
    limit?: number;
    rating?: number;
  } = {}
) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.rating) search.set('rating', String(params.rating));
  const suffix = search.toString() ? `?${search.toString()}` : '';
  return api.get<ReviewsResponse<SellerReview>>(`/api/sellers/${sellerId}/reviews${suffix}`);
}

