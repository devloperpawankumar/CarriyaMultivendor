import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryMenu from '../components/CategoryMenu';
import homeIcon from '../assets/images/Payment/Frame (2).png';
import officeIcon from '../assets/images/Payment/Frame (3).png';

const Checkout: React.FC = () => {
  const [showCategories, setShowCategories] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      <Header variant="simple" />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Browse Categories (hidden on mobile) */}
        <div className="relative mb-4 hidden md:block">
          <button onClick={() => setShowCategories(v => !v)} className="inline-flex items-center space-x-2 text-[#2ECC71] font-bold text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Browse Categories</span>
          </button>
          {showCategories && (
            <div className="absolute z-50 mt-2">
              <CategoryMenu />
            </div>
          )}
        </div>
        <h1 className="sr-only">Checkout</h1>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          {/* Form grid similar to Figma fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
              <div className="h-[67px] rounded-[15px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 mb-6">
                <input className="w-full placeholder-[#B8B1B1] text-[20px] outline-none" placeholder="Full Name" />
              </div>
              <div className="h-[67px] rounded-[15px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 mb-6">
                <input className="w-full placeholder-[#B8B1B1] text-[20px] outline-none" placeholder="Contact Number" />
              </div>
              <div className="h-[67px] rounded-[15px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 mb-6">
                <input className="w-full placeholder-[#B8B1B1] text-[20px] outline-none" placeholder="Building / House no / Floor / Street" />
              </div>
              <div className="h-[67px] rounded-[15px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 mb-6">
                <input className="w-full placeholder-[#B8B1B1] text-[20px] outline-none" placeholder="Colony / Suburb / Locality / Landmark" />
              </div>
            </div>
            <div className="col-span-1">
              <div className="h-[67px] rounded-[15px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 mb-6 justify-between">
                <input className="w-full placeholder-[#B8B1B1] text-[20px] outline-none" placeholder="Select City" />
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="#B8B1B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="h-[67px] rounded-[15px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 mb-6 justify-between">
                <input className="w-full placeholder-[#B8B1B1] text-[20px] outline-none" placeholder="Select Province" />
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="#B8B1B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="h-[67px] rounded-[15px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 mb-6 justify-between">
                <input className="w-full placeholder-[#B8B1B1] text-[20px] outline-none" placeholder="Select Area" />
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="#B8B1B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="h-[67px] rounded-[15px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-6 mb-6">
                <input className="w-full placeholder-[#B8B1B1] text-[20px] outline-none" placeholder="Write your full address" />
              </div>
            </div>
          </div>

          {/* Controls below form like Figma: Home, Office, Next */}
          <div className="flex flex-wrap gap-4 items-center mt-8">
            <div className="flex items-center gap-2 border border-[#DADADA] rounded-[10px] shadow-sm px-4 py-3">
             <img src={homeIcon} alt="Home" />
              <span className="text-[#949494] text-[25px] leading-none">Home</span>
            </div>
            <div className="flex items-center gap-2 border border-[#DADADA] rounded-[10px] shadow-sm px-4 py-3">
           <img src={officeIcon} alt="Office" />
              <span className="text-[#949494] text-[25px] leading-none">Office</span>
            </div>
            <button onClick={() => window.location.assign('/checkout/review')} className="ml-auto w-[254px] h-[68px] rounded-[15px] bg-[#2ECC71] text-white text-[35px] font-medium">Next</button>
          </div>
        </div>

        {/* Mobile Layout - matches Figma design exactly */}
        <div className="md:hidden space-y-4">
          {/* Form fields in mobile layout */}
          <div className="space-y-4">
            <div className="h-[38px] rounded-[10px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px]">
              <input className="w-full placeholder-[#B8B1B1] text-[12px] outline-none" placeholder="Full Name" />
            </div>
            <div className="h-[38px] rounded-[10px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px]">
              <input className="w-full placeholder-[#B8B1B1] text-[12px] outline-none" placeholder="Contact Number" />
            </div>
            <div className="h-[38px] rounded-[10px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px]">
              <input className="w-full placeholder-[#B8B1B1] text-[12px] outline-none" placeholder="Building / House no / Floor / Street" />
            </div>
            <div className="h-[38px] rounded-[10px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px] justify-between">
              <input className="w-full placeholder-[#B8B1B1] text-[12px] outline-none" placeholder="Select City" />
              <span className="text-[#B8B1B1] text-[20px]">&gt;</span>
            </div>
            <div className="h-[38px] rounded-[10px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px] justify-between">
              <input className="w-full placeholder-[#B8B1B1] text-[12px] outline-none" placeholder="Select Province" />
              <span className="text-[#B8B1B1] text-[20px]">&gt;</span>
            </div>
            <div className="h-[38px] rounded-[10px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px] justify-between">
              <input className="w-full placeholder-[#B8B1B1] text-[12px] outline-none" placeholder="Select Area" />
              <span className="text-[#B8B1B1] text-[20px]">&gt;</span>
            </div>
            <div className="h-[38px] rounded-[10px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] flex items-center px-[18px]">
              <input className="w-full placeholder-[#B8B1B1] text-[12px] outline-none" placeholder="Write your full address" />
            </div>
          </div>

          {/* Home and Office buttons - mobile layout */}
          <div className="flex gap-4 justify-center mt-8">
            <div className="flex items-center gap-2 border border-[#B8B1B1] rounded-[10px] shadow-[1px_2px_4px_rgba(0,0,0,0.25)] px-4 py-2" style={{ width: 104.44, height: 37.78 }}>
              <img src={homeIcon} alt="Home" className="w-[25px] h-[25px]" />
              <span className="text-[#949494] text-[15px] font-medium">Home</span>
            </div>
            <div className="flex items-center gap-2 border border-[#B8B1B1] rounded-[10px] shadow-[1px_2px_4px_rgba(0,0,0,0.25)] px-4 py-2" style={{ width: 104.44, height: 37.78 }}>
              <img src={officeIcon} alt="Office" className="w-[24px] h-[24px]" />
              <span className="text-[#949494] text-[15px] font-medium">Office</span>
            </div>
          </div>

          {/* Next button - mobile layout */}
          <div className="flex justify-center mt-6">
            <button 
              onClick={() => window.location.assign('/checkout/review')} 
              className="w-[60px] h-[26px] rounded-[5px] bg-[#2ECC71] text-white text-[13px] font-bold flex items-center justify-center"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;


