import { User } from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import { signJwt, verifyJwt } from '../utils/jwt.js';
import { httpError } from '../middleware/errors.js';
import { generateAndStoreOtp, verifyOtp, generateAndStoreEmailOtp, verifyEmailOtp } from '../services/otp.js';
import { sendWhatsAppOtp } from '../services/whatsapp.js';
import { sendEmailOtp } from '../services/email.js';
import { SellerOnboarding } from '../models/SellerOnboarding.js';
import bcrypt from 'bcryptjs';
import { getAuthCookieOptions } from '../utils/cookieOptions.js';

function setAuthCookie(res, token, opts = {}) {
  res.cookie('token', token, getAuthCookieOptions(opts));
}

// Buyer signup with email/password
export async function signup(req, res, next) {
  try {
    const { email, password, firstName, lastName, phone } = req.body || {};
    const emailExists = email ? await User.findOne({ email }) : null;
    if (emailExists) return next(httpError(409, 'Email already registered', { email: 'Already registered' }));
    const phoneExists = phone ? await User.findOne({ phone }) : null;
    if (phoneExists) return next(httpError(409, 'Phone already registered', { phone: 'Already registered' }));
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ email, passwordHash, firstName, lastName, phone, role: 'buyer' });
    const token = signJwt({ id: user._id.toString(), email: user.email, role: user.role });
    setAuthCookie(res, token);
    res.status(201).json({ id: user._id, email: user.email, firstName, lastName, phone, role: user.role });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, rememberMe } = req.body || {};
    const lower = String(email || '').toLowerCase();

    let user = await User.findOne({ email: lower });
    let passwordVerified = false;

    if (user) {
      // Try normal user password first
      passwordVerified = await user.verifyPassword(password || '');
      if (!passwordVerified && !user.passwordHash) {
        // Only fallback to onboarding hash if the user has NO password yet
        const ob = await SellerOnboarding.findOne({ $or: [ { userId: user._id }, { email: lower } ] });
        const obHash = ob?.basicInfo?.passwordHash;
        if (obHash) {
          passwordVerified = await bcrypt.compare(password || '', obHash);
          if (passwordVerified && !user.passwordHash) {
            user.passwordHash = obHash;
            await user.save();
          }
        }
      }
    } else {
      // No user yet: allow seller login using onboarding email/password
      const ob = await SellerOnboarding.findOne({ email: lower });
      const obHash = ob?.basicInfo?.passwordHash;
      if (!ob || !obHash) return next(httpError(401, 'Invalid credentials', { email: 'Not found' }));
      passwordVerified = await bcrypt.compare(password || '', obHash);
      if (!passwordVerified) return next(httpError(401, 'Invalid credentials', { password: 'Incorrect password' }));
      // Ensure a user exists and link
      if (ob.userId) {
        user = await User.findById(ob.userId);
      }
      if (!user) {
        user = await User.create({ email: lower, role: 'seller', passwordHash: obHash, isEmailVerified: !!ob.isEmailVerified });
        try { await SellerOnboarding.updateOne({ _id: ob._id }, { $set: { userId: user._id } }); } catch {}
      } else if (!user.email) {
        user.email = lower;
        if (!user.passwordHash) user.passwordHash = obHash;
        if (ob.isEmailVerified) user.isEmailVerified = true;
        await user.save();
      }
    }

    if (!user || !passwordVerified) return next(httpError(401, 'Invalid credentials', { password: 'Incorrect password' }));

    // Block/suspension enforcement (Daraz/Amazon style)
    // - Suspended users must not be able to login
    // - Pending seller accounts (approved later by admin) must also be blocked from accessing the platform
    if (!user.isActive) {
      const code = user.role === 'seller' && !user.isEmailVerified ? 'ACCOUNT_PENDING_APPROVAL' : 'ACCOUNT_SUSPENDED';
      const err = httpError(
        403,
        code === 'ACCOUNT_PENDING_APPROVAL' ? 'Account pending approval' : 'Account suspended'
      );
      err.meta = { code };
      return next(err);
    }

    if (user.role === 'seller') {
      const onboarding = await SellerOnboarding.findOne({
        $or: [
          { userId: user._id },
          user.email ? { email: user.email } : null,
          user.phone ? { phone: user.phone } : null,
        ].filter(Boolean),
      }).lean();

      if (onboarding && onboarding.status !== 'completed') {
        const onboardingMeta = {
          onboardingId: onboarding._id?.toString(),
          userId: user._id.toString(),
          status: onboarding.status || 'in_progress',
          currentStep: onboarding.currentStep || 1,
          steps: {
            otpVerified: !!onboarding.isOtpVerified,
            basicInfo: !!(onboarding.basicInfo && (onboarding.basicInfo.firstName || onboarding.basicInfo.lastName || onboarding.basicInfo.passwordHash)),
            emailVerified: !!onboarding.isEmailVerified,
            address: !!(onboarding.address && (onboarding.address.pickupAddress || onboarding.address.returnAddress)),
            idVerification: !!(onboarding.business && onboarding.business.idCardNumber && onboarding.business.idCardFrontUrl && onboarding.business.idCardBackUrl),
            bank: !!(onboarding.bank && onboarding.bank.accountNumber && onboarding.bank.bankName && onboarding.bank.bankDocumentUrl),
          },
        };
        if (onboarding.email) onboardingMeta.email = onboarding.email;
        if (onboarding.phone) onboardingMeta.phone = onboarding.phone;

        const err = httpError(
          409,
          'Seller onboarding is incomplete. Please finish your registration before logging in.',
          { onboarding: 'Finish seller onboarding to access your account.' }
        );
        err.meta = { onboarding: onboardingMeta };
        return next(err);
      }
    }

    const token = signJwt({ id: user._id.toString(), email: user.email, role: user.role });
    setAuthCookie(res, token, { session: !rememberMe });
    // Note: Raw database ID removed from public API (Daraz/Amazon style - security best practice)
    // Backend uses user ID from JWT token internally, frontend doesn't need it
    res.json({ email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, role: user.role });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res, next) {
  try {
    const token = req.cookies?.token || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(200).json(null);
    const payload = verifyJwt(token);
    if (!payload) return res.status(200).json(null);
    const user = await User.findById(payload.id).lean();
    if (!user) return res.status(200).json(null);
    if (!user.isActive) {
      // Clear cookie so frontend doesn't keep trying with an invalid session
      res.clearCookie('token', { path: '/' });
      return res.status(200).json(null);
    }
    return res.json({ 
      // Note: Raw database ID removed from public API (Daraz/Amazon style - security best practice)
      // Backend uses user ID from JWT token internally, frontend doesn't need it
      email: user.email, 
      firstName: user.firstName, 
      lastName: user.lastName, 
      phone: user.phone, 
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
    });
  } catch (e) {
    return res.status(200).json(null);
  }
}

