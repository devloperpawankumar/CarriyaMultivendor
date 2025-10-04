import React, { useMemo, useState } from "react";
import { categories as dataCategories } from "../data/categories";

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
  const [openName, setOpenName] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");

  const nameMap = useMemo<Record<string, string>>(
    () => ({
      "Fashion & Apparels": "Fashion & Apparel",
      "Home living & Furniture": "Home, Living & Furniture",
      "Automotive & Bike Accessories": "Automotive & Bikes",
    }),
    []
  );

  const activeDataCategory = useMemo(() => {
    if (!openName) return null;
    const target = nameMap[openName] ?? openName;
    return dataCategories.find((c) => c.name === target) || null;
  }, [openName, nameMap]);

  const activeMobileImage = useMemo(() => {
    if (!openName) return null;
    const found = categories.find((c) => c.name === openName);
    return found?.image || null;
  }, [openName]);

  const filteredSubcategories = useMemo(() => {
    if (!activeDataCategory) return [] as { name: string; items: string[] }[];
    if (!query.trim()) return activeDataCategory.subcategories ?? [];
    const q = query.toLowerCase();
    return (activeDataCategory.subcategories ?? [])
      .map((sub) => ({
        name: sub.name,
        items: sub.items.filter((it) => it.toLowerCase().includes(q)),
      }))
      .filter((sub) => sub.items.length > 0 || sub.name.toLowerCase().includes(q));
  }, [activeDataCategory, query]);

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
      onClick={() => setOpenName(cat.name)}
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

      {activeDataCategory && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            aria-label="Close"
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => { setOpenName(null); setQuery(""); }}
          />
          {/* Bottom Sheet */}
          <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl pt-2 pb-4 max-h-[75vh] overflow-hidden transition-transform duration-300">
            {/* Drag handle */}
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-gray-300" />

            {/* Header */}
            <div className="px-4 flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden border">
                  <img src={activeMobileImage || activeDataCategory.image} alt={activeDataCategory.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-gray-900 leading-tight">{activeDataCategory.name}</h3>
                  <p className="text-[11px] text-gray-500">{activeDataCategory.subcategories?.length ?? 0} subcategories</p>
                </div>
              </div>
              <button
                onClick={() => { setOpenName(null); setQuery(""); }}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Search */}
            <div className="px-4 mb-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search in this category"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2ECC71]"
              />
            </div>

            {/* Content scroll */}
            <div className="px-4 overflow-y-auto max-h-[55vh] space-y-4">
              {filteredSubcategories.length === 0 && (
                <p className="text-center text-[12px] text-gray-500">No results</p>
              )}
              {filteredSubcategories.map((sub) => (
                <div key={sub.name} className="bg-white">
                  <p className="text-[13px] font-semibold text-gray-900 mb-2">{sub.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {sub.items.map((item) => (
                      <button
                        key={item}
                        className="text-[12px] px-3 py-1.5 rounded-full bg-[#E9FFF2] text-[#17696A] border border-[#CDEFE0] active:scale-95 transition"
                        type="button"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



    </div>
  );
};

export default MobileCategories;
