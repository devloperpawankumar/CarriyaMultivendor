import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserTypeToggle from './UserTypeToggle';
import FormField from './FormField';
import TermsCheckbox from './TermsCheckbox';
import ActionButton from './ActionButton';

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface SignupFormProps {
  userType: 'buyer' | 'seller';
  onUserTypeChange: (type: 'buyer' | 'seller') => void;
  onSubmit: (data: SignupFormData) => void;
  submitButtonText: string;
  submitButtonIcon?: React.ReactNode;
  showPhoneField?: boolean;
  className?: string;
}

const SignupForm: React.FC<SignupFormProps> = ({
  userType,
  onUserTypeChange,
  onSubmit,
  submitButtonText,
  submitButtonIcon,
  showPhoneField = true,
  className = ''
}) => {
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={`max-w-[352px] md:max-w-[600px] mx-auto lg:mx-0 ${className}`}>
      {/* Mobile: constrain form width to 352px; desktop remains 600px */}
      {/* Header (Mobile: tighter spacing) */}
      <div className="mb-4 md:mb-8">
        <h1 className="text-[20px] md:text-[40px] font-semibold text-black mb-1 md:mb-2">
          Create an account
        </h1>
      </div>

      {/* User Type Toggle */}
      <div className="mb-6 md:mb-8 ">
        {/* Mobile: center toggle and cap width to 302px to match Figma */}
        <div className="mx-auto max-w-[302px] md:max-w-[469px] w-full py-4">
          <UserTypeToggle
            userType={userType}
            onUserTypeChange={onUserTypeChange}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
        {/* Name Fields Row (Mobile: 2 columns) */}
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <div className="flex-1">
            <FormField
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
              required
            />
          </div>
          <div className="flex-1">
            <FormField
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <FormField
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter Email"
          required
        />

        {/* Password Field */}
        <FormField
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Password"
          required
        />

        {/* Phone Fields Row - Only show if showPhoneField is true */}
        {showPhoneField && (
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
              <FormField
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="321 123456"
                required
              />
            </div>
          </div>
        )}

        {/* Terms and Conditions with Checkbox */}
        <TermsCheckbox />

        {/* Action Button (Mobile: 352px width centered) */}
        <div className="mb-6 flex justify-center md:block">
          <ActionButton
            type="submit"
            text={submitButtonText}
            icon={submitButtonIcon}
            className="w-[352px] md:w-full h-[29px] md:h-[48px] bg-[#2ECC71] text-white rounded-[45px] text-[15px] md:text-[25px] font-normal hover:bg-[#27AE60] transition-colors flex items-center justify-center gap-3 md:gap-4"
          />
        </div>

        {/* Or continue with divider (Mobile: tighter spacing and font) */}
        <div className="flex items-center mb-3 md:mb-6">
          <div className="flex-1 h-px bg-[#767676]"></div>
          <span className="px-2 text-[10px] md:text-[20px] font-light text-[#767676]">or continue with</span>
          <div className="flex-1 h-px bg-[#767676]"></div>
        </div>

        {/* Google Button (Mobile: smaller chip) */}
        <div className="flex justify-center">
          <button
            type="button"
            className="flex items-center gap-2 md:gap-4 px-4 md:px-8 py-1 md:py-1 border border-[#949494] rounded-[45px] hover:bg-gray-50 transition-colors"
          >
            <div className="w-4 h-4 md:w-6 md:h-6">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <span className="text-[15px] md:text-[30px] font-medium text-black">Google</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
