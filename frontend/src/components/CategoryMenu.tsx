import React, { useState } from "react";
import { categories } from "../data/categories";

const CategoryMenu: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <>
      {/* Desktop Categories (open on click) */}
      <div className="hidden md:block w-72 bg-white rounded-xl shadow-lg border overflow-hidden z-50">
        {categories.map((cat) => (
          <div key={cat.name}>
            {/* Parent Category */}
            <div
              onClick={() =>
                setActiveCategory(activeCategory === cat.name ? null : cat.name)
              }
              className={`flex justify-between items-center px-4 py-3 cursor-pointer border-b last:border-none transition
              ${
                activeCategory === cat.name
                  ? "bg-green-50 text-green-600 font-semibold"
                  : "text-gray-800 hover:text-green-600 hover:bg-gray-50"
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-sm">
                {activeCategory === cat.name ? "▾" : "▸"}
              </span>
            </div>

            {/* Subcategories */}
            {activeCategory === cat.name && (
              <div className="bg-gray-50 px-4 py-3 space-y-3 animate-fadeIn">
                {cat.subcategories.map((sub) => (
                  <div key={sub.name}>
                    <p className="font-medium text-gray-900 text-sm mb-1">
                      {sub.name}
                    </p>
                    <ul className="space-y-1 pl-3 text-sm text-gray-600">
                      {sub.items.map((item) => (
                        <li
                          key={item}
                          className="hover:text-green-600 cursor-pointer transition"
                        >
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    {/* Mobile Categories (grid with images) */}
<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 md:hidden bg-gray-100">
  {categories.map((cat) => (
    <div
      key={cat.name}
      className="flex flex-col items-center bg-white border border-gray-300 rounded-xl shadow p-3 cursor-pointer hover:shadow-md transition"
    >
      <img
        src={cat.image}
        alt={cat.name}
        className="w-16 h-16 object-cover mb-2 border"
      />
      <span className="text-gray-800 text-sm text-center font-medium">
        {cat.name}
      </span>
    </div>
  ))}
</div>

    </>
  );
};

export default CategoryMenu;