export function logout(_req, res) {
  res.clearCookie('token', { path: '/' });
  res.json({ success: true });
}

// Seller phone-first onboarding (WhatsApp/SMS OTP flow)
export function requestSellerOtp(req, res, next) {
  try {
    const { phone } = req.body || {};
    if (!phone) return next(httpError(422, 'Validation failed', { phone: 'Phone is required' }));
    const code = generateAndStoreOtp(phone);
    // Send via WhatsApp Cloud API if configured; otherwise logs in dev
    sendWhatsAppOtp(phone, code)
      .then(() => res.json({ success: true }))
      .catch((e) => next(httpError(502, 'Failed to send OTP')));
  } catch (e) {
    next(e);
  }
}

export async function verifySellerOtp(req, res, next) {
  try {
    const { phone, code } = req.body || {};
    if (!phone || !code) return next(httpError(422, 'Validation failed', { phone: 'Required', code: 'Required' }));
    const normalizedPhone = String(phone).replace(/\D/g, '');
    const ok = verifyOtp(normalizedPhone, code);
    if (!ok) return next(httpError(401, 'Invalid or expired code', { code: 'Invalid/expired' }));

    // Ensure a seller user exists and is linked to onboarding
    let user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      try {
        user = await User.create({ phone: normalizedPhone, role: 'seller', isPhoneVerified: true });
      } catch (err) {
        if (err && err.code === 11000) {
          user = await User.findOne({ phone: normalizedPhone });
        } else {
          throw err;
        }
      }
    } else {
      if (user.role !== 'seller') {
        user.role = 'seller';
      }
      user.isPhoneVerified = true;
      await user.save();
    }

    const ob = await SellerOnboarding.findOneAndUpdate(
      { phone: normalizedPhone },
      { $set: { phone: normalizedPhone, userId: user._id, isOtpVerified: true, currentStep: 2, status: 'in_progress' } },
      { new: true, upsert: true }
    );
    res.json({ success: true, onboardingId: ob._id, phone: ob.phone, status: ob.status, userId: user._id });
  } catch (e) {
    next(e);
  }
}

