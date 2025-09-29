import React from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import { useNavigate } from 'react-router-dom';
import prod1 from '../../../assets/images/Product/prodcut1.png';
import prod2 from '../../../assets/images/Product/product2.png';
import banner from '../../../assets/images/pexels-pixabay-356056.jpg';
import { fetchProducts, ProductListItem } from '../../../services/productService';

// Extended type for low stock products
export type LowStockProductListItem = {
  id: string;
  title: string;
  price: number;
  stock: number;
  status: 'active' | 'out_of_stock';
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
  description?: string;
};

// API function for fetching low stock products
export async function fetchLowStockProducts(params: { page?: number; pageSize?: number } = {}): Promise<{
  items: LowStockProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const qs = new URLSearchParams({ 
    page: String(page), 
    pageSize: String(pageSize), 
    status: 'low_stock' 
  });

  try {
    const res = await fetch(`/api/seller/products/low-stock?${qs.toString()}`);
    if (!res.ok) {
      throw new Error('Failed to fetch low stock products');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    // Return mock data for development
    return {
      items: [
        {
          id: '1',
          title: 'Nokia 4G Mobile Phone - 64 GB',
          price: 45000,
          stock: 3,
          status: 'active',
          thumbnailUrl: prod1,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T14:45:00Z',
          category: 'Electronics',
          description: 'High-quality Nokia mobile phone with 4G connectivity'
        },
        {
          id: '2',
          title: 'Men\'s Casual Cotton Slim Fit Shirt – Blue Long Sleeve',
          price: 1200,
          stock: 1,
          status: 'active',
          thumbnailUrl: banner,
          createdAt: '2024-01-16T09:15:00Z',
          updatedAt: '2024-01-21T11:20:00Z',
          category: 'Clothing',
          description: 'Comfortable cotton shirt perfect for casual wear'
        },
        {
          id: '3',
          title: 'Wireless Bluetooth Earphones with Mic – Deep Bass, Long Battery',
          price: 2500,
          stock: 2,
          status: 'active',
          thumbnailUrl: prod2,
          createdAt: '2024-01-17T16:45:00Z',
          updatedAt: '2024-01-22T08:30:00Z',
          category: 'Electronics',
          description: 'Premium wireless earphones with excellent sound quality'
        },
        {
          id: '4',
          title: 'Apple MacBook Air M2 13"',
          price: 199999,
          stock: 1,
          status: 'active',
          thumbnailUrl: prod1,
          createdAt: '2024-01-18T13:20:00Z',
          updatedAt: '2024-01-23T15:10:00Z',
          category: 'Electronics',
          description: 'Latest Apple MacBook Air with M2 chip'
        },
        {
          id: '5',
          title: 'Samsung Galaxy A34 5G – 128 GB',
          price: 79999,
          stock: 2,
          status: 'active',
          thumbnailUrl: banner,
          createdAt: '2024-01-19T14:30:00Z',
          updatedAt: '2024-01-24T10:15:00Z',
          category: 'Electronics',
          description: 'Samsung Galaxy A34 with 5G connectivity'
        },
        {
          id: '6',
          title: 'Sony WH-CH520 Wireless Headphones',
          price: 17500,
          stock: 3,
          status: 'active',
          thumbnailUrl: prod2,
          createdAt: '2024-01-20T11:45:00Z',
          updatedAt: '2024-01-25T16:20:00Z',
          category: 'Electronics',
          description: 'High-quality wireless headphones from Sony'
        },
        {
          id: '7',
          title: 'HP Pavilion 15 – Core i5 12th Gen',
          price: 165000,
          stock: 1,
          status: 'active',
          thumbnailUrl: prod1,
          createdAt: '2024-01-21T09:30:00Z',
          updatedAt: '2024-01-26T12:45:00Z',
          category: 'Electronics',
          description: 'HP Pavilion laptop with Intel Core i5 12th generation'
        },
        {
          id: '8',
          title: 'Nike Revolution 6 Men\'s Running Shoes',
          price: 11500,
          stock: 2,
          status: 'active',
          thumbnailUrl: banner,
          createdAt: '2024-01-22T15:20:00Z',
          updatedAt: '2024-01-27T09:30:00Z',
          category: 'Footwear',
          description: 'Comfortable running shoes from Nike'
        },
        {
          id: '9',
          title: 'Logitech M331 Silent Plus Mouse',
          price: 3999,
          stock: 3,
          status: 'active',
          thumbnailUrl: prod2,
          createdAt: '2024-01-23T13:15:00Z',
          updatedAt: '2024-01-28T14:20:00Z',
          category: 'Electronics',
          description: 'Silent wireless mouse from Logitech'
        },
        {
          id: '10',
          title: 'Xiaomi Redmi Buds 4 Lite',
          price: 5500,
          stock: 1,
          status: 'active',
          thumbnailUrl: prod1,
          createdAt: '2024-01-24T10:45:00Z',
          updatedAt: '2024-01-29T11:30:00Z',
          category: 'Electronics',
          description: 'Wireless earbuds from Xiaomi'
        },
        {
          id: '11',
          title: 'Anker 20W Fast Charger USB-C',
          price: 3200,
          stock: 2,
          status: 'active',
          thumbnailUrl: banner,
          createdAt: '2024-01-25T16:30:00Z',
          updatedAt: '2024-01-30T08:15:00Z',
          category: 'Electronics',
          description: 'Fast charging USB-C adapter from Anker'
        },
        {
          id: '12',
          title: 'Comfortable Casual Rubber Slippers – Non Slip, Soft Everyday Wear',
          price: 300,
          stock: 3,
          status: 'active',
          thumbnailUrl: prod2,
          createdAt: '2024-01-26T12:20:00Z',
          updatedAt: '2024-01-31T15:45:00Z',
          category: 'Footwear',
          description: 'Comfortable rubber slippers for everyday use'
        }
      ],
      total: 12,
      page: 1,
      pageSize: 10
    };
  }
}

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
  const [items, setItems] = React.useState<LowStockProductListItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Load low stock products from backend with graceful fallback
  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchLowStockProducts({ page, pageSize })
      .then((res: { items: LowStockProductListItem[]; total: number }) => {
        if (!isMounted) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => {
        if (!isMounted) return;
        // Fallback demo rows to preserve UI while backend is wiring up
        const demo: LowStockProductListItem[] = [
          { id: '1', title: 'Nokia 4G Mobile Phone - 64 GB', price: 45000, stock: 3, status: 'active', thumbnailUrl: prod1, createdAt: '2024-01-15T10:30:00Z', updatedAt: '2024-01-20T14:45:00Z', category: 'Electronics', description: 'High-quality Nokia mobile phone with 4G connectivity' },
          { id: '2', title: 'Men\'s Casual Cotton Slim Fit Shirt – Blue Long Sleeve', price: 1200, stock: 1, status: 'active', thumbnailUrl: banner, createdAt: '2024-01-16T09:15:00Z', updatedAt: '2024-01-21T11:20:00Z', category: 'Clothing', description: 'Comfortable cotton shirt perfect for casual wear' },
          { id: '3', title: 'Wireless Bluetooth Earphones with Mic – Deep Bass, Long Battery', price: 2500, stock: 2, status: 'active', thumbnailUrl: prod2, createdAt: '2024-01-17T16:45:00Z', updatedAt: '2024-01-22T08:30:00Z', category: 'Electronics', description: 'Premium wireless earphones with excellent sound quality' },
          { id: '4', title: 'Apple MacBook Air M2 13"', price: 199999, stock: 1, status: 'active', thumbnailUrl: prod1, createdAt: '2024-01-18T13:20:00Z', updatedAt: '2024-01-23T15:10:00Z', category: 'Electronics', description: 'Latest Apple MacBook Air with M2 chip' },
          { id: '5', title: 'Samsung Galaxy A34 5G – 128 GB', price: 79999, stock: 2, status: 'active', thumbnailUrl: banner, createdAt: '2024-01-19T14:30:00Z', updatedAt: '2024-01-24T10:15:00Z', category: 'Electronics', description: 'Samsung Galaxy A34 with 5G connectivity' },
          { id: '6', title: 'Sony WH-CH520 Wireless Headphones', price: 17500, stock: 3, status: 'active', thumbnailUrl: prod2, createdAt: '2024-01-20T11:45:00Z', updatedAt: '2024-01-25T16:20:00Z', category: 'Electronics', description: 'High-quality wireless headphones from Sony' },
          { id: '7', title: 'HP Pavilion 15 – Core i5 12th Gen', price: 165000, stock: 1, status: 'active', thumbnailUrl: prod1, createdAt: '2024-01-21T09:30:00Z', updatedAt: '2024-01-26T12:45:00Z', category: 'Electronics', description: 'HP Pavilion laptop with Intel Core i5 12th generation' },
          { id: '8', title: 'Nike Revolution 6 Men\'s Running Shoes', price: 11500, stock: 2, status: 'active', thumbnailUrl: banner, createdAt: '2024-01-22T15:20:00Z', updatedAt: '2024-01-27T09:30:00Z', category: 'Footwear', description: 'Comfortable running shoes from Nike' },
          { id: '9', title: 'Logitech M331 Silent Plus Mouse', price: 3999, stock: 3, status: 'active', thumbnailUrl: prod2, createdAt: '2024-01-23T13:15:00Z', updatedAt: '2024-01-28T14:20:00Z', category: 'Electronics', description: 'Silent wireless mouse from Logitech' },
          { id: '10', title: 'Xiaomi Redmi Buds 4 Lite', price: 5500, stock: 1, status: 'active', thumbnailUrl: prod1, createdAt: '2024-01-24T10:45:00Z', updatedAt: '2024-01-29T11:30:00Z', category: 'Electronics', description: 'Wireless earbuds from Xiaomi' },
          { id: '11', title: 'Anker 20W Fast Charger USB-C', price: 3200, stock: 2, status: 'active', thumbnailUrl: banner, createdAt: '2024-01-25T16:30:00Z', updatedAt: '2024-01-30T08:15:00Z', category: 'Electronics', description: 'Fast charging USB-C adapter from Anker' },
          { id: '12', title: 'Comfortable Casual Rubber Slippers – Non Slip, Soft Everyday Wear', price: 300, stock: 3, status: 'active', thumbnailUrl: prod2, createdAt: '2024-01-26T12:20:00Z', updatedAt: '2024-01-31T15:45:00Z', category: 'Footwear', description: 'Comfortable rubber slippers for everyday use' },
        ];
        setItems(demo);
        setTotal(demo.length);
      })
      .finally(() => setLoading(false));
    return () => {
      isMounted = false;
    };
  }, [page, pageSize]);

  // On page change, scroll to very top to show full page
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const totalPages = React.useMemo(() => Math.max(1, Math.ceil((total || 120) / pageSize)), [total, pageSize]);
  const pageNumbers = React.useMemo(() => [1, 2, 3].filter((n) => n <= totalPages), [totalPages]);

  const handleRestockProduct = (productId: string) => {
    // Navigate to restock product page or show restock modal
    navigate(`/seller/manage-products/restock-product/${productId}`);
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

        <div ref={containerRef} className="bg-white rounded-[10px] md:rounded-[15px] py-1 border border-[#C1C1C1] overflow-hidden">
          {isMobile ? (
            // Mobile Table View
            <>
              {/* Mobile Table Header */}
              <div className="grid grid-cols-[75px_1fr_40px_80px] items-center px-3 h-[35px] py-2 border-b border-[#C1C1C1]">
                <div className="text-[10px] font-semibold text-black">Product Image</div>
                <div className="text-[10px] font-semibold text-black pl-2">Product Title</div>
                <div className="text-[10px] font-semibold text-black text-center">Stock</div>
                <div className="text-[10px] font-semibold text-black text-center">Status</div>
              </div>

              {loading && Array.from({ length: pageSize }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="grid grid-cols-[75px_1fr_40px_80px] items-center px-3 py-3 border-b last:border-b-0 border-[#C1C1C1]">
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

              {!loading && items.slice((page - 1) * pageSize, page * pageSize).map((item: LowStockProductListItem) => {
                const thumb = item.thumbnailUrl || prod1;
                return (
                  <div key={item.id} className="grid grid-cols-[75px_1fr_40px_80px] items-center px-3 py-5 border-b last:border-b-0 border-[#C1C1C1]">
                    <div className="w-[67px] h-[61px] rounded-[10px] border border-[#B8B1B1] bg-[rgba(46,204,113,0.28)] flex items-center justify-center overflow-hidden">
                      <img src={thumb} alt="product" className="w-[33px] h-[33px] object-cover rounded-[6px]" />
                    </div>
                    {/* Product Title - Improved for long text */}
                    <div className="text-[10px] font-medium text-black pr-2 pl-2 py-5 break-words whitespace-normal min-w-0">
                      <div className="leading-tight" title={item.title}>
                        {item.title}
                      </div>
                    </div>
                    <div className="text-[10px] font-medium text-black text-center">
                      {item.stock}
                    </div>
                    <div className="flex justify-center">
                      <MobileRestockButton onClick={() => handleRestockProduct(item.id)} />
                    </div>
                  </div>
                );
              })}

              {/* Mobile Pagination */}
              <div className="flex flex-col items-center gap-1 px-3 py-2">
                <div className="text-[10px] text-black text-center">
                  {`Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total || page * pageSize)} of ${total || 120} Products`}
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
                  <div ref={statusRef} className="text-[20px] font-semibold text-black pl-6">Status</div>
                </div>

                {loading && Array.from({ length: pageSize }).map((_, idx) => (
                  <div key={`skeleton-${idx}`} className="grid grid-cols-[160px_1fr_140px_120px_140px] items-center px-6 py-6 border-b last:border-b-0 border-[#C1C1C1]">
                    <div className="w-[123px] h-[113px] rounded-[10px] border border-[#B8B1B1] bg-[rgba(46,204,113,0.28)] flex items-center justify-center overflow-hidden">
                      <img src={prod1} alt="product" className="w-[82px] h-[82px] object-cover rounded-[10px]" />
                    </div>
                    <div className="text-[18px] md:text-[20px] font-medium text-black pr-4 pl-6">Loading…</div>
                    <div className="text-[18px] md:text-[22px] font-medium text-black pl-6">-</div>
                    <div className="text-[18px] md:text-[22px] font-medium text-black pl-6">-</div>
                    <div className="pl-6">
                      <div className="w-[119px] h-10 bg-gray-200 rounded-[10px] animate-pulse"></div>
                    </div>
                  </div>
                ))}
                {!loading && items.slice((page - 1) * pageSize, page * pageSize).map((item: LowStockProductListItem) => {
                  const thumb = item.thumbnailUrl || prod1;
                  return (
                    <div key={item.id} className="grid grid-cols-[160px_1fr_140px_120px_140px] items-center px-6 py-6 border-b last:border-b-0 border-[#C1C1C1]">
                      <div className="w-[123px] h-[113px] rounded-[10px] border border-[#B8B1B1] bg-[rgba(46,204,113,0.28)] flex items-center justify-center overflow-hidden">
                        <img src={thumb} alt="product" className="w-[82px] h-[82px] object-cover rounded-[10px]" />
                      </div>
                      <div className="text-[18px] md:text-[20px] font-medium text-black pr-4 pl-6">{item.title}</div>
                      <div className="text-[18px] md:text-[22px] font-medium text-black pl-6">{Intl.NumberFormat('en-PK').format(item.price)}</div>
                      <div className="text-[18px] md:text-[22px] font-medium text-black pl-6">{item.stock}</div>
                      <div className="pl-6">
                        <RestockButton onClick={() => handleRestockProduct(item.id)} />
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
              <div className="text-[16px] md:text-[18px] text-black">{`Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total || page * pageSize)} of ${total || 120} Products`}</div>
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
