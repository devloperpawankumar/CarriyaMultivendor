import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const sampleImage = require('../assets/images/Product/prodcut1.png');

const MyOrders: React.FC = () => {
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const reviewSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showReview && reviewSectionRef.current) {
      try {
        reviewSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {}
    }
  }, [showReview]);
  return (
    <div className="min-h-screen bg-white">
      <Header variant="full" />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Page Title */}
        <h1 className="md:text-[40px] text-[20px] font-semibold text-black mb-[36px]">Orders details</h1>
        
        {/* Order Card -  (desktop only) */}
        <div className="hidden md:block w-[1225px] h-[278px] border border-[#B8B1B1] rounded-[12px] bg-white relative">
          {/* Shop Name - */}
          <div className="absolute left-[28.5px] top-[24px] w-[107px] h-[21px]">
            <span className="text-[14px] font-bold text-[#767676]" style={{fontFamily: 'Lato', lineHeight: '1.5em'}}>My shop name &gt;</span>
          </div>
          
          {/* Quantity - */}
          <div className="absolute left-[1134px] top-[107px] w-[50px] h-[30px]">
            <span className="text-[20px] font-medium text-black" style={{fontFamily: 'Lato', lineHeight: '1.5em'}}>Qty 1</span>
          </div>
          
          {/* Divider Line - */}
          <div className="absolute left-0 top-[61px] w-[1225px] h-[1px] bg-[#B8B1B1]"></div>
          
          {/* Product Image */}
          <div className="absolute left-[31px] top-[78.5px] w-[96px] h-[96px] bg-gray-200 rounded-[4px] overflow-hidden">
            <img src={sampleImage} alt="Product" className="w-full h-full object-cover" />
          </div>
          
          {/* Product Title  */}
          <div className="absolute left-[156px] top-[81px] w-[307px] h-[26px]">
            <h3 className="text-[20px] font-medium text-[#2ECC71]" style={{fontFamily: 'Roboto', lineHeight: '1.3em'}}>Cotton Shirt Black XL size for men</h3>
          </div>
          
          {/* Product Description*/}
          <div className="absolute left-[160.5px] top-[122px] w-[157px] h-[16px]">
            <p className="text-[12px] font-normal text-[#949494]" style={{fontFamily: 'Roboto', lineHeight: '1.3em'}}>Black color , XL Size , for men</p>
          </div>
          
          {/* Price */}
          <div className="absolute left-[523px] top-[90px] w-[90px]">
            <span className="text-[20px] font-bold text-black" style={{fontFamily: 'Roboto', lineHeight: '1.3em'}}>PKR 1200</span>
          </div>
          
          {/* Old Price  */}
          <div className="absolute left-[519px] top-[122px] w-[97px] h-[30px]">
            <span className="text-[20px] font-normal text-[#787A80] line-through" style={{fontFamily: 'Lato', lineHeight: '1.5em'}}>PKR -2000</span>
          </div>
          
          {/* Order Status  */}
          <div className="absolute left-[747px] top-[90px] w-[153px]">
            <span className="text-[19px] font-bold text-[#2ECC71]" style={{fontFamily: 'Roboto', lineHeight: '1.3em'}}>Order Completed</span>
          </div>
          
          {/* Successfully Text  */}
          <div className="absolute left-[747px] top-[122px] w-[113px] h-[30px]">
            <span className="text-[20px] font-normal text-[#787A80]" style={{fontFamily: 'Roboto', lineHeight: '1.5em'}}>Successfully</span>
          </div>
          
          {/* Review Button*/}
          <button
            type="button"
            onClick={() => setShowReview(true)}
            className="absolute left-[425px] top-[193px] w-[540px] h-[55px] bg-[#2ECC71] rounded-[10px] flex items-center justify-center"
          >
            <span className="text-[30px] font-medium text-white" style={{fontFamily: 'Roboto', lineHeight: '1.171875em'}}>Write your review</span>
          </button>
        </div>

        {/* Mobile Card - clean responsive layout */}
        <div className="md:hidden mt-4">
          <div className="rounded-2xl border border-[#B8B1B1] bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-semibold text-[#767676]">My shop name &gt;</span>
              <span className="text-base font-medium">Qty 1</span>
            </div>
            <div className="h-px bg-[#B8B1B1]" />
            <div className="p-4 flex items-start gap-3">
              <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={sampleImage} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[18px] font-medium text-[#2ECC71] truncate">Cotton Shirt Black XL size for men</h3>
                <p className="text-xs text-[#949494] mt-1">Black color , XL Size , for men</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold">PKR 1200</div>
                    <div className="text-sm text-[#787A80] line-through -mt-0.5">PKR -2000</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-[#2ECC71]">Order Completed</div>
                    <div className="text-sm text-[#787A80] -mt-0.5">Successfully</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <button
                type="button"
                onClick={() => setShowReview(true)}
                className="w-full h-12 bg-[#2ECC71] text-white rounded-xl text-lg font-semibold"
              >
                Write your review
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section below card desktop only */}
        {showReview && (
        <div ref={reviewSectionRef} className="hidden md:block relative mt-8 w-[1225px] h-[420px] bg-white border border-[#2ECC71] rounded-[10px]">
          {/* Avatar */}
          <div className="absolute left-[24px] top-[24px] w-[69px] h-[69px] rounded-full bg-[#2ECC71] flex items-center justify-center">
            <svg width="37" height="46" viewBox="0 0 37 46" fill="none">
              <path d="M18.5 0C23.56 0 27.67 4.11 27.67 9.17C27.67 14.23 23.56 18.33 18.5 18.33C13.44 18.33 9.33 14.23 9.33 9.17C9.33 4.11 13.44 0 18.5 0Z" fill="#101820"/>
              <path d="M0 46C0 36.52 8.52 28 18.5 28C28.48 28 37 36.52 37 46" fill="#101820"/>
            </svg>
          </div>

          {/* Name + subtext */}
          <div className="absolute left-[106px] top-[30px]">
            <span className="text-[25px] font-semibold text-black" style={{fontFamily: 'Roboto', lineHeight: '1.171875em'}}>Account Name</span>
          </div>
          <div className="absolute left-[106px] top-[65px]">
            <span className="text-[10px] font-medium text-black" style={{fontFamily: 'Roboto', lineHeight: '1.171875em'}}>Your are posting review publicly on Carryia</span>
          </div>

          {/* Stars row */}
            <div className="absolute left-[501px] top-[93px] flex" style={{gap: '22.39px'}}>
              {Array.from({ length: 5 }).map((_, i) => {
                const starIndex = i + 1;
                const active = (hoverRating || rating) >= starIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Rate ${starIndex} star${starIndex > 1 ? 's' : ''}`}
                    onMouseEnter={() => setHoverRating(starIndex)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starIndex)}
                    className="p-0 m-0 bg-transparent border-0 cursor-pointer"
                    style={{ width: '59.69px', height: '54.76px' }}
                  >
                    <svg width="59.69" height="54.76" viewBox="0 0 60 55">
                      <path d="M30 3l7.9 16 17.6 2.6-12.7 12.1 3 17.5L30 42.9 13.2 51.2l3-17.5L3.5 21.6 21.1 19 30 3z" fill={active ? '#2ECC71' : '#FFFFFF'} stroke={active ? '#2ECC71' : '#949494'} strokeWidth="1" />
                    </svg>
                  </button>
                );
              })}
            </div>

          {/* Review box */}
            <div
              className="absolute left-[297px] top-[191px] w-[797px] h-[195px] rounded-[10px] bg-white"
              style={{ boxShadow: '2px 3px 4px 0px rgba(46, 204, 113, 0.25)', border: '1px solid #E2E0E0' }}
            >
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review"
                className="absolute left-[36px] top-[27px] text-[20px] text-[#949494] outline-none resize-none"
                style={{ fontFamily: 'Roboto', lineHeight: '1.171875em', width: '725px', height: '141px' }}
              />
            </div>
        </div>
        )}

        {/* Mobile Review Section */}
        {showReview && (
          <div className="md:hidden mt-4 rounded-2xl border border-[#2ECC71] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-[52px] h-[52px] rounded-full bg-[#2ECC71] flex items-center justify-center">
                <svg width="28" height="36" viewBox="0 0 37 46" fill="none">
                  <path d="M18.5 0C23.56 0 27.67 4.11 27.67 9.17C27.67 14.23 23.56 18.33 18.5 18.33C13.44 18.33 9.33 14.23 9.33 9.17C9.33 4.11 13.44 0 18.5 0Z" fill="#101820"/>
                  <path d="M0 46C0 36.52 8.52 28 18.5 28C28.48 28 37 36.52 37 46" fill="#101820"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold">Account Name</div>
                <div className="text-[10px] text-black/80">Your are posting review publicly on Carryia</div>
              </div>
            </div>
            <div className="mt-3 flex items-center" style={{gap:'14px'}}>
              {Array.from({ length: 5 }).map((_, i) => {
                const starIndex = i + 1;
                const active = (hoverRating || rating) >= starIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Rate ${starIndex} star${starIndex > 1 ? 's' : ''}`}
                    onMouseEnter={() => setHoverRating(starIndex)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starIndex)}
                    className="p-0 m-0 bg-transparent border-0 cursor-pointer"
                    style={{ width: '40px', height: '36.7px' }}
                  >
                    <svg width="40" height="36.7" viewBox="0 0 60 55">
                      <path d="M30 3l7.9 16 17.6 2.6-12.7 12.1 3 17.5L30 42.9 13.2 51.2l3-17.5L3.5 21.6 21.1 19 30 3z" fill={active ? '#2ECC71' : '#FFFFFF'} stroke={active ? '#2ECC71' : '#949494'} strokeWidth="1" />
                    </svg>
                  </button>
                );
              })}
            </div>
            <div className="mt-4">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review"
                className="w-full h-36 rounded-xl border border-[#E2E0E0] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] px-4 py-3 text-[16px] text-[#949494] outline-none"
                style={{ fontFamily: 'Roboto' }}
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowReview(false)}
                className="px-5 h-10 rounded-lg bg-[#2ECC71] text-white text-sm font-semibold"
              >
                Submit review
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyOrders;


