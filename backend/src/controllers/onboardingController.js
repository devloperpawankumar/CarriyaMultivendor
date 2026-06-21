import { SellerOnboarding } from '../models/SellerOnboarding.js';
import { httpError } from '../middleware/errors.js';
import bcrypt from 'bcryptjs';
import { configureCloudinary, uploadBufferToCloudinary } from '../utils/cloudinary.js';
import { User } from '../models/User.js';
import { signJwt } from '../utils/jwt.js';
import { getAuthCookieOptions } from '../utils/cookieOptions.js';
import { verifyOtp as verifyOtpService, verifyEmailOtp as verifyEmailCodeService } from '../services/otp.js';

// Create or fetch onboarding record once OTP is verified
export async function startOnboarding(req, res, next) {
  try {
    const { phone } = req.body || {};
    if (!phone) return next(httpError(422, 'Validation failed', { phone: 'Phone is required' }));
    // Ensure a seller user exists
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, role: 'seller' });
    }
    const existing = await SellerOnboarding.findOne({ phone });
    if (existing) return res.json(existing);
    const created = await SellerOnboarding.create({ userId: user._id, phone, isOtpVerified: false, currentStep: 1, status: 'pending' });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
}

// Upsert partial info across steps (firstName, lastName, email, password)
export async function upsertOnboarding(req, res, next) {
  try {
    const { phone, firstName, lastName, email, password, confirmPassword, address, idCardName, idCardNumber, idCardFrontUrl, idCardBackUrl, bank } = req.body || {};
    if (!phone) return next(httpError(422, 'Validation failed', { phone: 'Phone is required' }));
    const errors = {};

    // If any identity fields are present, validate them
    const hasIdentity = firstName !== undefined || lastName !== undefined || password !== undefined || confirmPassword !== undefined;
    if (hasIdentity) {
      const nameRegex = /^[A-Za-z\s'-]{2,}$/;
      if (!firstName || !nameRegex.test(String(firstName).trim())) {
        errors.firstName = 'First name must be at least 2 letters (letters/spaces only)';
      }
      if (!lastName || !nameRegex.test(String(lastName).trim())) {
        errors.lastName = 'Last name must be at least 2 letters (letters/spaces only)';
      }
      if (password === undefined || String(password).length === 0) {
        errors.password = 'Password is required';
      } else {
        const passStr = String(password);
        const strong = passStr.length >= 8 && /[a-z]/.test(passStr) && /[A-Z]/.test(passStr) && /\d/.test(passStr) && /[^A-Za-z0-9]/.test(passStr);
        if (!strong) {
          errors.password = 'Password must be 8+ chars with upper, lower, number, and special char';
        }
      }
      if (confirmPassword === undefined || String(confirmPassword) !== String(password)) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    if (Object.keys(errors).length) {
      return next(httpError(422, 'Validation failed', errors));
    }

    // Build $set update only for provided fields; nested according to schema
    const setUpdate = { status: 'in_progress' };
    // Step 2: basic info
    if (firstName !== undefined) setUpdate['basicInfo.firstName'] = firstName;
    if (lastName !== undefined) setUpdate['basicInfo.lastName'] = lastName;
    if (password) {
      const hash = await bcrypt.genSalt(10).then((s) => bcrypt.hash(password, s));
      setUpdate['basicInfo.passwordHash'] = hash;
    }
    // Step 3: email
    if (email !== undefined) {
      setUpdate['email'] = email;
      setUpdate['isEmailVerified'] = false;
    }
    // Step 4: address
    if (address && typeof address === 'object') {
      const a = address;
      if (a.pickupAddress !== undefined) setUpdate['address.pickupAddress'] = a.pickupAddress;
      if (a.pickupProvince !== undefined) setUpdate['address.pickupProvince'] = a.pickupProvince;
      if (a.pickupDistrict !== undefined) setUpdate['address.pickupDistrict'] = a.pickupDistrict;
      if (a.returnAddress !== undefined) setUpdate['address.returnAddress'] = a.returnAddress;
      if (a.returnProvince !== undefined) setUpdate['address.returnProvince'] = a.returnProvince;
      if (a.returnDistrict !== undefined) setUpdate['address.returnDistrict'] = a.returnDistrict;
      if (a.sameAsPickup !== undefined) setUpdate['address.sameAsPickup'] = !!a.sameAsPickup;
    }
    // Step 5: business (ID)
    if (idCardName !== undefined) setUpdate['business.idCardName'] = idCardName;
    if (idCardNumber !== undefined) setUpdate['business.idCardNumber'] = idCardNumber;
    if (idCardFrontUrl !== undefined) setUpdate['business.idCardFrontUrl'] = idCardFrontUrl;
    if (idCardBackUrl !== undefined) setUpdate['business.idCardBackUrl'] = idCardBackUrl;
    // Step 6: bank
    if (bank && typeof bank === 'object') {
      const b = bank;
      if (b.accountHolderName !== undefined) setUpdate['bank.accountHolderName'] = b.accountHolderName;
      if (b.accountNumber !== undefined) setUpdate['bank.accountNumber'] = b.accountNumber;
      if (b.ibanNumber !== undefined) setUpdate['bank.ibanNumber'] = b.ibanNumber;
      if (b.bankName !== undefined) setUpdate['bank.bankName'] = b.bankName;
      if (b.branchCode !== undefined) setUpdate['bank.branchCode'] = b.branchCode;
      if (b.bankDocumentUrl !== undefined) setUpdate['bank.bankDocumentUrl'] = b.bankDocumentUrl;
    }

    // Step tracking heuristic
    if (idCardBackUrl || idCardFrontUrl || idCardNumber || idCardName) setUpdate['currentStep'] = 6; // likely toward bank step
    else if (address) setUpdate['currentStep'] = 5;
    else if (email) setUpdate['currentStep'] = 4;
    else if (firstName || lastName || password) setUpdate['currentStep'] = 3;

    const doc = await SellerOnboarding.findOneAndUpdate({ phone }, { $set: setUpdate }, { new: true, upsert: true });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

// Complete onboarding: create final seller user and delete onboarding

export async function completeOnboarding(req, res, next) {
  try {
    const { phone } = req.body || {};
    if (!phone) return next(httpError(422, 'Validation failed', { phone: 'Phone is required' }));
    const ob = await SellerOnboarding.findOne({ phone });
    if (!ob) return next(httpError(404, 'Onboarding not found'));

    // Validate that all required onboarding steps have been provided
    const errors = {};
    const addr = ob.address || {};
    const idDoc = (ob.business || {});
    const bank = ob.bank || {};

    // Address
    if (!addr.pickupAddress) errors.pickupAddress = 'Pickup address is required';
    if (!addr.pickupProvince) errors.pickupProvince = 'Pickup province is required';
    if (!addr.pickupDistrict) errors.pickupDistrict = 'Pickup district is required';
    if (!addr.returnAddress) errors.returnAddress = 'Return address is required';
    if (!addr.returnProvince) errors.returnProvince = 'Return province is required';
    if (!addr.returnDistrict) errors.returnDistrict = 'Return district is required';

    // National ID
    if (!idDoc.idCardName) errors.idCardName = 'Name on ID is required';
    if (!idDoc.idCardNumber) errors.idCardNumber = 'ID card number is required';
    if (!idDoc.idCardFrontUrl) errors.idCardFrontUrl = 'Front ID image is required';
    if (!idDoc.idCardBackUrl) errors.idCardBackUrl = 'Back ID image is required';

    // Bank
    if (!bank.accountHolderName) errors.accountHolderName = 'Bank account holder name is required';
    if (!bank.accountNumber) errors.accountNumber = 'Bank account number is required';
    if (!bank.bankName) errors.bankName = 'Bank name is required';
    if (!bank.bankDocumentUrl) errors.bankDocumentUrl = 'Bank document image is required';

    if (Object.keys(errors).length) {
      return next(httpError(422, 'Onboarding is incomplete', errors));
    }

    // Update linked seller user from onboarding info
    const user = await User.findOne({ phone: ob.phone });
    if (!user) return next(httpError(409, 'User missing for onboarding'));
    const update = {
      email: ob.email || user.email,
      firstName: ob.basicInfo?.firstName || user.firstName,
      lastName: ob.basicInfo?.lastName || user.lastName,
      isEmailVerified: !!ob.isEmailVerified,
      role: 'seller',
    };
    if (ob.basicInfo?.passwordHash) {
      update.passwordHash = ob.basicInfo.passwordHash;
    }
    await User.updateOne({ _id: user._id }, { $set: update });

    await SellerOnboarding.updateOne({ _id: ob._id }, { $set: { status: 'completed', currentStep: 6 } });

    const fresh = await User.findById(user._id);
    const token = signJwt({ id: fresh._id.toString(), role: fresh.role, phone: fresh.phone, email: fresh.email });
    res.cookie('token', token, getAuthCookieOptions());
    res.json({ id: fresh._id, phone: fresh.phone, email: fresh.email, firstName: fresh.firstName, lastName: fresh.lastName, role: fresh.role });
  } catch (e) {
    next(e);
  }
}

// Step-specific endpoints matching frontend DTOs
export async function submitBasicInfo(req, res, next) {
  try {
    const { userId, firstName, lastName, password } = req.body || {};
    if (!userId) return next(httpError(422, 'Validation failed', { userId: 'Required' }));
    const setUpdate = { currentStep: 3, status: 'in_progress' };
    if (firstName !== undefined) setUpdate['basicInfo.firstName'] = firstName;
    if (lastName !== undefined) setUpdate['basicInfo.lastName'] = lastName;
    if (password) {
      const hash = await bcrypt.genSalt(10).then((s) => bcrypt.hash(password, s));
      setUpdate['basicInfo.passwordHash'] = hash;
    }
    const doc = await SellerOnboarding.findOneAndUpdate({ userId }, { $set: setUpdate }, { new: true });
    if (!doc) return next(httpError(404, 'Onboarding not found'));
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function submitEmail(req, res, next) {
  try {
    const { userId, email } = req.body || {};
    if (!userId || !email) return next(httpError(422, 'Validation failed', { userId: 'Required', email: 'Required' }));
    // Prevent email collisions with existing users
    const emailUser = await User.findOne({ email: String(email).toLowerCase() });
    if (emailUser && String(emailUser._id) !== String(userId)) {
      return next(httpError(409, 'Email already registered', { email: 'Already registered' }));
    }
    const doc = await SellerOnboarding.findOneAndUpdate(
      { userId },
      { $set: { email, isEmailVerified: false, currentStep: 4, status: 'in_progress' } },
      { new: true }
    );
    if (!doc) return next(httpError(404, 'Onboarding not found'));
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function submitAddress(req, res, next) {
  try {
    const { userId, address } = req.body || {};
    if (!userId || !address) return next(httpError(422, 'Validation failed', { userId: 'Required', address: 'Required' }));
    const setUpdate = { currentStep: 5, status: 'in_progress' };
    const a = address || {};
    if (a.pickupAddress !== undefined) setUpdate['address.pickupAddress'] = a.pickupAddress;
    if (a.pickupProvince !== undefined) setUpdate['address.pickupProvince'] = a.pickupProvince;
    if (a.pickupDistrict !== undefined) setUpdate['address.pickupDistrict'] = a.pickupDistrict;
    if (a.returnAddress !== undefined) setUpdate['address.returnAddress'] = a.returnAddress;
    if (a.returnProvince !== undefined) setUpdate['address.returnProvince'] = a.returnProvince;
    if (a.returnDistrict !== undefined) setUpdate['address.returnDistrict'] = a.returnDistrict;
    if (a.sameAsPickup !== undefined) setUpdate['address.sameAsPickup'] = !!a.sameAsPickup;
    const doc = await SellerOnboarding.findOneAndUpdate({ userId }, { $set: setUpdate }, { new: true });
    if (!doc) return next(httpError(404, 'Onboarding not found'));
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function submitBusiness(req, res, next) {
  try {
    const { userId, idCardName, idCardNumber, idCardFrontUrl, idCardBackUrl } = req.body || {};
    if (!userId) return next(httpError(422, 'Validation failed', { userId: 'Required' }));
    const setUpdate = { currentStep: 6, status: 'in_progress' };
    if (idCardName !== undefined) setUpdate['business.idCardName'] = idCardName;
    if (idCardNumber !== undefined) setUpdate['business.idCardNumber'] = idCardNumber;
    if (idCardFrontUrl !== undefined) setUpdate['business.idCardFrontUrl'] = idCardFrontUrl;
    if (idCardBackUrl !== undefined) setUpdate['business.idCardBackUrl'] = idCardBackUrl;
    const doc = await SellerOnboarding.findOneAndUpdate({ userId }, { $set: setUpdate }, { new: true });
    if (!doc) return next(httpError(404, 'Onboarding not found'));
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function submitBank(req, res, next) {
  try {
    const { userId, accountHolderName, accountNumber, ibanNumber, bankName, branchCode, bankDocumentUrl } = req.body || {};
    if (!userId) return next(httpError(422, 'Validation failed', { userId: 'Required' }));
    const setUpdate = { status: 'in_progress' };
    if (accountHolderName !== undefined) setUpdate['bank.accountHolderName'] = accountHolderName;
    if (accountNumber !== undefined) setUpdate['bank.accountNumber'] = accountNumber;
    if (ibanNumber !== undefined) setUpdate['bank.ibanNumber'] = ibanNumber;
    if (bankName !== undefined) setUpdate['bank.bankName'] = bankName;
    if (branchCode !== undefined) setUpdate['bank.branchCode'] = branchCode;
    if (bankDocumentUrl !== undefined) setUpdate['bank.bankDocumentUrl'] = bankDocumentUrl;
    const doc = await SellerOnboarding.findOneAndUpdate({ userId }, { $set: setUpdate }, { new: true });
    if (!doc) return next(httpError(404, 'Onboarding not found'));

    // If all required steps are satisfied, mark completed
    const addr = doc.address || {};
    const biz = doc.business || {};
    const bank = doc.bank || {};
    const hasAddress = !!(addr.pickupAddress && addr.pickupProvince && addr.pickupDistrict && addr.returnAddress && addr.returnProvince && addr.returnDistrict);
    const hasKyc = !!(biz.idCardName && biz.idCardNumber && biz.idCardFrontUrl && biz.idCardBackUrl);
    const hasBank = !!(bank.accountHolderName && bank.accountNumber && bank.bankName && bank.bankDocumentUrl);
    const verifiedFlags = !!(doc.isOtpVerified && doc.isEmailVerified);

    if (hasAddress && hasKyc && hasBank && verifiedFlags) {
      const finalDoc = await SellerOnboarding.findOneAndUpdate(
        { _id: doc._id },
        { $set: { status: 'completed', currentStep: 6 } },
        { new: true }
      );
      return res.json(finalDoc);
    }

    res.json(doc);
  } catch (e) {
    next(e);
  }
}

// Upload ID images to Cloudinary and return their secure URLs
export async function uploadIdImages(req, res, next) {
  try {
    configureCloudinary();
    const front = req.files?.frontIdImage?.[0];
    const back = req.files?.backIdImage?.[0];

    if (!front || !back) {
      return next(httpError(422, 'Both frontIdImage and backIdImage are required'));
    }

    const folder = `carriya/onboarding/${new Date().getFullYear()}`;

    const [frontResult, backResult] = await Promise.all([
      uploadBufferToCloudinary(front.buffer, folder, undefined),
      uploadBufferToCloudinary(back.buffer, folder, undefined),
    ]);

    res.json({
      frontUrl: frontResult.secure_url,
      backUrl: backResult.secure_url,
      frontPublicId: frontResult.public_id,
      backPublicId: backResult.public_id,
    });
  } catch (e) {
    next(e);
  }
}

// Upload a single image to Cloudinary and return its secure URL
export async function uploadSingleImage(req, res, next) {
  try {
    configureCloudinary();
    const file = req.file;
    if (!file) return next(httpError(422, 'Image file is required'));
    const folder = `carriya/onboarding/${new Date().getFullYear()}`;
    const result = await uploadBufferToCloudinary(file.buffer, folder, undefined);
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (e) {
    next(e);
  }
}


// ========================= NEW: Unified Step Endpoints =========================

// GET /api/seller/onboarding-status?userId=...
export async function getOnboardingStatus(req, res, next) {
  try {
    const userId = String(req.query.userId || '').trim();
    if (!userId) return next(httpError(422, 'Validation failed', { userId: 'Required' }));
    const ob = await SellerOnboarding.findOne({ userId }).lean();
    if (!ob) return res.json({ exists: false, currentStep: 1, status: 'pending', steps: {} });

    const steps = {
      otpVerified: !!ob.isOtpVerified,
      basicInfo: !!(ob.basicInfo && (ob.basicInfo.firstName || ob.basicInfo.lastName || ob.basicInfo.passwordHash)),
      emailVerified: !!ob.isEmailVerified,
      address: !!(ob.address && (ob.address.pickupAddress || ob.address.returnAddress)),
      idVerification: !!(ob.business && ob.business.idCardNumber && ob.business.idCardFrontUrl && ob.business.idCardBackUrl),
      bank: !!(ob.bank && ob.bank.accountNumber && ob.bank.bankName && ob.bank.bankDocumentUrl),
    };

    const completedCount = Object.values(steps).filter(Boolean).length;
    const nextStep = steps.otpVerified ? (steps.basicInfo ? (steps.emailVerified ? (steps.address ? (steps.idVerification ? (steps.bank ? 6 : 6) : 5) : 4) : 3) : 2) : 1;
    const overall = completedCount === 6 ? 'completed' : 'in_progress';

    res.json({ exists: true, currentStep: ob.currentStep || nextStep, status: ob.status || overall, steps });
  } catch (e) {
    next(e);
  }
}

// GET /api/seller/onboarding-status-by-phone?phone=...
export async function getOnboardingStatusByPhone(req, res, next) {
  try {
    const raw = String(req.query.phone || '').trim();
    if (!raw) return next(httpError(422, 'Validation failed', { phone: 'Required' }));
    const phone = raw.replace(/\D/g, '');
    const ob = await SellerOnboarding.findOne({ phone }).lean();
    if (!ob) return res.json({ exists: false });

    const steps = {
      otpVerified: !!ob.isOtpVerified,
      basicInfo: !!(ob.basicInfo && (ob.basicInfo.firstName || ob.basicInfo.lastName || ob.basicInfo.passwordHash)),
      emailVerified: !!ob.isEmailVerified,
      address: !!(ob.address && (ob.address.pickupAddress || ob.address.returnAddress)),
      idVerification: !!(ob.business && ob.business.idCardNumber && ob.business.idCardFrontUrl && ob.business.idCardBackUrl),
      bank: !!(ob.bank && ob.bank.accountNumber && ob.bank.bankName && ob.bank.bankDocumentUrl),
    };
    const completed = ob.status === 'completed';
    res.json({ exists: true, userId: ob.userId, status: ob.status, currentStep: ob.currentStep, steps, completed });
  } catch (e) {
    next(e);
  }
}

// POST /api/seller/verify-otp { phone, code }
export async function verifyOtpStep(req, res, next) {
  try {
    const { phone, code } = req.body || {};
    if (!phone || !code) return next(httpError(422, 'Validation failed', { phone: 'Required', code: 'Required' }));
    const ok = verifyOtpService(phone, code);
    if (!ok) return next(httpError(401, 'Invalid or expired code', { code: 'Invalid/expired' }));

    // Prevent duplicate onboarding if already completed
    const existingOb = await SellerOnboarding.findOne({ phone });
    if (existingOb && existingOb.status === 'completed') {
      return next(httpError(409, 'Onboarding already completed for this phone'));
    }

    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone, role: 'seller', isPhoneVerified: true });
    else { user.isPhoneVerified = true; await user.save(); }

    // Also block if an existing seller user is present and onboarding completed previously
    if (user && user.role === 'seller' && existingOb && existingOb.status === 'completed') {
      return next(httpError(409, 'Seller already onboarded'));
    }

    const ob = existingOb
      ? await SellerOnboarding.findOneAndUpdate(
          { _id: existingOb._id },
          { $set: { userId: user._id, isOtpVerified: true, currentStep: 2, status: 'in_progress' } },
          { new: true }
        )
      : await SellerOnboarding.create({ phone, userId: user._id, isOtpVerified: true, currentStep: 2, status: 'in_progress' });
    res.json({ success: true, onboarding: ob, userId: user._id });
  } catch (e) {
    next(e);
  }
}

// POST /api/seller/basic-info { userId, firstName, lastName, password }
export async function submitBasicInfoStep(req, res, next) {
  try {
    const { userId, firstName, lastName, password } = req.body || {};
    if (!userId) return next(httpError(422, 'Validation failed', { userId: 'Required' }));
    const existing = await SellerOnboarding.findOne({ userId });
    if (!existing) return next(httpError(404, 'Onboarding not found'));
    if (existing.status === 'completed') return next(httpError(409, 'Onboarding already completed'));
    const setUpdate = { status: 'in_progress' };
    if (firstName !== undefined) setUpdate['basicInfo.firstName'] = firstName;
    if (lastName !== undefined) setUpdate['basicInfo.lastName'] = lastName;
    if (password) {
      const hash = await bcrypt.genSalt(10).then((s) => bcrypt.hash(password, s));
      setUpdate['basicInfo.passwordHash'] = hash;
    }
    setUpdate['currentStep'] = 3;
    const doc = await SellerOnboarding.findOneAndUpdate({ userId }, { $set: setUpdate }, { new: true });
    res.json({ success: true, onboarding: doc });
  } catch (e) {
    next(e);
  }
}

// POST /api/seller/verify-email { userId, email, code }
export async function verifyEmailStep(req, res, next) {
  try {
    const { userId, email, code } = req.body || {};
    if (!userId || !email || !code) return next(httpError(422, 'Validation failed', { userId: 'Required', email: 'Required', code: 'Required' }));
    const existing = await SellerOnboarding.findOne({ userId });
    if (!existing) return next(httpError(404, 'Onboarding not found'));
    if (existing.status === 'completed') return next(httpError(409, 'Onboarding already completed'));
    const ok = verifyEmailCodeService(email, code);
    if (!ok) return next(httpError(401, 'Invalid or expired code', { code: 'Invalid/expired' }));
    const doc = await SellerOnboarding.findOneAndUpdate(
      { userId },
      { $set: { email, isEmailVerified: true, currentStep: 4, status: 'in_progress' } },
      { new: true }
    );
    if (!doc) return next(httpError(404, 'Onboarding not found'));
    res.json({ success: true, onboarding: doc });
  } catch (e) {
    next(e);
  }
}

// POST /api/seller/address { userId, address }
export async function submitAddressStep(req, res, next) {
  try {
    const { userId, address } = req.body || {};
    if (!userId || !address) return next(httpError(422, 'Validation failed', { userId: 'Required', address: 'Required' }));
    const existing = await SellerOnboarding.findOne({ userId });
    if (!existing) return next(httpError(404, 'Onboarding not found'));
    if (existing.status === 'completed') return next(httpError(409, 'Onboarding already completed'));
    const setUpdate = { currentStep: 5, status: 'in_progress' };
    const a = address || {};
    if (a.pickupAddress !== undefined) setUpdate['address.pickupAddress'] = a.pickupAddress;
    if (a.pickupProvince !== undefined) setUpdate['address.pickupProvince'] = a.pickupProvince;
    if (a.pickupDistrict !== undefined) setUpdate['address.pickupDistrict'] = a.pickupDistrict;
    if (a.returnAddress !== undefined) setUpdate['address.returnAddress'] = a.returnAddress;
    if (a.returnProvince !== undefined) setUpdate['address.returnProvince'] = a.returnProvince;
    if (a.returnDistrict !== undefined) setUpdate['address.returnDistrict'] = a.returnDistrict;
    if (a.sameAsPickup !== undefined) setUpdate['address.sameAsPickup'] = !!a.sameAsPickup;
    const doc = await SellerOnboarding.findOneAndUpdate({ userId }, { $set: setUpdate }, { new: true });
    if (!doc) return next(httpError(404, 'Onboarding not found'));
    res.json({ success: true, onboarding: doc });
  } catch (e) {
    next(e);
  }
}

// POST /api/seller/id-verification (multipart form)
// fields: userId, idCardName, idCardNumber; files: frontIdImage, backIdImage
export async function submitIdVerificationStep(req, res, next) {
  try {
    const { userId, idCardName, idCardNumber } = req.body || {};
    if (!userId) return next(httpError(422, 'Validation failed', { userId: 'Required' }));
    const existing = await SellerOnboarding.findOne({ userId });
    if (!existing) return next(httpError(404, 'Onboarding not found'));
    if (existing.status === 'completed') return next(httpError(409, 'Onboarding already completed'));
    configureCloudinary();
    const front = req.files?.frontIdImage?.[0];
    const back = req.files?.backIdImage?.[0];
    let frontUrl; let backUrl;
    if (front) {
      const r = await uploadBufferToCloudinary(front.buffer, `carriya/onboarding/${new Date().getFullYear()}`, undefined);
      frontUrl = r.secure_url;
    }
    if (back) {
      const r = await uploadBufferToCloudinary(back.buffer, `carriya/onboarding/${new Date().getFullYear()}`, undefined);
      backUrl = r.secure_url;
    }
    const setUpdate = { currentStep: 6, status: 'in_progress' };
    if (idCardName !== undefined) setUpdate['business.idCardName'] = idCardName;
    if (idCardNumber !== undefined) setUpdate['business.idCardNumber'] = idCardNumber;
    if (frontUrl !== undefined) setUpdate['business.idCardFrontUrl'] = frontUrl;
    if (backUrl !== undefined) setUpdate['business.idCardBackUrl'] = backUrl;
    const doc = await SellerOnboarding.findOneAndUpdate({ userId }, { $set: setUpdate }, { new: true });
    if (!doc) return next(httpError(404, 'Onboarding not found'));
    res.json({ success: true, onboarding: doc });
  } catch (e) {
    next(e);
  }
}

// POST /api/seller/bank (multipart form)
// fields: userId, accountHolderName, accountNumber, ibanNumber, bankName, branchCode; files: bankDocument
export async function submitBankStep(req, res, next) {
  try {
    const { userId, accountHolderName, accountNumber, ibanNumber, bankName, branchCode } = req.body || {};
    if (!userId) return next(httpError(422, 'Validation failed', { userId: 'Required' }));
    const existing = await SellerOnboarding.findOne({ userId });
    if (!existing) return next(httpError(404, 'Onboarding not found'));
    if (existing.status === 'completed') return next(httpError(409, 'Onboarding already completed'));
    configureCloudinary();
    const docFile = req.files?.bankDocument?.[0];
    let bankDocumentUrl;
    if (docFile) {
      const r = await uploadBufferToCloudinary(docFile.buffer, `carriya/onboarding/${new Date().getFullYear()}`, undefined);
      bankDocumentUrl = r.secure_url;
    }
    const setUpdate = {};
    if (accountHolderName !== undefined) setUpdate['bank.accountHolderName'] = accountHolderName;
    if (accountNumber !== undefined) setUpdate['bank.accountNumber'] = accountNumber;
    if (ibanNumber !== undefined) setUpdate['bank.ibanNumber'] = ibanNumber;
    if (bankName !== undefined) setUpdate['bank.bankName'] = bankName;
    if (branchCode !== undefined) setUpdate['bank.branchCode'] = branchCode;
    if (bankDocumentUrl !== undefined) setUpdate['bank.bankDocumentUrl'] = bankDocumentUrl;

    // If all required bank fields exist, mark completed
    const updated = await SellerOnboarding.findOneAndUpdate({ userId }, { $set: setUpdate }, { new: true });
    if (!updated) return next(httpError(404, 'Onboarding not found'));

    const hasBank = !!(updated.bank && updated.bank.accountNumber && updated.bank.bankName && updated.bank.bankDocumentUrl && updated.bank.accountHolderName);
    const finalStatus = hasBank ? 'completed' : 'in_progress';
    const finalDoc = await SellerOnboarding.findOneAndUpdate({ _id: updated._id }, { $set: { status: finalStatus, currentStep: 6 } }, { new: true });
    res.json({ success: true, onboarding: finalDoc });
  } catch (e) {
    next(e);
  }
}

