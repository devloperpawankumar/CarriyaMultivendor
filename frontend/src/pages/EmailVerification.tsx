import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import signupImage from '../assets/images/auth/Rectangle 114.png';
import logoImg from '../assets/images/Carriya logo 1.png';
import Footer from '../components/Footer';
import { upsertOnboarding } from '../services/onboardingService';
import { useToast } from '../contexts/ToastContext';

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
  const [isLocked, setIsLocked] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    phone: '',
  });
  const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:4000';
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const otpIsComplete = otp.join('').length === 5;
  
  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if all required form fields are filled and email is valid
  const isFormComplete = formData.firstName.trim() && 
                        formData.lastName.trim() && 
                        formData.password.trim() && 
                        formData.phone.trim() && 
                        email.trim() && 
                        validateEmail(email);

  useEffect(() => {
    if (resendSecondsLeft <= 0) return;
    const id = setInterval(() => {
      setResendSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [resendSecondsLeft]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    const otpCode = otp.join('');
    if (otpCode.length !== 5) {
      setVerificationError('Please enter the 5-digit code');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/email/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: otpCode }),
      });
      if (!res.ok) {
        const maybeJson = await (async () => { try { return await res.json(); } catch { return null; } })();
        const msg = (maybeJson && (maybeJson.error || maybeJson.message)) || '';
        if (res.status === 409 || msg.toLowerCase().includes('already registered')) {
          setVerificationSuccess(false);
          setVerificationError('User Already Exists with this email..');
          showToast({
            type: 'error',
            title: 'User Already Exists',
            message: 'This email is already registered. Please login.',
          });
          return;
        }
        setVerificationSuccess(false);
        setVerificationError('Invalid or expired code');
        // Reset OTP inputs when code is incorrect
        setOtp(['', '', '', '', '']);
        setTimeout(() => {
          const firstInput = document.getElementById('otp-0');
          firstInput?.focus();
        }, 100);
        return;
      }
      setVerificationError(null);
      setVerificationSuccess(true);
      try { localStorage.setItem('verifiedEmail', email || ''); } catch {}

      // Persist email into onboarding so login by email+password works later
      const phone = localStorage.getItem('verifiedPhone') || localStorage.getItem('seller_phone_tmp') || '';
      if (phone) {
        try {
          await upsertOnboarding({ phone, email });
          setFieldErrors({});
        } catch (err: any) {
          const errs = err?.response?.data?.fieldErrors || {};
          setFieldErrors(errs);
        }
      }
    } catch (err) {
      console.error(err);
      setVerificationSuccess(false);
      setVerificationError('Invalid or expired code');
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
    if (resendSecondsLeft > 0) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/email/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const maybeJson = await (async () => { try { return await res.json(); } catch { return null; } })();
        const msg = (maybeJson && (maybeJson.error || maybeJson.message)) || '';
        if (res.status === 409 || msg.toLowerCase().includes('already registered')) {
          setVerificationError('This email is already registered. Please login.');
          setVerificationSuccess(false);
          showToast({
            type: 'error',
            title: 'Email Already Registered',
            message: 'This email is already registered. Please login.',
          });
          return;
        }
        throw new Error('Failed to resend');
      }
      setVerificationError(null);
      setVerificationSuccess(false);
      setResendSecondsLeft(60);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyEmail = async () => {
    // Validate email format before proceeding
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/email/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const maybeJson = await (async () => { try { return await res.json(); } catch { return null; } })();
        const msg = (maybeJson && (maybeJson.error || maybeJson.message)) || '';
        if (res.status === 409 || msg.toLowerCase().includes('already registered')) {
          setVerificationError('This email is already registered. Please login.');
          setVerificationSuccess(false);
          showToast({
            type: 'error',
            title: 'User Already Exists',
            message: 'This email is already registered. Please login.',
          });
          return;
        }
        throw new Error('Failed to send verification email');
      }
      setVerificationError(null);
      setVerificationSuccess(false);
      setResendSecondsLeft(60);
    } catch (e) {
      console.error('Error sending verification email:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Lock buyer flow on mount so user cannot switch to seller during verification
  useEffect(() => {
    try {
      localStorage.setItem('flowLock', 'buyer');
      setIsLocked(true);
      setUserType('buyer');
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Only show the top green bar, not the full header */}
      <div className="w-full h-[30px] md:h-[49px] bg-[#2ECC71] flex items-center justify-center text-white text-[12px] md:text-[20px] font-medium">
        Carriya - Buy , Sell And Carry
      </div>
      
      <main className="max-w-7xl mx-auto px-[26px] md:px-[120px] py-6">
        {/* Top row: Logo on left, Already have account on right */}
        <div className="flex items-center justify-between mb-4 md:mb-8">
          {/* Carriya Logo */}
          <div>
            <img
              src={logoImg}
              alt="Carriya Logo"
              className="w-[160px] h-[50px] md:w-[204px] md:h-[65px] object-contain"
            />
          </div>
          
          {/* Already have account */}
          <div className="flex items-center gap-2 text-[10px] md:text-[30px] font-light text-black">
            <span>Already have an account?</span>
            <button 
              onClick={() => navigate('/login')}
              className="underline hover:no-underline"
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Main content: Image on left, Form on right */}
        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Left Side - Image */}
          <div className="hidden md:block md:w-1/2 md:mb-0 md:pr-8">
            <div className="relative md:h-[400px] lg:h-[424px] rounded-[15px] md:rounded-[25px] overflow-hidden">
              <img
                src={signupImage}
                alt="Email Verification"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 md:pl-8">
            <div className="max-w-[352px] md:max-w-[600px] mx-auto lg:mx-0">
              {/* Header */}
              <div className="mb-4 md:mb-8">
                <h1 className="text-[20px] md:text-[40px] font-semibold text-black mb-1 md:mb-2">
                  Create an account
                </h1>
              </div>

              {/* User Type Toggle */}
              <div className="mb-6 md:mb-8">
                <div className={`relative w-full max-w-[302px] md:max-w-[469px] h-[41px] md:h-[64px] border border-[#4B4B4B] rounded-[45px] bg-white mx-auto ${isLocked ? 'opacity-60 pointer-events-none' : ''}`} aria-disabled={isLocked}>
                  <div className={`absolute top-[4.5px] left-[4.5px] md:top-[7px] md:left-[9px] h-[32px] md:h-[49px] bg-[#2ECC71] rounded-[45px] transition-transform duration-300 w-[calc(50%-9px)] md:w-[221px] ${userType === 'buyer' ? 'translate-x-0' : 'translate-x-[calc(100%+9px)]'}`} />
                  <div className="relative z-10 grid grid-cols-2 h-full">
                    <button type="button" onClick={() => setUserType('buyer')} className={`flex items-center justify-center text-[20px] md:text-[30px] font-normal ${userType === 'buyer' ? 'text-white' : 'text-black'}`}>Buyer</button>
                    <button type="button" onClick={() => { if (isLocked) return; setUserType('seller'); }} className={`flex items-center justify-center text-[20px] md:text-[30px] font-normal ${userType === 'seller' ? 'text-white' : 'text-black'}`}>Seller</button>
                  </div>
                </div>
                {/* helper text intentionally hidden per requirement */}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-6">
                {/* Name Fields Row */}
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[29px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[29px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEmail(value);
                      
                      // Validate email in real-time
                      if (value.trim() && !validateEmail(value)) {
                        setEmailError('Please enter a valid email address');
                      } else {
                        setEmailError('');
                      }
                    }}
                    placeholder="Enter Email"
                    className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[29px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
                    required
                  />
                  {emailError && (
                    <div className="text-red-500 text-[10px] md:text-[14px] mt-1">{emailError}</div>
                  )}
                  {fieldErrors.email ? (
                    <div className="text-red-500 text-[10px] md:text-[14px] mt-1">{fieldErrors.email}</div>
                  ) : null}
                </div>

                {/* Password Field */}
                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[29px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
                    required
                  />
                </div>

                {/* Phone Fields Row */}
                <div className="flex gap-2 md:gap-4">
                  <div className="w-[54px] md:w-[94px]">
                    <input
                      type="text"
                      value="+92"
                      readOnly
                      className="w-full h-[38px] md:h-[67px] px-[12px] md:px-[25px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] bg-gray-50 shadow-[1px_2px_4px_rgba(233,255,242,1)]"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="321 123456"
                      className="w-full h-[38px] md:h-[67px] px-[15px] md:px-[21px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
                      required
                    />
                  </div>
                </div>

                {/* Terms and Conditions with Checkbox */}
                <div className="flex items-start gap-3 mb-8 md:mb-[274px]">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 mt-1 text-[#2ECC71] border-[#2ECC71] rounded focus:ring-[#2ECC71] focus:ring-2 accent-[#2ECC71]"
                    required
                  />
                  <label htmlFor="terms" className="text-[10px] md:text-[15px] font-light text-[#767676] leading-relaxed md:w-[530px]">
                    "By creating or using an account, you confirm that you have read and agree to our [Terms of Use] and [Privacy Policy]."
                  </label>
                </div>

                {/* Verify your email Button */}
                <div className="mb-6 md:mb-[107px] flex justify-center">
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={!isFormComplete || isLoading}
                    className={`w-[352px] md:w-[500px] h-[29px] md:h-[48px] rounded-[45px] text-[15px] md:text-[25px] font-normal transition-colors flex items-center justify-center gap-3 ${
                      isFormComplete && !isLoading
                        ? 'bg-[#2ECC71] text-white hover:bg-[#27AE60]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                    </svg>
                    Verify your email
                  </button>
                </div>

                {/* OTP Input Boxes - Centered */}
                <div className="flex justify-center py-6 gap-[27px] md:gap-[42px] mb-6 md:mb-[68px]">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="w-[27px] h-[27px] md:w-[41px] md:h-[41px] text-center border border-[#949494] rounded text-[15px] md:text-[25px] font-medium focus:outline-none focus:border-[#2ECC71]"
                      maxLength={1}
                    />
                  ))}
                </div>

                {/* Verification Code Text - BELOW OTP boxes, Centered */}
                <div className="mb-6 md:mb-[74px] flex justify-center px-2">
                  <p className="text-[8px] md:text-[15px] font-light text-[#767676] leading-relaxed md:w-[505px] text-center">
                    A 5-digit verification code has been sent to your email. Please enter the code below to verify your account.
                  </p>
                </div>

                {/* Verify Button and Resend Code Row - Close together */}
                <div className="flex items-center justify-center gap-4 md:gap-[26px] py-2 md:py-5">
                  <button
                    type="submit"
                    disabled={!otpIsComplete || isLoading}
                    className={`w-[86.8px] h-[29px] md:w-[129px] md:h-[48px] rounded-[45px] text-[15px] md:text-[25px] font-normal transition-colors flex items-center justify-center ${
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
                    disabled={resendSecondsLeft > 0}
                    className="text-[10px] md:text-[15px] font-light text-[#767676] underline hover:no-underline disabled:opacity-50"
                  >
                    {resendSecondsLeft > 0 ? `Resend Code try after ${resendSecondsLeft}s` : 'Resend Code'}
                  </button>
                </div>

                {verificationSuccess && (
                  <div className="flex justify-center py-2">
                    <div className="bg-green-100 text-green-800 border border-green-300 rounded px-4 py-2 text-[12px] md:text-[16px]">
                      Your email has been verified.
                    </div>
                  </div>
                )}

                {verificationError && (
                  <div className="flex justify-center py-2">
                    <div className="bg-red-100 text-red-800 border border-red-300 rounded px-4 py-2 text-[12px] md:text-[16px]">
                      {verificationError}
                    </div>
                  </div>
                )}

                {/* Or continue with + Google (mobile) */}
                <div className="md:hidden mt-6">
                  <div className="flex items-center mb-3">
                    <div className="flex-1 h-px bg-[#767676]"></div>
                    <span className="px-2 text-[10px] font-light text-[#767676]">or continue with</span>
                    <div className="flex-1 h-px bg-[#767676]"></div>
                  </div>
                  <div className="flex justify-center">
                    <button type="button" className="flex items-center gap-2 px-4 py-1 border border-[#949494] rounded-[45px]">
                      <div className="w-4 h-4">
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <span className="text-[15px] font-medium text-black">Google</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmailVerification;
