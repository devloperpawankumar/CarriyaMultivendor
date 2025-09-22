import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupLayout from '../components/auth/SignupLayout';
import FormField from '../components/auth/FormField';
import ActionButton from '../components/auth/ActionButton';
import sellerAddressImage from '../assets/images/auth/Rectangle 114 (2).png';

interface AddressFormData {
  pickupAddress: string;
  region: string;
  sameAsPickup: boolean;
  returnAddress: string;
  returnRegion: string;
}

const SellerAddressSetup: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    pickupAddress: '',
    region: '',
    sameAsPickup: false,
    returnAddress: '',
    returnRegion: '',
  });

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };
      
      // If "same as pickup" is checked, clear the return address fields
      if (field === 'sameAsPickup' && value === true) {
        newData.returnAddress = '';
        newData.returnRegion = '';
      }
      
      return newData;
    });
  };

  // Mobile/Desktop: unified submit action (no form event required)
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Here you would typically send the data to your backend
      console.log('Address data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to the next step (you can customize this based on your flow)
      navigate('/business-setup'); // Navigate to business setup page
    } catch (error) {
      console.error('Error submitting address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignupLayout
      imageSrc={sellerAddressImage}
      imageAlt="Seller Address Setup"
    >
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <div className="max-w-[352px] md:max-w-[600px] mx-auto lg:mx-0">
        {/* Mobile: compact heading; Desktop: larger heading */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-[20px] md:text-[40px] font-semibold text-black mb-1 md:mb-2">
            Add a Pick up Adress
          </h1>
        </div>
        
        {/* Mobile: 38px height, 10px radius; Desktop: 67px, 15px radius */}
        <div className="mb-4 md:mb-[27px]">
          <div className="relative">
            <textarea
              placeholder="Address Details: Number, Street, Landmark, etc."
              value={formData.pickupAddress}
              onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[29px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder:text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)] resize-none overflow-hidden no-scrollbar"
            />
          </div>
        </div>

        {/* Mobile: compact select; Desktop: large select */}
        <div className="mb-4 md:mb-[27px]">
          <div className="relative">
            <select
              value={formData.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[29px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)] appearance-none"
            >
              <option value="" disabled>Region/City/District</option>
            </select>
            <div className="absolute right-[18px] md:right-[29px] top-[10px] md:top-[22px]">
              <svg width="12" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 6.25L12 17.03L22 6.25"
                  stroke="#B8B1B1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile: compact subheading; Desktop: larger subheading */}
        <div className="mb-4 md:mb-8">
          <h2 className="text-[20px] md:text-[40px] font-semibold text-black mb-1 md:mb-2">
            Return Adress
          </h2>
        </div>

        {/* Mobile: 23px checkbox and 15px label; Desktop: 45px, 25px */}
        <div className="mb-4 md:mb-[27px]">
          <div className="flex items-center space-x-[12px] md:space-x-[22px]">
            <div className="relative">
             
              <input
                type="checkbox"
                id="sameAsPickup"
                checked={formData.sameAsPickup}
                onChange={(e) => handleInputChange('sameAsPickup', e.target.checked)}
                className={`w-[23px] h-[23px] md:w-[45px] md:h-[45px] rounded-[5px] border-2 focus:ring-0 focus:ring-offset-0 appearance-none transition-colors ${
                  formData.sameAsPickup 
                    ? 'bg-[#2ECC71] border-[#2ECC71]' 
                    : 'bg-white border-[#2ECC71]'
                }`}
              />
              {formData.sameAsPickup && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="16" height="12" viewBox="0 0 23 18" fill="none" className="md:w-[23px] md:h-[18px]">
                    <path
                      d="M2 9L8.5 15.5L21 2"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
            <label
              htmlFor="sameAsPickup"
              className="text-[15px] md:text-[25px] text-[#B8B1B1] font-normal leading-[18px] md:leading-[29px] cursor-pointer"
            >
              Same Address as Pickup Address
            </label>
          </div>
        </div>

        {/* Mobile/Desktop: return address fields are conditionally shown */}
        {!formData.sameAsPickup && (
          <>
            {/* Return Address Details Input */}
            <div className="mb-4 md:mb-[27px]">
              <div className="relative">
                <textarea
                  placeholder="Address Details: Number, Street, Landmark, etc."
                  value={formData.returnAddress}
                  onChange={(e) => handleInputChange('returnAddress', e.target.value)}
                  className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[29px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder:text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)] resize-none overflow-hidden no-scrollbar"
                />
              </div>
            </div>

            {/* Return Region/City/District Dropdown */}
            <div className="mb-6 md:mb-[54px]">
              <div className="relative">
                <select
                  value={formData.returnRegion}
                  onChange={(e) => handleInputChange('returnRegion', e.target.value)}
                  className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[29px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)] appearance-none"
                >
                  <option value="" disabled>Region/City/District</option>
                </select>
                <div className="absolute right-[18px] md:right-[29px] top-[10px] md:top-[22px]">
                  <svg width="12" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M2 6.25L12 17.03L22 6.25"
                      stroke="#B8B1B1"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Mobile: full-width compact button; Desktop: larger button */}
        <div className="mb-10 md:mb-20 flex justify-center md:block">
          <ActionButton
            type="button"
            text="Continue Next"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-[352px] md:w-[234px] h-[38px] md:h-[67px] bg-[#2ECC71] text-white text-[16px] md:text-[30px] font-medium md:font-bold rounded-[10px] md:rounded-[15px]"
          />
        </div>
      </div>
    </SignupLayout>
  );
};

export default SellerAddressSetup;
