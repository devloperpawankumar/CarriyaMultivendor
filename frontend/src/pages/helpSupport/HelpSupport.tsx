import React from 'react';
import Footer from '../../components/Footer';
import ContactBanner from '../../assets/images/ContactUs banner.png';
import phoneIcon from '../../assets/images/Contactus/CallContactus.png';
import emailIcon from '../../assets/images/Contactus/Email.png';

function HelpSupport() {
  return (
    <div className="w-full">
      <div className="w-full h-10 bg-carriya-green flex items-center justify-center text-white text-sm md:text-base font-medium">
        Carriya - Buy , Sell And Carry
      </div>

      {/* Banner with overlay and title (mirrors ContactUs layout) */}
      <div className="w-full relative">
        <div className="w-full h-[180px] md:h-[218px] relative">
          <img src={ContactBanner} alt="Help & Support banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-[28px] md:text-[50px] font-semibold">Help & Support Center</h1>
          </div>
        </div>
      </div>

      {/* Light green section - centered help content per Figma */}
      <div className="w-full" style={{ backgroundColor: 'rgba(46, 204, 113, 0.18)' }}>
        <div className="mx-auto max-w-[1160px] px-4 md:px-0 py-8 md:py-12">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-[22px] text-[#2ECC71] md:text-[40px] font-medium">Need further assistance?</h2>
            <p className="mt-2 text-[16px] md:text-[30px] text-[#949494]">We are always here for your assistance .</p>

            <div className="mt-6 md:mt-8">
              <a
                className="inline-block bg-white text-[#2ECC71] text-[18px] md:text-[30px] font-medium px-6 md:px-8 py-3 md:py-4 rounded-[25px] shadow"
                href="/contact-us"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/contact-us';
                }}
              >
                Contact Us
              </a>
            </div>

            <div className="mt-8 md:mt-10 space-y-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded flex items-center justify-center">
                  <img
                    src={phoneIcon}
                    alt="Phone"
                    className="w-4 h-4 md:w-5 md:h-5"
                    style={{ filter: 'invert(53%) sepia(0%) saturate(0%) hue-rotate(176deg) brightness(92%) contrast(89%)' }}
                  />
                </div>
                <span className="text-[18px] md:text-[25px] text-[#949494]">+92 3146-045-045</span>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded flex items-center justify-center">
                  <img
                    src={emailIcon}
                    alt="Email"
                    className="w-4 h-4 md:w-5 md:h-5"
                    style={{ filter: 'invert(53%) sepia(0%) saturate(0%) hue-rotate(176deg) brightness(92%) contrast(89%)', color: '#949494' }}
                  />
                </div>
                <span className="text-[18px] md:text-[25px] text-[#949494]">info@carriya.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default HelpSupport;


