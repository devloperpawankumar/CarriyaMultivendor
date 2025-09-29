import React from 'react';

type SellerLayoutProps = {
  sidebar: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
};

const SellerLayout: React.FC<SellerLayoutProps> = ({ sidebar, header, children }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[366px_1fr] gap-0">
      <aside className="bg-white overflow-hidden hidden lg:block">
        {sidebar}
      </aside>
      <section>
        {header ? (
          <div className="bg-white rounded-[25px] overflow-hidden mb-6">
            {header}
          </div>
        ) : null}
        {children}
      </section>
    </div>
  );
};

export default SellerLayout;


