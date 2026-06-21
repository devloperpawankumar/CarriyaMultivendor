// Validation utility functions for form validation

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    return { isValid: false, message: 'Email is required' };
  }
  
  // More comprehensive email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    return { isValid: false, message: 'Email cannot contain consecutive dots' };
  }
  
  // Check for valid domain length
  const domain = trimmedEmail.split('@')[1];
  if (domain && domain.length < 3) {
    return { isValid: false, message: 'Email domain must be at least 3 characters' };
  }
  
  // Check for valid local part length
  const localPart = trimmedEmail.split('@')[0];
  if (localPart && localPart.length > 64) {
    return { isValid: false, message: 'Email local part cannot exceed 64 characters' };
  }
  
  return { isValid: true, message: '' };
};

// Name validation (first name, last name)
export const validateName = (name: string, fieldName: string): ValidationResult => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (trimmedName.length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters` };
  }
  
  // Check if name starts with a number
  if (/^\d/.test(trimmedName)) {
    return { isValid: false, message: `${fieldName} cannot start with a number` };
  }
  
  // Check if name contains only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[A-Za-z\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, message: `${fieldName} must contain only letters, spaces, hyphens, and apostrophes` };
  }
  
  // Check if name contains any numbers
  if (/\d/.test(trimmedName)) {
    return { isValid: false, message: `${fieldName} cannot contain numbers` };
  }
  
  return { isValid: true, message: '' };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password must not exceed 128 characters' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!hasUpperCase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter (A-Z)' };
  }
  
  if (!hasLowerCase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter (a-z)' };
  }
  
  if (!hasNumbers) {
    return { isValid: false, message: 'Password must contain at least one number (0-9)' };
  }
  
  if (!hasSpecialChar) {
    return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)' };
  }
  
  // Check for common weak patterns
  if (/(.)\1{2,}/.test(password)) {
    return { isValid: false, message: 'Password cannot contain more than 2 consecutive identical characters' };
  }
  
  // Check for common sequences
  const commonSequences = ['123', 'abc', 'qwe', 'asd', 'zxc'];
  const lowerPassword = password.toLowerCase();
  for (const sequence of commonSequences) {
    if (lowerPassword.includes(sequence)) {
      return { isValid: false, message: 'Password cannot contain common sequences like "123" or "abc"' };
    }
  }
  
  return { isValid: true, message: '' };
};

// Phone number validation
export const validatePhone = (phone: string): ValidationResult => {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (!phone.trim()) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  // Must be exactly 10 digits
  if (cleanPhone.length !== 10) {
    return { isValid: false, message: 'Phone number must be exactly 10 digits' };
  }
  
  return { isValid: true, message: '' };
};

// Form validation interface
export interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
}

// Validate entire signup form
export const validateSignupForm = (formData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {};
  
  // Validate first name
  const firstNameValidation = validateName(formData.firstName, 'First name');
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.message;
  }
  
  // Validate last name
  const lastNameValidation = validateName(formData.lastName, 'Last name');
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.message;
  }
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }
  
  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }
  
  // Validate phone
  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
