import React from "react";
import { Link } from "react-router-dom";
import Footerlogo from "../assets/images/Footerlogo.png";
import Facebook from "../assets/images/Facebooksocial.png";
import Twitter from "../assets/images/ThreadSocial.png";
import Instagram from "../assets/images/InstagramSocial.png";
import Youtube from "../assets/images/YoutubeSocail.png";
import Mastercard from "../assets/images/Payment/master card.svg";
import Visa from "../assets/images/Payment/Visa.svg";
import phoneIcon from "../assets/images/Call.svg";
import mailIcon from "../assets/images/Email.png";






const Footer: React.FC = () => {
  return (
    <footer className="text-white">
      {/* MAIN GREEN AREA */}
      <div className="bg-[#2ECC71]">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
            {/* grid with 4 columns on large, stacked on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 items-start">
              
              {/* Logo */}
              <div>
                <img
                  src={Footerlogo}
                  alt="Carriya Logo"
                  className="w-44 h-14 object-contain"
                />
                <p className="mt-4 text-sm text-white/90">
                  Carriya Buy , Sell And Carry
                </p>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-lg font-semibold">Company</h3>
                <ul className="mt-6 space-y-3 text-sm text-white/90">
                  <li><Link to="/blog" className="hover:underline">Blog</Link></li>
                  <li><Link to="/about" className="hover:underline">About Us</Link></li>
                  <li><Link to="/contact-us" className="hover:underline">Contact Us</Link></li>
                </ul>
              </div>

              {/* Information */}
              <div>
                <h3 className="text-lg font-semibold">Information</h3>
                <ul className="mt-6 space-y-3 text-sm text-white/90">
                  <li><Link to="/help-support" className="hover:underline">Help Center</Link></li>
                  <li><Link to="/return-refund-policy" className="hover:underline">Return & Refund</Link></li>
                  <li><Link to="/seller-signup" className="hover:underline">Become a seller</Link></li>
                </ul>
              </div>

              {/* Contact Us */}
              <div>
                <h3 className="text-lg font-semibold">Contact Us</h3>
                <div className="mt-6 text-sm text-white/90 space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={phoneIcon} alt="Phone" className="w-5 h-5" />
                    <span>+92 3146-045-045</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src={mailIcon} alt="Email" className="w-5 h-5" />
                    <span>info@carriya.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Icons Row – moved to bottom */}
            <div className="flex gap-4 mt-8">
              <a href="#"><img src={Instagram} alt="Instagram" className="w-12 h-12" /></a>
              <a href="#"><img src={Twitter} alt="Twitter" className="w-12 h-12" /></a>
              <a href="#"><img src={Facebook} alt="Facebook" className="w-12 h-12" /></a>
              <a href="#"><img src={Youtube} alt="YouTube" className="w-12 h-12" /></a>
            </div>
          </div>
        </div>

        {/* Mobile Layout  */}
        <div className="lg:hidden">
          <div className="px-[20px] py-5 max-[320px]:px-4">
            {/* Logo Section */}
            <div className="mb-6 max-[320px]:mb-5">
              <div className="bg-white rounded-[10px] w-[88px] h-[36.44px] mb-2 flex items-center justify-center max-[320px]:w-[84px] max-[320px]:h-[34px]">
                <img
                  src={Footerlogo}
                  alt="Carriya Logo"
                  className="w-[82.16px] h-[26.03px] object-contain max-[320px]:w-[78px] max-[320px]:h-[24px]"
                />
              </div>
              <p className="text-white/80 text-[7px] leading-[1.364] max-[320px]:text-[6.5px]">
                Carriya Buy , Sell And Carry
              </p>
            </div>

            {/* Content Grid - 3 columns */}
            <div className="grid grid-cols-3 gap-6 mb-8 max-[320px]:gap-4 max-[320px]:mb-6">
              {/* Company Column */}
              <div>
                <h3 className="text-white font-bold text-[13px] leading-[1.364] mb-3 max-[320px]:text-[12px]">Company</h3>
                <ul className="space-y-2 text-[10px] leading-[1.364] text-white/80 max-[320px]:text-[9px]">
                  <li><Link to="/blog" className="hover:underline">Blog</Link></li>
                  <li><Link to="/about" className="hover:underline">About Us</Link></li>
                  <li><Link to="/contact-us" className="hover:underline">Contact Us</Link></li>
                </ul>
              </div>

              {/* Information Column */}
              <div>
                <h3 className="text-white font-bold text-[13px] leading-[1.364] mb-3 max-[320px]:text-[12px]">Information</h3>
                <ul className="space-y-2 text-[10px] leading-[1.364] text-white/80 max-[320px]:text-[9px]">
                <li><Link to="/help-support" className="hover:underline">Help Center</Link></li>
                  <li><Link to="/return-refund-policy" className="hover:underline">Return & Refund</Link></li>
                  <li><Link to="/seller-signup" className="hover:underline">Become a seller</Link></li>
                </ul>
              </div>

              {/* Contact Us Column */}
              <div>
                <h3 className="text-white font-bold text-[13px] leading-[1.364] mb-3 max-[320px]:text-[12px]">Contact Us</h3>
                <div className="space-y-2 text-[10px] leading-[1.364] text-white/80 max-[320px]:text-[9px]">
                  <div className="flex items-center gap-2">
                    <img src={phoneIcon} alt="Phone" className="w-[13px] h-[13px] max-[320px]:w-3 max-[320px]:h-3" />
                    <span className="text-[9.1px] leading-[1.364] text-white/80 max-[320px]:text-[9px]">+92 3146-045-045</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src={mailIcon} alt="Email" className="w-[13px] h-[13px] max-[320px]:w-3 max-[320px]:h-3" />
                    <span>info@carryia.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-[13px] max-[320px]:gap-2.5">
              <a href="#" className="bg-white rounded-[8px] w-[24.59px] h-[24.59px] p-[3.51px] flex items-center justify-center max-[320px]:w-[22px] max-[320px]:h-[22px] max-[320px]:p-[3px]">
                <img src={Instagram} alt="Instagram" className="w-[14.64px] h-[14.64px] max-[320px]:w-[13px] max-[320px]:h-[13px]" />
              </a>
              <a href="#" className="bg-white rounded-[8px] w-[24.59px] h-[24.59px] p-[3.51px] flex items-center justify-center max-[320px]:w-[22px] max-[320px]:h-[22px] max-[320px]:p-[3px]">
                <img src={Twitter} alt="Twitter" className="w-[14.64px] h-[14.64px] max-[320px]:w-[13px] max-[320px]:h-[13px]" />
              </a>
              <a href="#" className="bg-white rounded-[8px] w-[24.59px] h-[24.59px] p-[3.51px] flex items-center justify-center max-[320px]:w-[22px] max-[320px]:h-[22px] max-[320px]:p-[3px]">
                <img src={Facebook} alt="Facebook" className="w-[14.64px] h-[14.64px] max-[320px]:w-[13px] max-[320px]:h-[13px]" />
              </a>
              <a href="#" className="bg-white rounded-[8px] w-[24.59px] h-[24.59px] p-[3.51px] flex items-center justify-center max-[320px]:w-[22px] max-[320px]:h-[22px] max-[320px]:p-[3px]">
                <img src={Youtube} alt="YouTube" className="w-[14.64px] h-[14.64px] max-[320px]:w-[13px] max-[320px]:h-[13px]" />
              </a>
            </div>
          </div>
        </div>
      </div>



      {/* BOTTOM DARK STRIP */}
      <div className="bg-[#354337]">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-white/70">
              Copyright © 2025 Carriya. All Right Reserved
            </div>

            <div className="hidden md:block flex-1 mx-8">
              <div className="w-full border-t border-white/20" />
            </div>

            <div className="flex items-center gap-4">
              {/* payment icons */}
              <div className="flex items-center gap-2">
                <img
                  src={Mastercard} // mastercard logo
                  alt="MasterCard"
                  className="w-8 h-6 object-contain"
                />
                <img
                  src={Visa} // visa logo
                  alt="Visa"
                  className="w-10 h-6 object-contain"
                />
              </div>

              <div className="text-sm text-white/90 font-medium">COD Service</div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="py-3" style={{ paddingLeft: `calc(20px + env(safe-area-inset-left))`, paddingRight: `calc(20px + env(safe-area-inset-right))` }}>
            <div className="text-xs text-white/70 text-center max-[320px]:text-[11px]">
            
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
