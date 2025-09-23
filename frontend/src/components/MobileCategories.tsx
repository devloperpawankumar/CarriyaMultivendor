import React from "react";

import electronicsImg from "../assets/images/categories/category 1.jpg";
import fashionImg from "../assets/images/categories/category 2.jpg";
import healthImg from "../assets/images/categories/category 3.jpg";
import homeImg from "../assets/images/categories/category 4.jpg";
import sportsImg from "../assets/images/categories/category 5.png";
import automotiveImg from "../assets/images/categories/category 6.png";
import groceriesImg from "../assets/images/categories/category 7.png";
import booksImg from "../assets/images/categories/category 8.png";
import toysImg from "../assets/images/categories/category 9.png";
import jewelryImg from "../assets/images/categories/category 10.png";
import industrialImg from "../assets/images/categories/category 11.png";

const categories = [
  { name: "Electronics & Appliances", image: electronicsImg },
  { name: "Fashion & Apparels", image: fashionImg }, // fixed spelling
  { name: "Health & Beauty", image: healthImg },
  { name: "Home living & Furniture", image: homeImg },
  { name: "Sports & Outdoor", image: sportsImg },
  { name: "Automotive & Bike Accessories", image: automotiveImg },
  { name: "Groceries & Essentials", image: groceriesImg },
  { name: "Books, Stationery & Education", image: booksImg },
  { name: "Toys, Kids & Baby", image: toysImg },
  { name: "Jewelry & Watches", image: jewelryImg },
  { name: "Industrial & Business Supplies", image: industrialImg },
];

const MobileCategories: React.FC = () => {
  return (
    <div className="md:hidden px-5 mt-5">
      {/* Heading */}
      <h2 className="text-[17px] font-medium text-gray-900 mb-4">
        Categories :
      </h2>

      <div className="flex flex-wrap justify-center gap-y-6">
  {categories.map((cat) => (
    <div
      key={cat.name}
      className="w-1/4 flex flex-col items-center text-center px-2"
    >
      <img
        src={cat.image}
        alt={cat.name}
        className="w-[72px] h-[72px] rounded-full object-cover mb-2"
      />
      <span className="text-[12px] text-gray-800 leading-tight">
        {cat.name}
      </span>
    </div>
  ))}
</div>



    </div>
  );
};

export default MobileCategories;
