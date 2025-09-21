import React from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  image: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  originalPrice,
  discount,
  rating,
  reviews,
  image
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-[7.94px] h-[8.94px] lg:w-[20.42px] lg:h-[23px] ${index < rating ? 'text-[#E5E523]' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <Link to={`/product/${id}`} className="block group" aria-label={`View details for ${name}`}>
      <div className="w-full max-w-[121px] lg:max-w-none bg-white border border-[#B8B1B1] rounded-lg overflow-hidden group-hover:shadow-lg group-hover:-translate-y-2 transition-all duration-300 ease-in-out transform">
        {/* Image area - responsive for mobile and desktop */}
        <div className="relative w-full h-[97px] lg:h-[192px] bg-[#C7FFDF] flex items-center justify-center">
          <img
            src={image}
            alt={name}
            className="w-[77px] lg:w-[160px] h-[77px] lg:h-[160px] object-contain"
            loading="lazy"
          />
          {/* {typeof discount === 'number' && (
            <span className="absolute top-1 left-1 lg:top-2 lg:left-2 bg-[#E5E523] text-black text-[8px] lg:text-xs font-semibold px-1.5 py-0.5 rounded">
              -{discount}%
            </span>
          )} */}
        </div>

        {/* Info area - responsive layout */}
        <div className="px-[10px] py-[4px] lg:px-[17px] lg:py-[17px] flex flex-col justify-between">
          {/* Product Name */}
          <h3 className="font-semibold text-[8px] lg:text-[20px] text-black leading-[1.17] h-[18px] lg:h-[46px] overflow-hidden">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-[1px] h-[10px] lg:h-[23px]">
            <div className="flex space-x-[0.5px] lg:space-x-[2px]">
              {renderStars(rating)}
            </div>
            <span className="text-[#949494] text-[5px] lg:text-[15px] leading-[1.17] whitespace-nowrap">
              ({reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-[6px] h-[12px] lg:h-[26px]">
            <span className="text-[#2ECC71] font-semibold text-[10px] lg:text-[22px] leading-[1.17]">
              Rs. {price}
            </span>
            {originalPrice && (
              <span className="text-[#949494] text-[5px] lg:text-[15px] leading-[1.17] line-through">
                -{originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
