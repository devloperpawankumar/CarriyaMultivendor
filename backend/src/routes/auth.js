import { Router } from 'express';
import { validate, isRequired, isEmail, minLength, isPhone } from '../middleware/validate.js';
import { signup, login, me, logout, requestSellerOtp, verifySellerOtp, requestEmailOtp, verifyEmailOtpController, checkPhone, buyerSignup, verifyBuyerEmailOtp, resendBuyerEmailOtp, requestBuyerPhoneOtp, verifyBuyerPhoneOtp, resendBuyerPhoneOtp, googleAuthBuyer, requestPasswordReset, resetPassword } from '../controllers/authController.js';
import { authRateLimit } from '../middleware/rateLimit.js';

const router = Router();

router.post(
  '/auth/signup',
  validate({
    body: {
      firstName: [isRequired('First name is required')],
      lastName: [isRequired('Last name is required')],
      email: [isRequired('Email is required'), isEmail()],
      password: [isRequired('Password is required'), minLength(6)],
      phone: [isRequired('Phone is required'), isPhone()],
    },
  }),
  signup
);

router.post(
  '/auth/login',
  authRateLimit,
  validate({ body: { email: [isRequired(), isEmail()], password: [isRequired()] } }),
  login
);

router.get('/auth/me', me);
// Password reset
router.post(
  '/auth/password/forgot',
  authRateLimit,
  validate({ body: { email: [isRequired('Email is required'), isEmail()] } }),
  requestPasswordReset
);

router.post(
  '/auth/password/reset',
  validate({ body: { token: [isRequired('Token is required')], newPassword: [isRequired('Password is required'), minLength(6)], confirmPassword: [isRequired('Confirm is required')] } }),
  resetPassword
);


router.post('/auth/logout', logout);

// Seller OTP endpoints
router.post('/auth/seller/request-otp', authRateLimit, validate({ body: { phone: [isRequired('Phone is required')] } }), requestSellerOtp);
router.post('/auth/seller/verify-otp', authRateLimit, validate({ body: { phone: [isRequired('Phone is required')], code: [isRequired('Code is required')] } }), verifySellerOtp);

// Phone existence check (for prevalidation in seller signup UI)
router.get('/auth/check-phone', checkPhone);

// Email OTP endpoints
router.post('/auth/email/request-otp', validate({ body: { email: [isRequired('Email is required'), isEmail()] } }), requestEmailOtp);
router.post('/auth/email/verify-otp', validate({ body: { email: [isRequired('Email is required'), isEmail()], code: [isRequired('Code is required')] } }), verifyEmailOtpController);

// Buyer signup endpoints
router.post(
  '/auth/buyer/signup',
  authRateLimit,
  validate({
    body: {
      firstName: [isRequired('First name is required')],
      lastName: [isRequired('Last name is required')],
      email: [isRequired('Email is required'), isEmail()],
      password: [isRequired('Password is required'), minLength(6)],
      phone: [isRequired('Phone is required'), isPhone()],
    },
  }),
  buyerSignup
);

router.post(
  '/auth/buyer/verify-email',
  validate({
    body: {
      email: [isRequired('Email is required'), isEmail()],
      code: [isRequired('Code is required')],
      userId: [isRequired('User ID is required')],
    },
  }),
  verifyBuyerEmailOtp
);

router.post(
  '/auth/buyer/request-otp',
  validate({
    body: {
      email: [isRequired('Email is required'), isEmail()],
    },
  }),
  resendBuyerEmailOtp
);

// Buyer phone OTP endpoints
router.post(
  '/auth/buyer/request-phone-otp',
  validate({
    body: {
      phone: [isRequired('Phone is required')],
      userId: [isRequired('User ID is required')],
    },
  }),
  requestBuyerPhoneOtp
);

router.post(
  '/auth/buyer/verify-phone-otp',
  validate({
    body: {
      phone: [isRequired('Phone is required')],
      code: [isRequired('Code is required')],
      userId: [isRequired('User ID is required')],
    },
  }),
  verifyBuyerPhoneOtp
);

router.post(
  '/auth/buyer/resend-phone-otp',
  validate({
    body: {
      phone: [isRequired('Phone is required')],
      userId: [isRequired('User ID is required')],
    },
  }),
  resendBuyerPhoneOtp
);

// Google Sign-In for buyers
router.post(
  '/auth/buyer/google',
  validate({ body: { idToken: [isRequired('idToken is required')] } }),
  googleAuthBuyer
);

export default router;


