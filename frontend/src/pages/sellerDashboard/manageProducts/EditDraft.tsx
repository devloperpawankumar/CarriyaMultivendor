import React from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, ProductListItem } from '../../../services/productService';
import { buildProductPublicId } from './utils/productPublicId';


const EditDraft: React.FC = () => {
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

  const EditButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const base = 'inline-flex items-center justify-center rounded-[10px] h-10 w-[119px] text-[18px] font-semibold bg-[#CC9501] text-white';
    return (
      <button onClick={onClick} className={base}>
        Edit
      </button>
    );
  };

  const MobileEditButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const base = 'inline-flex items-center justify-center rounded-[5px] h-[23px] w-[75px] text-[10px] font-semibold bg-[#CC9501] text-white';
    return (
      <button onClick={onClick} className={base}>
        Edit
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

  // Load draft products from backend with professional practices
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
        const res = await fetchProducts({ page, pageSize, status: 'draft' });
        
        if (abortController.signal.aborted || !isMounted) return;

        setItems(withPublicIds(res.items || []));
        setTotal(res.total || 0);
        setError(null);
        setRetryCount(0);
      } catch (err: any) {
        if (abortController.signal.aborted || !isMounted) return;

        const message = err?.response?.data?.message || err?.message || 'Unable to load draft products.';
        
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

  const handleEditProduct = (product: ProductListItem) => {
    const publicId = product.publicId || buildProductPublicId(product.title, product.id);
    navigate(`/seller/manage-products/edit/${encodeURIComponent(publicId)}`);
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
              <h1 className="text-[20px] md:text-[32px] lg:text-[40px] font-bold text-black leading-none">Edit Draft</h1>
              <p className="text-[#949494] text-[12px] md:text-[16px] mt-1">Manage Products &gt; Edit Draft</p>
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
                <div className="text-[10px] font-semibold text-black text-center">Price</div>
                <div className="text-[10px] font-semibold text-black text-center">Edit</div>
              </div>

              {loading && Array.from({ length: pageSize }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="grid grid-cols-[75px_1fr_60px_80px] items-center px-3 py-5 border-b last:border-b-0 border-[#C1C1C1]">
                  {/* Skeleton Image */}
                  <div className="w-[67px] h-[61px] rounded-[10px] border border-[#B8B1B1] bg-gray-100 flex items-center justify-center overflow-hidden">
                    <div className="w-[33px] h-[33px] bg-gray-300 rounded-[6px] animate-pulse"></div>
                  </div>
                  {/* Skeleton Title */}
                  <div className="pr-2 pl-2 break-words min-w-0">
                    <div className="h-3 bg-gray-200 rounded animate-pulse mb-1 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                  {/* Skeleton Price */}
                  <div className="text-center">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>
                  </div>
                  {/* Skeleton Edit Button */}
                  <div className="flex justify-center">
                    <div className="w-[75px] h-[23px] bg-gray-200 rounded-[5px] animate-pulse"></div>
                  </div>
                </div>
              ))}

              {!loading && items.length === 0 && !error && (
                <div className="px-3 py-6 text-center text-[10px] text-[#4C4C4C]">No draft products found.</div>
              )}
              {!loading && items.map((item: ProductListItem) => {
                const hasImage = item.thumbnailUrl && item.thumbnailUrl.trim() !== '';
                return (
                  <div key={item.id} className="grid grid-cols-[75px_1fr_60px_80px] items-center px-3 py-5 border-b last:border-b-0 border-[#C1C1C1]">
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
                    <div className="text-[10px] font-semibold text-black text-center">
                      {formatPrice(item.finalPrice ?? item.currentPrice ?? item.price)}
                    </div>
                    <div className="flex justify-center">
                      <MobileEditButton onClick={() => handleEditProduct(item)} />
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
                  <div ref={stockRef} className="text-[20px] font-semibold text-black pl-6">Stock</div>
                  <div ref={statusRef} className="text-[20px] font-semibold text-black pl-6">Edit Draft</div>
                </div>

                {loading && Array.from({ length: pageSize }).map((_, idx) => (
                  <div key={`skeleton-${idx}`} className="grid grid-cols-[160px_1fr_140px_120px_140px] items-center px-6 py-6 border-b last:border-b-0 border-[#C1C1C1]">
                    {/* Skeleton Image */}
                    <div className="w-[123px] h-[113px] rounded-[10px] border border-[#B8B1B1] bg-gray-100 flex items-center justify-center overflow-hidden">
                      <div className="w-[82px] h-[82px] bg-gray-300 rounded-[10px] animate-pulse"></div>
                    </div>
                    {/* Skeleton Title */}
                    <div className="pr-4 pl-6">
                      <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                    {/* Skeleton Price */}
                    <div className="pl-6">
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                    </div>
                    {/* Skeleton Stock */}
                    <div className="pl-6">
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                    {/* Skeleton Edit Button */}
                    <div className="pl-6">
                      <div className="w-[119px] h-10 bg-gray-200 rounded-[10px] animate-pulse"></div>
                    </div>
                  </div>
                ))}
                {!loading && items.length === 0 && !error && (
                  <div className="px-6 py-10 text-center text-[#4C4C4C] text-[16px]">You don't have any draft products yet.</div>
                )}
                {!loading && items.map((item: ProductListItem) => {
                  const hasImage = item.thumbnailUrl && item.thumbnailUrl.trim() !== '';
                  const finalPrice = item.finalPrice ?? item.currentPrice ?? item.price;
                  const hasDiscount = item.discount > 0 && finalPrice !== item.price;
                  return (
                    <div key={item.id} className="grid grid-cols-[160px_1fr_140px_120px_140px] items-center px-6 py-6 border-b last:border-b-0 border-[#C1C1C1]">
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
                      <div className="text-[18px] md:text-[22px] font-medium text-black pl-6">
                        {item.unlimitedStock ? 'Unlimited' : item.stock}
                      </div>
                      <div className="pl-6">
                        <EditButton onClick={() => handleEditProduct(item)} />
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

export default EditDraft;
