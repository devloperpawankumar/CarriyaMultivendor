import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FlashSale from '../components/FlashSale';
import ExploreInterests from '../components/ExploreInterests';
import Footer from '../components/Footer';
import MobileCategories from '../components/MobileCategories';
import Reveal from '../components/Reveal';
import ProductCard from '../components/ProductCard';
import { fetchPublicProducts, PublicProductListItem } from '../services/productService';
import PopularProducts from '../components/PopularProducts';
import SkeletonProductCard from '../components/common/SkeletonProductCard';

const PAGE_SIZE = 16;

const Home: React.FC = () => {
  const [products, setProducts] = useState<PublicProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchPublicProducts({ page: 1, pageSize: PAGE_SIZE, sort: 'popular' });
        if (!mounted) return;
        setProducts(data.items);
        setPage(data.page);
        setTotalPages(data.totalPages || 1);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchPublicProducts({ page: nextPage, pageSize: PAGE_SIZE, sort: 'popular' });
      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const appended = data.items.filter((item) => !existingIds.has(item.id));
        return [...prev, ...appended];
      });
      setPage(data.page);
      setTotalPages(data.totalPages || data.page || nextPage);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header variant="full" />
    
        <Hero />
   
     
        <MobileCategories />
      
     
        <FlashSale />
    
   
        <ExploreInterests />
        
        <PopularProducts />
        
        {/* Products section */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <h2 className="text-black text-[20px] md:text-[28px] font-semibold mb-4">More Products</h2>
          {loading ? (
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
              {Array.from({ length: 16 }).map((_, i) => (
                <SkeletonProductCard key={i} compact />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-sm md:text-base text-gray-500">No products available yet.</div>
          ) : (
            <>
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    slug={p.id}
                    name={p.title}
                    price={p.currentPrice}
                    originalPrice={p.discount > 0 ? p.price : undefined}
                    discount={p.discount}
                    rating={p.rating || 0}
                    reviews={p.reviewCount || 0}
                    image={p.thumbnailUrl || ''}
                  />
                ))}
              </div>
              {page < totalPages && (
                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center justify-center rounded-[12px] bg-[#2ECC71] px-8 py-3 text-white text-sm md:text-base font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? 'Loading more...' : 'Load more products'}
                  </button>
                </div>
              )}
            </>
          )}
          {loadingMore && (
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6 mt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonProductCard key={`more-${i}`} compact />
              ))}
            </div>
          )}
        </div>
     
      <Footer />
    </div>
  );
};

export default Home;
