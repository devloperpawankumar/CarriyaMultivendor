import React from 'react';
import Footer from '../../components/Footer';
import ContactBanner from '../../assets/images/ContactUs banner.png';

import Instagram from '../../assets/images/Contactus/social-instagram.png';
import Twitter from '../../assets/images/Contactus/social-twitter.png';
import Facebook from '../../assets/images/Contactus/social-facebook.png';
import Linkedin from '../../assets/images/Contactus/social-linkedin.png';
import callicon from '../../assets/images/Contactus/CallContactus.png';
import emailicon from '../../assets/images/Contactus/Email.png';

const inputBase = 'w-full rounded-[10px] border border-[#E2E0E0] h-[60px] md:h-[80px] px-4 md:px-6 text-[16px] md:text-[20px] placeholder-[#949494] outline-none';

const ContactUs: React.FC = () => {
  return (
    <div className="w-full">
      <div className="w-full h-10 bg-carriya-green flex items-center justify-center text-white text-sm md:text-base font-medium">
        Carriya - Buy , Sell And Carry
      </div>

      {/* Banner with overlay and title */}
      <div className="w-full relative">
        <div className="w-full h-[180px] md:h-[218px] relative">
          <img src={ContactBanner} alt="Contact banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-[28px] md:text-[50px] font-semibold">Contact us</h1>
          </div>
        </div>
      </div>

      {/* Light green section with two cards - FLEXBOX LAYOUT */}
      <div className="w-full" style={{ backgroundColor: 'rgba(46, 204, 113, 0.18)' }}>
        <div className="mx-auto max-w-[1160px] px-4 md:px-0 py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Left card: Send Us Message */}
            <div className="bg-white rounded-[35px] p-5 md:p-8 flex-1">
              <div className="text-[20px] md:text-[25px] font-semibold mb-4 md:mb-6">Send Us Message</div>
              <div className="h-[2px] bg-[#DBD5D5] mb-5 md:mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div>
                  <label className="block text-[16px] md:text-[20px] font-medium mb-2">Name</label>
                  <input className={inputBase} placeholder="Enter your name" />
                </div>
                <div>
                  <label className="block text-[16px] md:text-[20px] font-medium mb-2">Phone Number</label>
                  <input className={inputBase} placeholder="Enter your phone" />
                </div>
              </div>
              <div className="mt-4 md:mt-5">
                <label className="block text-[16px] md:text-[20px] font-medium mb-2">Email</label>
                <input className={inputBase} placeholder="Enter your email" />
              </div>
              <div className="mt-4 md:mt-5">
                <label className="block text-[16px] md:text-[20px] font-medium mb-2">Your Message</label>
                <textarea
                  className={'w-full rounded-[10px] border border-[#E2E0E0] h-[170px] md:h-[170px] px-4 md:px-6 py-4 text-[16px] md:text-[20px] placeholder-[#949494] outline-none resize-none'}
                  placeholder="Write your message"
                />
              </div>
              <div className="mt-6 md:mt-8">
                <button className="w-[220px] h-[56px] md:w-[245px] md:h-[58px] bg-carriya-green text-[#F2F2F2] rounded-[15px] font-extrabold text-[16px] md:text-[20px]">
                  SEND MESSAGE
                </button>
              </div>
            </div>

            {/* Right card: Get in touch + socials */}
            <div className="bg-white rounded-[35px] p-5 md:p-8 md:w-[400px] md:h-[494px]">
              <div className="text-[20px] md:text-[25px] font-semibold">GET IN TOUCH</div>
              <div className="h-[1px] bg-[#DBD5D5] mt-4" />
              <div className="mt-6 flex items-start gap-4">
                <div className="w-[65px] h-[65px] rounded-full border border-[#949494] flex items-center justify-center">
                  <span className="text-[#2ECC71] font-semibold"><img src={emailicon} alt="email" className="w-[20px] h-[20px]" /></span>
                </div>
                <div>
                  <div className="text-[#818181] text-[22px] font-semibold leading-none">Email</div>
                  <div className="text-[#818181] text-[15px] mt-1">info@carryia.com</div>
                </div>
              </div>
              <div className="mt-6 flex items-start gap-4">
                <div className="w-[65px] h-[65px] rounded-full border border-[#949494] flex items-center justify-center">
                  <span className="text-[#2ECC71] font-semibold"><img src={callicon} alt="call" className="w-[20px] h-[20px]" /></span>
                </div>
                <div>
                  <div className="text-[#818181] text-[22px] font-semibold leading-none">Call Us</div>
                  <div className="text-[#818181] text-[15px] mt-1">+92 3146-045-045</div>
                </div>
              </div>

              <div className="h-[1px] bg-[#DBD5D5] mt-8" />
              <div className="mt-6 text-[20px] md:text-[25px] font-semibold">Follow Our Social Media Pages</div>
              <div className="mt-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-black/80 flex items-center justify-center">
                  <span className="text-white text-sm"><img src={Facebook} alt="facebook" className="w-[15px] h-[17px]" /></span>
                </div>
                <div className="w-10 h-10 rounded-full bg-black/80 flex items-center justify-center">
                  <span className="text-white text-sm"><img src={Linkedin} alt="linkedin" className="w-[15px] h-[16px]" /></span>
                </div>
                <div className="w-10 h-10 rounded-full bg-black/80 flex items-center justify-center">
                  <span className="text-white text-sm"><img src={Twitter} alt="twitter" className="w-[15px] h-[16px]" /></span>
                </div>
                <div className="w-10 h-10 rounded-full bg-black/80 flex items-center justify-center">
                  <span className="text-white text-sm"><img src={Instagram} alt="instagram" className="w-[15px] h-[16px]" /></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactUs;