import React from 'react';
import SellerScaffold from '../../../components/seller/SellerScaffold';
import { sellerMenuIcons, sellerMenuRoutes } from '../../../components/seller/menuConfig';
import { useNavigate, useParams } from 'react-router-dom';
import prod1 from '../../../assets/images/Product/prodcut1.png';

const RestockProduct: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [quantity, setQuantity] = React.useState(100);
  const [currentStock] = React.useState(3);

  const product = {
    id: productId || '1',
    price: 15, // 15 PKR per unit
    thumbnailUrl: prod1,
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0) setQuantity(newQuantity);
  };

  const calculateTotalCost = () => quantity * product.price;

  return (
    <SellerScaffold menuIcons={sellerMenuIcons} menuRoutes={sellerMenuRoutes}>
      <div className="w-full px-3  md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col mb-4 md:mb-8 gap-3">
          <div className="flex flex-row items-center justify-between md:flex-row md:items-start gap-3">
            <div className="flex-1 py-3 mb-4">
              <h1 className="text-[20px] md:text-[32px] lg:text-[40px] font-bold text-black leading-none">Restock Product</h1>
              <p className="text-[#949494] text-[12px] md:text-[16px] mt-1">Manage Products &gt; Low Stock &gt; Restock Product</p>
            </div>
          </div>
        </div>

        {/* Main Content Container - Centered Card */}
        <div className="flex justify-center md:py-0 py-5">
          <div className="bg-white border border-[#B8B1B1] rounded-[25px] p-4 py-10 md:p-6 lg:p-8 shadow-[2px_4px_4px_0px_rgba(46,204,113,0.15)] max-w-[600px] w-full">
            <div className="flex flex-col items-center gap-6 md:gap-8">
              {/* Product Image Section - Centered */}
              <div className="flex justify-center">
                <div className="w-[120px] h-[120px] md:w-[153px] md:h-[150px] rounded-[20px] md:rounded-[33px] border border-[#B8B1B1] bg-[rgba(46,204,113,0.17)] flex items-center justify-center overflow-hidden">
                  <img 
                    src={product.thumbnailUrl} 
                    alt="Product" 
                    className="w-[90px] h-[90px] md:w-[120px] md:h-[120px] object-cover rounded-[8px] md:rounded-[10px]" 
                  />
                </div>
              </div>

               {/* Form Section */}
               <div className="w-full space-y-4 md:space-y-6">
                 {/* Add Quantity Section */}
                 <div className="bg-[#FAFAFA] border border-[#B8B1B1] rounded-[10px] p-4 md:p-6 h-[50px] md:h-[66px] flex items-center shadow-[1px_2px_4px_0px_rgba(46,204,113,0.2)]">
                   <div className="flex items-center justify-between w-full">
                     <h3 className="text-[16px] md:text-[20px] font-medium text-black">Add Quantity</h3>
                     
                     <div className="flex items-center gap-3 md:gap-4">
                       <div className="bg-white border bg-[rgba(46,204,113,0.17)] rounded-[5px] w-[40px] h-[35px] md:w-[49px] md:h-[43px] flex items-center justify-center">
                         <span className="text-[16px] md:text-[20px] font-medium text-black">{quantity}</span>
                       </div>
                       <div className="flex flex-col gap-1 md:gap-2">
                         <button
                           onClick={() => handleQuantityChange(quantity + 1)}
                           className="text-[#2ECC71] text-[18px] md:text-[23px] font-medium leading-none w-[10px] h-[20px] md:w-[13px] md:h-[27px] mt-1 md:mt-2 flex items-center justify-center"
                         >
                           +
                         </button>
                         <button
                           onClick={() => handleQuantityChange(quantity - 1)}
                           className="text-[#2ECC71] text-[24px] md:text-[30px] font-medium leading-none w-[8px] h-[28px] md:w-[9px] md:h-[35px] mb-0 md:mb-1 flex items-center justify-center"
                         >
                           -
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Current Stock Section */}
                 <div className="bg-[#FAFAFA] border border-[#B8B1B1] rounded-[10px] p-4 md:p-6 h-[50px] md:h-[66px] flex items-center shadow-[1px_2px_4px_0px_rgba(46,204,113,0.2)]">
                   <div className="flex items-center justify-between w-full">
                     <h3 className="text-[16px] md:text-[20px] font-medium text-black">Current Stock Available</h3>
                     <div className="text-[16px] md:text-[20px] font-medium text-black">
                       {currentStock}
                     </div>
                   </div>
                 </div>

                 {/* Restock Amount Section */}
                 <div className="space-y-2 md:space-y-3">
                   <h3 className="text-[18px] md:text-[22px] font-semibold text-black">Restock Amount</h3>
                   <div className="bg-[#FAFAFA] border border-[#B8B1B1] rounded-[10px] h-[50px] md:h-[66px] flex items-center shadow-[1px_2px_4px_0px_rgba(46,204,113,0.2)]">
                     <div className="flex items-center justify-start w-full px-4 md:px-6">
                       <div className="text-[16px] md:text-[20px] font-semibold text-black">
                         {Intl.NumberFormat('en-PK').format(calculateTotalCost())} PKR
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </SellerScaffold>
  );
};

export default RestockProduct;