// Email verification flow (request + verify OTP)
export async function requestEmailOtp(req, res, next) {
  try {
    const { email, userId } = req.body || {};
    if (!email) return next(httpError(422, 'Validation failed', { email: 'Email is required' }));
    const lower = String(email).toLowerCase();

    // If userId is provided, ensure email is not used by another user/onboarding
    if (userId) {
      const otherUser = await User.findOne({ email: lower });
      if (otherUser && String(otherUser._id) !== String(userId)) {
        return next(httpError(409, 'Email already registered', { email: 'Already registered' }));
      }
      const otherOb = await SellerOnboarding.findOne({ email: lower, userId: { $ne: userId } });
      if (otherOb) {
        return next(httpError(409, 'Email already registered', { email: 'Already registered' }));
      }
    }

    const code = generateAndStoreEmailOtp(lower);
    await sendEmailOtp(lower, code);
    if (userId) {
      try {
        await SellerOnboarding.updateOne(
          { userId },
          { $set: { email: lower, isEmailVerified: false, currentStep: 4, status: 'in_progress' } }
        );
      } catch (err) {
        if (err && err.code === 11000) {
          return next(httpError(409, 'Email already registered', { email: 'Already registered' }));
        }
        throw err;
      }
    }
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function verifyEmailOtpController(req, res, next) {
  try {
    const { email, code, userId } = req.body || {};
    if (!email || !code) return next(httpError(422, 'Validation failed', { email: 'Required', code: 'Required' }));
    const ok = verifyEmailOtp(email, code);
    if (!ok) return next(httpError(401, 'Invalid or expired code', { code: 'Invalid/expired' }));
    if (userId) {
      const lower = String(email).toLowerCase();
      const existingUserWithEmail = await User.findOne({ email: lower });
      if (existingUserWithEmail && String(existingUserWithEmail._id) !== String(userId)) {
        return next(httpError(409, 'Email already registered', { email: 'Already registered, please login' }));
      }
      await SellerOnboarding.updateOne({ userId }, { $set: { email: lower, isEmailVerified: true, currentStep: 4, status: 'in_progress' } });
      await User.updateOne({ _id: userId }, { $set: { email: lower, isEmailVerified: true } });
    }
    res.json({ success: true, userId });
  } catch (e) {
    next(e);
  }
}


// Check if a phone is already registered
export async function checkPhone(req, res, next) {
  try {
    const phone = String(req.query.phone || '').trim();
    if (!phone) return next(httpError(422, 'Validation failed', { phone: 'Phone is required' }));
    const normalized = phone.replace(/\D/g, '');
    const exists = await User.exists({ phone: normalized });
    res.json({ exists: !!exists });
  } catch (e) {
    next(e);
  }
}

// Buyer signup with email/phone validation and OTP
export async function buyerSignup(req, res, next) {
  try {
    const { firstName, lastName, email, password, phone } = req.body || {};
    
    // Check if email already exists
    const emailExists = await User.findOne({ email: email?.toLowerCase() });
    if (emailExists) {
      return next(httpError(409, 'Email already registered', { email: 'Email already registered' }));
    }
    
    // Check if phone already exists
    const normalizedPhone = phone?.replace(/\D/g, '');
    const phoneExists = await User.findOne({ phone: normalizedPhone });
    if (phoneExists) {
      return next(httpError(409, 'Phone already registered', { phone: 'Phone already registered' }));
    }
    
    // Hash password
    const passwordHash = await User.hashPassword(password);
    
    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email?.toLowerCase(),
      phone: normalizedPhone,
      passwordHash,
      role: 'buyer',
      isEmailVerified: false,
      isPhoneVerified: false
    });
    
    // Send email OTP
    const code = generateAndStoreEmailOtp(email?.toLowerCase());
    await sendEmailOtp(email?.toLowerCase(), code);
    
    res.status(201).json({ 
      success: true, 
      message: 'OTP sent to your email',
      userId: user._id,
      email: user.email,
      phone: user.phone
    });
  } catch (e) {
    next(e);
  }
}

