import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import galleryicon from "../assets/images/Seller/gallery-add.png";
import SkeletonProductCard from '../components/common/SkeletonProductCard';
import { useParams } from 'react-router-dom';
import { fetchPublicProducts, PublicProductListItem } from '../services/productService';
import { getPublicSellerProfile, PublicSellerProfile } from '../services/sellerSettingsService';


const sortOptions: Array<{ value: 'popular' | 'newest' | 'price_asc' | 'price_desc'; label: string }> = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const SellerStore: React.FC = () => {
  const { sellerSlug = '' } = useParams<{ sellerSlug: string }>();
  const [profile, setProfile] = useState<PublicSellerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [products, setProducts] = useState<PublicProductListItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [totalPages, setTotalPages] = useState(0);
  const [sort, setSort] = useState<'popular' | 'newest' | 'price_asc' | 'price_desc'>('popular');

  useEffect(() => {
    setPage(1);
    setSort('popular');
  }, [sellerSlug]);

  useEffect(() => {
    if (!sellerSlug) {
      setProfile(null);
      setProfileError('Seller not found');
      setProfileLoading(false);
      return;
    }

    let active = true;
    setProfileLoading(true);
    setProfileError(null);

    (async () => {
      try {
        const profileData = await getPublicSellerProfile(sellerSlug);
        if (!active) return;
        setProfile(profileData);
        // If backend returns canonical slug different from URL, redirect client-side
        if (profileData.storeSlug && profileData.storeSlug !== sellerSlug) {
          window.history.replaceState(null, '', `/seller/${profileData.storeSlug}`);
        }
      } catch (err) {
        console.error('Failed to fetch seller profile:', err);
        if (!active) return;
        setProfile(null);
        setProfileError('Seller not found');
      } finally {
        if (active) setProfileLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [sellerSlug]);

  useEffect(() => {
    if (!sellerSlug || profileError) {
      setProducts([]);
      setTotalPages(0);
      setProductsLoading(false);
      return;
    }

    let active = true;
    setProductsLoading(true);
    setProductsError(null);

    (async () => {
      try {
        const data = await fetchPublicProducts({
          page,
          pageSize,
          sort,
          sellerSlug,
        });
        if (!active) return;

        if (data.totalPages > 0 && page > data.totalPages) {
          setPage(data.totalPages);
          return;
        }

        if (data.totalPages === 0 && page !== 1) {
          setPage(1);
          return;
        }

        setProducts(data.items);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error('Failed to load seller products:', err);
        if (!active) return;
        setProducts([]);
        setTotalPages(0);
        setProductsError('Failed to load products');
      } finally {
        if (active) setProductsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [sellerSlug, page, pageSize, sort, profileError]);

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as 'popular' | 'newest' | 'price_asc' | 'price_desc';
    setSort(value);
    setPage(1);
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (totalPages > 0) {
      setPage((prev) => Math.min(totalPages, prev + 1));
    }
  };

  const canPrev = page > 1;
  const canNext = totalPages > 0 ? page < totalPages : false;
  const displayPage = totalPages > 0 ? page : 1;
  const displayTotalPages = totalPages > 0 ? totalPages : 1;

  return (
    <div className="min-h-screen bg-white">
      <Header variant="full" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Top bar: Browse categories and brand mark ( header area) could be part of Header */}

        {/* Upload banner area */}
        <div className="border border-[#4C535F] border-dashed rounded-[18px] bg-[#E9FFF2] w-full h-[60px] sm:h-[167px] flex items-center justify-center relative mb-4 sm:mb-0 overflow-hidden">
          {profileLoading ? (
            <div className="w-full h-full bg-gray-100 animate-pulse" />
          ) : profile?.storeBanner ? (
            <img src={profile.storeBanner} alt="Store banner" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center flex flex-col items-center w-full">
              <div className="mx-auto  w-[25px] h-[35px] sm:w-[74.58px] sm:h-[74.57px] mb-1 sm:mb-2">
                <img src={galleryicon} alt="gallery-add" className="w-full h-full object-contain" />
              </div>
              <p className="text-[10px]  sm:text-[25px] leading-[1.366] text-[#4C535F] font-medium">No banner added</p>
            </div>
          )}
        </div>

        {/* Logo + Description row */}
        <div className="mt-4 sm:mt-6 flex items-center sm:flex-row items-start sm:items-center gap-3 sm:gap-8">
          {/* Add logo circle */}
          <div className="w-[90px] h-[90px] sm:w-[190px] sm:h-[193px] rounded-full border border-[#4C535F] border-dashed bg-[#E9FFF2] flex items-center justify-center flex-shrink-0 mb-2 sm:mb-0 overflow-hidden">
            {profileLoading ? (
              <div className="w-full h-full bg-gray-100 animate-pulse" />
            ) : profile?.storeLogo ? (
              <img src={profile.storeLogo} alt="Store logo" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center flex flex-col items-center">
                <div className="mx-auto w-[36px] h-[36px] sm:w-[64.72px] sm:h-[64.72px] mb-1 sm:mb-2">
                  <img src={galleryicon} alt="gallery-add" className="w-full h-full object-contain" />
                </div>
                <p className="text-[8px] sm:text-[15px] leading-[1.366] text-[#4C535F] font-medium mt-1 md:mt-2 sm:mt-5">No logo added</p>
              </div>
            )}
          </div>

          {/* Seller description */}
          <div className="flex-1">
            {profileLoading ? (
              <>
                <div className="h-5 sm:h-6 bg-gray-100 rounded w-1/3 animate-pulse" />
                <div className="mt-2 h-4 sm:h-5 bg-gray-100 rounded w-2/3 animate-pulse" />
              </>
            ) : (
              <>
                <h3 className="text-[16px] sm:text-[20px] font-semibold text-black">{profile?.storeName || 'Seller Store'}</h3>
                <p className="text-black md:text-[18px] text-[12px] leading-[1.5] max-w-[566px] mt-2">
                  {profile?.storeDescription || 'No description Added'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Section title */}
        <h2 className="mt-12 text-black text-[25px] font-normal">Seller Products</h2>

        {profileError ? (
          <div className="mt-6 text-sm text-red-600">{profileError}</div>
        ) : (
          <>
            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="seller-store-sort" className="text-sm text-gray-600">
                  Sort by:
                </label>
                <select
                  id="seller-store-sort"
                  value={sort}
                  onChange={handleSortChange}
                  disabled={productsLoading}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ECC71]"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {(totalPages > 0 || productsLoading) && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={!canPrev || productsLoading}
                    className={`px-3 py-1.5 rounded border border-gray-300 transition ${
                      !canPrev || productsLoading
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-[#2ECC71] hover:border-[#2ECC71]'
                    }`}
                  >
                    Previous
                  </button>
                  <span>
                    Page {displayPage} of {displayTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={!canNext || productsLoading}
                    className={`px-3 py-1.5 rounded border border-gray-300 transition ${
                      !canNext || productsLoading
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-[#2ECC71] hover:border-[#2ECC71]'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

        {/* Product grid (3 cols mobile, 4 cols desktop) */}
            {productsLoading ? (
              <div className="mt-6 grid grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
                {Array.from({ length: pageSize }).map((_, i) => (
                  <SkeletonProductCard key={i} compact />
                ))}
              </div>
            ) : productsError ? (
              <div className="mt-6 text-sm text-red-600">{productsError}</div>
            ) : products.length === 0 ? (
              <div className="mt-6 text-sm text-gray-500">No products from this seller yet.</div>
            ) : (
        <div className="mt-6 grid grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
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
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SellerStore;


