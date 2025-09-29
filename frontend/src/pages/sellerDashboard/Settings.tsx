import React from 'react';
import SellerScaffold from '../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../components/seller/menuConfig';

const Settings: React.FC = () => {
  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      {/* Mobile responsive work: ensure heading is left-aligned */}
      <h1 className="text-[40px] font-bold text-black text-left w-full">Settings</h1>
      {/* TODO: add settings content */}
    </SellerScaffold>
  );
};

export default Settings;


