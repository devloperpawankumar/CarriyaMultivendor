import React, { useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import product1 from "../assets/images/Product/prodcut1.png";
import product2 from "../assets/images/Product/product2.png";
import galleryicon from "../assets/images/Seller/gallery-add.png";


const SellerStore: React.FC = () => {
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const handleBannerSelect: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
    }
  };

  const handleLogoSelect: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };
  const products = [
    { id: 1, name: 'Write The Name Of Product Here', price: 500, originalPrice: 1250, discount: 60, rating: 5, reviews: 25, image: product1 },
    { id: 2, name: 'Write The Name Of Product Here', price: 500, originalPrice: 1250, discount: 60, rating: 5, reviews: 25, image: product2 },
    { id: 3, name: 'Write The Name Of Product Here', price: 500, originalPrice: 1250, discount: 60, rating: 5, reviews: 25, image: product1 },
    { id: 4, name: 'Write The Name Of Product Here', price: 500, originalPrice: 1250, discount: 60, rating: 5, reviews: 25, image: product2 },
    { id: 5, name: 'Write The Name Of Product Here', price: 700, originalPrice: 1750, discount: 60, rating: 5, reviews: 25, image: product1 },
    { id: 6, name: 'Write The Name Of Product Here', price: 700, originalPrice: 1750, discount: 60, rating: 5, reviews: 25, image: product2 },
    { id: 7, name: 'Write The Name Of Product Here', price: 1000, originalPrice: 2500, discount: 60, rating: 5, reviews: 25, image: product1 },
    { id: 8, name: 'Write The Name Of Product Here', price: 1000, originalPrice: 2500, discount: 60, rating: 5, reviews: 25, image: product2 },
    { id: 9, name: 'Write The Name Of Product Here', price: 500, originalPrice: 1250, discount: 60, rating: 5, reviews: 25, image: product1 },
    { id: 10, name: 'Write The Name Of Product Here', price: 700, originalPrice: 1750, discount: 60, rating: 5, reviews: 25, image: product2 },
    { id: 11, name: 'Write The Name Of Product Here', price: 700, originalPrice: 1750, discount: 60, rating: 5, reviews: 25, image: product1 },
    { id: 12, name: 'Write The Name Of Product Here', price: 500, originalPrice: 1250, discount: 60, rating: 5, reviews: 25, image: product2 },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header variant="full" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Top bar: Browse categories and brand mark (as seen in Figma header area) could be part of Header */}

        {/* Upload banner area */}
        <div
          className="border border-[#4C535F] border-dashed rounded-[18px] bg-[#E9FFF2] w-full h-[60px] sm:h-[167px] flex items-center justify-center relative mb-4 sm:mb-0 overflow-hidden cursor-pointer"
          onClick={() => bannerInputRef.current?.click()}
          aria-label="Upload banner"
          role="button"
        >
          {bannerPreview ? (
            <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center flex flex-col items-center w-full">
              <div className="mx-auto  w-[25px] h-[35px] sm:w-[74.58px] sm:h-[74.57px] mb-1 sm:mb-2">
                <img src={galleryicon} alt="gallery-add" className="w-full h-full object-contain" />
              </div>
              <p className="text-[10px]  sm:text-[25px] leading-[1.366] text-[#4C535F] font-medium">Upload your banner</p>
            </div>
          )}
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerSelect}
          />
        </div>

        {/* Logo + Description row */}
        <div className="mt-4 sm:mt-6 flex items-center sm:flex-row items-start sm:items-center gap-3 sm:gap-8">
          {/* Add logo circle */}
          <div
            className="w-[90px] h-[90px] sm:w-[190px] sm:h-[193px] rounded-full border border-[#4C535F] border-dashed bg-[#E9FFF2] flex items-center justify-center flex-shrink-0 mb-2 sm:mb-0 overflow-hidden cursor-pointer"
            onClick={() => logoInputRef.current?.click()}
            aria-label="Upload logo"
            role="button"
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center flex flex-col items-center">
                <div className="mx-auto w-[36px] h-[36px] sm:w-[64.72px] sm:h-[64.72px] mb-1 sm:mb-2">
                  <img src={galleryicon} alt="gallery-add" className="w-full h-full object-contain" />
                </div>
                <p className="text-[12px] sm:text-[15px] leading-[1.366] text-[#4C535F] font-medium mt-1 md:mt-2 sm:mt-5">Add logo</p>
              </div>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoSelect}
            />
          </div>

          {/* Seller description */}
          <p className="text-black md:text-[25px] text-[13px] leading-[1.366] max-w-[566px]">
            No description  Added
          </p>
        </div>

        {/* Section title */}
        <h2 className="mt-12 text-black text-[25px] font-normal">Seller Products</h2>

        {/* Product grid (3 cols mobile, 4 cols desktop) */}
        <div className="mt-6 grid grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SellerStore;


