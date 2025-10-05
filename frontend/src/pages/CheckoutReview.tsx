import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CategoryMenu from "../components/CategoryMenu";
import deleteIcon from "../assets/images/Layer_1.png";
import productImage from "../assets/images/Product/prodcut1.png";

const CheckoutReview: React.FC = () => {
  const [showCategories, setShowCategories] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <Header variant="simple" />

      <main className="max-w-[1245px] mx-auto px-4 md:px-6 py-8">
        {/* Browse Categories (hidden on mobile) */}
        <div className="relative mb-4 hidden md:block">
          <button onClick={() => setShowCategories((v) => !v)} className="inline-flex items-center space-x-2 text-[#2ECC71] font-bold text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Browse Categories</span>
          </button>
          {showCategories && (
            <div className="absolute z-50 mt-2">
              <CategoryMenu />
            </div>
          )}
        </div>
        <div className="hidden md:block">
{/* Shipping and Billing */}
<section className="rounded-[10px] border border-[#E0E0E0] p-5 md:p-6">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-[16px] font-medium text-[#555555]">Shipping and billing</h2>
    <button className="text-[#2ECC71] text-[15px] font-medium hover:underline">
      Edit
    </button>
  </div>

  {/* Name + Phone */}
  <div className="flex flex-wrap items-center gap-6 mb-4 text-[15px] text-[#767676]">
    <span>Muhammad Huzaifa</span>
    <span>0321 6121223</span>
  </div>

  {/* Address (everything in one row) */}
  <div className="flex flex-wrap items-center gap-2 text-[15px]">
    <span className="text-[#767676]">This is my address</span>
    <span className="text-[#2ECC71] font-medium">City</span>
    <span className="text-[#767676]">Lahore</span>
    <span className="text-[#2ECC71] font-medium">Province</span>
    <span className="text-[#767676]">Punjab</span>
    <span className="text-[#2ECC71] font-medium">Area</span>
    <span className="text-[#767676]">Wapdatown Phase 2</span>
  </div>
</section>



{/* Cart item summary */}
<section className="rounded-[10px] border border-[#E0E0E0] p-5 md:p-6 mt-6">
  {/* Header row */}
  <div className="flex items-center justify-between text-[14px] text-[#767676] mb-4">
    <div>My shop name &gt;</div>
    {/* Trash Icon */}
    <button className="text-[#9A9A9A] hover:text-red-500">
    <img src={deleteIcon} alt="delete" />
    </button>
  </div>

  {/* Divider */}
  <div className="w-full h-px bg-[#E0E0E0] mb-4" />

  {/* Product row */}
  <div className="flex items-center justify-between gap-6">
    {/* Product Image */}
    <img
      src={productImage}
      alt="Cotton Shirt"
      className="w-[70px] h-[70px] rounded object-cover bg-gray-100"
    />

    {/* Product Details */}
    <div className="flex flex-col flex-1">
      <div className="text-[16px] font-medium text-[#2ECC71]">
        Cotton Shirt Black XL size for men
      </div>
      <div className="text-[13px] text-[#767676]">
        Black color , XL Size , for men
      </div>
    </div>

    {/* Price (stacked) */}
    <div className="flex flex-col items-start min-w-[100px]">
      <span className="font-bold text-black">PKR 1200</span>
      <span className="line-through text-[#9A9A9A] text-[13px]">PKR 2000</span>
    </div>

    {/* Shipping (stacked) */}
    <div className="flex flex-col items-start min-w-[150px]">
      <span className="text-[#2ECC71] font-medium">
        Shipping Charges:{" "}
        <span className="text-black font-semibold">PKR 300</span>
      </span>
      <span className="text-[#767676] text-[13px]">Standard Delivery</span>
    </div>

    {/* Qty */}
    <div className="text-black font-medium">Qty 1</div>
  </div>
</section>




			{/* Proceed button */}
			<div className="flex justify-start mt-8">
				<button 
					onClick={() => navigate('/payment')}
					className="ml-auto w-[254px] h-[68px] rounded-[15px] bg-[#2ECC71] text-white text-[35px] font-medium"
				>
					Proceed
				</button>
			</div>
		</div>

		{/* Mobile layout  */}
		<div className="md:hidden space-y-4">
			{/* Shipping and billing card */}
			<section className="border border-[#949494] rounded-[10px] p-4" style={{ height: 130 }}>
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-[12px] text-[#949494]">Shipping and billing</h2>
					<button className="text-[#2ECC71] text-[12px]">Edit</button>
				</div>
				<div className="text-[12px] text-[#949494] mb-2">Muhammad Huzaifa</div>
				<div className="text-[12px] text-[#949494] leading-snug">This is my address  <span className="text-[#2ECC71]">City</span>  Lahore  <span className="text-[#2ECC71]">Province</span>  Punjab <span className="text-[#2ECC71]">Area</span>  Wapdatown Phase 2</div>
			</section>

			{/* Product summary card */}
			<section className="border border-[#949494] rounded-[10px] p-4" style={{ height: 150 }}>
				<div className="flex items-center justify-between mb-2">
					<span className="text-[10px] text-[#4D4D4D]">My shop Name</span>
					<button className="leading-none">
						<img src={deleteIcon} alt="delete" className="w-[16px] h-[16px]" />
					</button>
				</div>
				<div className="w-full h-px bg-[#949494] mb-3" />
				<div className="flex items-start gap-4">
					<div className="w-[76px] h-[73px] rounded border border-[#2ECC71] bg-[#C7FFDF] overflow-hidden flex items-center justify-center">
						<img src={productImage} alt="Cotton Shirt" className="w-full h-full object-cover" />
					</div>
					<div className="flex-1 min-w-0">
						<div className="text-[13px] font-medium text-[#2ECC71] leading-[1.3] mb-1 truncate">Cotton Shirt Black XL size for men</div>
						<div className="text-[10px] text-[#949494] leading-[1.3] mb-2">Black color , XL Size , for men</div>
						<div className="flex items-start justify-between">
							<div className="flex flex-col">
								<div className="text-[8px] font-bold text-black leading-none">PKR 1200</div>
								<div className="text-[5px] text-gray line-through leading-none mt-1">PKR -2000</div>
							</div>
							<div className="flex flex-col items-start">
								<div className="text-[8px] text-black"   ><span className="font-bold text-[#2ECC71]  ">Shipping Charges : </span>PKR 300</div>
              

								<div className="text-[5px] text-[#949494] text-center">  Standard delivery</div>
                
							</div>
						</div>
					</div>
					<div className="text-[12px] text-black whitespace-nowrap self-center">Qty 1</div>
				</div>
			</section>

			{/* Proceed to payment button */}
			<div className="flex justify-center mt-2">
				<button 
					onClick={() => navigate('/payment')}
					className="w-[180px] h-[35px] bg-[#2ECC71] text-white rounded-[5px] text-[18px] font-bold flex items-center justify-center"
				>
					Proceed to payment
				</button>
			</div>
		</div>
		</main>

      <Footer />
    </div>
  );
};

export default CheckoutReview;
