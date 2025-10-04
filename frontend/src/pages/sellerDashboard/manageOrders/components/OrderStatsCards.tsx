import React from "react";
import { OrderStatsCardsProps } from "../types/orderTypes";
import cartIcon from "../../../../assets/images/Seller/shoppingSeller.png";
import truckIcon from "../../../../assets/images/Seller/ProcessingSeller.png";
import checkIcon from "../../../../assets/images/Seller/completedSeller.png";
import crossIcon from "../../../../assets/images/Seller/CancelledSeller.png";

const OrderStatsCards: React.FC<OrderStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: "New Orders",
      count: stats.newOrders,
      gradient: "from-cyan-100 to-cyan-600",
      bottomColor: "#1391C6", // Blue color
      iconBg: "",
      icon: <img src={cartIcon} alt="new orders" className="w-6 h-6" />,
    },
    {
      title: "Processing",
      count: stats.processing,
      gradient: "from-yellow-100 to-yellow-500",
      bottomColor: "#FBBC05", // Yellow color
      icon: <img src={truckIcon} alt="processing" className="w-6 h-6" />,
    },
    {
      title: "Completed",
      count: stats.completed,
      gradient: "from-green-100 to-green-500",
      bottomColor: "#41AD49", // Green color
      icon: <img src={checkIcon} alt="completed" className="w-10 h-10" />,
    },
    {
      title: "Canceled/Returned",
      count: stats.canceled,
      gradient: "from-red-100 to-red-500",
      bottomColor: "#FF4867", // Red color
      iconBg: "",
      icon: <img src={crossIcon} alt="canceled" className="w-6 h-6" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-16 mb-8 py-2 pr-0 lg:pr-10 ">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`relative w-full h-[110px] md:h-[120px] md:w-[190px] rounded-[20px] bg-gradient-to-br ${c.gradient} border border-gray-300 shadow-md overflow-hidden `}
        >
          {/* Colored bottom */}
          <div 
            className="absolute bottom-0 left-0 w-full h-[14px] md:h-[18px]"
            style={{ backgroundColor: c.bottomColor }}
          ></div>
          
          {/* Content  */}
          <div className="relative z-10 h-full  ">
            {/* Title positioned at top left */}
            <h3 className="text-[13px] md:text-[15px] font-semibold text-gray-600 absolute top-[14px] md:top-[17px] left-[18px] md:left-[29px]  leading-tight">
              {c.title === "Canceled/Returned" ? (
                <>
                  Canceled/<br />Returned
                </>
              ) : (
                c.title
              )}
            </h3>
            
            {/* Count positioned below title */}
            <p className="text-[26px] md:text-[32px] font-medium text-gray-900 absolute top-[44px] md:top-[49px] left-[18px] md:left-[29px]">
              {c.count}
            </p>
            
            {/* Icon positioned at top right with dark circle background */}
            <div className="absolute top-[24px] md:top-[31px] right-[16px] md:right-[24px]">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black bg-opacity-10 flex items-center justify-center">
                <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full ${c.iconBg} flex items-center justify-center`}>
                  {c.icon}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderStatsCards;
