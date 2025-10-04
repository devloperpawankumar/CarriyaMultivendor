import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupLayout from '../components/auth/SignupLayout';
import UserTypeToggle from '../components/auth/UserTypeToggle';
import FormField from '../components/auth/FormField';
import TermsCheckbox from '../components/auth/TermsCheckbox';
import ActionButton from '../components/auth/ActionButton';
import sellerSignupImage from '../assets/images/auth/Rectangle 114 (1).png';

const SellerSignup: React.FC = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'buyer' | 'seller'>('seller');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle seller signup logic here
    console.log('Seller signup data:', { phone, userType });
    
    // For now, navigate to WhatsApp OTP verification
    // In a real app, you would send this data to your backend
    navigate('/whatsapp-otp-verification');
  };

  const handleUserTypeChange = (type: 'buyer' | 'seller') => {
    setUserType(type);
    // Navigate to appropriate signup page based on user type
    if (type === 'buyer') {
      navigate('/signup');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setPhone(e.target.value);
  };

  return (
    <SignupLayout
      imageSrc={sellerSignupImage}
      imageAlt="Seller Signup"
    >
      {/* Mobile: constrain form width to 352px; desktop remains 600px */}
      <div className="max-w-[352px] md:max-w-[600px] mx-auto lg:mx-0">
        {/* Header (Mobile: tighter spacing) */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-[20px] md:text-[40px] font-semibold text-black mb-1 md:mb-2">
            Create an account
          </h1>
        </div>

        {/* User Type Toggle */}
        <div className="mb-6 md:mb-8">
          {/* Mobile: center toggle and cap width to 302px  */}
          <div className="mx-auto max-w-[302px] md:max-w-[469px] w-full py-4">
            <UserTypeToggle
              userType={userType}
              onUserTypeChange={handleUserTypeChange}
            />
          </div>
        </div>

        {/* Form - Only Phone Fields for Seller (Mobile: tighter vertical rhythm) */}
        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          {/* Phone Fields Row */}
          <div className="flex gap-2 md:gap-4">
            {/* Mobile: +92 box 54px wide and 38px tall */}
            <div className="w-[54px] md:w-[94px]">
              <input
                type="text"
                value="+92"
                readOnly
                className="w-full h-[38px] md:h-[67px] px-[12px] md:px-[25px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] bg-gray-50 shadow-[1px_2px_4px_rgba(233,255,242,1)]"
              />
            </div>
            <div className="flex-1">
              <FormField
                type="tel"
                name="phone"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="321 123456"
                required
              />
            </div>
          </div>

          {/* Terms and Conditions with Checkbox */
          /* Mobile: text sizing handled within component styles */}
          <TermsCheckbox />

          {/* Send OTP via whatsapp Button (Mobile: 352px width centered) */}
          <div className="mb-6 flex justify-center md:block">
            <ActionButton
              type="submit"
              text="Send OTP via whatsapp"
              icon={
                <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" fill="currentColor"/>
                </svg>
              }
              className="w-[352px] md:w-full h-[29px] md:h-[48px] bg-[#2ECC71] text-white rounded-[45px] text-[15px] md:text-[25px] font-normal hover:bg-[#27AE60] transition-colors flex items-center justify-center gap-3 md:gap-4"
            />
          </div>
        </form>
      </div>
    </SignupLayout>
  );
};

export default SellerSignup;
