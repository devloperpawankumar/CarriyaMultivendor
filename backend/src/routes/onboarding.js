import { Router } from 'express';
import { validate, isRequired } from '../middleware/validate.js';
import { startOnboarding, upsertOnboarding, completeOnboarding, uploadIdImages, uploadSingleImage, submitBasicInfo, submitEmail, submitAddress, submitBusiness, submitBank, getOnboardingStatus, verifyOtpStep, submitBasicInfoStep, verifyEmailStep, submitAddressStep, submitIdVerificationStep, submitBankStep, getOnboardingStatusByPhone } from '../controllers/onboardingController.js';
import multer from 'multer';

// Use memory storage so we can send buffers to Cloudinary
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 7 * 1024 * 1024 } });

const router = Router();

router.post('/auth/seller/onboarding/start', validate({ body: { phone: [isRequired('Phone is required')] } }), startOnboarding);
router.post('/auth/seller/onboarding/upsert', validate({ body: { phone: [isRequired('Phone is required')] } }), upsertOnboarding);
router.post('/auth/seller/onboarding/complete', validate({ body: { phone: [isRequired('Phone is required')] } }), completeOnboarding);
// removed save-address in favor of SellerOnboarding.address

// Step-specific endpoints
router.post('/auth/seller/onboarding/submit-basic-info', validate({ body: { userId: [isRequired('UserId is required')] } }), submitBasicInfo);
router.post('/auth/seller/onboarding/submit-email', validate({ body: { userId: [isRequired('UserId is required')], email: [isRequired('Email is required')] } }), submitEmail);
router.post('/auth/seller/onboarding/submit-address', validate({ body: { userId: [isRequired('UserId is required')] } }), submitAddress);
router.post('/auth/seller/onboarding/submit-business', validate({ body: { userId: [isRequired('UserId is required')] } }), submitBusiness);
router.post('/auth/seller/onboarding/submit-bank', validate({ body: { userId: [isRequired('UserId is required')] } }), submitBank);

// Upload ID card images (front and back) to Cloudinary
router.post('/auth/seller/onboarding/upload-id', upload.fields([
  { name: 'frontIdImage', maxCount: 1 },
  { name: 'backIdImage', maxCount: 1 },
]), uploadIdImages);

// Single image upload (used for immediate previews)
router.post('/auth/seller/onboarding/upload-image', upload.single('image'), uploadSingleImage);

// New unified endpoints per requirements
router.get('/seller/onboarding-status', getOnboardingStatus);
router.post('/seller/verify-otp', validate({ body: { phone: [isRequired('Phone is required')], code: [isRequired('Code is required')] } }), verifyOtpStep);
router.post('/seller/basic-info', validate({ body: { userId: [isRequired('UserId is required')] } }), submitBasicInfoStep);
router.post('/seller/verify-email', validate({ body: { userId: [isRequired('UserId is required')], email: [isRequired('Email is required')] } }), verifyEmailStep);
router.post('/seller/address', validate({ body: { userId: [isRequired('UserId is required')] } }), submitAddressStep);
router.post('/seller/id-verification', upload.fields([
  { name: 'frontIdImage', maxCount: 1 },
  { name: 'backIdImage', maxCount: 1 },
]), submitIdVerificationStep);
router.post('/seller/bank', upload.fields([
  { name: 'bankDocument', maxCount: 1 },
]), submitBankStep);

// Status by phone for pre-checks on signup
router.get('/seller/onboarding-status-by-phone', getOnboardingStatusByPhone);

export default router;


