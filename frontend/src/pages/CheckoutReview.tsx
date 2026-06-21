import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CategoryMenu from "../components/CategoryMenu";
import { useClickOutside } from "../hooks/useClickOutside";
import deleteIcon from "../assets/images/Layer_1.png";
import { useCart } from "../contexts/CartContext";
import { loadBuyerInfo, BuyerInfo, fetchBuyerInfoFromApi } from "../services/checkoutService";
import { useAuth } from "../contexts/AuthContext";

const CheckoutReview: React.FC = () => {
  const [showCategories, setShowCategories] = useState(false);
  const browseButtonRef = useRef<HTMLButtonElement | null>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { items, totals, removeItem } = useCart();
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo | null>(null);
  const { isAuthenticated, user } = useAuth();
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    setBuyerInfo(loadBuyerInfo());
  }, [user?.email]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let ignore = false;
    setLoadingAddress(true);
    fetchBuyerInfoFromApi()
      .then((data) => {
        if (!ignore && data) {
          setBuyerInfo(data);
        }
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch buyer info', error);
        }
      })
      .finally(() => {
        if (!ignore) setLoadingAddress(false);
      });
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, user?.email]);

  const formatPKR = (value: number) => `PKR ${value.toLocaleString()}`;
  const hasItems = items.length > 0;
  const canProceed = hasItems && !!buyerInfo;

  const handleProceed = () => {
    if (!canProceed) return;
    navigate("/payment");
  };
  
  useClickOutside(() => setShowCategories(false), {
    enabled: showCategories,
    include: [browseButtonRef, categoriesDropdownRef],
    escapeCloses: true,
    eventType: 'mousedown',
  });
  return (
    <div className="min-h-screen bg-white">
      <Header variant="simple" />

      <main className="max-w-[1245px] mx-auto px-4 md:px-6 py-8">
        {/* Browse Categories (hidden on mobile) */}
        <div className="relative mb-4 hidden md:block">
          <button ref={browseButtonRef} onClick={() => setShowCategories((v) => !v)} className="inline-flex items-center space-x-2 text-[#2ECC71] font-bold text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Browse Categories</span>
          </button>
          {showCategories && (
            <div className="absolute z-50 mt-2" ref={categoriesDropdownRef}>
              <CategoryMenu />
            </div>
          )}
        </div>
        <div className="hidden md:block">
          {/* Shipping and Billing */}
          <section className="rounded-[10px] border border-[#E0E0E0] p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-medium text-[#555555]">Shipping and billing</h2>
              <button className="text-[#2ECC71] text-[15px] font-medium hover:underline" onClick={() => navigate('/checkout')}>
                Edit
              </button>
            </div>

            {buyerInfo ? (
              <>
                <div className="flex flex-wrap items-center gap-6 mb-4 text-[15px] text-[#767676]">
                  <span>{buyerInfo.fullName}</span>
                  <span>{buyerInfo.contactNumber}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[15px] text-[#767676]">
                <span className="text-[#2ECC71] font-medium">Street Address</span>
                  <span>{buyerInfo.streetAddress}</span>
                  <span className="text-[#2ECC71] font-medium">Locality</span>
                  <span>{buyerInfo.locality}</span>
                  <span className="text-[#2ECC71] font-medium">City</span>
                  <span>{buyerInfo.city}</span>
                  <span className="text-[#2ECC71] font-medium">Province</span>
                  <span>{buyerInfo.province}</span>
                  <span className="text-[#2ECC71] font-medium">Area</span>
                  <span>{buyerInfo.area}</span>
                  <span>{buyerInfo.addressNotes}</span>
                </div>
              </>
            ) : loadingAddress ? (
              <p className="text-[15px] text-[#9A9A9A]">Loading saved address…</p>
            ) : (
              <p className="text-[15px] text-[#9A9A9A]">No shipping details found. Please add them on the checkout page.</p>
            )}
          </section>

          {/* Cart item summary */}
          {hasItems ? (
            items.map((item) => (
              <section key={item.id} className="rounded-[10px] border border-[#E0E0E0] p-5 md:p-6 mt-6">
                <div className="flex items-center justify-between text-[14px] text-[#767676] mb-4">
                  <div>{item.shopName || "Store"} &gt;</div>
                  <button className="text-[#9A9A9A] hover:text-red-500" onClick={() => removeItem(item.id)}>
                    <img src={deleteIcon} alt="delete" />
                  </button>
                </div>

                <div className="w-full h-px bg-[#E0E0E0] mb-4" />

                <div className="flex items-center justify-between gap-6">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-[70px] h-[70px] rounded object-cover bg-gray-100"
                  />

                  <div className="flex flex-col flex-1">
                    <div className="text-[16px] font-medium text-[#2ECC71]">{item.title}</div>
                    <div className="text-[13px] text-[#767676]">
                      {[
                        item.color ? `${item.color} color` : null,
                        item.size ? `${item.size} size` : null,
                      ]
                        .filter(Boolean)
                        .join(" , ") || "No variant selected"}
                    </div>
                  </div>

                  <div className="flex flex-col items-start min-w-[100px]">
                    <span className="font-bold text-black">{formatPKR(item.price)}</span>
                    {item.compareAt && (
                      <span className="line-through text-[#9A9A9A] text-[13px]">{formatPKR(item.compareAt)}</span>
                    )}
                  </div>

                    <div className="flex flex-col items-start min-w-[150px]">
                      <span className="text-[#2ECC71] font-medium">
                        Shipping Charges: <span className="text-black font-semibold">{formatPKR(totals.shipping)}</span>
                      </span>
                      <span className="text-[#767676] text-[13px]">Standard Delivery</span>
                    </div>

                  <div className="text-black font-medium">Qty {item.qty}</div>
                </div>
              </section>
            ))
          ) : (
            <section className="rounded-[10px] border border-dashed border-[#E0E0E0] p-8 mt-6 text-center text-[#767676]">
              Your cart is empty. Please add items before reviewing your order.
            </section>
          )}

          <div className="flex justify-start mt-8">
            <button
              onClick={handleProceed}
              disabled={!canProceed}
              className={`ml-auto w-[254px] h-[68px] rounded-[15px] text-white text-[35px] font-medium ${
                canProceed ? "bg-[#2ECC71]" : "bg-[#B8B1B1] cursor-not-allowed"
              }`}
            >
              Proceed
            </button>
          </div>
        </div>

        {/* Mobile layout  */}
        <div className="md:hidden space-y-4">
          <section className="border border-[#949494] rounded-[10px] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[12px] text-[#949494]">Shipping and billing</h2>
              <button className="text-[#2ECC71] text-[12px]" onClick={() => navigate('/checkout')}>Edit</button>
            </div>
            {buyerInfo ? (
              <>
                <div className="text-[12px] text-[#949494] mb-2">{buyerInfo.fullName}</div>
                <div className="text-[12px] text-[#949494] leading-snug">
                  {buyerInfo.streetAddress} • {buyerInfo.locality} • {buyerInfo.city}, {buyerInfo.province} • {buyerInfo.area}
                </div>
                <div className="text-[11px] text-[#2ECC71] mt-1">{buyerInfo.contactNumber}</div>
              </>
            ) : loadingAddress ? (
              <p className="text-[12px] text-[#9A9A9A]">Loading saved address…</p>
            ) : (
              <p className="text-[12px] text-[#9A9A9A]">No shipping info saved yet.</p>
            )}
          </section>

          {hasItems ? (
            items.map((item) => (
              <section key={item.id} className="border border-[#949494] rounded-[10px] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-[#4D4D4D]">{item.shopName || "Store"}</span>
                  <button className="leading-none" onClick={() => removeItem(item.id)}>
                    <img src={deleteIcon} alt="delete" className="w-[16px] h-[16px]" />
                  </button>
                </div>
                <div className="w-full h-px bg-[#949494] mb-3" />
                <div className="flex items-start gap-4">
                  <div className="w-[76px] h-[73px] rounded border border-[#2ECC71] bg-[#C7FFDF] overflow-hidden flex items-center justify-center">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#2ECC71] leading-[1.3] mb-1 truncate">{item.title}</div>
                    <div className="text-[10px] text-[#949494] leading-[1.3] mb-2">
                      {[
                        item.color ? `${item.color} color` : null,
                        item.size ? `${item.size} size` : null,
                      ]
                        .filter(Boolean)
                        .join(" , ") || "No variant selected"}
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <div className="text-[8px] font-bold text-black leading-none">{formatPKR(item.price)}</div>
                        {item.compareAt && <div className="text-[5px] text-gray line-through leading-none mt-1">{formatPKR(item.compareAt)}</div>}
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="text-[8px] text-black">
                          <span className="font-bold text-[#2ECC71]">Shipping Charges : </span>{formatPKR(totals.shipping)}
                        </div>
                        <div className="text-[5px] text-[#949494] text-center">Standard delivery</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-[12px] text-black whitespace-nowrap self-center">Qty {item.qty}</div>
                </div>
              </section>
            ))
          ) : (
            <section className="border border-dashed border-[#949494] rounded-[10px] p-6 text-center text-[#949494]">
              Your cart is empty. Add items to continue.
            </section>
          )}

          <div className="flex justify-center mt-2">
            <button
              onClick={handleProceed}
              disabled={!canProceed}
              className={`w-[180px] h-[35px] text-white rounded-[5px] text-[18px] font-bold flex items-center justify-center ${
                canProceed ? "bg-[#2ECC71]" : "bg-[#B8B1B1] cursor-not-allowed"
              }`}
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