// Verify buyer email OTP and complete signup
export async function verifyBuyerEmailOtp(req, res, next) {
  try {
    const { email, code, userId } = req.body || {};
    
    if (!email || !code || !userId) {
      return next(httpError(422, 'Validation failed', { 
        email: 'Email is required', 
        code: 'Code is required',
        userId: 'User ID is required'
      }));
    }
    
    // Verify OTP
    const ok = verifyEmailOtp(email.toLowerCase(), code);
    if (!ok) {
      return next(httpError(401, 'Invalid or expired code', { code: 'Invalid or expired code' }));
    }
    
    // Update user as email verified
    const user = await User.findByIdAndUpdate(
      userId,
      { isEmailVerified: true },
      { new: true }
    );
    
    if (!user) {
      return next(httpError(404, 'User not found'));
    }
    
    // Generate JWT token
    const token = signJwt({ 
      id: user._id.toString(), 
      email: user.email, 
      role: user.role 
    });
    
    // Set auth cookie
    setAuthCookie(res, token);
    
    res.json({ 
      success: true, 
      message: 'Email verified successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (e) {
    next(e);
  }
}

// Resend buyer email OTP
export async function resendBuyerEmailOtp(req, res, next) {
  try {
    const { email } = req.body || {};
    
    if (!email) {
      return next(httpError(422, 'Validation failed', { email: 'Email is required' }));
    }
    
    // Check if user exists and is not verified
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(httpError(404, 'User not found'));
    }
    
    if (user.isEmailVerified) {
      return next(httpError(400, 'Email already verified'));
    }
    
    // Generate and send new OTP
    const code = generateAndStoreEmailOtp(email.toLowerCase());
    await sendEmailOtp(email.toLowerCase(), code);
    
    res.json({ 
      success: true, 
      message: 'OTP sent to your email' 
    });
  } catch (e) {
    next(e);
  }
}

// Request buyer phone OTP (for development, uses console logging)
export function requestBuyerPhoneOtp(req, res, next) {
  try {
    const { phone, userId } = req.body || {};
    if (!phone) return next(httpError(422, 'Validation failed', { phone: 'Phone is required' }));
    if (!userId) return next(httpError(422, 'Validation failed', { userId: 'User ID is required' }));
    
    // Normalize phone to E.164 format (+92XXXXXXXXXX) for OTP storage
    const normalizedPhone = String(phone).replace(/\D/g, '');
    const phoneForOtp = normalizedPhone.length === 10 ? `+92${normalizedPhone}` : phone;
    
    const code = generateAndStoreOtp(phoneForOtp);
    // Send via WhatsApp Cloud API if configured; otherwise logs in dev
    sendWhatsAppOtp(phoneForOtp, code)
      .then(() => res.json({ success: true, message: 'OTP sent to your phone' }))
      .catch((e) => next(httpError(502, 'Failed to send OTP')));
  } catch (e) {
    next(e);
  }
}

// Verify buyer phone OTP
export async function verifyBuyerPhoneOtp(req, res, next) {
  try {
    const { phone, code, userId } = req.body || {};
    if (!phone || !code) return next(httpError(422, 'Validation failed', { phone: 'Required', code: 'Required' }));
    if (!userId) return next(httpError(422, 'Validation failed', { userId: 'User ID is required' }));
    
    // Normalize phone to E.164 format (+92XXXXXXXXXX) for OTP verification
    const normalizedPhone = String(phone).replace(/\D/g, '');
    const phoneForOtp = normalizedPhone.length === 10 ? `+92${normalizedPhone}` : phone;
    
    const ok = verifyOtp(phoneForOtp, code);
    if (!ok) return next(httpError(401, 'Invalid or expired code', { code: 'Invalid/expired' }));

    // Update user as phone verified
    const user = await User.findByIdAndUpdate(
      userId,
      { isPhoneVerified: true },
      { new: true }
    );
    
    if (!user) {
      return next(httpError(404, 'User not found'));
    }
    
    res.json({ 
      success: true, 
      message: 'Phone verified successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      }
    });
  } catch (e) {
    next(e);
  }
}

// Resend buyer phone OTP
export function resendBuyerPhoneOtp(req, res, next) {
  try {
    const { phone, userId } = req.body || {};
    if (!phone) return next(httpError(422, 'Validation failed', { phone: 'Phone is required' }));
    if (!userId) return next(httpError(422, 'Validation failed', { userId: 'User ID is required' }));
    
    // Normalize phone to E.164 format (+92XXXXXXXXXX) for OTP storage
    const normalizedPhone = String(phone).replace(/\D/g, '');
    const phoneForOtp = normalizedPhone.length === 10 ? `+92${normalizedPhone}` : phone;
    
    const code = generateAndStoreOtp(phoneForOtp);
    // Send via WhatsApp Cloud API if configured; otherwise logs in dev
    sendWhatsAppOtp(phoneForOtp, code)
      .then(() => res.json({ success: true, message: 'OTP sent to your phone' }))
      .catch((e) => next(httpError(502, 'Failed to send OTP')));
  } catch (e) {
    next(e);
  }
}


// Google Sign-In for buyers using ID token verification
export async function googleAuthBuyer(req, res, next) {
  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return next(httpError(422, 'Validation failed', { idToken: 'idToken is required' }));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return next(httpError(500, 'Server misconfiguration: GOOGLE_CLIENT_ID is missing'));
    }

    const oauthClient = new OAuth2Client(clientId);
    const ticket = await oauthClient.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload) {
      return next(httpError(401, 'Invalid Google token'));
    }

    const email = payload.email?.toLowerCase();
    if (!email) {
      return next(httpError(400, 'Google account missing email'));
    }

    const firstName = payload.given_name || '';
    const lastName = payload.family_name || '';

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        firstName,
        lastName,
        role: 'buyer',
        isEmailVerified: true,
      });
    } else if (user.role !== 'buyer') {
      // Ensure role is buyer for marketplace buyer login
      user.role = 'buyer';
      if (!user.isEmailVerified) user.isEmailVerified = true;
      await user.save();
    }

    const token = signJwt({ id: user._id.toString(), email: user.email, role: user.role });
    setAuthCookie(res, token);
    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function requestPasswordReset(req, res, next) {
  try {
    const { email, userType } = req.body || {};
    const lower = String(email || '').toLowerCase();
    if (!lower) return next(httpError(422, 'Validation failed', { email: 'Email is required' }));
    const user = await User.findOne({ email: lower });
    // Always respond success to avoid user enumeration
    const token = user ? signJwt({ sub: user._id.toString(), purpose: 'password_reset' }, { expiresIn: '15m' }) : null;

    try {
      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = token ? `${frontendBase}/reset-password?token=${encodeURIComponent(token)}${userType ? `&userType=${encodeURIComponent(userType)}` : ''}` : '';
      const subject = 'Reset your Carriya password';
      const text = token
        ? `We received a request to reset your password.\n\nUse this link to set a new password (expires in 15 minutes):\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`
        : `If this email is registered, you will receive a reset link shortly.`;

      const host = process.env.SMTP_HOST;
      const port = Number(process.env.SMTP_PORT || 587);
      const userS = process.env.SMTP_USER;
      const passS = process.env.SMTP_PASS;
      const fromName = process.env.SMTP_FROM_NAME || 'Carriya Platform';
      const fromAddress = process.env.SMTP_FROM_ADDRESS || 'no-reply@carriya.local';
      if (host && userS && passS) {
        const nodemailer = (await import('nodemailer')).default;
        const tx = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user: userS, pass: passS } });
        await tx.sendMail({ from: { name: fromName, address: fromAddress }, to: lower, subject, text });
      } else {
        console.log('[DEV EMAIL][RESET] To:', lower, '\n', text);
      }
    } catch (e) {
      console.warn('Failed sending reset email:', e.message);
    }

    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword, confirmPassword } = req.body || {};
    if (!token) return next(httpError(422, 'Validation failed', { token: 'Token is required' }));
    if (!newPassword) return next(httpError(422, 'Validation failed', { newPassword: 'Password is required' }));
    if (String(newPassword) !== String(confirmPassword)) return next(httpError(422, 'Validation failed', { confirmPassword: 'Passwords do not match' }));
    const payload = verifyJwt(token);
    if (!payload || payload.purpose !== 'password_reset') return next(httpError(400, 'Invalid or expired token'));
    const user = await User.findById(payload.sub);
    if (!user) return next(httpError(404, 'User not found'));
    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();
    // Optional: clear onboarding password hash to prevent old password logins via fallback
    try {
      await SellerOnboarding.updateMany({ $or: [ { userId: user._id }, { email: user.email } ] }, { $unset: { 'basicInfo.passwordHash': 1 } });
    } catch {}
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

