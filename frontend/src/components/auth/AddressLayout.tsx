import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../Footer';

interface AddressLayoutProps {
  children: React.ReactNode;
  imageSrc: string;
}

const AddressLayout: React.FC<AddressLayoutProps> = ({ children, imageSrc }) => {
  return (
    <div className="min-h-screen bg-white relative" style={{ width: '1440px', height: '1505px' }}>
      {/* Upper Header */}
      <div 
        className="absolute bg-[#2ECC71] flex items-center justify-center"
        style={{ 
          top: '0px', 
          left: '0px', 
          width: '1440px', 
          height: '49px' 
        }}
      >
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-white text-[15px] font-bold hover:underline">
            Home
          </Link>
          <Link to="/blogs" className="text-white text-[15px] font-bold hover:underline">
            Blogs
          </Link>
          <Link to="/about" className="text-white text-[15px] font-bold hover:underline">
            About Us
          </Link>
          <Link to="/contact" className="text-white text-[15px] font-bold hover:underline">
            Contact Us
          </Link>
        </div>
      </div>

      {/* Carriya Logo */}
      <div 
        className="absolute"
        style={{ 
          top: '114px', 
          left: '120px', 
          width: '204px', 
          height: '65px' 
        }}
      >
        <img
          src="/src/assets/images/Carriya logo 1.png"
          alt="Carriya Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Left Side - Image */}
      <div 
        className="absolute"
        style={{ 
          top: '260px', 
          left: '120px', 
          width: '574px', 
          height: '424px' 
        }}
      >
        <img
          src={imageSrc}
          alt="Seller Address Setup"
          className="w-full h-full object-cover rounded-[25px]"
        />
      </div>

      {/* Already have account section */}
      <div 
        className="absolute"
        style={{ 
          top: '127px', 
          left: '933px', 
          width: '434px', 
          height: '39px' 
        }}
      >
        <div className="flex items-center">
          <span className="text-black text-[30px] font-light leading-[35px]">
            Already have an account? Sign in
          </span>
          <div 
            className="ml-4 bg-black"
            style={{ width: '91px', height: '1.2px' }}
          ></div>
        </div>
      </div>

      {/* Form Content */}
      <div 
        className="absolute"
        style={{ 
          top: '260px', 
          left: '783px', 
          width: '583px' 
        }}
      >
        {children}
      </div>

      {/* Footer positioned at bottom */}
      <div 
        className="absolute"
        style={{ 
          top: '911px', 
          left: '0px', 
          width: '1443px', 
          height: '594px' 
        }}
      >
        <Footer />
      </div>
    </div>
  );
};

export default AddressLayout;
