import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupLayout from '../components/auth/SignupLayout';
import UserTypeToggle from '../components/auth/UserTypeToggle';
import FormField from '../components/auth/FormField';
import TermsCheckbox from '../components/auth/TermsCheckbox';
import ActionButton from '../components/auth/ActionButton';
import sellerSignupImage from '../assets/images/auth/Rectangle 114 (1).png';
import { requestSellerOtp, checkPhoneExists } from '../services/authService';
import { getOnboardingStatusByPhone } from '../services/onboardingService';
import api from '../services/api';
import { useAppDispatch } from '../store';
import { setPhone as setOnboardingPhone } from '../store/onboardingSlice';
import { useToast } from '../contexts/ToastContext';

const SellerSignup: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [userType, setUserType] = useState<'buyer' | 'seller'>('seller');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isPhoneValidating, setIsPhoneValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasIncompleteOnboarding, setHasIncompleteOnboarding] = useState(false);
  const dispatch = useAppDispatch();

  // Debounced phone validation
  const debouncedPhoneValidation = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (phoneNumber: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (phoneNumber && phoneNumber.length === 10) {
            setIsPhoneValidating(true);
            try {
              // First check onboarding status to see if it's completed
              const onboardingStatus = await getOnboardingStatusByPhone(`+92${phoneNumber}`);
              const onboardingData = onboardingStatus as any;
              
              if (onboardingData?.exists) {
                // If onboarding is completed, then show error
                if (onboardingData?.completed || onboardingData?.status === 'completed') {
                  setPhoneError('This phone number is already registered');
                  showToast({
                    type: 'error',
                    title: 'Phone Already Registered',
                    message: 'This phone number is already registered. Please login.',
                  });
                } else {
                  // If onboarding is in progress, allow continuation
                  setPhoneError('');
                  setHasIncompleteOnboarding(true);
                  showToast({
                    type: 'info',
                    title: 'Continue Your Registration',
                    message: 'We found your incomplete registration. You can continue from where you left off.',
                  });
                }
              } else {
                // No onboarding found, check if phone exists in regular users
                const result = await checkPhoneExists(`+92${phoneNumber}`);
                if (result.exists) {
                  setPhoneError('This phone number is already registered');
                  showToast({
                    type: 'error',
                    title: 'Phone Already Registered',
                    message: 'This phone number is already registered. Please login.',
                  });
                } else {
                  setPhoneError('');
                  setHasIncompleteOnboarding(false);
                }
              }
            } catch (error) {
              console.error('Phone validation error:', error);
            } finally {
              setIsPhoneValidating(false);
            }
          }
        }, 500);
      };
    })(),
    [showToast]
  );

  // Starting a new seller flow: clear any stale onboarding state to avoid wrong redirects
  React.useEffect(() => {
    try {
      localStorage.removeItem('onboardingUserId');
      localStorage.removeItem('verifiedPhone');
      localStorage.removeItem('verifiedEmail');
      localStorage.removeItem('seller_phone_tmp');
      localStorage.removeItem('seller_otp_sent');
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isPhoneValidating) return;
    
    // Validate phone number
    if (!phone) {
      setPhoneError('Phone number is required');
      return;
    }
    
    if (phone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }
    
    if (phoneError) {
      return; // Don't proceed if there's a validation error
    }
    
    setIsSubmitting(true);
    
    // Clear any existing errors
    setPhoneError('');
    
    // Format phone number with +92 prefix
    const formattedPhone = `+92${phone}`;
    
    try {
      // Pre-check onboarding state by phone.
      const pre = await getOnboardingStatusByPhone(formattedPhone);
      const pdata = pre as any;
      
      if (pdata?.exists) {
        if (pdata?.completed || pdata?.status === 'completed') {
          showToast({
            type: 'error',
            title: 'Phone Already Registered',
            message: 'This phone is already registered. Please login.',
          });
          return;
        }
        
        // In-progress: resume flow at next step
        if (pdata?.userId) localStorage.setItem('onboardingUserId', String(pdata.userId));
        
        // Show info toast about continuing registration
        showToast({
          type: 'info',
          title: 'Continuing Registration',
          message: 'Resuming your seller registration from where you left off.',
        });
        
        // Navigate to the next required step
        const steps = pdata?.steps || {};
        if (!steps.otpVerified) { 
          navigate('/whatsapp-otp-verification'); 
          return; 
        }
        if (steps.otpVerified && !steps.basicInfo) { 
          navigate('/whatsapp-otp-verification'); 
          return; 
        }
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
      }
      
      // If no onboarding found, proceed to request OTP
      await requestSellerOtp(formattedPhone);
      localStorage.setItem('seller_phone_tmp', formattedPhone);
      localStorage.setItem('seller_otp_sent', '1');
      dispatch(setOnboardingPhone(formattedPhone));
      navigate('/whatsapp-otp-verification');
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('already registered')) {
        showToast({
          type: 'error',
          title: 'Phone Already Registered',
          message: 'This phone is already registered. Please login.',
        });
      } else {
        showToast({
          type: 'error',
          title: 'OTP Send Failed',
          message: 'Failed to send OTP. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserTypeChange = (type: 'buyer' | 'seller') => {
    setUserType(type);
    // Navigate to appropriate signup page based on user type
    if (type === 'buyer') {
      navigate('/signup');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Limit to 10 digits
    const limitedValue = numericValue.slice(0, 10);
    
    setPhone(limitedValue);
    
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError('');
    }
    
    // Reset incomplete onboarding flag when user changes phone
    setHasIncompleteOnboarding(false);
    
    // Trigger debounced phone validation
    debouncedPhoneValidation(limitedValue);
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
            <div className="flex-1 relative">
              <FormField
                type="tel"
                name="phone"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="321 123456"
                required
                error={phoneError}
              />
              {isPhoneValidating && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/>
                  </svg>
                </div>
              )}
              {hasIncompleteOnboarding && !isPhoneValidating && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Terms and Conditions with Checkbox */
          /* Mobile: text sizing handled within component styles */}
          <TermsCheckbox />

          {/* Send OTP via whatsapp Button (Mobile: 352px width centered) */}
          <div className="mb-6 flex justify-center md:block">
            <ActionButton
              type="submit"
              text={
                isPhoneValidating 
                  ? 'Checking availability...' 
                  : isSubmitting 
                    ? 'Sending OTP...' 
                    : hasIncompleteOnboarding
                      ? 'Continue Registration'
                      : 'Send OTP via whatsapp'
              }
              icon={
                isPhoneValidating || isSubmitting ? (
                  <svg className="w-4 h-4 md:w-6 md:h-6 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" fill="currentColor"/>
                  </svg>
                )
              }
              className={`w-[352px] md:w-full h-[29px] md:h-[48px] rounded-[45px] text-[15px] md:text-[25px] font-normal transition-colors flex items-center justify-center gap-3 md:gap-4 ${
                !phone || phone.length !== 10 || !!phoneError || isPhoneValidating || isSubmitting
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-[#2ECC71] text-white hover:bg-[#27AE60]'
              }`}
              disabled={!phone || phone.length !== 10 || !!phoneError || isPhoneValidating || isSubmitting}
            />
          </div>
        </form>
      </div>
    </SignupLayout>
  );
};

export default SellerSignup;
