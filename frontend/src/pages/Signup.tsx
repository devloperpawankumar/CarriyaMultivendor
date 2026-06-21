import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import SignupLayout from '../components/auth/SignupLayout';
import SignupForm, { SignupFormData } from '../components/auth/SignupForm';
import signupImage from '../assets/images/auth/Rectangle 114.png';
import { buyerSignup, googleBuyerSignIn } from '../services/buyerAuthService';
import { useToast } from '../contexts/ToastContext';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
  const [isLoading, setIsLoading] = useState(false);

  const getBuyerRedirectPath = () => {
    const fromLocation = (location.state as { from?: Location } | null)?.from;
    if (fromLocation) {
      return `${fromLocation.pathname}${fromLocation.search ?? ''}${fromLocation.hash ?? ''}`;
    }
    const saved = localStorage.getItem('signup_redirect_path');
    return saved || '/';
  };

  const handleGoogleClick = async () => {
    try {
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
            const result = await googleBuyerSignIn(credential);
            showToast({ type: 'success', title: 'Signed in with Google' });
            navigate('/home');
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

  const handleSubmit = async (data: SignupFormData) => {
    if (userType === 'buyer') {
      setIsLoading(true);
      try {
        const response = await buyerSignup({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone
        });
        
        showToast({ type: 'success', title: 'OTP sent to your email!' });
        
        // Store user data for email verification
        const redirectPath = getBuyerRedirectPath();
        localStorage.setItem('signup_redirect_path', redirectPath);
        localStorage.setItem('buyer_signup_data', JSON.stringify({
          userId: response.userId,
          email: response.email,
          phone: response.phone,
          firstName: data.firstName,
          lastName: data.lastName,
          redirectPath,
        }));
        
        // Navigate to buyer email verification
        navigate('/buyer-email-verification');
      } catch (error: any) {
        console.error('Buyer signup error:', error);
        
        if (error.response?.status === 409) {
          const errorData = error.response.data;
          if (errorData.fieldErrors?.email) {
            showToast({
              type: 'error',
              title: 'Email Already Registered',
              message: 'This email is already registered. Please login.',
            });
          } else if (errorData.fieldErrors?.phone) {
            showToast({
              type: 'error',
              title: 'Phone Already Registered',
              message: 'This phone number is already registered. Please login.',
            });
          } else if (errorData.error) {
            showToast({
              type: 'error',
              title: 'Registration Failed',
              message: errorData.error,
            });
          } else {
            showToast({
              type: 'error',
              title: 'Registration Failed',
              message: errorData.message || 'Please try again.',
            });
          }
        } else {
          showToast({
            type: 'error',
            title: 'Registration Failed',
            message: 'Please try again.',
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUserTypeChange = (type: 'buyer' | 'seller') => {
    setUserType(type);
    // Navigate to appropriate signup page based on user type
    if (type === 'seller') {
      navigate('/seller-signup');
    }
  };

  return (
    <SignupLayout
      imageSrc={signupImage}
      imageAlt="Buyer Signup"
    >
      <SignupForm
        userType={userType}
        onUserTypeChange={handleUserTypeChange}
        onSubmit={handleSubmit}
        submitButtonText={isLoading ? "Creating Account..." : "Verify Email"}
        submitButtonIcon={
          isLoading ? (
            <svg className="w-5 h-5 md:w-6 md:h-6 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
            </svg>
          )
        }
        showPhoneField={true}
        isLoading={isLoading}
        onGoogleClick={handleGoogleClick}
      />
    </SignupLayout>
  );
};

export default Signup;