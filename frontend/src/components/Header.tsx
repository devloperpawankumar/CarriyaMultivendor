import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logoImg from "../assets/images/Carriya logo 1.png";
import searchIcon from "../assets/images/searchicon.png";
import favIcon from "../assets/images/Favourite Products icon.png";
import cartIcon from "../assets/images/Cart icon (1).png";
import userIcon from "../assets/images/account.png";
import menuIcon from "../assets/images/MENU.png";
import CategoryMenu from "./CategoryMenu";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useClickOutside } from "../hooks/useClickOutside";


export type HeaderProps = {
  variant?: 'simple' | 'full';
};

function Header({ variant = 'simple' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { getItemCount } = useCart();
  const { count: favCount } = useFavorites();
  const navigate = useNavigate();
  const cartItemCount = getItemCount();
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const menuButtonRef = useRef<HTMLDivElement | null>(null);
  const menuDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeaderHeight(entry.contentRect.height);
      }
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useClickOutside(() => setIsMenuOpen(false), {
    enabled: isMenuOpen,
    include: [menuButtonRef, menuDropdownRef],
    escapeCloses: true,
    eventType: 'mousedown',
  });

  return (
    <>
    <header ref={headerRef} className="w-full fixed top-0 inset-x-0 z-40">
      {/* Top Bar (full only) */}
      {variant === 'full' && (
        <div className={`w-full ${isScrolled ? 'h-8' : 'h-10'} bg-carriya-green flex items-center justify-center text-white text-sm md:text-base font-medium`}>
          Carriya - Buy , Sell And Carry
        </div>
      )}
      

      {/* Main Header */}
      <div className="w-full bg-white shadow-sm">
        <div className={`max-w-7xl mx-auto px-4 md:px-8 ${isScrolled ? 'py-2 md:py-3' : 'py-3 md:py-4'}` }>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src={logoImg}
                alt="Carriya Logo"
                className={`${isScrolled ? 'w-28 md:w-40' : 'w-32 md:w-[204px]'} h-auto object-contain`}
              />
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className={`flex items-center bg-white border border-gray-300 rounded-2xl ${isScrolled ? 'px-3 py-1.5' : 'px-4 py-2'} shadow-sm w-full`}>
                <input
                  type="text"
                  placeholder="Search For Products"
                  className="flex-1 outline-none text-sm md:text-base text-carriya-gray placeholder-carriya-gray"
                />
                <div className={`${isScrolled ? 'w-9 h-9' : 'w-10 h-10'} bg-carriya-green rounded-lg flex items-center justify-center ml-2`}>
                  <img
                    src={searchIcon}
                    alt="Search"
                    className="w-5 h-5 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Right Side Icons */}
            <div className={`flex items-center ${isScrolled ? 'space-x-3 md:space-x-4' : 'space-x-4 md:space-x-6'}` }>
              <button className="relative p-1.5 md:p-2 hover:bg-gray-100 rounded-lg" onClick={() => navigate('/favorites')}>
                <img
                  src={favIcon}
                  alt="Favorites"
                  className="w-5 h-5 md:w-6 md:h-6 object-contain"
                />
                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-carriya-green text-white text-[10px] md:text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => navigate('/cart')}
                className="relative p-1.5 md:p-2 hover:bg-gray-100 rounded-lg"
              >
                <img
                  src={cartIcon}
                  alt="Cart"
                  className="w-5 h-5 md:w-6 md:h-6 object-contain"
                />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-carriya-green text-white text-[10px] md:text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              <div className="hidden md:flex items-center space-x-2">
                <img
                  src={userIcon}
                  alt="Account"
                  className="w-6 h-6 object-contain"
                />
                <span className={`text-carriya-dark font-medium text-sm ${isScrolled ? 'md:text-base' : 'md:text-lg'}`}>
                  Account
                </span>
              </div>

              {/* Mobile hamburger (always visible on mobile). Black icon */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 6h18M3 12h18M3 18h18" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation (desktop only, full variant) */}
        {variant === 'full' && (
          <div className="bg-carriya-green hidden md:block relative">
            <div className={`max-w-7xl mx-auto px-8 ${isScrolled ? 'py-2' : 'py-3'} flex items-center justify-between`}>
              {/* Browse Categories */}
              <div
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                ref={menuButtonRef}
                className={`flex items-center space-x-2 ${isScrolled ? 'px-3 py-1.5' : 'px-4 py-2'} cursor-pointer 
                           rounded-lg text-white font-bold text-sm
                           hover:bg-carriya-green transition`}
              >
                <img src={menuIcon} alt="Menu" className="w-5 h-5 object-contain" />
                <span>Browse Categories</span>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center space-x-8">
                <Link to="/" className="text-white font-bold text-sm hover:text-gray-200">Home</Link>
                <Link to="/my-orders" className="text-white font-bold text-sm hover:text-gray-200">My Orders</Link>
                <Link to="/about" className="text-white font-bold text-sm hover:text-gray-200">About Us</Link>
                <Link to="/contact-us" className="text-white font-bold text-sm hover:text-gray-200">Contact Us</Link>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-white text-carriya-dark px-4 py-2 rounded-lg font-medium text-xs hover:bg-gray-100"
                >
                  Sign-Up
                </button>
                <button className="bg-white text-carriya-dark px-4 py-2 rounded-lg font-medium text-xs hover:bg-gray-100" 
                onClick={()=>navigate("/login")}>Log-In</button>
                <button 
                  onClick={() => navigate('/seller-signup')}
                  className="bg-carriya-dark text-white px-4 py-2 rounded-lg font-medium text-xs hover:bg-gray-800"
                >
                  Become a seller
                </button>
              </div>
            </div>

            {/* Dropdown Category Menu */}
            {isMenuOpen && (
              <div className="absolute left-8 top-full mt-2 z-50" ref={menuDropdownRef}>
                <CategoryMenu />
              </div>
            )}
          </div>
        )}

        {/* Mobile Search (under logo) always for mobile */}
        <div className="px-4 py-2 md:hidden">
          <div className="flex items-center bg-white border border-gray-300 rounded-xl px-3 py-2 shadow-sm w-full">
            <input
              type="text"
              placeholder="Search For Products"
              className="flex-1 outline-none text-sm text-carriya-gray placeholder-carriya-gray"
            />
            <div className="w-9 h-9 bg-carriya-green rounded-md flex items-center justify-center ml-2">
              <img src={searchIcon} alt="Search" className="w-5 h-5 object-contain" />
            </div>
          </div>
        </div>

        {/* Mobile Menu Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* Header with logo + close */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <img
                  src={logoImg}
                  alt="Carriya Logo"
                  className="w-28 h-auto object-contain"
                />
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                ✕
              </button>
            </div>

          <nav className="px-6 py-6 space-y-6 text-black flex flex-col">
      {/* Menu Links */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive
            ? "block font-semibold text-green-600 border-b border-green-600 w-fit"
            : "block font-medium"
        }
      >
        Home
      </NavLink>

      <NavLink
        to="/my-orders"
        className={({ isActive }) =>
          isActive
            ? "block font-semibold text-green-600 border-b border-green-600 w-fit"
            : "block font-medium"
        }
      >
        My Orders
      </NavLink>

      <NavLink
        to="/blog"
        className={({ isActive }) =>
          isActive
            ? "block font-semibold text-green-600 border-b border-green-600 w-fit"
            : "block font-medium"
        }
      >
        Blogs
      </NavLink>

      <NavLink
        to="/about"
        className={({ isActive }) =>
          isActive
            ? "block font-semibold text-green-600 border-b border-green-600 w-fit"
            : "block font-medium"
        }
      >
        About Us
      </NavLink>

      <NavLink
        to="/contact-us"
        className={({ isActive }) =>
          isActive
            ? "block font-semibold text-green-600 border-b border-green-600 w-fit"
            : "block font-medium"
        }
      >
        Contact Us
      </NavLink>

      <NavLink
        to="/seller-signup"
        className={({ isActive }) =>
          isActive
            ? "block font-semibold text-green-600 border-b border-green-600 w-fit"
            : "block font-medium"
        }
      >
        Sell
      </NavLink>

      {/* Footer Buttons */}
      <div className="pt-4 border-t flex items-center gap-2">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            isActive
              ? "text-green-600 font-semibold border-b border-green-600"
              : "text-green-600 font-medium"
          }
        >
          Sign in
        </NavLink>
        <span>or</span>
        <NavLink
          to="/signup"
          className={({ isActive }) =>
            isActive
              ? "text-green-600 font-semibold border-b border-green-600"
              : "text-green-600 font-medium"
          }
        >
          Register
        </NavLink>
      </div>
    </nav>
          </div>
        )}
  
      </div>
    </header>
    <div style={{ height: headerHeight }} />
    </>
  );
}

export default Header;
