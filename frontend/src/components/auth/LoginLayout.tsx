import React from 'react';
import Footer from '../Footer';
import logoImg from '../../assets/images/Carriya logo 1.png';

export interface LoginLayoutProps {
  children: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  className?: string;
  imageHeight?: 'default' | 'tall';
}

const LoginLayout: React.FC<LoginLayoutProps> = ({
  children,
  imageSrc,
  imageAlt,
  className = '',
  imageHeight = 'default'
}) => {
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {/* Only show the top green bar, not the full header */}
      <div className="w-full h-[30px] md:h-[49px] bg-[#2ECC71] flex items-center justify-center text-white text-[11px] md:text-[20px] font-medium">
        Carriya - Buy , Sell And Carry
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-[120px] py-6">
        {/* Top row: Logo on left, Create account on right */}
        <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
          {/* Carriya Logo */}
          <div>
            <img
              src={logoImg}
              alt="Carriya Logo"
              className="w-[82px] h-[26px] md:w-[204px] md:h-[65px] object-contain"
            />
          </div>

          {/* Create account */}
          <div className="flex items-center gap-1 text-[11px] md:text-[30px] font-light text-black/60">
            <span className="whitespace-nowrap">Don't have an account?</span>
            <button
              onClick={() => window.location.href = '/signup'}
              className="text-black underline md:no-underline"
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Main content: Image on left, Form on right */}
        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Left Side - Image */}
          <div className="hidden md:block md:w-1/2 md:mb-0 md:pr-8">
            <div className={`relative rounded-[15px] md:rounded-[25px] overflow-hidden ${
              imageHeight === 'tall'
                ? 'md:h-[500px] -mt-40 lg:h-[700px]'
                : 'md:h-[400px] lg:h-[424px]'
            }`}>
              <img
                src={imageSrc}
                alt={imageAlt}
                className={`w-full h-full ${
                  imageHeight === 'tall' ? 'object-contain' : 'object-cover'
                }`}
              />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 md:pl-8">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginLayout;
