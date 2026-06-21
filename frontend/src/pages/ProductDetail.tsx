import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryMenu from '../components/CategoryMenu';
import menuIcon from '../assets/images/MENU.png';
import productImage from '../assets/images/Product/prodcut1.png';
import InfoPanel from '../components/product/InfoPanel';
import Gallery from '../components/product/Gallery';
import DescriptionBlock from '../components/product/DescriptionBlock';
import ReviewsBlock from '../components/product/ReviewsBlock';
import { useNavigate } from 'react-router-dom';
import Stars from '../components/product/Stars';
import saleIcon from '../assets/images/Icon (Stroke).png';
import cartIcon from '../assets/images/Cart.png';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { useToast } from '../contexts/ToastContext';
import { commonToasts } from '../utils/toast';
import { getProduct, ProductDetail as ApiProductDetail } from '../services/productService';
import { getProductReviews, ProductReview } from '../services/reviewService';

// (Replaced dummy data with real API fetch)


const ProductDetail: React.FC = () => {
  const { productSlug = '' } = useParams<{ productSlug: string }>();
  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [totalReviewsCount, setTotalReviewsCount] = useState<number>(0);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { items: favoriteItems, toggle: toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const isFavorite = useMemo(() => favoriteItems.some(i => i.id === product?.id), [favoriteItems, product?.id]);
  const [showCategories, setShowCategories] = useState(false);
  const browseButtonRef = useRef<HTMLButtonElement | null>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement | null>(null);
  const [cartDetails, setCartDetails] = useState<{ quantity: number; color?: string; size?: string } | null>(null);
  const [mobileQuantity, setMobileQuantity] = useState(1);
  const [mobileSelectedColor, setMobileSelectedColor] = useState<string | undefined>(undefined);
  const [mobileSelectedSize, setMobileSelectedSize] = useState<string | undefined>(undefined);
  const [mobileColorOpen, setMobileColorOpen] = useState(false);
  const [mobileSizeOpen, setMobileSizeOpen] = useState(false);
  const sellerStoreName = product?.storeName || product?.sellerName || 'Seller Store';

  // Ensure page starts at top when navigating to a product
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch {
      // noop
    }
  }, [productSlug]);

  useEffect(() => {
    let mounted = true;

    if (!productSlug) {
      setProduct(null);
      setError('Product not found');
      setLoading(false);
      setReviewsLoading(false);
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    setReviewsLoading(true);
    setError(null);
    setReviewsError(null);
    
    // Load product and reviews in parallel for better performance
    (async () => {
      try {
        // Start both requests in parallel
        const productPromise = getProduct(productSlug);
        
        // We need product ID first to fetch reviews, so we'll do it in two steps:
        // 1. Get product
        // 2. Once we have product ID, fetch reviews immediately
        const productData = await productPromise;
        
        if (!mounted) return;
        
        // Set product data immediately
        setProduct(productData);
        setMobileSelectedColor(productData.colors?.[0]?.name || undefined);
        setMobileSelectedSize(productData.sizes?.[0] || undefined);
        // Use id (which is the slug) for URL redirect if needed
        if (productData.id && productData.id !== productSlug) {
          window.history.replaceState(null, '', `/product/${productData.id}`);
        }
        
        // Now fetch reviews immediately after product is loaded (still in same effect)
        // This ensures they load together and appear together
        if (productData.id) {
          try {
            const reviewsResponse = await getProductReviews(productData.id, { page: 1, limit: 10 });
            if (mounted) {
              setReviews(reviewsResponse.reviews || []);
              setTotalReviewsCount(reviewsResponse.pagination?.total || 0);
            }
          } catch (reviewsErr: any) {
            if (mounted) {
              // Don't show error if it's just that there are no reviews (404 or empty)
              const status = reviewsErr?.response?.status;
              if (status === 404) {
                // Product not found or no reviews - treat as empty, not error
                setReviewsError(null);
                setReviews([]);
                setTotalReviewsCount(0);
              } else {
                setReviewsError('Failed to load reviews. Please try again later.');
                console.error('Failed to load reviews:', reviewsErr);
              }
            }
          } finally {
            if (mounted) {
              setReviewsLoading(false);
            }
          }
        } else {
          if (mounted) {
            setReviewsLoading(false);
          }
        }
      } catch {
          if (mounted) {
          setError('Failed to load product');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    
    return () => { 
      mounted = false; 
    };
  }, [productSlug]);

  // Use product's reviewCount and rating (source of truth from database)
  // This is updated automatically when reviews are submitted (backend updates product.rating and product.reviewCount)
  // Similar to how Amazon/Daraz work - they show total count from product, not just fetched reviews
  // We use product.reviewCount as the source of truth to match ProductCard display
  const reviewStats = useMemo(() => {
    // Always use product's reviewCount (source of truth, matches ProductCard)
    // This ensures consistency across all product displays
    const count = product?.reviewCount || 0;
    return {
      count,
      rating: product?.rating || 0,
    };
  }, [product?.reviewCount, product?.rating]);

  useClickOutside(() => setShowCategories(false), {
    enabled: showCategories,
    include: [browseButtonRef, categoriesDropdownRef],
    escapeCloses: true,
    eventType: 'mousedown',
  });

  return (
    <div className="min-h-screen bg-white">
      <Header variant="simple" />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Browse Categories: Desktop text link; Mobile hamburger only */}
        
        {loading && (
          <div className="py-12 text-center text-[#424551]">Loading product...</div>
        )}
        {error && !loading && (
          <div className="py-12 text-center text-red-600">{error}</div>
        )}
        {!loading && !error && product && (
        <>
        <div className="relative mb-4 flex items-center">
          {/* Desktop: keep current styling */}
          <button
            ref={browseButtonRef}
            onClick={() => setShowCategories((v) => !v)}
            className="hidden md:inline-flex items-center space-x-2 text-[#2ECC71] font-bold text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Browse Categories</span>
          </button>

     

          {showCategories && (
            <div className="absolute z-50 top-full  mt-2" ref={categoriesDropdownRef}>
              <CategoryMenu />
            </div>
            
          )}
        </div>

        

        {/* Page heading: category, title, divider (desktop only) */}
        <div className="mb-6 hidden md:block">
          <div className="text-[35px] font-medium leading-[1.17] mb-1">
            <span className="text-black  cursor-pointer">{product.categoryPath || 'Product'}</span>
          </div>
          <h1
            className="text-[46px] font-bold text-[#2ECC71] leading-[1.3] mb-4 cursor-default"
          >
            {product.title}
          </h1>
          <div className="w-full h-px bg-[#E5E8ED]"></div>
        </div>

        {/* Two-column: left gallery, right details (desktop only for right panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Gallery images={(product.images && product.images.length ? product.images : [productImage])} />
          <div className="hidden md:block">
            <InfoPanel
            price={product.currentPrice ?? product.price}
            compareAt={product.originalPrice ?? product.price}
            currency={'PKR'}
            sales={product.salesCount ?? 0}
            rating={reviewStats.rating}
            reviews={reviewStats.count}
            colors={(product.colors || []).map(c => c.name)}
            colorsWithHex={product.colors || []}
            sizes={product.sizes}
            productId={product.id}
            productTitle={product.title}
            productImage={(product.images && product.images[0]) || productImage}
            sellerId={product.sellerId}
            sellerSlug={product.sellerSlug}
            onAddToCart={async (d) => { 
              try {
                await addItem({
                  productId: product.id,
                  sellerId: product.sellerId,
                  title: product.title,
                  image: (product.images && product.images[0]) || productImage,
                  price: product.currentPrice ?? product.price,
                  compareAt: product.originalPrice ?? product.price,
                  color: d.color,
                  size: d.size,
                  qty: d.quantity,
                  shopName: sellerStoreName
                });
                setCartDetails(d); 
                showToast(commonToasts.addedToCart()); 
              } catch (error: any) {
                // Extract backend error message
                const backendMessage = error?.response?.data?.error || 
                                      error?.response?.data?.message || 
                                      error?.message || 
                                      'Failed to add item to cart. Please try again.';
                const lowerMessage = backendMessage.toLowerCase();
                
                // Stock-related issues should be warnings (informational), not errors (Amazon/Daraz style)
                if (lowerMessage.includes('insufficient stock') || 
                    lowerMessage.includes('stock') || 
                    lowerMessage.includes('available')) {
                  showToast({ 
                    type: 'warning', 
                    title: 'Stock Limit', 
                    message: backendMessage 
                  });
                } else if (lowerMessage.includes('not available') || 
                           lowerMessage.includes('unavailable')) {
                  showToast({ 
                    type: 'warning', 
                    title: 'Product Unavailable', 
                    message: backendMessage 
                  });
                } else {
                  // Real errors (network issues, server errors, etc.)
                  showToast({ 
                    type: 'error', 
                    title: 'Error', 
                    message: backendMessage 
                  });
                }
              }
            }}
            />
          </div>
        </div>

        {/* Mobile-only layout  */}
        <div className="md:hidden mt-4">
          {/* First top border */}
          <div className="border-t border-[#E5E8ED] mb-4" />

          {/* Row: category (left) and color swatches (right) */}
       <div className="flex items-center justify-between mb-2">
  <div className="text-[16px] font-medium text-black">
    {(product as any).category}
  </div>

            <div className="flex items-center gap-5">
      {/* Label */}

    {/* Color buttons */}
    {(product.colors || []).slice(0, 3).map((c) => {
      const colorName = c.name || 'Unknown';
      const colorHex = c.hex || '#eee';
      return (
        <button
          key={colorName}
          onClick={() => setMobileSelectedColor(colorName)}
          aria-label={colorName}
          className={`w-5 h-5 rounded-full border ${
            (mobileSelectedColor ?? product.colors?.[0]?.name) === colorName
              ? 'border-[#2ECC71]'
              : 'border-[#D7DADD]'
          }`}
          style={{ backgroundColor: colorHex }}
          title={colorName}
        />
      );
    })}

    {/* Selected color text */}
    <span className="ml-2 text-sm text-gray-700">
      {mobileSelectedColor ?? product.colors?.[0]?.name}
    </span>
  </div>
</div>


          {/* Title */}
          <div className="flex items-center justify-start gap-24 mb-3">
            <h1
              className="text-[24px] font-bold text-[#2ECC71] leading-[1.3] cursor-default"
            >
              {product.title}
            </h1>
            <button
              type="button"
              aria-label="Toggle favorite"
              onClick={() => toggleFavorite({ id: product.id, title: product.title, image: (product.images && product.images[0]) || productImage })}
              className={`h-10 w-7 flex items-center justify-center`}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill={isFavorite ? '#2ECC71' : 'none'}
                xmlns="http://www.w3.org/2000/svg"
                stroke="#2ECC71"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {/* Row: sales + stars on left, price on right (no compareAt) */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <img src={saleIcon} alt="sales" className="w-4 h-4" />
                <span className="text-[12px] text-[#949494]">{(product.salesCount ?? 0).toLocaleString()} Sales</span>
              </div>
              <div className="flex items-center gap-1">
                <Stars rating={reviewStats.rating} size="sm" />
                <span className="text-[12px] text-[#949494]">({reviewStats.count})</span>
              </div>
            </div>
            <div className="text-[20px] font-bold text-black">PKR {product.currentPrice ?? product.price}</div>
          </div>

          {/* Description */}
          <div className="mt-3 text-[14px] text-[#424551]">
            {product.description}
          </div>

          {/* Border above Size */}
          <div className="border-t-4 border-[#737373] pt-0 mt-10">
            <button
              type="button"
              onClick={() => setMobileSizeOpen(v => !v)}
              className="w-full flex items-center justify-between py-3 px-4 focus:outline-none"
            >
              <span className="text-[20px] font-bold text-black">Size</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {mobileSizeOpen && (
              <div className="px-4 pb-2">
                {(product.sizes || []).map((s: string) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setMobileSelectedSize(s); /* Do not close dropdown */ }}
                    className={`w-full text-left py-2 text-[16px] ${((mobileSelectedSize ?? product.sizes?.[0]) === s) ? 'font-bold text-[#2ECC71]' : 'text-[#424551]'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Border above Color */}
          <div className="border-t-4 border-[#737373] pt-0 ">
            <button
              type="button"
              onClick={() => setMobileColorOpen(v => !v)}
              className="w-full flex items-center justify-between py-3 px-4 focus:outline-none"
            >
              <span className="text-[20px] font-bold text-black">Color</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {mobileColorOpen && (
              <div className="px-4 pb-2">
                {(product.colors || []).map((c) => {
                  const colorName = c.name || 'Unknown';
                  return (
                    <button
                      key={colorName}
                      type="button"
                      onClick={() => { setMobileSelectedColor(colorName); /* Do not close dropdown */ }}
                      className={`w-full text-left py-2 text-[16px] flex items-center gap-2 ${((mobileSelectedColor ?? product.colors?.[0]?.name) === colorName) ? 'font-bold text-[#2ECC71]' : 'text-[#424551]'}`}
                    >
                      <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: c.hex || '#eee' }} />
                      <span>{colorName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t-4 border-[#737373]  "></div>

          {/* Qty + actions (row then secondary below) */}
          <div className="mt-10 flex flex-col gap-2 ">
            <div className="flex items-center justify-between gap-6">
              {/* Qty control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileQuantity((q) => Math.max(0, q - 1))}
                  className="w-9 h-9 flex items-center justify-center border border-[#BDBDBD] rounded-[4px] text-[18px] text-[#222] bg-white"
                  style={{ minWidth: '36px', minHeight: '36px' }}
                >
                  –
                </button>
                <span className="w-8 text-center text-[18px] font-medium text-[#222]">{mobileQuantity}</span>
                <button
                  onClick={() => setMobileQuantity((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center border border-[#BDBDBD] rounded-[4px] text-[18px] text-[#222] bg-white"
                  style={{ minWidth: '36px', minHeight: '36px' }}
                >
                  +
                </button>
              </div>

              <div className="flex justify-end">
              <button 
                className=" flext-0.5 h-11 bg-[#2ECC71]  text-white rounded-[10px] font-medium flex items-center justify-end gap-2 px-4" 
                onClick={async () => {
                  try {
                    await addItem({
                      productId: product.id,
                      sellerId: product.sellerId,
                      title: product.title,
                      image: (product.images && product.images[0]) || productImage,
                      price: product.currentPrice ?? product.price,
                      compareAt: product.originalPrice,
                      color: mobileSelectedColor,
                      size: mobileSelectedSize,
                      qty: mobileQuantity,
                      shopName: sellerStoreName
                    });
                    showToast(commonToasts.addedToCart());
                  } catch (error: any) {
                    // Extract backend error message
                    const backendMessage = error?.response?.data?.error || 
                                          error?.response?.data?.message || 
                                          error?.message || 
                                          'Failed to add item to cart. Please try again.';
                    showToast({ type: 'error', title: 'Error', message: backendMessage });
                  }
                }}
              >
                <span>Add to cart</span>
                <img src={cartIcon} alt="" className="w-5 h-5 object-contain" />
              </button>
              </div>
              {/* Primary action on right */}
            
            </div>
           {/* Secondary action below */}
<div className="flex justify-end">
  <button
    className="px-4 w-1/2 h-11 bg-[#2ECC71] text-white rounded-[10px] font-medium mt-1"
    onClick={() => {
      const target = product.sellerSlug
        ? `/seller/${product.sellerSlug}`
        : product.sellerId
        ? `/seller/${product.sellerId}`
        : null;
      if (target) navigate(target);
    }}
  >
    Go to Seller store
  </button>
</div>


            {/* Mobile Reviews placed after actions   */}
            <div className="mt-6">
              <ReviewsBlock 
                items={reviews.map((r) => ({
                  user: r.buyer.name || 'Anonymous',
                  rating: r.productRating,
                  text: r.productReview || 'No review text provided.',
                }))}
                loading={reviewsLoading}
                error={reviewsError}
                showTitle={false}
              />
            </div>
          </div>
        </div>

        {/* Divider line  */}
        <div className="w-full h-px bg-[#E5E8ED] my-8 hidden md:block"></div>

          {/* Below: left description, right reviews (desktop only) */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DescriptionBlock text={product.description} />
          <ReviewsBlock 
            items={reviews.map((r) => ({
              user: r.buyer.name || 'Anonymous',
              rating: r.productRating,
              text: r.productReview || 'No review text provided.',
            }))}
            loading={reviewsLoading}
            error={reviewsError}
          />
        </div>

        </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
