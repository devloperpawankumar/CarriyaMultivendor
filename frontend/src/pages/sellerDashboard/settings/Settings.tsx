import React from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import SettingsTabs from './SettingsTabs';
import StoreInformation from './StoreInformation';
import BusinessDocuments from './BusinessDocuments';
import Notifications from './Notifications';
import ShippingSettings from './ShippingSettings';

const Settings: React.FC = () => {
  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      {/* Mobile responsive work: ensure heading is left-aligned and sizes scale across breakpoints */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="w-full text-left font-bold text-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight">Settings</h1>

        <div className="mt-4 sm:mt-6 overflow-x-auto">
          <SettingsTabs
            storeTab={<StoreInformation />}
            documentsTab={<BusinessDocuments />}
            notificationsTab={<Notifications />}
            shippingTab={<ShippingSettings />}
          />
        </div>
      </div>
    </SellerScaffold>
  );
};

export default Settings;


