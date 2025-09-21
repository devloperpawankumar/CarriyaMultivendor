import React from "react";
import testImg from "../assets/images/pexels-pixabay-356056.jpg";

const categories = [
  { name: "Electronics & Appliances", image: testImg },
  { name: "Fashion & Apparels", image: testImg }, // fixed spelling
  { name: "Health & Beauty", image: testImg },
  { name: "Home living & Furniture", image: testImg },
  { name: "Sports & Outdoor", image: testImg },
  { name: "Automotive & Bike Accessories", image: testImg },
  { name: "Groceries & Essentials", image: testImg },
  { name: "Books, Stationery & Education", image: testImg },
  { name: "Toys, Kids & Baby", image: testImg },
  { name: "Jewelry & Watches", image: testImg },
  { name: "Industrial & Business Supplies", image: testImg },
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
