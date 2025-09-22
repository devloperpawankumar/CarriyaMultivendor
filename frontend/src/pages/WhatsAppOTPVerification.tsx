import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupLayout from '../components/auth/SignupLayout';
import FormField from '../components/auth/FormField';
import ActionButton from '../components/auth/ActionButton';
import UserTypeToggle from '../components/auth/UserTypeToggle';
import whatsappOTPImage from '../assets/images/auth/Rectangle 114 (1).png';

const WhatsAppOTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '']);
  const [userType, setUserType] = useState<'buyer' | 'seller'>('seller');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    if (value.match(/^\d*$/) && value.length <= 1) {
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input if a digit is entered
      if (value && index < otp.length - 1) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    console.log('OTP verified:', fullOtp);
    console.log('Form data:', formData);
    // Here you would typically send the OTP to your backend for verification
    // On successful verification, navigate to the next page
    // navigate('/dashboard');
  };

  const handleContinueNext = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Continue Next with data:', formData);
    // Navigate to email verification page
    navigate('/email-verification-page');
  };

  return (
    <SignupLayout
      imageSrc={whatsappOTPImage}
      imageAlt="WhatsApp OTP Verification"
    >
      {/* Mobile: constrain width to 352px; desktop remains 600px */}
      <div className="max-w-[352px] md:max-w-[600px] mx-auto lg:mx-0">
        {/* Header (Mobile: tighter spacing) */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-[20px] md:text-[40px] font-semibold text-black mb-1 md:mb-2">
            Verify your number
          </h1>
        </div>

        {/* User Type Toggle */}
        <div className="mb-6 md:mb-8">
          {/* Mobile: center toggle and cap width to 302px to match Figma; desktop uses wider */}
          <div className="mx-auto max-w-[302px] md:max-w-[469px] w-full py-4">
            <UserTypeToggle
              userType={userType}
              onUserTypeChange={(t) => setUserType(t)}
            />
          </div>
        </div>

      

        {/* OTP Input Boxes (Mobile: 27px box and 27px gap) */}
        <div className="flex justify-center gap-[27px] md:gap-[42px] mb-5 md:mb-[20px] ">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => { otpRefs.current[index] = el; }}
              className="w-[27px] h-[27px] md:w-[41px] md:h-[41px] text-center border border-[#949494] rounded text-[15px] md:text-[25px] font-medium focus:outline-none focus:border-[#2ECC71] "
              maxLength={1}
            />
          ))}
        </div>

          {/* WhatsApp Verification Text */}
          <div className="mb-6 md:mb-8 px-2 md:px-0">
          <p className="text-[8px] md:text-[15px] font-light text-[#767676] leading-relaxed text-center md:text-left">
            A 5-digit verification code has been sent to your Whatsapp. Please enter the code below to verify your account.
          </p>
        </div>

        {/* Verify Button and Resend Code Row (Mobile: small pill and 10px text) */}
        <div className="flex items-center justify-center gap-4 md:gap-[10px] mb-8 md:mb-20 px-2 md:px-5">
          <button
            onClick={handleVerify}
            className="w-[86.8px] h-[29px] md:w-[129px] md:h-[48px] bg-[#2ECC71] text-white rounded-[45px] text-[15px] md:text-[25px] font-normal hover:bg-[#27AE60] transition-colors flex items-center justify-center"
          >
            Verify
          </button>
          
          <button
            type="button"
            className="text-[10px] md:text-[13px] font-light text-[#767676] hover:no-underline mt-2"
          >
            Resend Code try after  <span className="underline">60s</span>
          </button>
        </div>

        {/* Additional Form Fields */}
        {/* Mobile: tighter vertical rhythm; desktop keeps larger spacing */}
        <form onSubmit={handleContinueNext} className="space-y-6 md:space-y-6">
          {/* First two fields in one row on mobile */}
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <div className="flex-1">
              <FormField
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                required
              />
            </div>
            <div className="flex-1">
              <FormField
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <FormField
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
          />

          {/* Confirm Password Field */}
          <FormField
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm Password"
            required
          />

          {/* Continue Next Button */}
          {/* Mobile: 352px × 29px full-width pill; Desktop keeps large button */}
          <div className="mb-10 md:mb-20 flex justify-start md:justify-start">
            <ActionButton
              type="submit"
              text="Continue Next"
              className="w-[138px] md:w-[234px] h-[38px] md:h-[67px] bg-[#2ECC71] text-white rounded-[10px] md:rounded-[5px] text-[15px] md:text-[25px] font-normal md:font-bold hover:bg-[#27AE60] transition-colors flex items-center justify-center"
            />
          </div>
        </form>
      </div>
    </SignupLayout>
  );
};

export default WhatsAppOTPVerification;
