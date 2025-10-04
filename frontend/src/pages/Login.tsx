import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginLayout from '../components/auth/LoginLayout';
import LoginForm, { LoginFormData } from '../components/auth/LoginForm';
import loginImage from '../assets/images/auth/Rectangle 114.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');

  const handleSubmit = (data: LoginFormData) => {
    // Handle login logic here
    console.log('Login data:', { ...data, userType });
    
    // Redirect based on user type after successful login
    if (userType === 'buyer') {
      navigate('/home'); // or navigate to home/dashboard after login
    } else {
      navigate('/seller/dashboard'); // navigate to seller dashboard
    }
  };

  const handleUserTypeChange = (type: 'buyer' | 'seller') => {
    setUserType(type);
  };

  return (
    <LoginLayout
      imageSrc={loginImage}
      imageAlt="Login"
    >
      <LoginForm
        userType={userType}
        onUserTypeChange={handleUserTypeChange}
        onSubmit={handleSubmit}
        submitButtonText="Sign In"
        submitButtonIcon={
          <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
            <path d="M15.5 7L17 8.5l-7 7-3-3 1.5-1.5 1.5 1.5L15.5 7z" fill="currentColor"/>
            <path d="M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm-8 6a8 8 0 1 1 16 0 8 8 0 0 1-16 0z" fill="currentColor"/>
          </svg>
        }
      />
    </LoginLayout>
  );
};

export default Login;
