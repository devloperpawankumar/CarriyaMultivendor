import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupLayout from '../components/auth/SignupLayout';
import FormField from '../components/auth/FormField';
import ActionButton from '../components/auth/ActionButton';
import UserTypeToggle from '../components/auth/UserTypeToggle';
import sellerSignupImage from '../assets/images/auth/Rectangle 114 (1).png';

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
  });
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [showOtp, setShowOtp] = useState(false); // Mobile: reveal OTP UI after clicking Verify email
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleVerifyEmail = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call to send verification email
      console.log('Sending verification email for:', formData);
      
      // Here you would typically:
      // 1. Send company name and email to backend
      // 2. Backend sends verification email
      // 3. Show success message
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      // After sending verification, show OTP inputs and Verify row (mobile flow)
      setShowOtp(true);
      
    } catch (error) {
      console.error('Error sending verification email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    
    try {
      const fullOtp = otp.join('');
      console.log('Verifying OTP:', fullOtp);
      
      // Here you would typically:
      // 1. Verify OTP with backend
      // 2. On successful verification, navigate to dashboard
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to seller address setup page
      navigate('/seller-address-setup');
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    
    try {
      console.log('Resending verification code...');
      
      // Here you would typically:
      // 1. Call backend to resend verification email
      // 2. Show success message
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error resending code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignupLayout
      imageSrc={sellerSignupImage}
      imageAlt="Email Verification"
    >
      {/* Mobile: constrain to 352px; Desktop keeps 600px */}
      <div className="max-w-[352px] md:max-w-[600px] mx-auto lg:mx-0">
        {/* Header (Mobile tighter) */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-[20px] md:text-[40px] font-semibold text-black mb-1 md:mb-2">
            Verify your email
          </h1>
        </div>

        {/* User Type Toggle */}
        <div className="mb-6 md:mb-8 md:hidden">
          {/* Mobile: center toggle and cap width to 302px; desktop uses wider */}
          <div className="mx-auto max-w-[302px] md:max-w-[469px] w-full py-4">
            <UserTypeToggle
              userType={userType}
              onUserTypeChange={(t) => setUserType(t)}
            />
          </div>
        </div>

        {/* Form Fields (mobile spacing tightened) */}
        <div className="space-y-3 md:space-y-6 mb-6 md:mb-8">
          <FormField
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            placeholder="Company Name"
            required
          />
          <FormField
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email Address"
            required
          />
        </div>

        {/* Verify Email Button (Mobile 352x29 centered) */}
        {!showOtp && (
        <div className="mb-6 md:mb-8 flex justify-center md:block">
          <ActionButton
            type="button"
            text="Verify your email"
            icon={
              <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
              </svg>
            }
            className="w-[352px] md:w-full h-[29px] md:h-[48px] bg-[#2ECC71] text-white rounded-[45px] text-[15px] md:text-[25px] font-normal flex items-center justify-center gap-3 md:gap-4"
            onClick={handleVerifyEmail}
            disabled={isLoading}
          />
        </div>
        )}

        {/* OTP Input Boxes (hidden until Verify email; mobile 27x27 with 27px gap) */}
        {showOtp && (
        <div className="flex justify-center gap-[27px] md:gap-[42px] mb-5 md:mb-[20px]">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => { otpRefs.current[index] = el; }}
              className="w-[27px] h-[27px] md:w-[41px] md:h-[41px] text-center border border-[#949494] rounded text-[15px] md:text-[25px] font-medium focus:outline-none focus:border-[#2ECC71]"
              maxLength={1}
            />
          ))}
        </div>
        )}

        {/* Verification Text (mobile smaller) */}
        {showOtp && (
        <div className="mb-6 md:mb-8">
          <p className="text-[8px] md:text-[15px] font-light text-[#767676] leading-relaxed text-center">
            A 5-digit verification code has been sent to your email. Please enter the code below to verify your account.
          </p>
        </div>
        )}

        {/* Verify Button and Resend Code Row (only after OTP shown) */}
        {showOtp && (
        <div className="flex items-center justify-center gap-4 md:gap-[10px] mb-8 md:mb-20 px-2 md:px-5">
          <button
            onClick={handleVerifyOtp}
            disabled={isLoading}
            className="w-[86.8px] h-[29px] md:w-[129px] md:h-[48px] bg-[#2ECC71] text-white rounded-[45px] text-[15px] md:text-[25px] font-normal flex items-center justify-center disabled:opacity-50"
          >
            Verify
          </button>
          
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isLoading}
            className="text-[10px] md:text-[13px] font-light text-[#767676] hover:no-underline mt-2 disabled:opacity-50"
          >
            Resend Code try after <span className="underline">60s</span>
          </button>
        </div>
        )}
      </div>
    </SignupLayout>
  );
};

export default EmailVerificationPage;
