import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import LoginLayout from '../components/auth/LoginLayout';
import LoginForm, { LoginFormData } from '../components/auth/LoginForm';
import { googleBuyerSignIn } from '../services/buyerAuthService';
import { buyerLogin } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import loginImage from '../assets/images/auth/Rectangle 114.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshUser } = useAuth();
  const location = useLocation();
  useEffect(() => {
    const fromLocation = (location.state as { from?: Location } | null)?.from;
    if (fromLocation) {
      const path = `${fromLocation.pathname}${fromLocation.search ?? ''}${fromLocation.hash ?? ''}`;
      localStorage.setItem('signup_redirect_path', path);
    } else {
      localStorage.removeItem('signup_redirect_path');
    }
  }, [location.state]);
  const getBuyerRedirectPath = () => {
    const fromLocation = (location.state as { from?: Location } | null)?.from;
    if (fromLocation) {
      return `${fromLocation.pathname}${fromLocation.search ?? ''}${fromLocation.hash ?? ''}`;
    }
    return '/';
  };

  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('userType');
    if (t === 'buyer' || t === 'seller') setUserType(t);
  }, [location.search]);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return; // prevent double submit
    setIsSubmitting(true);
    setErrors({});
    try {
      const user = await buyerLogin({ email: data.email.trim().toLowerCase(), password: data.password, rememberMe: !!data.rememberMe });

      // Ensure selected userType matches account role
      if (userType === 'seller' && user?.role !== 'seller') {
        setErrors({ general: 'This account is not a seller.' });
        showToast({ type: 'error', title: 'This account is not a seller.' });
        return;
      }
      if (userType === 'buyer' && user?.role !== 'buyer') {
        setErrors({ general: 'This account is not a buyer.' });
        showToast({ type: 'error', title: 'This account is not a buyer.' });
        return;
      }

      // Refresh auth context to update Header (this also saves to localStorage)
      await refreshUser();

      showToast({ type: 'success', title: 'Logged in successfully' });
      const redirectPath = userType === 'buyer' ? getBuyerRedirectPath() : '/seller/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const resp = err?.response?.data || {};
      const fieldErrors = resp?.fieldErrors || {};
      const emailErr = fieldErrors.email;
      const pwdErr = fieldErrors.password;

      if (fieldErrors.onboarding) {
        const meta = resp?.meta?.onboarding || {};
        const steps = meta.steps || {};
        try {
          if (meta.userId) localStorage.setItem('onboardingUserId', String(meta.userId));
          if (meta.phone) {
            localStorage.setItem('seller_phone_tmp', String(meta.phone));
            if (steps.otpVerified) localStorage.setItem('verifiedPhone', String(meta.phone));
          }
          if (meta.email && steps.emailVerified) {
            localStorage.setItem('verifiedEmail', String(meta.email));
          }
        } catch {}

        let nextRoute = '/whatsapp-otp-verification';
        if (steps.otpVerified && steps.basicInfo && !steps.emailVerified) {
          nextRoute = '/email-verification-page';
        } else if (steps.otpVerified && steps.basicInfo && steps.emailVerified && !steps.address) {
          nextRoute = '/seller-address-setup';
        } else if (steps.otpVerified && steps.basicInfo && steps.emailVerified && steps.address && !steps.idVerification) {
          nextRoute = '/business-setup';
        } else if (steps.otpVerified && steps.basicInfo && steps.emailVerified && steps.address && steps.idVerification && !steps.bank) {
          nextRoute = '/bank-verification';
        }

        setErrors({
          general: fieldErrors.onboarding || 'Please finish your seller onboarding.',
        });
        showToast({
          type: 'info',
          title: 'Finish Your Seller Setup',
          message: 'We found your incomplete registration. Let’s pick up where you left off.',
        });
        navigate(nextRoute, { replace: true });
        return;
      }

      // Compute toast message per your requirement
      const toastMessage = emailErr ? 'User not found' : (pwdErr ? 'Invalid email or password' : (resp?.error || resp?.message || 'Login failed'));

      setErrors({
        email: emailErr ? 'User not found' : undefined,
        password: pwdErr ? 'Invalid email or password' : undefined,
        general: (!emailErr && !pwdErr) ? (resp?.error || resp?.message || 'Login failed') : undefined,
      });
      showToast({ type: 'error', title: toastMessage });
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleUserTypeChange = (type: 'buyer' | 'seller') => {
    setUserType(type);
  };

  const handleGoogleClick = async () => {
    try {
      if (userType !== 'buyer') {
        showToast({ type: 'error', title: 'Google sign-in is only for buyers' });
        return;
      }
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      if (!clientId) {
        showToast({ type: 'error', title: 'Google Sign-In not configured' });
        return;
      }
      const google = (window as any).google;
      if (!google?.accounts?.id) {
        showToast({ type: 'error', title: 'Google SDK not loaded' });
        return;
      }

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            const credential = response?.credential;
            if (!credential) {
              showToast({ type: 'error', title: 'Google sign-in failed' });
              return;
            }
            await googleBuyerSignIn(credential);
            // Refresh auth context to update Header
            await refreshUser();
            showToast({ type: 'success', title: 'Signed in with Google' });
            const redirectPath = getBuyerRedirectPath();
            navigate(redirectPath, { replace: true });
          } catch (err: any) {
            console.error('Google sign-in error:', err);
            showToast({ type: 'error', title: 'Google sign-in failed' });
          }
        },
      });

      google.accounts.id.prompt();
    } catch (e) {
      console.error(e);
      showToast({ type: 'error', title: 'Google sign-in failed' });
    }
  };

  return (
    <LoginLayout
      imageSrc={loginImage}
      imageAlt="Login"
      onSignupClick={() => {
        const fromLocation = (location.state as { from?: Location } | null)?.from;
        navigate('/signup', {
          state: fromLocation ? { from: fromLocation } : undefined,
          replace: false,
        });
      }}
    >
      <LoginForm
        userType={userType}
        onUserTypeChange={handleUserTypeChange}
        onSubmit={handleSubmit}
        submitButtonText={isSubmitting ? 'Signing in…' : 'Sign In'}
        submitButtonIcon={
          <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
            <path d="M15.5 7L17 8.5l-7 7-3-3 1.5-1.5 1.5 1.5L15.5 7z" fill="currentColor"/>
            <path d="M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm-8 6a8 8 0 1 1 16 0 8 8 0 0 1-16 0z" fill="currentColor"/>
          </svg>
        }
        errors={errors}
        onGoogleClick={handleGoogleClick}
        submitting={isSubmitting}
        onForgotPassword={() => navigate(`/forgot-password?userType=${userType}`)}
        onFieldChange={(name) => {
          setErrors((prev) => ({
            ...prev,
            [name]: undefined,
            general: undefined,
          }));
        }}
      />
    </LoginLayout>
  );
};

export default Login;
