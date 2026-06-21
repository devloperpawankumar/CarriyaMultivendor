import { User } from '../models/User.js';
import { httpError } from '../middleware/errors.js';
import { successResponse } from '../utils/response.js';

/**
 * Get buyer account information
 * GET /api/buyer/account
 */
export async function getBuyerAccount(req, res, next) {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const user = await User.findById(buyerId).select('firstName lastName email phone role isEmailVerified isPhoneVerified').lean();

    if (!user || user.role !== 'buyer') {
      return next(httpError(403, 'Forbidden: Buyer access required'));
    }

    const accountInfo = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      isEmailVerified: user.isEmailVerified || false,
      isPhoneVerified: user.isPhoneVerified || false,
    };

    return successResponse(res, accountInfo);
  } catch (e) {
    next(e);
  }
}

/**
 * Update buyer account information
 * PATCH /api/buyer/account
 */
export async function updateBuyerAccount(req, res, next) {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const user = await User.findById(buyerId);
    if (!user || user.role !== 'buyer') {
      return next(httpError(403, 'Forbidden: Buyer access required'));
    }

    const errors = {};
    const updates = {};

    // Update firstName
    if (req.body.firstName !== undefined) {
      const firstName = String(req.body.firstName).trim();
      if (firstName.length < 2) {
        errors.firstName = 'First name must be at least 2 characters';
      } else if (firstName.length > 50) {
        errors.firstName = 'First name must be 50 characters or less';
      } else {
        updates.firstName = firstName;
      }
    }

    // Update lastName
    if (req.body.lastName !== undefined) {
      const lastName = String(req.body.lastName).trim();
      if (lastName.length < 2) {
        errors.lastName = 'Last name must be at least 2 characters';
      } else if (lastName.length > 50) {
        errors.lastName = 'Last name must be 50 characters or less';
      } else {
        updates.lastName = lastName;
      }
    }

    // Update email
    if (req.body.email !== undefined) {
      const email = String(req.body.email).trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Invalid email format';
      } else {
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: buyerId } });
        if (existingUser) {
          errors.email = 'Email already registered';
        } else {
          updates.email = email;
          // Reset email verification when email is changed
          updates.isEmailVerified = false;
        }
      }
    }

    // Update phone
    if (req.body.phone !== undefined) {
      const phone = String(req.body.phone).trim();
      if (phone) {
        // Basic phone validation (adjust regex as needed for your region)
        if (!/^[+]?[\d\s-()]{7,20}$/.test(phone)) {
          errors.phone = 'Invalid phone number format';
        } else {
          // Check if phone is already taken by another user
          const existingUser = await User.findOne({ phone, _id: { $ne: buyerId } });
          if (existingUser) {
            errors.phone = 'Phone number already registered';
          } else {
            updates.phone = phone;
            // Reset phone verification when phone is changed
            updates.isPhoneVerified = false;
          }
        }
      } else {
        // Allow clearing phone if email exists
        if (!user.email && !req.body.email) {
          errors.phone = 'Either email or phone is required';
        } else {
          updates.phone = null;
          updates.isPhoneVerified = false;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(httpError(422, 'Validation failed', errors));
    }

    // Update User model
    if (Object.keys(updates).length > 0) {
      await User.findByIdAndUpdate(buyerId, { $set: updates });
    }

    // Return updated data
    const updatedUser = await User.findById(buyerId).select('firstName lastName email phone isEmailVerified isPhoneVerified').lean();

    return successResponse(res, {
      firstName: updatedUser.firstName || '',
      lastName: updatedUser.lastName || '',
      email: updatedUser.email || '',
      phone: updatedUser.phone || '',
      isEmailVerified: updatedUser.isEmailVerified === true,
      isPhoneVerified: updatedUser.isPhoneVerified === true,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Change buyer password
 * PATCH /api/buyer/change-password
 */
export async function changeBuyerPassword(req, res, next) {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const user = await User.findById(buyerId);
    if (!user || user.role !== 'buyer') {
      return next(httpError(403, 'Forbidden: Buyer access required'));
    }

    const { currentPassword, newPassword } = req.body || {};
    const errors = {};

    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    }

    if (Object.keys(errors).length > 0) {
      return next(httpError(422, 'Validation failed', errors));
    }

    // Verify current password
    const isValidPassword = await user.verifyPassword(currentPassword);
    if (!isValidPassword) {
      return next(httpError(422, 'Validation failed', { currentPassword: 'Current password is incorrect' }));
    }

    // Validate new password strength
    const isStrong = newPassword.length >= 8 && 
      /[a-z]/.test(newPassword) && 
      /[A-Z]/.test(newPassword) && 
      /\d/.test(newPassword) && 
      /[^A-Za-z0-9]/.test(newPassword);
    
    if (!isStrong) {
      return next(httpError(422, 'Validation failed', { 
        newPassword: 'Password must be 8+ characters with uppercase, lowercase, number, and special character' 
      }));
    }

    // Update password
    const hash = await User.hashPassword(newPassword);
    await User.findByIdAndUpdate(buyerId, { $set: { passwordHash: hash } });

    return successResponse(res, { success: true, message: 'Password changed successfully' });
  } catch (e) {
    next(e);
  }
}


