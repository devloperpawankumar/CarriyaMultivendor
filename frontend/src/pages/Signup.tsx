import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupLayout from '../components/auth/SignupLayout';
import SignupForm, { SignupFormData } from '../components/auth/SignupForm';
import signupImage from '../assets/images/auth/Rectangle 114.png';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');

  const handleSubmit = (data: SignupFormData) => {
    // Handle buyer signup logic here
    console.log('Buyer signup data:', { ...data, userType });
    
    // For now, navigate to email verification
    // In a real app, you would send this data to your backend
    navigate('/email-verification');
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
        submitButtonText="Verify Email"
        submitButtonIcon={
          <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
          </svg>
        }
        showPhoneField={true}
      />
    </SignupLayout>
  );
};

export default Signup;