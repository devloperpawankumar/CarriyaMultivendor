import React from "react";
import logo from "../assets/images/Carriya logo 1.png";
import electronics from "../assets/images/pexels-pixabay-356056.jpg";
import appliances from "../assets/images/pexels-pixabay-356056.jpg";
import model1 from "../assets/images/pexels-pixabay-356056.jpg";
import model2 from "../assets/images/pexels-pixabay-356056.jpg";
import heart from "../assets/images/Heart.png";
import banner from "../assets/images/bannerhero.png";

const Hero: React.FC = () => {
  return (
    <div
      className="w-full mt-4 flex justify-between items-center 
                 px-2 sm:px-6 py-4 sm:py-6 
                 rounded-lg relative overflow-hidden 
                 bg-cover bg-center"
      style={{ backgroundImage: `url(${banner})` }}
    >
      {/* Left Side Images */}
      <div className="flex gap-1 sm:gap-6">
        <div className="w-[44px] h-[62px] sm:w-[143.96px] sm:h-[205.66px] rounded-full overflow-hidden shadow-lg">
          <img src={electronics} alt="Electronics" className="w-full h-full object-cover" />
        </div>
        <div className="w-[44px] h-[62px] sm:w-[143.96px] sm:h-[205.66px] rounded-full overflow-hidden shadow-lg">
          <img src={appliances} alt="Appliances" className="w-full h-full object-cover" />
        </div>
      </div>
      <div
  className="
    bg-white text-center shadow-lg flex flex-col items-center justify-between
    rounded-[15px] sm:rounded-[40px] 
    px-2 sm:px-6 py-2 sm:py-6 
    relative overflow-hidden
    w-[120px] h-[90px] sm:w-[379px] sm:h-auto
  "
>
  {/* Logo */}
  <img src={logo} alt="Carryia Logo" className="h-4 sm:h-8 mb-1 sm:mb-2" />

  {/* Heading with heart */}
  <div className="relative flex items-center justify-center my-0.5 sm:my-2 w-full">
    <img
      src={heart}
      alt="heart"
      className="w-3 h-3 sm:w-6 sm:h-6 absolute left-1 sm:left-6 top-1/2 -translate-y-1/2"
    />
    <h2 className="text-[8px] sm:text-2xl font-light text-carriya-dark tracking-wide uppercase font-serif leading-snug break-words">
      GRAND <br />
      OPENING <br />
      SALE
    </h2>
  </div>

  {/* Button */}
  <button className="bg-green-500 text-black px-2 sm:px-6 py-0.5 sm:py-2 rounded-md text-[7px] sm:text-sm font-semibold hover:bg-green-600 transition">
    SHOP NOW
  </button>
</div>



      {/* Right Side Images */}
      <div className="flex gap-1 sm:gap-6">
        <div className="w-[44px] h-[62px] sm:w-[143.96px] sm:h-[205.66px] rounded-full overflow-hidden shadow-lg">
          <img src={model1} alt="Model 1" className="w-full h-full object-cover" />
        </div>
        <div className="w-[44px] h-[62px] sm:w-[143.96px] sm:h-[205.66px] rounded-full overflow-hidden shadow-lg">
          <img src={model2} alt="Model 2" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
