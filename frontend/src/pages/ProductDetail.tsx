import React, { useEffect, useMemo, useState } from 'react';
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
import AddToCartOverlay from '../components/product/AddToCartOverlay';
import { useNavigate } from 'react-router-dom';
import Stars from '../components/product/Stars';
import saleIcon from '../assets/images/Icon (Stroke).png';
import cartIcon from '../assets/images/Cart.png';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';

// Dummy data builder
function useDummyProduct(id: string) {
  return useMemo(() => ({
    id,
    category: 'Shirt',
    title: 'Cotton Shirt Black',
    price: 1200,
    compareAt: 2000,
    currency: 'PKR',
    sales: 2200,
    rating: 5,
    reviews: 10,
    colors: ['Pink', 'Blue', 'Yellow'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [productImage, productImage, productImage, productImage],
    description: `This is a captivating fragrance that combines freshness, elegance, and warmth in perfect harmony. With a delicate blend of floral and woody notes, it leaves a long-lasting impression that is both refined and unforgettable. Designed for any occasion, this perfume adds a touch of sophistication to your everyday moments or special evenings.`,
    reviewsList: [
      { 
        user: 'Huzaifa', 
        rating: 5, 
        text: `I've been using this cleanser for about five or six months now and my acne is almost completely gone. I really struggled for years with my skin and tried everything possible but this is the only thing that managed to clear up my skin. 100% recommend and will continue to use is for sure.` 
      },
      { 
        user: 'Pawan', 
        rating: 4, 
        text: `I've been using this cleanser for about five or six months now and my acne is almost completely gone. I really struggled for years with my skin and tried everything possible but this is the only thing that managed to clear up my skin. 100% recommend and will continue to use is for sure.` 
      },
      { 
        user: 'Ahmed', 
        rating: 5, 
        text: `I've been using this cleanser for about five or six months now and my acne is almost completely gone. I really struggled for years with my skin and tried everything possible but this is the only thing that managed to clear up my skin. 100% recommend and will continue to use is for sure.` 
      },
    ],
  }), [id]);
}


const ProductDetail: React.FC = () => {
  const { productId = '1' } = useParams();
  const product = useDummyProduct(productId);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { items: favoriteItems, toggle: toggleFavorite } = useFavorites();
  const isFavorite = useMemo(() => favoriteItems.some(i => i.id === product.id), [favoriteItems, product.id]);
  const [showAddToast, setShowAddToast] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [cartDetails, setCartDetails] = useState<{ quantity: number; color?: string; size?: string } | null>(null);
  const [mobileQuantity, setMobileQuantity] = useState(1);
  const [mobileSelectedColor, setMobileSelectedColor] = useState<string | undefined>(undefined);
  const [mobileSelectedSize, setMobileSelectedSize] = useState<string | undefined>(undefined);
  const [mobileColorOpen, setMobileColorOpen] = useState(false);
  const [mobileSizeOpen, setMobileSizeOpen] = useState(false);

  // Ensure page starts at top when navigating to a product
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch {
      // noop
    }
  }, [productId]);

  return (
    <div className="min-h-screen bg-white">
      <Header variant="simple" />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Browse Categories: Desktop text link; Mobile hamburger only */}
        
        <div className="relative mb-4 flex items-center">
          {/* Desktop: keep current styling */}
          <button
            onClick={() => setShowCategories((v) => !v)}
            className="hidden md:inline-flex items-center space-x-2 text-[#2ECC71] font-bold text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Browse Categories</span>
          </button>

     

          {showCategories && (
            <div className="absolute z-50 top-full  mt-2">
              <CategoryMenu />
            </div>
            
          )}
        </div>

        

        {/* Page heading: category, title, divider (desktop only) */}
        <div className="mb-6 hidden md:block">
          <div className="text-[35px] font-medium leading-[1.17] mb-1">
            <span className="text-black  cursor-pointer">{(product as any).category}</span>
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
          <Gallery images={product.images} />
          <div className="hidden md:block">
            <InfoPanel
            price={product.price}
            compareAt={product.compareAt}
            currency={product.currency}
            sales={product.sales}
            rating={product.rating}
            reviews={product.reviews}
            colors={product.colors}
            sizes={product.sizes}
            productId={product.id}
            productTitle={product.title}
            productImage={product.images[0]}
            onAddToCart={(d) => { 
              addItem({
                title: product.title,
                image: product.images[0],
                price: product.price,
                compareAt: product.compareAt,
                color: d.color,
                size: d.size,
                qty: d.quantity,
                shopName: 'My Shop'
              });
              setCartDetails(d); 
              setShowAddToast(true); 
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
    {product.colors.slice(0, 3).map((c: string) => (
      <button
        key={c}
        onClick={() => setMobileSelectedColor(c)}
        aria-label={c}
        className={`w-5 h-5 rounded-full border ${
          (mobileSelectedColor ?? product.colors[0]) === c
            ? 'border-[#2ECC71]'
            : 'border-[#D7DADD]'
        }`}
        style={{
          backgroundColor:
            c.toLowerCase() === 'pink'
              ? '#FFB6C1'
              : c.toLowerCase() === 'blue'
              ? '#C0DDED'
              : c.toLowerCase() === 'yellow'
              ? '#FEDE41'
              : c.toLowerCase() === 'black'
              ? '#000'
              : '#eee',
        }}
      />
    ))}

    {/* Selected color text */}
    <span className="ml-2 text-sm text-gray-700">
      {mobileSelectedColor ?? product.colors[0]}
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
              onClick={() => toggleFavorite({ id: product.id, title: product.title, image: product.images[0] })}
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
                <span className="text-[12px] text-[#949494]">{product.sales.toLocaleString()} Sales</span>
              </div>
              <div className="flex items-center gap-1">
                <Stars rating={(product as any).rating} size="sm" />
                <span className="text-[12px] text-[#949494]">({(product as any).reviews})</span>
              </div>
            </div>
            <div className="text-[20px] font-bold text-black">{product.currency} {product.price}</div>
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
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setMobileSelectedSize(s); /* Do not close dropdown */ }}
                    className={`w-full text-left py-2 text-[16px] ${((mobileSelectedSize ?? product.sizes[0]) === s) ? 'font-bold text-[#2ECC71]' : 'text-[#424551]'}`}
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
                {product.colors.map((c: string) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setMobileSelectedColor(c); /* Do not close dropdown */ }}
                    className={`w-full text-left py-2 text-[16px] ${((mobileSelectedColor ?? product.colors[0]) === c) ? 'font-bold text-[#2ECC71]' : 'text-[#424551]'}`}
                  >
                    {c}
                  </button>
                ))}
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
                onClick={() => {
                  addItem({
                    title: product.title,
                    image: product.images[0],
                    price: product.price,
                    compareAt: product.compareAt,
                    color: mobileSelectedColor,
                    size: mobileSelectedSize,
                    qty: mobileQuantity,
                    shopName: 'My Shop'
                  });
                  setShowAddToast(true);
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
    onClick={() => navigate('/sellerstore')}
  >
    Go to Seller store
  </button>
</div>


            {/* Mobile Reviews placed after actions   */}
            <div className="mt-6">
              <h2 className="text-[24px] font-bold text-black mb-3">Reviews</h2>
              <ReviewsBlock items={product.reviewsList} />
            </div>
          </div>
        </div>

        {/* Divider line  */}
        <div className="w-full h-px bg-[#E5E8ED] my-8 hidden md:block"></div>

          {/* Below: left description, right reviews (desktop only) */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DescriptionBlock text={product.description} />
          <ReviewsBlock items={product.reviewsList} />
        </div>

        <AddToCartOverlay open={showAddToast} onClose={() => setShowAddToast(false)} message="Product has been added to the cart" onViewCart={() => navigate('/cart')} />
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
