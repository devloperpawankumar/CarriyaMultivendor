import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UserTypeToggle from './UserTypeToggle';
import FormField from './FormField';
import TermsCheckbox from './TermsCheckbox';
import ActionButton from './ActionButton';
import { validateSignupForm, FormErrors, validateName, validateEmail, validatePassword, validatePhone } from '../../utils/validation';
import { checkEmailExists, checkPhoneExists } from '../../services/buyerAuthService';
import { useToast } from '../../contexts/ToastContext';

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
  isLoading?: boolean;
  onGoogleClick?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({
  userType,
  onUserTypeChange,
  onSubmit,
  submitButtonText,
  submitButtonIcon,
  showPhoneField = true,
  className = '',
  isLoading = false,
  onGoogleClick
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationLoading, setValidationLoading] = useState<{
    email: boolean;
    phone: boolean;
  }>({
    email: false,
    phone: false,
  });

  // Debounced validation functions
  const debouncedEmailValidation = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (email: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (email && validateEmail(email).isValid) {
            setValidationLoading(prev => ({ ...prev, email: true }));
            try {
              const result = await checkEmailExists(email);
              if (result.exists) {
                setFormErrors(prev => ({ ...prev, email: 'This email is already registered' }));
                showToast({
                  type: 'error',
                  title: 'Email Already Registered',
                  message: 'This email is already registered. Please login.',
                });
              } else {
                setFormErrors(prev => ({ ...prev, email: '' }));
              }
            } catch (error) {
              console.error('Email validation error:', error);
            } finally {
              setValidationLoading(prev => ({ ...prev, email: false }));
            }
          }
        }, 500);
      };
    })(),
    [showToast]
  );

  const debouncedPhoneValidation = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (phone: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (phone && phone.length === 10) {
            setValidationLoading(prev => ({ ...prev, phone: true }));
            try {
              const result = await checkPhoneExists(`+92${phone}`);
              if (result.exists) {
                setFormErrors(prev => ({ ...prev, phone: 'This phone number is already registered' }));
                showToast({
                  type: 'error',
                  title: 'Phone Already Registered',
                  message: 'This phone number is already registered. Please login.',
                });
              } else {
                setFormErrors(prev => ({ ...prev, phone: '' }));
              }
            } catch (error) {
              console.error('Phone validation error:', error);
            } finally {
              setValidationLoading(prev => ({ ...prev, phone: false }));
            }
          }
        }, 500);
      };
    })(),
    [showToast]
  );

  // Check if form is valid (no errors and all required fields filled)
  const isFormValid = () => {
    const hasErrors = Object.values(formErrors).some(error => error && error.length > 0);
    const allFieldsFilled = formData.firstName.trim() && 
                           formData.lastName.trim() && 
                           formData.email.trim() && 
                           formData.password.trim() && 
                           formData.phone.trim();
    const isLoadingValidation = validationLoading.email || validationLoading.phone;
    return !hasErrors && allFieldsFilled && !isLoadingValidation;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      // Only allow digits and limit to 10 characters
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
      
      // Clear error when user starts typing
      if (formErrors.phone) {
        setFormErrors(prev => ({ ...prev, phone: '' }));
      }
      
      // Trigger debounced phone validation
      debouncedPhoneValidation(digitsOnly);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Clear error when user starts typing
      if (formErrors[name as keyof FormErrors]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
      
      // Trigger debounced email validation
      if (name === 'email') {
        debouncedEmailValidation(value);
      }
    }
    
    // Real-time validation for the current field
    validateField(name, name === 'phone' ? (value.replace(/\D/g, '').slice(0, 10)) : value);
  };

  const validateField = (fieldName: string, value: string) => {
    let error = '';
    
    switch (fieldName) {
      case 'firstName':
        const firstNameValidation = validateName(value, 'First name');
        error = firstNameValidation.isValid ? '' : firstNameValidation.message;
        break;
      case 'lastName':
        const lastNameValidation = validateName(value, 'Last name');
        error = lastNameValidation.isValid ? '' : lastNameValidation.message;
        break;
      case 'email':
        const emailValidation = validateEmail(value);
        error = emailValidation.isValid ? '' : emailValidation.message;
        break;
      case 'password':
        const passwordValidation = validatePassword(value);
        error = passwordValidation.isValid ? '' : passwordValidation.message;
        break;
      case 'phone':
        const phoneValidation = validatePhone(value);
        error = phoneValidation.isValid ? '' : phoneValidation.message;
        break;
    }
    
    setFormErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.currentTarget;
    
    // Prevent numbers in name fields
    if (name === 'firstName' || name === 'lastName') {
      if (/\d/.test(e.key)) {
        e.preventDefault();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isLoading) return;
    
    setIsSubmitting(true);
    
    // Validate form
    const validation = validateSignupForm(formData);
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }
    
    // Clear any existing errors
    setFormErrors({});
    
    // Prepare form data with +92 prefix for phone
    const formDataWithPrefix = {
      ...formData,
      phone: `+92${formData.phone}`
    };
    
    // Submit form
    onSubmit(formDataWithPrefix);
    setIsSubmitting(false);
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
        {/* Mobile: center toggle and cap width to 302px */}
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
              onKeyPress={handleKeyPress}
              placeholder="First Name"
              required
              error={formErrors.firstName}
            />
          </div>
          <div className="flex-1">
            <FormField
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Last Name"
              required
              error={formErrors.lastName}
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="relative">
          <FormField
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter Email"
            required
            error={formErrors.email}
          />
          {validationLoading.email && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/>
              </svg>
            </div>
          )}
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
            <div className="flex-1 relative">
              <FormField
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="3012345678"
                required
                error={formErrors.phone}
              />
              {validationLoading.phone && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Terms and Conditions with Checkbox */}
        <TermsCheckbox />

        {/* Action Button (Mobile: 352px width centered) - Disabled when form is not valid */}
        <div className="mb-6 flex justify-center md:block">
          <ActionButton
            type="submit"
            text={
              validationLoading.email || validationLoading.phone 
                ? 'Checking availability...' 
                : isSubmitting 
                  ? 'Validating...' 
                  : submitButtonText
            }
            icon={
              validationLoading.email || validationLoading.phone || isSubmitting ? (
                <svg className="w-5 h-5 md:w-6 md:h-6 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/>
                </svg>
              ) : submitButtonIcon
            }
            className={`w-[352px] md:w-full h-[29px] md:h-[48px] rounded-[45px] text-[15px] md:text-[25px] font-normal transition-colors flex items-center justify-center gap-3 md:gap-4 ${
              !isFormValid() || isSubmitting || isLoading || validationLoading.email || validationLoading.phone
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-[#2ECC71] text-white hover:bg-[#27AE60]'
            }`}
            disabled={!isFormValid() || isSubmitting || isLoading || validationLoading.email || validationLoading.phone}
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
            onClick={onGoogleClick}
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
