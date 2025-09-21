import React from 'react';
import ProductCard from './ProductCard';
import product1 from "../assets/images/Product/prodcut1.png";


const FlashSale: React.FC = () => {
  const flashSaleProducts = [
    {
      id: 1,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 2,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 3,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 4,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 5,
      name: "Write The Name Of Product Here",
      price: 700,
      originalPrice: 1750,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 6,
      name: "Write The Name Of Product Here",
      price: 700,
      originalPrice: 1750,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 7,
      name: "Write The Name Of Product Here",
      price: 1200,
      originalPrice: 3000,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 8,
      name: "Write The Name Of Product Here",
      price: 1000,
      originalPrice: 2500,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 9,
      name: "Write The Name Of Product Here",
      price: 1000,
      originalPrice: 2500,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 10,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 11,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 12,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 13,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 14,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 15,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 16,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 17,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 18,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 19,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    },
    {
      id: 20,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product1
    }
  ];

  return (
    <section className="w-full bg-white py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-normal text-carriya-dark mb-8">
        Flash Sale :
      </h2>
  
      {/* 3 per row on mobile, 4 on desktop */}
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
        {flashSaleProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>






    </div>
  </section>
  
  
  );
};

export default FlashSale;
