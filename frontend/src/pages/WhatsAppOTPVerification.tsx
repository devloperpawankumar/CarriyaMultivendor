import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupLayout from '../components/auth/SignupLayout';
import FormField from '../components/auth/FormField';
import ActionButton from '../components/auth/ActionButton';
import UserTypeToggle from '../components/auth/UserTypeToggle';
import whatsappOTPImage from '../assets/images/auth/Rectangle 114 (1).png';
import { verifySellerOtp, requestSellerOtp } from '../services/authService';
import { submitBasicInfo, getOnboardingStatus } from '../services/onboardingService';
import { useAppDispatch, useAppSelector } from '../store';
import { setOtpVerified, setFirstName, setLastName } from '../store/onboardingSlice';
import { upsertOnboarding } from '../services/onboardingService';
import { useToast } from '../contexts/ToastContext';

const WhatsAppOTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '']);
  const [userType, setUserType] = useState<'buyer' | 'seller'>('seller');
  const [isLocked, setIsLocked] = useState(false);
  const dispatch = useAppDispatch();
  const onboardingPhone = useAppSelector((s) => s.onboarding.phone);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Enforce seller flow lock on OTP page
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
        if (!userId) return; // new flow: don't redirect before OTP created userId
        const status = await getOnboardingStatus(userId);
        const data: any = (status as any)?.data || status;
        if (data?.status === 'completed') {
          navigate('/seller/dashboard');
          return;
        }
        const steps = data?.steps || {};
        if (steps.otpVerified && steps.basicInfo && !steps.emailVerified) {
          navigate('/email-verification-page');
          return;
        }
        if (steps.otpVerified && steps.basicInfo && steps.emailVerified && !steps.address) {
          navigate('/seller-address-setup');
          return;
        }
        if (steps.otpVerified && steps.basicInfo && steps.emailVerified && steps.address && !steps.idVerification) {
          navigate('/business-setup');
          return;
        }
        if (steps.otpVerified && steps.basicInfo && steps.emailVerified && steps.address && steps.idVerification && !steps.bank) {
          navigate('/bank-verification');
          return;
        }
      } catch {}
    })();
  }, [navigate]);

  // Start cooldown when page opens or when an OTP is sent
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-hide info messages after 3 seconds
  useEffect(() => {
    if (!infoMessage) return;
    const t = setTimeout(() => setInfoMessage(null), 3000);
    return () => clearTimeout(t);
  }, [infoMessage]);

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    if (value.match(/^\d*$/) && value.length <= 1) {
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input if a digit is entered
      if (value && index < otp.length - 1) {
        otpRefs.current[index + 1]?.focus();
      }

      // Auto-verify when 5 digits entered
      const full = newOtp.join('');
      if (full.length === 5 && !isVerified && !isVerifying) {
        void submitVerify(full);
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

  const submitVerify = async (fullOtp: string) => {
    const phone = localStorage.getItem('seller_phone_tmp') || '';
    try {
      setIsVerifying(true);
      try {
        const resp = await verifySellerOtp(phone, fullOtp);
        try {
          const userId = (resp as any)?.userId || (resp as any)?.data?.userId;
          if (userId) localStorage.setItem('onboardingUserId', String(userId));
        } catch {}
        setIsVerified(true);
        setVerifyMessage('Thanks! Your phone number has been verified.');
        setInfoMessage(null);
        dispatch(setOtpVerified(true));
        try { localStorage.setItem('verifiedPhone', phone); } catch {}
        
        // Show success toast notification
        showToast({
          type: 'success',
          title: 'Phone Verified',
          message: 'Your phone number has been successfully verified!',
        });
        
        // Reset OTP inputs after successful verification
        setOtp(['', '', '', '', '']);
      } catch (e: any) {
        const m = e?.message || '';
        if (m.toLowerCase().includes('already registered')) {
          showToast({
            type: 'error',
            title: 'Phone Already Registered',
            message: 'This phone is already registered. Please login.',
          });
          return;
        }
        throw e;
      }
    } catch (_err) {
      showToast({
        type: 'error',
        title: 'Invalid Code',
        message: 'Invalid or expired code. Please try again.',
      });
      // Reset OTP inputs and focus first input when code is incorrect
      setOtp(['', '', '', '', '']);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    await submitVerify(fullOtp);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const phone = localStorage.getItem('seller_phone_tmp') || '';
    try {
      await requestSellerOtp(phone);
      setResendCooldown(60);
      setInfoMessage('Verification code sent again to your WhatsApp.');
    } catch {
      setInfoMessage('Failed to resend code. Please try again.');
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const nameRe = /^[A-Za-z\s'-]{2,}$/;
    if (!nameRe.test(formData.firstName.trim())) {
      errors.firstName = 'Enter a valid first name (letters/spaces)';
    }
    if (!nameRe.test(formData.lastName.trim())) {
      errors.lastName = 'Enter a valid last name (letters/spaces)';
    }
    const pass = formData.password;
    const strong = pass.length >= 8 && /[a-z]/.test(pass) && /[A-Z]/.test(pass) && /\d/.test(pass) && /[^A-Za-z0-9]/.test(pass);
    if (!strong) {
      errors.password = 'Use 8+ chars with upper, lower, number, special';
    }
    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if form is valid (for button disable state)
  const isFormValid = () => {
    if (!isVerified) return false;
    
    const nameRe = /^[A-Za-z\s'-]{2,}$/;
    const firstNameValid = nameRe.test(formData.firstName.trim());
    const lastNameValid = nameRe.test(formData.lastName.trim());
    
    const pass = formData.password;
    const passwordValid = pass.length >= 8 && 
                         /[a-z]/.test(pass) && 
                         /[A-Z]/.test(pass) && 
                         /\d/.test(pass) && 
                         /[^A-Za-z0-9]/.test(pass);
    
    const passwordsMatch = formData.confirmPassword === formData.password && formData.confirmPassword.length > 0;
    
    return firstNameValid && lastNameValid && passwordValid && passwordsMatch;
  };

  const handleContinueNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) return;
    if (!validateForm()) return;
    const phone = localStorage.getItem('verifiedPhone') || localStorage.getItem('seller_phone_tmp') || '';
    try {
      const userId = localStorage.getItem('onboardingUserId') || '';
      await submitBasicInfo({
        userId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        password: formData.password,
      });
      dispatch(setFirstName(formData.firstName.trim()));
      dispatch(setLastName(formData.lastName.trim()));
      navigate('/email-verification-page');
    } catch (err: any) {
      const apiErrors = err?.response?.data?.fieldErrors || {};
      setFormErrors(apiErrors);
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the highlighted errors.',
      });
    }
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
          {/* Mobile: center toggle and cap width to 302px to match ; desktop uses wider */}
          <div className={`mx-auto max-w-[302px] md:max-w-[469px] w-full py-4 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`} aria-disabled={isLocked}>
            <UserTypeToggle
              userType={userType}
              onUserTypeChange={(t) => {
                if (isLocked && t === 'buyer') return;
                setUserType(t);
              }}
            />
          </div>
          {/* helper text intentionally hidden per requirement */}
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
              className="w-[27px] h-[27px] md:w-[41px] md:h-[41px] text-center border border-[#949494] rounded text-[15px] md:text-[25px] font-medium focus:outline-none focus:border-[#2ECC71] disabled:bg-gray-100 disabled:text-gray-400"
              disabled={isVerified || isVerifying}
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
        <div className="flex flex-col items-center gap-3 md:gap-[10px] mb-8 md:mb-20 px-2 md:px-5">
          {verifyMessage && (
            <div className="w-full max-w-[352px] md:max-w-[600px] bg-green-50 border border-green-200 text-green-800 rounded px-3 py-2 text-center text-[12px] md:text-[16px]">
              {verifyMessage}
            </div>
          )}
          {!isVerified ? (
            <button
              onClick={handleVerify}
              disabled={otp.join('').length !== 5 || isVerifying}
              className={`w-[86.8px] h-[29px] md:w-[129px] md:h-[48px] rounded-[45px] text-[15px] md:text-[25px] font-normal transition-colors flex items-center justify-center ${
                otp.join('').length === 5 && !isVerifying
                  ? 'bg-[#2ECC71] text-white hover:bg-[#27AE60]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </button>
          ) : null}
          
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isVerified}
            className={`text-[10px] md:text-[13px] font-light ${resendCooldown > 0 || isVerified ? 'text-gray-400' : 'text-[#2ECC71]'} hover:no-underline mt-2`}
          >
            {isVerified ? 'Verified' : resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
          </button>
          {infoMessage && (
            <div className="w-full max-w-[352px] md:max-w-[600px] bg-blue-50 border border-blue-200 text-blue-800 rounded px-3 py-2 text-center text-[10px] md:text-[14px]">
              {infoMessage}
            </div>
          )}
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
                disabled={!isVerified}
              />
              {formErrors.firstName ? (
                <div className="text-red-500 text-[10px] md:text-[14px] mt-1">{formErrors.firstName}</div>
              ) : null}
            </div>
            <div className="flex-1">
              <FormField
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                required
                disabled={!isVerified}
              />
              {formErrors.lastName ? (
                <div className="text-red-500 text-[10px] md:text-[14px] mt-1">{formErrors.lastName}</div>
              ) : null}
            </div>
          </div>

          {/* Password Field with Real-time Validation */}
          <div>
            <FormField
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              disabled={!isVerified}
              error="" // Don't show error message - use real-time validation instead
            />
            {formData.password && (
              <div className="mt-2 text-[10px] text-[#8D98AA]">
                <div className="font-medium mb-1">Password requirements:</div>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li className={formData.password.length >= 8 ? 'text-[#2ECC71]' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'text-[#2ECC71]' : ''}>
                    One uppercase letter (A-Z)
                  </li>
                  <li className={/[a-z]/.test(formData.password) ? 'text-[#2ECC71]' : ''}>
                    One lowercase letter (a-z)
                  </li>
                  <li className={/\d/.test(formData.password) ? 'text-[#2ECC71]' : ''}>
                    One number (0-9)
                  </li>
                  <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-[#2ECC71]' : ''}>
                    One special character (!@#$%^&*...)
                  </li>
                </ul>
              </div>
            )}
            {formData.password && !formErrors.password && (
              <div className="text-[#2ECC71] text-[10px] mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Password looks good
              </div>
            )}
          </div>

          {/* Confirm Password Field with Real-time Matching */}
          <div>
            <FormField
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm Password"
              required
              disabled={!isVerified}
              error="" // Don't show error message - use real-time validation instead
            />
            {formData.confirmPassword && (
              <div className="mt-1">
                {formData.confirmPassword === formData.password ? (
                  <div className="text-[#2ECC71] text-[10px] flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Passwords match
                  </div>
                ) : (
                  <div className="text-red-500 text-[10px] flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Passwords do not match
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Continue Next Button */}
          {/* Mobile: 352px × 29px full-width pill; Desktop keeps large button */}
          <div className="mb-10 md:mb-20 flex justify-start md:justify-start">
            <ActionButton
              type="submit"
              text="Continue Next"
              className={`w-[138px] md:w-[234px] h-[38px] md:h-[67px] ${
                isFormValid() 
                  ? 'bg-[#2ECC71] hover:bg-[#27AE60] cursor-pointer' 
                  : 'bg-gray-300 cursor-not-allowed opacity-50'
              } text-white rounded-[10px] md:rounded-[5px] text-[15px] md:text-[25px] font-normal md:font-bold transition-colors flex items-center justify-center`}
              disabled={!isFormValid()}
            />
          </div>
        </form>
      </div>
    </SignupLayout>
  );
};

export default WhatsAppOTPVerification;
