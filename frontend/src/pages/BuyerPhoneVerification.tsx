import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import signupImage from '../assets/images/auth/Rectangle 114.png';
import SignupLayout from '../components/auth/SignupLayout';
import { verifyBuyerPhoneOtp, resendBuyerPhoneOtp, requestBuyerPhoneOtp } from '../services/buyerAuthService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const BuyerPhoneVerification: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshUser } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [buyerData, setBuyerData] = useState<{
    userId: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    redirectPath?: string;
  } | null>(null);

  const otpIsComplete = otp.join('').length === 5;

  useEffect(() => {
    // Get buyer data from localStorage
    const storedData = localStorage.getItem('buyer_signup_data');
    if (storedData) {
      const data = JSON.parse(storedData);
      setBuyerData(data);
    } else {
      // If no data found, redirect to signup
      navigate('/signup');
    }
  }, [navigate]);

  useEffect(() => {
    if (resendSecondsLeft <= 0) return;
    const id = setInterval(() => {
      setResendSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [resendSecondsLeft]);

  const requestOtp = async () => {
    if (!buyerData) return;
    
    setIsRequestingOtp(true);
    try {
      await requestBuyerPhoneOtp({
        phone: buyerData.phone,
        userId: buyerData.userId
      });
      
      setOtpSent(true);
      setResendSecondsLeft(60);
      showToast({
        type: 'success',
        title: 'SMS Sent!',
        message: 'A verification code has been sent to your phone.',
      });
    } catch (error: any) {
      console.error('Request OTP error:', error);
      showToast({
        type: 'error',
        title: 'Failed to Send SMS',
        message: 'Please try again later.',
      });
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 4) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
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
    const nextIndex = Math.min(digits.length, 4);
    const nextInput = document.getElementById(`otp-${nextIndex}`);
    nextInput?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerData) return;

    const otpCode = otp.join('');
    if (otpCode.length !== 5) {
      setVerificationError('Please enter the 5-digit code');
      return;
    }

    setIsLoading(true);
    setVerificationError(null);

    try {
      const response = await verifyBuyerPhoneOtp({
        phone: buyerData.phone,
        code: otpCode,
        userId: buyerData.userId
      });

      setVerificationSuccess(true);
      
      // Refresh auth context to get user data (token was set during email verification)
      await refreshUser();
      
      showToast({
        type: 'success',
        title: 'Phone Verified Successfully!',
        message: 'Your account is now fully verified.',
      });

      const redirectPath = buyerData.redirectPath || '/';
      setTimeout(() => {
        localStorage.removeItem('buyer_signup_data');
        localStorage.removeItem('signup_redirect_path');
        navigate(redirectPath, { replace: true });
      }, 1200);

    } catch (error: any) {
      console.error('Verification error:', error);
      
      setVerificationSuccess(false);
      
      if (error.response?.status === 401) {
        setVerificationError('Invalid or expired code. Please try again.');
        showToast({
          type: 'error',
          title: 'Invalid Code',
          message: 'The verification code is invalid or has expired.',
        });
      } else if (error.response?.status === 404) {
        setVerificationError('User not found. Please sign up again.');
        showToast({
          type: 'error',
          title: 'User Not Found',
          message: 'Please sign up again.',
        });
        navigate('/signup');
      } else {
        setVerificationError('Verification failed. Please try again.');
        showToast({
          type: 'error',
          title: 'Verification Failed',
          message: 'Please try again or request a new code.',
        });
      }

      // Reset OTP inputs when code is incorrect
      setOtp(['', '', '', '', '']);
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSecondsLeft > 0 || !buyerData) return;

    setIsLoading(true);
    try {
      await resendBuyerPhoneOtp(buyerData.phone, buyerData.userId);

      setVerificationError(null);
      setResendSecondsLeft(60);
      showToast({
        type: 'success',
        title: 'Code Sent!',
        message: 'A new verification code has been sent to your phone.',
      });
    } catch (error: any) {
      console.error('Resend error:', error);
      
      if (error.response?.status === 404) {
        showToast({
          type: 'error',
          title: 'User Not Found',
          message: 'Please sign up again.',
        });
        navigate('/signup');
      } else if (error.response?.status === 400) {
        showToast({
          type: 'error',
          title: 'Already Verified',
          message: 'Your phone is already verified.',
        });
        navigate('/');
      } else {
        showToast({
          type: 'error',
          title: 'Failed to Resend',
          message: 'Please try again later.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!buyerData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ECC71] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SignupLayout
      imageSrc={signupImage}
      imageAlt="Phone Verification"
    >
      <div className="max-w-[352px] md:max-w-[600px] mx-auto lg:mx-0">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-[20px] md:text-[40px] font-semibold text-black mb-1 md:mb-2">
            Verify your phone
          </h1>
          {!otpSent ? (
            <p className="text-[12px] md:text-[20px] text-[#767676]">
              We need to verify your phone number: <strong>{buyerData.phone}</strong>
            </p>
          ) : (
            <p className="text-[12px] md:text-[20px] text-[#767676]">
              We've sent a verification code to <strong>{buyerData.phone}</strong>
            </p>
          )}
        </div>

        {/* Show Send OTP button if not sent yet */}
        {!otpSent ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={requestOtp}
                disabled={isRequestingOtp}
                className={`w-[200px] h-[48px] md:w-[300px] md:h-[67px] rounded-[45px] text-[15px] md:text-[25px] font-normal transition-colors flex items-center justify-center ${
                  isRequestingOtp
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#2ECC71] text-white hover:bg-[#27AE60]'
                }`}
              >
                {isRequestingOtp ? 'Sending...' : 'Send OTP'}
              </button>
            </div>

            {/* Back to Email Verification */}
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => navigate('/buyer-email-verification')}
                className="text-[10px] md:text-[15px] font-light text-[#767676] underline hover:no-underline"
              >
                ← Back to Email Verification
              </button>
            </div>
          </div>
        ) : (
          /* Form - Only show when OTP is sent */
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input Boxes - Centered */}
          <div className="flex justify-center py-6 gap-3 md:gap-[42px] mb-6 md:mb-[68px]">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handleOtpPaste}
                className="w-[35px] h-[35px] md:w-[41px] md:h-[41px] text-center border border-[#949494] rounded text-[16px] md:text-[25px] font-medium focus:outline-none focus:border-[#2ECC71]"
                maxLength={1}
              />
            ))}
          </div>

          {/* Verification Code Text - BELOW OTP boxes, Centered */}
          <div className="mb-6 md:mb-[74px] flex justify-center px-2">
            <p className="text-[12px] md:text-[15px] font-light text-[#767676] leading-relaxed md:w-[505px] text-center">
              A 5-digit verification code has been sent to your phone via SMS. Please enter the code below to verify your phone number.
            </p>
          </div>

          {/* Verify Button and Resend Code Row - Close together */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-[26px] py-2 md:py-5">
            <button
              type="submit"
              disabled={!otpIsComplete || isLoading}
              className={`w-[120px] h-[36px] md:w-[129px] md:h-[48px] rounded-[45px] text-[14px] md:text-[25px] font-normal transition-colors flex items-center justify-center ${
                otpIsComplete && !isLoading
                  ? 'bg-[#2ECC71] text-white hover:bg-[#27AE60]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
            
            <button
              type="button"
              onClick={handleResend}
              disabled={resendSecondsLeft > 0 || isLoading}
              className="text-[12px] md:text-[15px] font-light text-[#767676] underline hover:no-underline disabled:opacity-50"
            >
              {resendSecondsLeft > 0 ? `Resend Code try after ${resendSecondsLeft}s` : 'Resend Code'}
            </button>
          </div>

          {/* Success Message */}
          {verificationSuccess && (
            <div className="flex justify-center py-2 px-4">
              <div className="bg-green-100 text-green-800 border border-green-300 rounded px-4 py-2 text-[12px] md:text-[16px] text-center max-w-sm">
                ✅ Your phone has been verified successfully! Redirecting...
              </div>
            </div>
          )}

          {/* Error Message */}
          {verificationError && (
            <div className="flex justify-center py-2 px-4">
              <div className="bg-red-100 text-red-800 border border-red-300 rounded px-4 py-2 text-[12px] md:text-[16px] text-center max-w-sm">
                ❌ {verificationError}
              </div>
            </div>
          )}

          {/* Back to Email Verification */}
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={() => navigate('/buyer-email-verification')}
              className="text-[10px] md:text-[15px] font-light text-[#767676] underline hover:no-underline"
            >
              ← Back to Email Verification
            </button>
          </div>
          </form>
        )}
      </div>
    </SignupLayout>
  );
};

export default BuyerPhoneVerification;
