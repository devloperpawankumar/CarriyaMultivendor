import React from 'react';
import ProductCard from './ProductCard';
import product2 from "../assets/images/Product/product2.png";

const ExploreInterests: React.FC = () => {
  const exploreProducts = [
    {
      id: 21,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 22,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 23,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 24,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 25,
      name: "Write The Name Of Product Here",
      price: 700,
      originalPrice: 1750,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 26,
      name: "Write The Name Of Product Here",
      price: 700,
      originalPrice: 1750,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 27,
      name: "Write The Name Of Product Here",
      price: 1200,
      originalPrice: 3000,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 28,
      name: "Write The Name Of Product Here",
      price: 1000,
      originalPrice: 2500,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 29,
      name: "Write The Name Of Product Here",
      price: 1000,
      originalPrice: 2500,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 30,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 31,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 32,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 33,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 34,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 35,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 36,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 37,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 38,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 39,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
    },
    {
      id: 40,
      name: "Write The Name Of Product Here",
      price: 500,
      originalPrice: 1250,
      discount: 60,
      rating: 5,
      reviews: 25,
      image: product2
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
        {exploreProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  </section>
  
  );
};

export default ExploreInterests;
