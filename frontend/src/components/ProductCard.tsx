import React from 'react';
import { Link } from 'react-router-dom';
import Stars from './product/Stars';

interface ProductCardProps {
  id: number | string;
  slug?: string;
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
  slug,
  name,
  price,
  originalPrice,
  discount,
  rating,
  reviews,
  image
}) => {
  const productHref = slug ? `/product/${slug}` : `/product/${id}`;

  return (
    <Link to={productHref} className="block group" aria-label={`View details for ${name}`}>
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
              <Stars rating={rating} size="card" />
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
