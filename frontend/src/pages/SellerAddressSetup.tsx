import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupLayout from '../components/auth/SignupLayout';
import FormField from '../components/auth/FormField';
import ActionButton from '../components/auth/ActionButton';
import sellerAddressImage from '../assets/images/auth/Rectangle 114 (2).png';
import { pkProvinceDistricts } from '../data/pkRegions';
import { submitAddress, getOnboardingStatus } from '../services/onboardingService';

interface AddressFormData {
  pickupAddress: string;
  pickupProvince: string;
  pickupDistrict: string;
  sameAsPickup: boolean;
  returnAddress: string;
  returnProvince: string;
  returnDistrict: string;
}

const SellerAddressSetup: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});
  const [formData, setFormData] = useState<AddressFormData>({
    pickupAddress: '',
    pickupProvince: '',
    pickupDistrict: '',
    sameAsPickup: false,
    returnAddress: '',
    returnProvince: '',
    returnDistrict: '',
  });

  const provinces = useMemo(() => Object.keys(pkProvinceDistricts), []);
  // Prevent duplicate flow if already completed
  React.useEffect(() => {
    (async () => {
      try {
        const userId = localStorage.getItem('onboardingUserId') || '';
        if (!userId) return;
        const status = await getOnboardingStatus(userId);
        const data: any = (status as any)?.data || status;
        if (data?.status === 'completed') { navigate('/seller/dashboard'); return; }
        const steps = data?.steps || {};
        if (!steps.otpVerified || !steps.basicInfo) { navigate('/whatsapp-otp-verification'); return; }
        if (!steps.emailVerified) { navigate('/email-verification-page'); return; }
        if (steps.address && !steps.idVerification) { navigate('/business-setup'); return; }
        if (steps.address && steps.idVerification && !steps.bank) { navigate('/bank-verification'); return; }
      } catch {}
    })();
  }, [navigate]);
  const pickupDistricts = useMemo(
    () => (formData.pickupProvince ? pkProvinceDistricts[formData.pickupProvince] || [] : []),
    [formData.pickupProvince]
  );
  const returnDistricts = useMemo(
    () => (formData.returnProvince ? pkProvinceDistricts[formData.returnProvince] || [] : []),
    [formData.returnProvince]
  );

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };
      
      // If province changes, reset the corresponding district
      if (field === 'pickupProvince') newData.pickupDistrict = '';
      if (field === 'returnProvince') newData.returnDistrict = '';
      // If "same as pickup" is checked, mirror values for return
      if (field === 'sameAsPickup' && value === true) {
        newData.returnAddress = newData.pickupAddress;
        newData.returnProvince = newData.pickupProvince;
        newData.returnDistrict = newData.pickupDistrict;
      }
      
      return newData;
    });
  };

  const isFormValid = React.useMemo(() => {
    if (!formData.pickupAddress || !formData.pickupProvince || !formData.pickupDistrict) {
      return false;
    }
    if (!formData.sameAsPickup && (!formData.returnAddress || !formData.returnProvince || !formData.returnDistrict)) {
      return false;
    }
    return true;
  }, [formData]);

  // Mobile/Desktop: unified submit action (no form event required)
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // client-side validation
      const nextErrors: Partial<Record<keyof AddressFormData, string>> = {};
      if (!formData.pickupAddress) nextErrors.pickupAddress = 'Pickup address is required';
      if (!formData.pickupProvince) nextErrors.pickupProvince = 'Pickup province is required';
      if (!formData.pickupDistrict) nextErrors.pickupDistrict = 'Pickup district is required';
      if (!formData.sameAsPickup) {
        if (!formData.returnAddress) nextErrors.returnAddress = 'Return address is required';
        if (!formData.returnProvince) nextErrors.returnProvince = 'Return province is required';
        if (!formData.returnDistrict) nextErrors.returnDistrict = 'Return district is required';
      }
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        return;
      }
      const userId = (() => { try { return localStorage.getItem('onboardingUserId') || localStorage.getItem('userId') || ''; } catch { return ''; } })();
      if (!userId) throw new Error('Missing userId for onboarding');
      const address = formData.sameAsPickup
        ? {
            pickupAddress: formData.pickupAddress,
            pickupProvince: formData.pickupProvince,
            pickupDistrict: formData.pickupDistrict,
            returnAddress: formData.pickupAddress,
            returnProvince: formData.pickupProvince,
            returnDistrict: formData.pickupDistrict,
            sameAsPickup: true,
          }
        : {
            pickupAddress: formData.pickupAddress,
            pickupProvince: formData.pickupProvince,
            pickupDistrict: formData.pickupDistrict,
            returnAddress: formData.returnAddress,
            returnProvince: formData.returnProvince,
            returnDistrict: formData.returnDistrict,
            sameAsPickup: false,
          };
      await submitAddress({ userId, address });
      
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

        {/* Pickup Province */}
        <div className="mb-4 md:mb-[27px]">
          <label className="block mb-1 md:mb-2 text-[10px] md:text-[15px] text-[#767676]">Province</label>
          <div className="relative">
            <select
              value={formData.pickupProvince}
              onChange={(e) => handleInputChange('pickupProvince', e.target.value)}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[29px] pr-[40px] md:pr-[48px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)] appearance-none"
            >
              <option value="" disabled>Province</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-[18px] md:right-[29px] flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
          {/* errors */}
          {errors.pickupAddress ? (<div className="text-red-500 text-[10px] md:text-[14px] mt-1">{errors.pickupAddress}</div>) : null}
          {errors.pickupProvince ? (<div className="text-red-500 text-[10px] md:text-[14px] mt-1">{errors.pickupProvince}</div>) : null}
          {errors.pickupDistrict ? (<div className="text-red-500 text-[10px] md:text-[14px] mt-1">{errors.pickupDistrict}</div>) : null}
        </div>

        {/* Pickup District */}
        <div className="mb-4 md:mb-[27px]">
          <label className="block mb-1 md:mb-2 text-[10px] md:text-[15px] text-[#767676]">District</label>
          <div className="relative">
            <select
              value={formData.pickupDistrict}
              onChange={(e) => handleInputChange('pickupDistrict', e.target.value)}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[29px] pr-[40px] md:pr-[48px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)] appearance-none"
            >
              <option value="" disabled>District</option>
              {pickupDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-[18px] md:right-[29px] flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
          {errors.returnAddress ? (<div className="text-red-500 text-[10px] md:text-[14px] mt-1">{errors.returnAddress}</div>) : null}
          {errors.returnProvince ? (<div className="text-red-500 text-[10px] md:text-[14px] mt-1">{errors.returnProvince}</div>) : null}
          {errors.returnDistrict ? (<div className="text-red-500 text-[10px] md:text-[14px] mt-1">{errors.returnDistrict}</div>) : null}
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

            {/* Return Province */}
            <div className="mb-6 md:mb-[54px]">
              <label className="block mb-1 md:mb-2 text-[10px] md:text-[15px] text-[#767676]">Province</label>
              <div className="relative">
                <select
                  value={formData.returnProvince}
                  onChange={(e) => handleInputChange('returnProvince', e.target.value)}
                  className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[29px] pr-[40px] md:pr-[48px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)] appearance-none"
                >
                  <option value="" disabled>Province</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-[18px] md:right-[29px] flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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

            {/* Return District */}
            <div className="mb-6 md:mb-[54px]">
              <label className="block mb-1 md:mb-2 text-[10px] md:text-[15px] text-[#767676]">District</label>
              <div className="relative">
                <select
                  value={formData.returnDistrict}
                  onChange={(e) => handleInputChange('returnDistrict', e.target.value)}
                  className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[29px] pr-[40px] md:pr-[48px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)] appearance-none"
                >
                  <option value="" disabled>District</option>
                  {returnDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-[18px] md:right-[29px] flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
            disabled={isLoading || !isFormValid}
            className="w-[352px] md:w-[234px] h-[38px] md:h-[67px] bg-[#2ECC71] text-white text-[16px] md:text-[30px] font-medium md:font-bold rounded-[10px] md:rounded-[15px]"
          />
        </div>
      </div>
    </SignupLayout>
  );
};

export default SellerAddressSetup;
