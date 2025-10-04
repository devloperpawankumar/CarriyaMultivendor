import React, { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { sellerMenuIcons, sellerMenuRoutes } from './menuConfig';

const MobileSellerHeader: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Mobile responsive work: compute active item from route (green when active)
  const activeKey =
    location.pathname.includes('/seller/manage-products') ? 'products' :
    location.pathname.includes('/seller/manage-orders') ? 'orders' :
    location.pathname.includes('/seller/manage-payments') ? 'payments' :
    location.pathname.includes('/seller/manage-reports') ? 'reports' :
    location.pathname.includes('/seller/settings') ? 'settings' :
    'dashboard';

  return (
    <>
      {/* Header */}
      <div
        className="lg:hidden w-full flex items-center justify-between"
        style={{
          height: 41,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 20,
        }}
      >
        <img
          src={require("../../assets/images/Carriya logo 1.png")}
          alt="Carriya"
          className="h-[29px] w-auto rounded-lg"
        />
        <div className="flex items-center gap-3">
          <img
            src={require("../../assets/images/Seller/rightTop.png")}
            alt="right-top"
            className="w-5 h-5"
          />
          <img
            src={require("../../assets/images/Seller/rightBottom.png")}
            alt="right-bottom"
            className="w-5 h-5"
          />
          {/* Hamburger */}
          <img
            src={require("../../assets/images/Seller/hamberger.png")}
            alt="menu"
            className="w-4 h-4 cursor-pointer"
            // Mobile responsive work: force hamburger to black on mobile, 
            style={{ filter: 'brightness(0) saturate(100%)' }}
            onClick={() => setMenuOpen(true)}
          />
        </div>
      </div>

      {/* Mobile responsive work: Fullscreen Menus */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Mobile responsive work:  */}
          <div className="w-full" style={{ height: 30, backgroundColor: '#2ECC71' }}>
            <div className="h-full flex items-center justify-center">
              <span className="text-white" style={{ fontSize: 12, fontWeight: 500 }}>
                Carryia - Buy , Sell And Carry
              </span>
            </div>
          </div>

          {/* Header area with logo and close */}
          <div className="flex items-center justify-between" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 8 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <div className="bg-white rounded-[25px]" style={{ width: 99, height: 41 }}>
                <div className="w-full h-full flex items-center justify-center">
                  <img src={require("../../assets/images/Carriya logo 1.png")} alt="Carriya" style={{ height: 29 }} />
                </div>
              </div>
            </div>
            <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="p-2">
              {/* Mobile responsive work: use provided close icon asset (png/jpg) */}
              <img src={require("../../assets/images/Seller/closeIcon.png")} alt="close" className="w-5 h-5" />
            </button>
          </div>

          {/* Separator lines (grey and green)  */}
          {/* <div className="w-full" style={{ height: 1, backgroundColor: '#949494' }} />
          <div className="w-[150px] ml-[26px]" style={{ height: 1, backgroundColor: '#2ECC71' }} /> */}

          {/* Menu items */}
          <div style={{ paddingLeft: 26, paddingRight: 26, paddingTop: 20 }}>
            <ul className="space-y-[18px]">
              {sellerMenuIcons.map((mi) => {
                const isActive = activeKey === mi.key;
                const textColor = isActive ? '#2ECC71' : '#000000';
                return (
                  <li key={mi.key}>
                    <button
                      type="button"
                      onClick={() => { const to = (sellerMenuRoutes as any)[mi.key]; if (to) navigate(to); setMenuOpen(false); }}
                      className="w-full flex items-center"
                      style={{ gap: 12 }}
                    >
                      {/* Mobile responsive work: menu icons black when idle, green when active */}
                      <img
                        src={mi.src}
                        alt={mi.label}
                        className="w-5 h-5"
                        style={isActive ? undefined : { filter: 'brightness(0) saturate(100%)' }}
                      />
                      <span className="font-semibold" style={{ fontSize: 23, color: textColor }}>{mi.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Divider */}
            {/* <hr className="my-5" /> */}
              <div className="w-full my-5" style={{ height: 1, backgroundColor: '#949494' }} />

            {/* Continue as buyer */}
            <button className="font-semibold underline " style={{ color: '#2ECC71', fontSize: 23 }}>
              Continue as buyer
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileSellerHeader;
