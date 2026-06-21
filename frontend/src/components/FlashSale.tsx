import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { fetchPublicProducts, PublicProductListItem } from '../services/productService';
import SkeletonProductCard from './common/SkeletonProductCard';


const FlashSale: React.FC = () => {
  const [items, setItems] = useState<PublicProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch popular products; prefer discounted ones for "Flash Sale"
        const data = await fetchPublicProducts({ page: 1, pageSize: 24, sort: 'popular' });
        const discounted = data.items.filter((p) => p.discount > 0);
        const pool = discounted.length >= 8 ? discounted : data.items;
        // Cap max 2 items per seller
        const perSellerCount: Record<string, number> = {};
        const capped: PublicProductListItem[] = [];
        for (const p of pool) {
          const sid = p.sellerId || `unknown-${p.id}`;
          const count = perSellerCount[sid] || 0;
          if (count < 2) {
            capped.push(p);
            perSellerCount[sid] = count + 1;
          }
          if (capped.length >= 12) break;
        }
        if (mounted) setItems(capped);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="w-full bg-white py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-normal text-carriya-dark mb-8">
        Flash Sale :
      </h2>
  
      {/* 3 per row on mobile, 4 on desktop */}
      {loading ? (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonProductCard key={i} compact />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">No deals right now.</div>
      ) : (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
          {items.map((p) => (
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
      )}






    </div>
  </section>
  
  
  );
};

export default FlashSale;
