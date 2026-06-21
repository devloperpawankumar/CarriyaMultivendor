import React from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, ProductListItem } from '../../../services/productService';
import { buildProductPublicId } from './utils/productPublicId';

const LowStock: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const titleRef = React.useRef<HTMLDivElement | null>(null);
  const priceRef = React.useRef<HTMLDivElement | null>(null);
  const stockRef = React.useRef<HTMLDivElement | null>(null);
  const statusRef = React.useRef<HTMLDivElement | null>(null);
  const [dividerXs, setDividerXs] = React.useState<number[]>([]);

  const RestockButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const base = 'inline-flex items-center justify-center rounded-[10px] h-10 w-[119px] text-[18px] font-semibold bg-[#CC9501] text-white';
    return (
      <button onClick={onClick} className={base}>
        Restock
      </button>
    );
  };

  const MobileRestockButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const base = 'inline-flex items-center justify-center rounded-[5px] h-[23px] w-[75px] text-[10px] font-semibold bg-[#CC9501] text-white';
    return (
      <button onClick={onClick} className={base}>
        Restock
      </button>
    );
  };


  const recalcDividers = React.useCallback(() => {
    if (isMobile) return;
    const container = containerRef.current;
    if (!container) return;
    const crect = container.getBoundingClientRect();
    const cells = [titleRef.current, priceRef.current, stockRef.current, statusRef.current];
    const rawXs: number[] = [];
    cells.forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      rawXs.push(r.left - crect.left);
    });
    const withinBounds = rawXs
      .filter((x) => x > 1 && x < crect.width - 1)
      .sort((a, b) => a - b);
    const deduped: number[] = [];
    for (const x of withinBounds) {
      if (deduped.length === 0 || Math.abs(x - deduped[deduped.length - 1]) > 2) {
        deduped.push(Math.round(x));
      }
    }
    setDividerXs((prev) => (JSON.stringify(prev) === JSON.stringify(deduped) ? prev : deduped));
  }, [isMobile]);

  React.useLayoutEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      recalcDividers();
      const raf2 = requestAnimationFrame(recalcDividers);
      // @ts-ignore
      if (document.fonts && typeof document.fonts.ready?.then === 'function') {
        // @ts-ignore
        document.fonts.ready.then(() => recalcDividers());
      }
      const container = containerRef.current;
      let ro: ResizeObserver | null = null;
      if (container && 'ResizeObserver' in window) {
        ro = new ResizeObserver(() => recalcDividers());
        ro.observe(container);
      }
      const onResize = () => recalcDividers();
      window.addEventListener('resize', onResize);
      window.addEventListener('load', onResize);
      return () => {
        cancelAnimationFrame(raf2);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('load', onResize);
        if (ro) ro.disconnect();
      };
    });
    return () => cancelAnimationFrame(raf1);
  }, [recalcDividers]);

  // Backend-friendly pagination state
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(4);
  const [total, setTotal] = React.useState(0);
  const [items, setItems] = React.useState<ProductListItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const withPublicIds = React.useCallback(
    (list: ProductListItem[]) =>
      (list || []).map((item) => ({
        ...item,
        publicId: item.publicId || buildProductPublicId(item.title, item.id),
      })),
    []
  );

  // Load low stock products from backend with professional practices
  React.useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout | null = null;

    const loadProducts = async (attempt = 0) => {
      if (!isMounted || abortController.signal.aborted) return;

      setLoading(true);
      setError(null);
      
      // Clear items only on initial load (not retries) to show skeleton
      if (attempt === 0) {
        setItems([]);
      }

      try {
        const res = await fetchProducts({ page, pageSize, status: 'low_stock' });
        
        if (abortController.signal.aborted || !isMounted) return;

        setItems(withPublicIds(res.items || []));
        setTotal(res.total || 0);
        setError(null);
        setRetryCount(0);
      } catch (err: any) {
        if (abortController.signal.aborted || !isMounted) return;

        const message = err?.response?.data?.message || err?.message || 'Unable to load low stock products.';
        
        // Retry logic: up to 2 retries with exponential backoff
        if (attempt < 2 && !abortController.signal.aborted) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 4000);
          retryTimeout = setTimeout(() => {
            if (isMounted && !abortController.signal.aborted) {
              loadProducts(attempt + 1);
            }
          }, delay);
          setRetryCount(attempt + 1);
        } else {
          setError(message);
          setItems([]);
          setTotal(0);
        }
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
      abortController.abort();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [page, pageSize, refreshKey, withPublicIds]);

  // On page change, scroll to very top to show full page
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const totalPages = React.useMemo(() => Math.max(1, Math.ceil((total || 0) / pageSize)), [total, pageSize]);
  const pageNumbers = React.useMemo(() => {
    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) {
      pages.add(i);
    }
    return Array.from(pages).sort((a, b) => a - b);
  }, [page, totalPages]);

  const formatPrice = React.useCallback((value: number) => {
    return Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(value || 0);
  }, []);

  // Helper function to determine stock status (Amazon/Daraz style)
  const getStockStatus = React.useCallback((item: ProductListItem) => {
    if (item.unlimitedStock) {
      return { 
        type: 'unlimited', 
        label: 'Unlimited', 
        color: 'text-[#2ECC71]',
        priority: 3 // Lowest priority
      };
    }
    if (item.stock === 0) {
      return { 
        type: 'out_of_stock', 
        label: 'Out of Stock', 
        color: 'text-red-600', 
        bgColor: 'bg-red-50', 
        borderColor: 'border-red-300',
        textColor: 'text-red-700',
        priority: 1 // Highest priority - show first
      };
    }
    // Default lowStockThreshold is 10, but we can check if stock is low
    // Since we're already in low_stock view, all items here are low stock
    const isLowStock = item.stock > 0 && item.stock <= 10; // Default threshold
    if (isLowStock) {
      return { 
        type: 'low_stock', 
        label: `Only ${item.stock} left`, // Amazon/Daraz style: "Only X left"
        color: 'text-orange-600', 
        bgColor: 'bg-orange-50', 
        borderColor: 'border-orange-300',
        textColor: 'text-orange-700',
        priority: 2 // Medium priority
      };
    }
    return { 
      type: 'in_stock', 
      label: `${item.stock} in stock`, 
      color: 'text-black',
      priority: 3
    };
  }, []);

  // Sort items: Out of Stock first, then Low Stock (Amazon/Daraz style)
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const statusA = getStockStatus(a);
      const statusB = getStockStatus(b);
      return statusA.priority - statusB.priority;
    });
  }, [items, getStockStatus]);

  // Calculate stock statistics (Amazon/Daraz style summary)
  const stockStats = React.useMemo(() => {
    const outOfStock = items.filter(item => !item.unlimitedStock && item.stock === 0).length;
    const lowStock = items.filter(item => !item.unlimitedStock && item.stock > 0 && item.stock <= 10).length;
    return { outOfStock, lowStock, total: items.length };
  }, [items]);

  const handleRestockProduct = (product: ProductListItem) => {
    const publicId = product.publicId || buildProductPublicId(product.title, product.id);
    navigate(`/seller/manage-products/restock/${encodeURIComponent(publicId)}`);
  };

  const handleAddProduct = () => {
    navigate('/seller/manage-products/add-product');
  };

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      <div className="w-full px-3 md:px-6 lg:px-8">
        {/* Header Section - Mobile aligns button right of title */}
        <div className="flex flex-col mb-4 md:mb-8 gap-3">
          <div className="flex flex-row items-center justify-between md:flex-row md:items-start gap-3">
            <div className="flex-1 py-3 mb-4">
              <h1 className="text-[20px] md:text-[32px] lg:text-[40px] font-bold text-black leading-none">Low Stock</h1>
              <p className="text-[#949494] text-[12px] md:text-[16px] mt-1">Manage Products &gt; Low Stock</p>
            </div>
            {/* Add Product Button - Positioned like in the reference image */}
              <div className="flex justify-end md:block mt-[-30px] pt-[-10px] md:mt-0 md:pt-0">
                <button
                  onClick={handleAddProduct}
                  className="shadow-[2px_4px_4px_0_rgba(118,255,176,0.17)] border border-[#B8B1B1]/30 rounded-[5px] bg-[#2ECC71] md:text-white  text-white/80  font-medium w-[80px] h-[25px] text-[11px] md:rounded-[10px] md:bg-green-500 md:font-bold md:w-[180px] md:h-[45px] md:text-[22px] lg:w-[220px] lg:h-[56px] lg:text-[28px]"
                >
                   <span className='hidden md:inline'>+</span>   Add Product
                </button>
              </div>
          </div>
        </div>

        {/* Stock Summary Cards (Amazon/Daraz style) */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border-2 border-red-300 rounded-[10px] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] md:text-[14px] text-gray-600 font-medium">Out of Stock</p>
                  <p className="text-[24px] md:text-[32px] font-bold text-red-600 mt-1">{stockStats.outOfStock}</p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-[20px] md:text-[24px]">⚠️</span>
                </div>
              </div>
            </div>
            <div className="bg-white border-2 border-orange-300 rounded-[10px] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] md:text-[14px] text-gray-600 font-medium">Low Stock</p>
                  <p className="text-[24px] md:text-[32px] font-bold text-orange-600 mt-1">{stockStats.lowStock}</p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-[20px] md:text-[24px]">📦</span>
                </div>
              </div>
            </div>
            <div className="bg-white border-2 border-[#2ECC71] rounded-[10px] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] md:text-[14px] text-gray-600 font-medium">Total Products</p>
                  <p className="text-[24px] md:text-[32px] font-bold text-[#2ECC71] mt-1">{stockStats.total}</p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-[#2ECC71] text-[20px] md:text-[24px]">📊</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={containerRef} className="bg-white rounded-[10px] md:rounded-[15px] py-1 border border-[#C1C1C1] overflow-hidden">
          {error && !loading && (
            <div className="px-6 py-4 flex items-center justify-between bg-red-50 border-b border-red-200">
              <span className="text-red-600 text-sm md:text-base">{error}</span>
              <button
                onClick={() => {
                  setError(null);
                  setRetryCount(0);
                  setRefreshKey((k) => k + 1);
                }}
                className="ml-4 px-3 py-1 text-xs md:text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          {retryCount > 0 && loading && (
            <div className="px-6 py-2 text-xs md:text-sm text-[#4C4C4C] bg-yellow-50 border-b border-yellow-200">
              Retrying... (Attempt {retryCount + 1}/3)
            </div>
          )}
          {isMobile ? (
            // Mobile Table View
            <>
              {/* Mobile Table Header */}
              <div className="grid grid-cols-[75px_1fr_60px_80px] items-center px-3 h-[35px] py-2 border-b border-[#C1C1C1]">
                <div className="text-[10px] font-semibold text-black">Product Image</div>
                <div className="text-[10px] font-semibold text-black pl-2">Product Title</div>
                <div className="text-[10px] font-semibold text-black text-center">Stock</div>
                <div className="text-[10px] font-semibold text-black text-center">Status</div>
              </div>

              {loading && Array.from({ length: pageSize }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="grid grid-cols-[75px_1fr_60px_80px] items-center px-3 py-3 border-b last:border-b-0 border-[#C1C1C1]">
                  <div className="w-[67px] h-[61px] rounded-[10px] border border-[#B8B1B1] bg-[rgba(46,204,113,0.28)] flex items-center justify-center overflow-hidden">
                    <div className="w-[33px] h-[33px] bg-gray-200 rounded-[6px] animate-pulse"></div>
                  </div>
                  <div className="text-[10px] font-medium text-black pr-2 pl-2 break-words min-w-0">
                    <div className="line-clamp-2 leading-tight">Loading product title...</div>
                  </div>
                  <div className="text-[10px] font-medium text-black text-center">-</div>
                  <div className="flex justify-center">
                    <div className="w-[75px] h-[23px] bg-gray-200 rounded-[5px] animate-pulse"></div>
                  </div>
                </div>
              ))}

              {!loading && items.length === 0 && !error && (
                <div className="px-3 py-6 text-center text-[10px] text-[#4C4C4C]">No low stock products found.</div>
              )}
              {!loading && sortedItems.map((item: ProductListItem) => {
                const hasImage = item.thumbnailUrl && item.thumbnailUrl.trim() !== '';
                const stockStatus = getStockStatus(item);
                const isOutOfStock = stockStatus.type === 'out_of_stock';
                const isLowStock = stockStatus.type === 'low_stock';
                return (
                  <div 
                    key={item.id} 
                    className={`grid grid-cols-[75px_1fr_60px_80px] items-center px-3 py-5 border-b last:border-b-0 ${
                      isOutOfStock ? 'border-red-200 bg-red-50/30' : isLowStock ? 'border-orange-200 bg-orange-50/20' : 'border-[#C1C1C1]'
                    }`}
                  >
                    <div className="w-[67px] h-[61px] rounded-[10px] border border-[#B8B1B1] bg-[rgba(46,204,113,0.28)] flex items-center justify-center overflow-hidden">
                      {hasImage ? (
                        <img src={item.thumbnailUrl} alt="product" className="w-[33px] h-[33px] object-cover rounded-[6px]" />
                      ) : (
                        <div className="w-[33px] h-[33px] rounded-[6px] bg-gray-200 flex items-center justify-center">
                          <span className="text-[8px] text-gray-400 text-center leading-tight">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] font-medium text-black pr-2 pl-2 break-words whitespace-normal min-w-0">
                      <div className="leading-tight" title={item.title}>
                        {item.title}
                      </div>
                    </div>
                    <div className="text-[10px] font-medium text-center flex flex-col items-center gap-1 px-1">
                      <span className={`font-bold ${stockStatus.color}`}>
                        {item.unlimitedStock ? 'Unlimited' : item.stock}
                      </span>
                      {(isOutOfStock || isLowStock) && (
                        <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${stockStatus.bgColor || ''} ${stockStatus.borderColor || ''} border ${stockStatus.textColor || stockStatus.color} whitespace-nowrap`}>
                          {stockStatus.label}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <MobileRestockButton onClick={() => handleRestockProduct(item)} />
                    </div>
                  </div>
                );
              })}

              {/* Mobile Pagination */}
              <div className="flex flex-col items-center gap-1 px-3 py-2">
                <div className="text-[10px] text-black text-center">
                  {`Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total || page * pageSize)} of ${total || 0} Products`}
                </div>
                <div className="flex items-center gap-2 text-[#4C4C4C] text-[10px]">
                  <button
                    aria-label="Previous"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="text-[#2ECC71] text-[15px] disabled:opacity-40"
                  >
                    {'<'}
                  </button>
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`relative w-[14px] h-[14px] inline-flex items-center justify-center ${n === page ? 'text-[#4C4C4C] font-medium' : 'text-[#4C4C4C]'}`}
                    >
                      {n === page && <span className="absolute -z-[1] w-[10px] h-[9px] bg-[#2ECC71] rounded-[1px]" />}
                      <span className="leading-none">{n}</span>
                    </button>
                  ))}
                  <button
                    aria-label="Next"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="text-[#2ECC71] text-[15px] disabled:opacity-40"
                  >
                    {'>'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Desktop Table View (Unchanged)
            <>
              <div className="relative">
                <div className="grid grid-cols-[160px_1fr_140px_120px_140px] items-center px-6 h-20 border-b border-[#C1C1C1]">
                  <div className="text-[20px] font-semibold text-black">Product Image</div>
                  <div ref={titleRef} className="text-[20px] font-semibold text-black pl-6">Product Title</div>
                  <div ref={priceRef} className="text-[20px] font-semibold text-black pl-6">Price (PKR)</div>
                  <div ref={stockRef} className="text-[20px] font-semibold text-black pl-6 pr-4">Stock</div>
                  <div ref={statusRef} className="text-[20px] font-semibold text-black pl-6">Status</div>
                </div>

                {loading && Array.from({ length: pageSize }).map((_, idx) => (
                  <div key={`skeleton-${idx}`} className="grid grid-cols-[160px_1fr_140px_120px_140px] items-center px-6 py-6 border-b last:border-b-0 border-[#C1C1C1]">
                    <div className="w-[123px] h-[113px] rounded-[10px] border border-[#B8B1B1] bg-[rgba(46,204,113,0.28)] flex items-center justify-center overflow-hidden">
                      <div className="w-[82px] h-[82px] bg-gray-300 rounded-[10px] animate-pulse"></div>
                    </div>
                    <div className="text-[18px] md:text-[20px] font-medium text-black pr-4 pl-6">Loading…</div>
                    <div className="text-[18px] md:text-[22px] font-medium text-black pl-6">-</div>
                    <div className="text-[18px] md:text-[22px] font-medium text-black pl-6">-</div>
                    <div className="pl-6">
                      <div className="w-[119px] h-10 bg-gray-200 rounded-[10px] animate-pulse"></div>
                    </div>
                  </div>
                ))}
                {!loading && items.length === 0 && !error && (
                  <div className="px-6 py-10 text-center text-[#4C4C4C] text-[16px]">You don't have any low stock products yet.</div>
                )}
                {!loading && sortedItems.map((item: ProductListItem) => {
                  const hasImage = item.thumbnailUrl && item.thumbnailUrl.trim() !== '';
                  const finalPrice = item.finalPrice ?? item.currentPrice ?? item.price;
                  const hasDiscount = item.discount > 0 && finalPrice !== item.price;
                  const stockStatus = getStockStatus(item);
                  const isOutOfStock = stockStatus.type === 'out_of_stock';
                  const isLowStock = stockStatus.type === 'low_stock';
                  return (
                    <div 
                      key={item.id} 
                      className={`grid grid-cols-[160px_1fr_140px_120px_140px] items-center px-6 py-6 border-b last:border-b-0 ${
                        isOutOfStock ? 'border-red-200 bg-red-50/30' : isLowStock ? 'border-orange-200 bg-orange-50/20' : 'border-[#C1C1C1]'
                      }`}
                    >
                      <div className="w-[123px] h-[113px] rounded-[10px] border border-[#B8B1B1] bg-[rgba(46,204,113,0.28)] flex items-center justify-center overflow-hidden">
                        {hasImage ? (
                          <img src={item.thumbnailUrl} alt="product" className="w-[82px] h-[82px] object-cover rounded-[10px]" />
                        ) : (
                          <div className="w-[82px] h-[82px] rounded-[10px] bg-gray-200 flex items-center justify-center">
                            <span className="text-[12px] text-gray-400 text-center leading-tight">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="text-[18px] md:text-[20px] font-medium text-black pr-4 pl-6" title={item.title}>{item.title}</div>
                      <div className="pl-6">
                        <div className="flex flex-col">
                          <span className="text-[18px] md:text-[22px] font-medium text-black">{formatPrice(finalPrice)}</span>
                          {hasDiscount && (
                            <span className="text-[14px] md:text-[16px] text-[#949494] line-through">{formatPrice(item.price)}</span>
                          )}
                        </div>
                      </div>
                      <div className="pl-6 pr-4 flex flex-col gap-2">
                        <span className={`text-[18px] md:text-[22px] font-bold ${stockStatus.color}`}>
                          {item.unlimitedStock ? 'Unlimited' : item.stock}
                        </span>
                        {(isOutOfStock || isLowStock) && (
                          <span className={`text-[13px] md:text-[15px] font-bold px-3 py-1.5 rounded-md ${stockStatus.bgColor || ''} ${stockStatus.borderColor || ''} border-2 ${stockStatus.textColor || stockStatus.color} inline-block w-fit`}>
                            {stockStatus.label}
                          </span>
                        )}
                      </div>
                      <div className="pl-6">
                        <RestockButton onClick={() => handleRestockProduct(item)} />
                      </div>
                    </div>
                  );
                })}

                {/* Continuous vertical dividers overlay only for header+rows */}
                <div className="pointer-events-none absolute inset-0">
                  {dividerXs.map((x, i) => (
                    <div key={i} className="absolute top-0 bottom-0" style={{ left: x + 0.5, width: 1, background: '#C1C1C1' }} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Desktop Pagination - Only show on desktop */}
          {!isMobile && (
            <div className="relative px-6 py-4">
              <div className="text-[16px] md:text-[18px] text-black">{`Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total || page * pageSize)} of ${total || 0} Products`}</div>
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center gap-4 text-[#4C4C4C] text-[16px] md:text-[18px]">
                <button aria-label="Previous" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="text-[#2ECC71] text-[22px] disabled:opacity-40">{'<'}</button>
                {pageNumbers.map((n) => (
                  <button key={n} onClick={() => setPage(n)} className={n === page ? 'text-[#2ECC71] font-semibold' : 'text-[#4C4C4C]'}>
                    {n}
                  </button>
                ))}
                <button aria-label="Next" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="text-[#2ECC71] text-[22px] disabled:opacity-40">{'>'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SellerScaffold>
  );
};

export default LowStock;
