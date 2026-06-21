import { ToastType } from '../contexts/ToastContext';

// Utility functions for common toast patterns
export const toastUtils = {
  success: (title: string, message?: string, duration?: number) => ({
    type: 'success' as ToastType,
    title,
    message,
    duration,
  }),
  
  error: (title: string, message?: string, duration?: number) => ({
    type: 'error' as ToastType,
    title,
    message,
    duration,
  }),
  
  warning: (title: string, message?: string, duration?: number) => ({
    type: 'warning' as ToastType,
    title,
    message,
    duration,
  }),
  
  info: (title: string, message?: string, duration?: number) => ({
    type: 'info' as ToastType,
    title,
    message,
    duration,
  }),
};

// Common toast messages
export const commonToasts = {
  // Success messages
  addedToCart: () => toastUtils.success('Added to Cart', 'Product has been added to the cart', 3000),
  paymentSuccess: () => toastUtils.success('Payment Successful', 'Your payment has been processed successfully!'),
  loginSuccess: () => toastUtils.success('Login Successful', 'Welcome back!'),
  signupSuccess: () => toastUtils.success('Signup Successful', 'Account created successfully!'),
  orderPlaced: () => toastUtils.success('Order Placed', 'We’ve received your order.'),
  
  // Error messages
  userExists: () => toastUtils.error('User Already Exists', 'This email/phone is already registered. Please login.'),
  invalidCode: () => toastUtils.error('Invalid Code', 'Invalid or expired code. Please try again.'),
  otpSendFailed: () => toastUtils.error('OTP Send Failed', 'Failed to send OTP. Please try again.'),
  validationError: () => toastUtils.error('Validation Error', 'Please fix the highlighted errors.'),
  
  // Warning messages
  selectPaymentMethod: () => toastUtils.warning('Payment Method Required', 'Please select a payment method'),
  
  // Info messages
  processing: () => toastUtils.info('Processing', 'Please wait while we process your request...'),
};
