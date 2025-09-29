import React from 'react';
import ProductStatCard from '../../../components/seller/ProductStatCard';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import { useNavigate } from 'react-router-dom';

// ✅ Replace these paths with your actual icons
import addIcon from '../../../assets/images/Seller/Add product.png';
import myProductIcon from '../../../assets/images/Seller/Myproduct.png';
import editDraftIcon from '../../../assets/images/Seller/EditProduct.png';
import lowStockIcon from '../../../assets/images/Seller/lowStcokk.png';


const ManageProducts: React.FC = () => {
  const navigate = useNavigate();
  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      {/* Mobile responsive work: ensure heading is left-aligned */}
      <h1 className="text-[22px] md:text-[28px] lg:text-[32px] font-bold text-black mb-4 md:mb-10 text-left w-full">
        Manage Products
      </h1>

      <div
        className="
          grid
          grid-cols-1
          gap-y-8 md:gap-y-16 md:gap-x-16
          lg:grid-cols-3
          justify-items-center
          w-full
        "
        style={{ paddingLeft: 16, paddingRight: 16 }}
      >
        {/* Add Product */}
        <ProductStatCard
          title="Add Product"
          icon={<img src={addIcon} alt="add" className="w-[34px] h-[34px] md:w-[37px] md:h-[37px]" />}
          buttonText="Add Product"
          onClick={() => navigate('/seller/manage-products/add-product')}
        />

        {/* My Product */}
        <ProductStatCard
          title="My Product"
          icon={<img src={myProductIcon} alt="my product" className="w-[34px] h-[34px] md:w-[37px] md:h-[37px]" />}
          buttonText="My Product"
          onClick={() => navigate('/seller/manage-products/my-products')}
        />

        {/* Edit Draft */}
        <ProductStatCard
          title="Edit Draft"
          icon={<img src={editDraftIcon} alt="edit draft" className="w-[34px] h-[34px] md:w-[37px] md:h-[37px]" />}
          buttonText="Edit Draft"
          onClick={() => navigate('/seller/manage-products/edit-draft')}
        />

        {/* Low Stock — center on 2nd row */}
        <ProductStatCard
          className="lg:col-start-2"  // ✅ middle column when 3-col grid
          title="Low Stock"
          icon={<img src={lowStockIcon} alt="low stock" className="w-[34px] h-[34px] md:w-[74px] md:h-[74px]" />}
          buttonText="Low Stock"
          subtitle="3 Products Need To Restore"
          onClick={() => navigate('/seller/manage-products/low-stock')}
        />
      </div>
    </SellerScaffold>
  );
};

export default ManageProducts;


