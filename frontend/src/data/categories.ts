// src/data/categories.ts

import testImg from "../assets/images/pexels-pixabay-356056.jpg";

export const categories = [
  {
    name: "Electronics & Appliances",
    image: testImg,
    subcategories: [
      {
        name: "Mobiles & Tablets",
        items: [
          "Smartphones",
          "Feature Phones",
          "Tablets",
          "Mobile Accessories (Covers, Chargers, Power Banks, Screen Protectors)",
          "Smartwatches & Wearables",
        ],
      },
      {
        name: "Computers & Laptops",
        items: [
          "Laptops",
          "Desktops",
          "Computer Accessories (Keyboards, Mice, Cables)",
          "Storage Devices (Hard Drives, SSDs, USBs)",
          "Networking Devices (Routers, Wi-Fi Devices)",
        ],
      },
      {
        name: "Home Appliances",
        items: [
          "Refrigerators",
          "Washing Machines",
          "Air Conditioners",
          "Microwave Ovens",
          "Kitchen Appliances (Blenders, Juicers, Coffee Machines)",
        ],
      },
      {
        name: "Cameras & Accessories",
        items: [
          "DSLR & Mirrorless Cameras",
          "Action Cameras",
          "Camera Lenses",
          "Tripods & Gimbals",
          "Security Cameras & CCTV",
        ],
      },
    ],
  },
  {
    name: "Fashion & Apparel",
    image: testImg,
    subcategories: [
      {
        name: "Men’s Fashion",
        items: [
          "T-Shirts & Polos",
          "Shirts",
          "Jeans & Trousers",
          "Shoes & Sneakers",
          "Watches",
          "Sunglasses",
        ],
      },
      {
        name: "Women’s Fashion",
        items: [
          "Dresses & Kurtis",
          "Abayas & Hijabs",
          "Shoes & Heels",
          "Handbags & Clutches",
          "Jewelry (Rings, Earrings, Necklaces)",
        ],
      },
      {
        name: "Kids & Baby Fashion",
        items: ["Baby Clothing", "Shoes", "School Bags & Accessories"],
      },
    ],
  },
  {
    name: "Health & Beauty",
    image: testImg,
    subcategories: [
      {
        name: "Beauty & Personal Care",
        items: [
          "Skincare (Creams, Lotions, Facewash)",
          "Makeup (Foundations, Lipsticks, Palettes)",
          "Hair Care (Shampoos, Oils, Conditioners)",
          "Perfumes & Deodorants",
        ],
      },
      {
        name: "Health & Wellness",
        items: [
          "Vitamins & Supplements",
          "Fitness Equipment",
          "Medical Supplies",
          "Personal Care Devices (Trimmers, Hair Dryers, Massagers)",
        ],
      },
    ],
  },
  {
    name: "Home, Living & Furniture",
    image: testImg,
    subcategories: [
      {
        name: "Home Décor",
        items: [
          "Wall Art & Frames",
          "Lighting & Lamps",
          "Rugs & Carpets",
          "Curtains & Blinds",
        ],
      },
      {
        name: "Furniture",
        items: [
          "Sofas & Chairs",
          "Beds & Mattresses",
          "Tables & Cabinets",
          "Office Furniture",
        ],
      },
      {
        name: "Kitchen & Dining",
        items: [
          "Cookware (Pans, Pots, Non-stick Sets)",
          "Dinnerware (Plates, Glasses, Bowls)",
          "Storage Solutions",
        ],
      },
    ],
  },
  {
    name: "Groceries & Essentials",
    image: testImg,
    subcategories: [
      {
        name: "Food & Beverages",
        items: [
          "Cooking Essentials (Oil, Ghee, Rice, Flour)",
          "Snacks & Chips",
          "Tea, Coffee & Juices",
        ],
      },
      {
        name: "Household Supplies",
        items: [
          "Cleaning Supplies (Detergents, Floor Cleaners)",
          "Tissue & Paper Products",
          "Insect Killers",
        ],
      },
      {
        name: "Baby Products",
        items: ["Diapers & Wipes", "Baby Formula & Food", "Feeding Bottles"],
      },
    ],
  },
  {
    name: "Sports & Outdoor",
    image: testImg,
    subcategories: [
      {
        name: "Sports Equipment",
        items: ["Cricket", "Football", "Badminton"],
      },
      {
        name: "Gym Equipment",
        items: ["Dumbbells", "Yoga Mats"],
      },
      {
        name: "Outdoor & Travel",
        items: ["Tents & Camping Gear", "Travel Bags & Luggage"],
      },
      {
        name: "Cycling & Scooters",
        items: ["Bicycles", "Scooters"],
      },
    ],
  },
  {
    name: "Automotive & Bikes",
    image: testImg,
    subcategories: [
      {
        name: "Car Accessories",
        items: [
          "Car Electronics (Speakers, GPS, Dash Cams)",
          "Car Care Products (Waxes, Cleaners)",
          "Tyres & Wheels",
        ],
      },
      {
        name: "Motorbike Accessories",
        items: [
          "Helmets & Safety Gear",
          "Bike Spare Parts",
          "Oils & Lubricants",
        ],
      },
    ],
  },
  {
    name: "Books, Stationery & Education",
    image: testImg,
    subcategories: [
      {
        name: "Books",
        items: [
          "Fiction & Novels",
          "Academic & Educational",
          "Religious Books (Quran, Hadith, Tafseer)",
        ],
      },
      {
        name: "Stationery",
        items: [
          "Notebooks",
          "Pens",
          "Markers",
          "School Supplies",
          "Office Supplies",
        ],
      },
    ],
  },
  {
    name: "Toys, Kids & Baby",
    image: testImg,
    subcategories: [
      {
        name: "Toys & Games",
        items: [
          "Learning & Educational Toys",
          "Dolls & Action Figures",
          "Remote Control Cars & Drones",
          "Board Games & Puzzles",
        ],
      },
      {
        name: "Baby Gear",
        items: ["Strollers & Walkers", "Car Seats", "Baby Carriers"],
      },
    ],
  },
  {
    name: "Jewelry & Watches",
    image: testImg,
    subcategories: [
      {
        name: "Jewelry",
        items: ["Gold Jewelry", "Silver Jewelry", "Artificial Jewelry"],
      },
      {
        name: "Watches",
        items: ["Men’s Watches", "Women’s Watches", "Smartwatches"],
      },
    ],
  },
  {
    name: "Industrial & Business Supplies",
    image: testImg,
    subcategories: [
      {
        name: "Tools & Hardware",
        items: ["Hand Tools", "Power Tools"],
      },
      {
        name: "Safety & Security Equipment",
        items: ["Helmets", "Safety Shoes", "Gloves", "CCTV Systems"],
      },
      {
        name: "Construction Supplies",
        items: ["Cement", "Bricks", "Steel"],
      },
      {
        name: "Office Furniture & Equipment",
        items: ["Office Chairs", "Desks", "Cabinets"],
      },
    ],
  },
];
