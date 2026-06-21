import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupLayout from '../components/auth/SignupLayout';
import FormField from '../components/auth/FormField';
import ActionButton from '../components/auth/ActionButton';
import UserTypeToggle from '../components/auth/UserTypeToggle';
import sellerSignupImage from '../assets/images/auth/Rectangle 114 (1).png';
import api from '../services/api';
import { getOnboardingStatus } from '../services/onboardingService';
import { useToast } from '../contexts/ToastContext';

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
  });
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '']);
  const [showOtp, setShowOtp] = useState(false); // Mobile: reveal OTP UI after clicking Verify email
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [emailError, setEmailError] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const otpIsComplete = otp.join('').length === 5;
  
  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if all required form fields are filled and email is valid
  const isFormComplete = formData.companyName.trim() && formData.email.trim() && validateEmail(formData.email);

  useEffect(() => {
    if (resendSecondsLeft <= 0) return;
    const id = setInterval(() => {
      setResendSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [resendSecondsLeft]);

  // Enforce seller flow lock on Email Verification page
  useEffect(() => {
    try {
      localStorage.setItem('flowLock', 'seller');
      setIsLocked(true);
      setUserType('seller');
    } catch {}
  }, []);

  // Prevent duplicate flow if already completed (only when userId exists)
  useEffect(() => {
    (async () => {
      try {
        const userId = localStorage.getItem('onboardingUserId') || '';
        if (!userId) return; // if no userId yet, user hasn't verified phone; don't redirect
        const status = await getOnboardingStatus(userId);
        const data: any = (status as any)?.data || status;
        if (data?.status === 'completed') { navigate('/seller/dashboard'); return; }
        const steps = data?.steps || {};
        if (!steps.otpVerified || !steps.basicInfo) { navigate('/whatsapp-otp-verification'); return; }
        if (steps.emailVerified && !steps.address) { navigate('/seller-address-setup'); return; }
        if (steps.emailVerified && steps.address && !steps.idVerification) { navigate('/business-setup'); return; }
        if (steps.emailVerified && steps.address && steps.idVerification && !steps.bank) { navigate('/bank-verification'); return; }
      } catch {}
    })();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate email in real-time
    if (name === 'email') {
      if (value.trim() && !validateEmail(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
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

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const clip = e.clipboardData.getData('text');
    const digits = (clip || '').replace(/\D/g, '').slice(0, 5).split('');
    if (digits.length === 0) return;
    const filled = [...otp];
    for (let i = 0; i < 5; i++) {
      filled[i] = digits[i] || '';
    }
    setOtp(filled);
    // focus next empty or last
    const nextIndex = Math.min(digits.length, 4);
    otpRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyEmail = async () => {
    // Validate email format before proceeding
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userId = localStorage.getItem('onboardingUserId') || '';
      try {
        await api.post('/api/auth/email/request-otp', { email: formData.email, userId });
      } catch (e: any) {
        const m = e?.message || '';
        if (m.toLowerCase().includes('already registered')) {
          setShowOtp(false);
          showToast({
            type: 'error',
            title: 'User Already Exists',
            message: 'This email is already registered. Please login.',
          });
          return;
        }
        throw e;
      }
      // After sending verification, show OTP inputs and Verify row (mobile flow)
      setShowOtp(true);
      // Start 60s cooldown to allow resend
      setResendSecondsLeft(60);
      
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
      if (fullOtp.length !== 5) {
        showToast({
          type: 'warning',
          title: 'Incomplete Code',
          message: 'Please enter the 5-digit code',
        });
        // Reset OTP inputs when code is incomplete
        setOtp(['', '', '', '', '']);
        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 100);
        return;
      }
      const userId = localStorage.getItem('onboardingUserId') || '';
      try {
        await api.post('/api/auth/email/verify-otp', { email: formData.email, code: fullOtp, userId });
      } catch (e: any) {
        const m = e?.message || '';
        if (m.toLowerCase().includes('already registered')) {
          showToast({
            type: 'error',
            title: 'Email Already Registered',
            message: 'This email is already registered. Please login.',
          });
          return;
        }
        throw e;
      }
      try { localStorage.setItem('verifiedEmail', formData.email || ''); } catch {}
      
      // Show success toast notification
      showToast({
        type: 'success',
        title: 'Email Verified',
        message: 'Your email has been successfully verified!',
      });
      
      // Navigate to seller address setup page after a short delay
      setTimeout(() => {
        navigate('/seller-address-setup');
      }, 1200);
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      showToast({
        type: 'error',
        title: 'Invalid Code',
        message: 'Invalid or expired code. Please try again.',
      });
      // Reset OTP inputs when code is incorrect
      setOtp(['', '', '', '', '']);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    
    try {
      if (resendSecondsLeft > 0) return;
      const userId = localStorage.getItem('onboardingUserId') || '';
      await api.post('/api/auth/email/request-otp', { email: formData.email, userId });
      setResendSecondsLeft(60);
      
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
          <div className={`mx-auto max-w-[302px] md:max-w-[469px] w-full py-4 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`} aria-disabled={isLocked}>
            <UserTypeToggle
              userType={userType}
              onUserTypeChange={(t) => {
                if (isLocked && t === 'buyer') return;
                setUserType(t);
              }}
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
          <div>
            <FormField
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              required
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1 ml-1">{emailError}</p>
            )}
          </div>
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
            className={`w-[352px] md:w-full h-[29px] md:h-[48px] rounded-[45px] text-[15px] md:text-[25px] font-normal flex items-center justify-center gap-3 md:gap-4 ${
              isFormComplete && !isLoading
                ? 'bg-[#2ECC71] text-white hover:bg-[#27AE60]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleVerifyEmail}
            disabled={!isFormComplete || isLoading}
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
            onPaste={handleOtpPaste}
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
            disabled={isLoading || !otpIsComplete}
            className={`w-[86.8px] h-[29px] md:w-[129px] md:h-[48px] rounded-[45px] text-[15px] md:text-[25px] font-normal flex items-center justify-center transition-colors ${
              otpIsComplete && !isLoading
                ? 'bg-[#2ECC71] text-white hover:bg-[#27AE60]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
          
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isLoading || resendSecondsLeft > 0}
            className="text-[10px] md:text-[13px] font-light text-[#767676] hover:no-underline mt-2 disabled:opacity-50"
          >
            {resendSecondsLeft > 0 ? (
              <>Resend Code try after <span className="underline">{resendSecondsLeft}s</span></>
            ) : (
              <>Resend Code</>
            )}
          </button>
        </div>
        )}

      </div>
    </SignupLayout>
  );
};

export default EmailVerificationPage;
