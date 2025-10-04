import React, { useState } from 'react';

type TabKey = 'store' | 'documents' | 'notifications' | 'shipping';

type SettingsTabsProps = {
  storeTab: React.ReactNode;
  documentsTab: React.ReactNode;
  notificationsTab: React.ReactNode;
  shippingTab: React.ReactNode;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'store', label: 'Store Information' },
  { key: 'documents', label: 'Personal Info' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'shipping', label: 'Shipping Settings' },
];

const SettingsTabs: React.FC<SettingsTabsProps> = ({ storeTab, documentsTab, notificationsTab, shippingTab }) => {
  const [active, setActive] = useState<TabKey>('store');

  const renderContent = () => {
    switch (active) {
      case 'store':
        return storeTab;
      case 'documents':
        return documentsTab;
      case 'notifications':
        return notificationsTab;
      case 'shipping':
        return shippingTab;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-[25px] shadow-[0px_2px_16px_rgba(233,255,242,1)] overflow-hidden">
        {/* Tabs header inside card */}
        <div className="px-4 md:px-6 pt-4 md:pt-6">
          {/* Mobile: show a friendly select instead of scrollable tabs */}
          <div className="md:hidden">
            <label htmlFor="settings-mobile-tab" className="sr-only">Select settings section</label>
            <div className="relative">
              <select
                id="settings-mobile-tab"
                value={active}
                onChange={(e) => setActive(e.target.value as TabKey)}
                className="w-full appearance-none rounded-2xl border border-[#CDEFD9] bg-white pl-4 pr-14 py-3 text-[15px] font-semibold text-[#252C36] shadow-[0_0_0_3px_rgba(46,204,113,0.15)_inset] focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/40 focus:border-[#2ECC71]"
                aria-label="Settings Tabs Selector"
              >
                {tabs.map(t => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
              {/* Custom dropdown icon with padded, attractive chip */}
              <span
                className="pointer-events-none absolute inset-y-0 right-2 my-auto flex h-9 w-9 items-center justify-center rounded-full    text-[#252C36]"
                aria-hidden="true"
              >
                {/* Chevron Down Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </div>

          {/* Desktop/Tablet: classic tab list without horizontal scrolling */}
          <div className="hidden md:block border-b border-[#E0E4EC]" role="tablist" aria-label="Settings Tabs">
            <div className="flex flex-wrap gap-4 items-end">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  role="tab"
                  aria-selected={active === t.key}
                  className={
                    (active === t.key
                      ? 'text-[#2ECC71] border-b-2 border-[#2ECC71]'
                      : 'text-[#717B8C] border-b-2 border-transparent hover:text-[#2ECC71]/80') +
                    ' text-[15px] md:text-[16px] font-semibold -mb-[2px] px-3 py-3 transition-colors'
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content inside same card */}
        <div className="p-4 md:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsTabs;


