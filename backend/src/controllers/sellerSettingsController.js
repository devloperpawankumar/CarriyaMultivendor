import mongoose from 'mongoose';
import { SellerSettings } from '../models/SellerSettings.js';
import { SellerOnboarding } from '../models/SellerOnboarding.js';
import { httpError } from '../middleware/errors.js';
import { configureCloudinary, uploadBufferToCloudinary } from '../utils/cloudinary.js';
import { User } from '../models/User.js';
import { successResponse } from '../utils/response.js';
import bcrypt from 'bcryptjs';

/**
 * Public: Get seller profile for store page
 * GET /api/sellers/:identifier/profile (identifier can be slug or sellerId)
 */
export async function getPublicSellerProfile(req, res, next) {
  try {
    const { identifier } = req.params;
    if (!identifier) {
      return next(httpError(400, 'Seller identifier is required'));
    }

    let sellerSettingsDoc = null;
    let sellerId = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      sellerSettingsDoc = await SellerSettings.findOne({ sellerId: identifier });
      if (sellerSettingsDoc) {
        sellerId = sellerSettingsDoc.sellerId;
      } else {
        sellerId = identifier;
      }
    } else {
      // Try current slug
      sellerSettingsDoc = await SellerSettings.findOne({ storeSlug: identifier });
      // Try historical slugs if not found
      if (!sellerSettingsDoc) {
        sellerSettingsDoc = await SellerSettings.findOne({ storeSlugHistory: identifier });
      }
      if (sellerSettingsDoc) {
        sellerId = sellerSettingsDoc.sellerId;
      }
    }

    if (!sellerId) {
      return next(httpError(404, 'Seller not found'));
    }

    const user = await User.findById(sellerId).select('firstName lastName role').lean();
    if (!user || user.role !== 'seller') {
      return next(httpError(404, 'Seller not found'));
    }

    if (!sellerSettingsDoc) {
      const defaultName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Store';
      sellerSettingsDoc = new SellerSettings({
        sellerId,
        storeName: defaultName,
      });
      await sellerSettingsDoc.save();
    } else if (!sellerSettingsDoc.storeSlug) {
      sellerSettingsDoc.storeSlug = undefined;
      sellerSettingsDoc.markModified('storeSlug');
      await sellerSettingsDoc.save();
    }

    const settings = sellerSettingsDoc.toObject();

    // Get or generate sellerCode (Daraz/Amazon style - public identifier)
    let sellerCode = settings.sellerCode;
    if (!sellerCode) {
      try {
        sellerCode = await SellerSettings.generateSellerCode(sellerSettingsDoc._id);
        await SellerSettings.findByIdAndUpdate(sellerSettingsDoc._id, { $set: { sellerCode } });
      } catch (err) {
        console.warn(`Failed to generate sellerCode for ${sellerSettingsDoc._id}:`, err.message);
      }
    }

    res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    if (identifier !== settings.storeSlug) {
      res.set('X-Canonical-Slug', settings.storeSlug || '');
    }
    return successResponse(res, {
      sellerCode: sellerCode || undefined, // Public seller code (Daraz/Amazon style) - replaces raw sellerId
      storeSlug: settings.storeSlug,
      storeName: settings.storeName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Store',
      storeDescription: settings.storeDescription || '',
      storeLogo: settings.storeLogo || undefined,
      storeBanner: settings.storeBanner || undefined,
      isActive: settings.isActive ?? true,
      sellerName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      // Note: Removed sellerId from public API (Daraz/Amazon style - only public codes exposed)
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Get seller settings
 * GET /api/seller/settings
 */
export async function getSellerSettings(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    // Verify user is a seller
    const user = await User.findById(sellerId);
    if (!user || user.role !== 'seller') {
      return next(httpError(403, 'Forbidden: Seller access required'));
    }

    let settings = await SellerSettings.findOne({ sellerId }).lean();

    // If no settings exist, create default settings
    if (!settings) {
      const newSettings = await SellerSettings.create({
        sellerId,
        storeName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'My Store',
        isActive: true,
      });
      settings = newSettings.toObject();
    }

    // Ensure sellerCode exists (Daraz/Amazon style - public identifier)
    if (!settings.sellerCode) {
      try {
        settings.sellerCode = await SellerSettings.generateSellerCode(settings._id);
        await SellerSettings.findByIdAndUpdate(settings._id, { $set: { sellerCode: settings.sellerCode } });
      } catch (err) {
        console.warn(`Failed to generate sellerCode for ${settings._id}:`, err.message);
      }
    }

    // Clean up response - remove raw database IDs (Daraz/Amazon style)
    const {
      _id,
      sellerId: rawSellerId,
      __v,
      ...cleanSettings
    } = settings;

    return successResponse(res, {
      // Note: Removed _id, sellerId, and __v (raw database IDs) for security
      // Use storeSlug and sellerCode as public identifiers (Daraz/Amazon style)
      ...cleanSettings,
      // Ensure sellerCode is included (public identifier)
      sellerCode: settings.sellerCode,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Update seller settings
 * PATCH /api/seller/settings
 */
export async function updateSellerSettings(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    // Verify user is a seller
    const user = await User.findById(sellerId);
    if (!user || user.role !== 'seller') {
      return next(httpError(403, 'Forbidden: Seller access required'));
    }

    const updateData = {};

    // Store Information
    if (req.body.storeName !== undefined) {
      updateData.storeName = String(req.body.storeName).trim();
      if (updateData.storeName.length > 200) {
        return next(httpError(422, 'Validation failed', { storeName: 'Store name must be 200 characters or less' }));
      }
    }

    if (req.body.storeDescription !== undefined) {
      updateData.storeDescription = String(req.body.storeDescription).trim();
      if (updateData.storeDescription.length > 5000) {
        return next(httpError(422, 'Validation failed', { storeDescription: 'Description must be 5000 characters or less' }));
      }
    }

    if (req.body.storeLogo !== undefined) {
      updateData.storeLogo = String(req.body.storeLogo).trim();
    }

    if (req.body.storeBanner !== undefined) {
      updateData.storeBanner = String(req.body.storeBanner).trim();
    }

    // Contact Information
    if (req.body.contactEmail !== undefined) {
      const email = String(req.body.contactEmail).trim().toLowerCase();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return next(httpError(422, 'Validation failed', { contactEmail: 'Invalid email format' }));
      }
      updateData.contactEmail = email || undefined;
    }

    if (req.body.contactPhone !== undefined) {
      updateData.contactPhone = String(req.body.contactPhone).trim() || undefined;
    }

    if (req.body.website !== undefined) {
      updateData.website = String(req.body.website).trim() || undefined;
    }

    // Social Media
    if (req.body.socialMedia !== undefined && typeof req.body.socialMedia === 'object') {
      updateData.socialMedia = {};
      const social = req.body.socialMedia;
      if (social.facebook !== undefined) updateData.socialMedia.facebook = String(social.facebook).trim() || undefined;
      if (social.instagram !== undefined) updateData.socialMedia.instagram = String(social.instagram).trim() || undefined;
      if (social.twitter !== undefined) updateData.socialMedia.twitter = String(social.twitter).trim() || undefined;
      if (social.linkedin !== undefined) updateData.socialMedia.linkedin = String(social.linkedin).trim() || undefined;
    }

    // Shipping Settings
    if (req.body.shippingSettings !== undefined && typeof req.body.shippingSettings === 'object') {
      updateData.shippingSettings = {};
      const shipping = req.body.shippingSettings;
      if (shipping.freeShippingThreshold !== undefined) {
        const threshold = Number(shipping.freeShippingThreshold);
        if (isNaN(threshold) || threshold < 0) {
          return next(httpError(422, 'Validation failed', { freeShippingThreshold: 'Must be a non-negative number' }));
        }
        updateData.shippingSettings.freeShippingThreshold = threshold;
      }
      if (shipping.defaultShippingCost !== undefined) {
        const cost = Number(shipping.defaultShippingCost);
        if (isNaN(cost) || cost < 0) {
          return next(httpError(422, 'Validation failed', { defaultShippingCost: 'Must be a non-negative number' }));
        }
        updateData.shippingSettings.defaultShippingCost = cost;
      }
      if (shipping.estimatedDeliveryDays !== undefined) {
        const days = Number(shipping.estimatedDeliveryDays);
        if (isNaN(days) || days < 1) {
          return next(httpError(422, 'Validation failed', { estimatedDeliveryDays: 'Must be at least 1 day' }));
        }
        updateData.shippingSettings.estimatedDeliveryDays = days;
      }
      if (shipping.shippingZones !== undefined && Array.isArray(shipping.shippingZones)) {
        updateData.shippingSettings.shippingZones = shipping.shippingZones.map(zone => ({
          zone: String(zone.zone || '').trim(),
          cost: Math.max(0, Number(zone.cost) || 0),
        })).filter(zone => zone.zone);
      }
    }

    // Notification Preferences
    if (req.body.notifications !== undefined && typeof req.body.notifications === 'object') {
      updateData.notifications = {};
      const notif = req.body.notifications;
      if (notif.emailNotifications !== undefined) updateData.notifications.emailNotifications = !!notif.emailNotifications;
      if (notif.orderNotifications !== undefined) updateData.notifications.orderNotifications = !!notif.orderNotifications;
      if (notif.productNotifications !== undefined) updateData.notifications.productNotifications = !!notif.productNotifications;
      if (notif.marketingEmails !== undefined) updateData.notifications.marketingEmails = !!notif.marketingEmails;
    }

    // Store Theme
    if (req.body.storeTheme !== undefined && typeof req.body.storeTheme === 'object') {
      updateData.storeTheme = {};
      const theme = req.body.storeTheme;
      if (theme.primaryColor !== undefined) {
        const color = String(theme.primaryColor).trim();
        if (color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
          return next(httpError(422, 'Validation failed', { primaryColor: 'Invalid color format. Use hex format (e.g., #2ECC71)' }));
        }
        updateData.storeTheme.primaryColor = color || '#2ECC71';
      }
      if (theme.secondaryColor !== undefined) {
        const color = String(theme.secondaryColor).trim();
        if (color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
          return next(httpError(422, 'Validation failed', { secondaryColor: 'Invalid color format. Use hex format (e.g., #2ECC71)' }));
        }
        updateData.storeTheme.secondaryColor = color || undefined;
      }
    }

    // Use findOneAndUpdate with upsert to create if doesn't exist
    const settings = await SellerSettings.findOneAndUpdate(
      { sellerId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    if (!settings) {
      return next(httpError(404, 'Settings not found'));
    }

    // Ensure sellerCode exists (Daraz/Amazon style - public identifier)
    if (!settings.sellerCode) {
      try {
        settings.sellerCode = await SellerSettings.generateSellerCode(settings._id);
        await SellerSettings.findByIdAndUpdate(settings._id, { $set: { sellerCode: settings.sellerCode } });
      } catch (err) {
        console.warn(`Failed to generate sellerCode for ${settings._id}:`, err.message);
      }
    }

    // Clean up response - remove raw database IDs (Daraz/Amazon style)
    const {
      _id,
      sellerId: rawSellerId,
      __v,
      ...cleanSettings
    } = settings;

    return successResponse(res, {
      // Note: Removed _id, sellerId, and __v (raw database IDs) for security
      // Use storeSlug and sellerCode as public identifiers (Daraz/Amazon style)
      ...cleanSettings,
      // Ensure sellerCode is included (public identifier)
      sellerCode: settings.sellerCode,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Upload store logo (immediate upload - best practice)
 * POST /api/seller/settings/upload-logo
 * Returns URL immediately, doesn't save to DB until user submits
 */
export async function uploadStoreLogo(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const file = req.file;
    if (!file) {
      return next(httpError(422, 'Image file is required'));
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      return next(httpError(422, 'File must be an image'));
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return next(httpError(422, 'Image size must be less than 5MB'));
    }

    configureCloudinary();
    
    // Professional folder structure: carriya/seller-settings/{sellerId}/logo/{timestamp}
    const timestamp = Date.now();
    const folder = `carriya/seller-settings/${sellerId}/logo`;
    const filename = `logo_${timestamp}`;
    
    // Upload with optimization settings
    const result = await uploadBufferToCloudinary(
      file.buffer,
      folder,
      filename,
      'image'
    );

    // Return URL immediately - don't save to DB yet (user might cancel or change)
    // The URL will be saved when user clicks "Update Profile"
    return successResponse(res, {
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Upload store banner (immediate upload - best practice)
 * POST /api/seller/settings/upload-banner
 * Returns URL immediately, doesn't save to DB until user submits
 */
export async function uploadStoreBanner(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const file = req.file;
    if (!file) {
      return next(httpError(422, 'Image file is required'));
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      return next(httpError(422, 'File must be an image'));
    }

    // Validate file size (max 10MB for banners)
    if (file.size > 10 * 1024 * 1024) {
      return next(httpError(422, 'Banner size must be less than 10MB'));
    }

    configureCloudinary();
    
    // Professional folder structure: carriya/seller-settings/{sellerId}/banner/{timestamp}
    const timestamp = Date.now();
    const folder = `carriya/seller-settings/${sellerId}/banner`;
    const filename = `banner_${timestamp}`;
    
    // Upload with optimization settings
    const result = await uploadBufferToCloudinary(
      file.buffer,
      folder,
      filename,
      'image'
    );

    // Return URL immediately - don't save to DB yet (user might cancel or change)
    // The URL will be saved when user clicks "Update Profile"
    return successResponse(res, {
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Get seller personal information (optimized query)
 * GET /api/seller/personal-info
 */
export async function getPersonalInfo(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    // Optimized: Parallel queries with lean() and field selection
    const [user, onboarding, settings] = await Promise.all([
      User.findById(sellerId).select('firstName lastName email phone role').lean(),
      SellerOnboarding.findOne({ userId: sellerId })
        .select('basicInfo email')
        .lean(),
      SellerSettings.findOne({ sellerId }).select('storeName').lean(),
    ]);

    if (!user || user.role !== 'seller') {
      return next(httpError(403, 'Forbidden: Seller access required'));
    }

    // Merge data from User, Onboarding, and Settings
    const personalInfo = {
      firstName: user.firstName || onboarding?.basicInfo?.firstName || '',
      lastName: user.lastName || onboarding?.basicInfo?.lastName || '',
      email: user.email || onboarding?.email || '',
      phone: user.phone || '',
      storeName: settings?.storeName || '',
    };

    return successResponse(res, personalInfo);
  } catch (e) {
    next(e);
  }
}

/**
 * Update seller personal information
 * PATCH /api/seller/personal-info
 */
export async function updatePersonalInfo(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const user = await User.findById(sellerId);
    if (!user || user.role !== 'seller') {
      return next(httpError(403, 'Forbidden: Seller access required'));
    }

    const errors = {};
    const updates = {};

    // Update firstName
    if (req.body.firstName !== undefined) {
      const firstName = String(req.body.firstName).trim();
      if (firstName.length < 2) {
        errors.firstName = 'First name must be at least 2 characters';
      } else {
        updates.firstName = firstName;
      }
    }

    // Update lastName
    if (req.body.lastName !== undefined) {
      const lastName = String(req.body.lastName).trim();
      if (lastName.length < 2) {
        errors.lastName = 'Last name must be at least 2 characters';
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
        const existingUser = await User.findOne({ email, _id: { $ne: sellerId } });
        if (existingUser) {
          errors.email = 'Email already registered';
        } else {
          updates.email = email;
        }
      }
    }

    // Update store name
    if (req.body.storeName !== undefined) {
      const storeName = String(req.body.storeName).trim();
      if (storeName.length > 200) {
        errors.storeName = 'Store name must be 200 characters or less';
      } else {
        // Update in SellerSettings
        await SellerSettings.findOneAndUpdate(
          { sellerId },
          { $set: { storeName } },
          { upsert: true }
        );
      }
    }

    // Update password with strong validation (same as signup)
    if (req.body.currentPassword && req.body.newPassword) {
      const isValidPassword = await user.verifyPassword(req.body.currentPassword);
      if (!isValidPassword) {
        errors.currentPassword = 'Current password is incorrect';
      } else {
        const newPassword = String(req.body.newPassword);
        // Strong password validation: 8+ chars, upper, lower, number, special char
        const isStrong = newPassword.length >= 8 && 
          /[a-z]/.test(newPassword) && 
          /[A-Z]/.test(newPassword) && 
          /\d/.test(newPassword) && 
          /[^A-Za-z0-9]/.test(newPassword);
        
        if (!isStrong) {
          errors.newPassword = 'Password must be 8+ chars with upper, lower, number, and special char';
        } else {
          const hash = await User.hashPassword(newPassword);
          updates.passwordHash = hash;
        }
      }
    } else if (req.body.currentPassword || req.body.newPassword) {
      // If only one is provided, it's an error
      if (!req.body.currentPassword) {
        errors.currentPassword = 'Current password is required';
      }
      if (!req.body.newPassword) {
        errors.newPassword = 'New password is required';
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(httpError(422, 'Validation failed', errors));
    }

    // Update User model
    if (Object.keys(updates).length > 0) {
      await User.findByIdAndUpdate(sellerId, { $set: updates });
    }

    // Also update onboarding basicInfo for consistency
    if (updates.firstName || updates.lastName || updates.email) {
      const onboardingUpdate = {};
      if (updates.firstName) onboardingUpdate['basicInfo.firstName'] = updates.firstName;
      if (updates.lastName) onboardingUpdate['basicInfo.lastName'] = updates.lastName;
      if (updates.email) onboardingUpdate.email = updates.email;

      if (Object.keys(onboardingUpdate).length > 0) {
        await SellerOnboarding.findOneAndUpdate(
          { userId: sellerId },
          { $set: onboardingUpdate },
          { upsert: false }
        );
      }
    }

    // Return updated data (optimized parallel query)
    const [updatedUser, updatedSettings] = await Promise.all([
      User.findById(sellerId).select('firstName lastName email phone').lean(),
      SellerSettings.findOne({ sellerId }).select('storeName').lean(),
    ]);

    return successResponse(res, {
      firstName: updatedUser.firstName || '',
      lastName: updatedUser.lastName || '',
      email: updatedUser.email || '',
      phone: updatedUser.phone || '',
      storeName: updatedSettings?.storeName || '',
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Get seller shipping/address information (optimized query)
 * GET /api/seller/shipping-info
 */
export async function getShippingInfo(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    // Optimized: Single query with lean() and field selection
    const onboarding = await SellerOnboarding.findOne({ userId: sellerId })
      .select('address')
      .lean();

    if (!onboarding || !onboarding.address) {
      return successResponse(res, {
        pickupAddress: '',
        pickupProvince: '',
        pickupDistrict: '',
        returnAddress: '',
        returnProvince: '',
        returnDistrict: '',
        sameAsPickup: false,
      });
    }

    const address = onboarding.address;
    return successResponse(res, {
      pickupAddress: address.pickupAddress || '',
      pickupProvince: address.pickupProvince || '',
      pickupDistrict: address.pickupDistrict || '',
      returnAddress: address.returnAddress || '',
      returnProvince: address.returnProvince || '',
      returnDistrict: address.returnDistrict || '',
      sameAsPickup: address.sameAsPickup || false,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Update seller shipping/address information
 * PATCH /api/seller/shipping-info
 */
export async function updateShippingInfo(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const user = await User.findById(sellerId);
    if (!user || user.role !== 'seller') {
      return next(httpError(403, 'Forbidden: Seller access required'));
    }

    const errors = {};
    const addressUpdate = {};

    // Validate and set pickup address
    if (req.body.pickupAddress !== undefined) {
      addressUpdate['address.pickupAddress'] = String(req.body.pickupAddress).trim();
    }
    if (req.body.pickupProvince !== undefined) {
      addressUpdate['address.pickupProvince'] = String(req.body.pickupProvince).trim();
    }
    if (req.body.pickupDistrict !== undefined) {
      addressUpdate['address.pickupDistrict'] = String(req.body.pickupDistrict).trim();
    }

    // Validate and set return address
    if (req.body.sameAsPickup !== undefined) {
      addressUpdate['address.sameAsPickup'] = !!req.body.sameAsPickup;
    }

    if (req.body.returnAddress !== undefined) {
      addressUpdate['address.returnAddress'] = String(req.body.returnAddress).trim();
    }
    if (req.body.returnProvince !== undefined) {
      addressUpdate['address.returnProvince'] = String(req.body.returnProvince).trim();
    }
    if (req.body.returnDistrict !== undefined) {
      addressUpdate['address.returnDistrict'] = String(req.body.returnDistrict).trim();
    }

    // If sameAsPickup is true, copy pickup address to return address
    if (req.body.sameAsPickup === true) {
      const onboarding = await SellerOnboarding.findOne({ userId: sellerId }).select('address').lean();
      const pickupAddr = req.body.pickupAddress !== undefined
        ? String(req.body.pickupAddress).trim()
        : onboarding?.address?.pickupAddress || '';
      const pickupProv = req.body.pickupProvince !== undefined
        ? String(req.body.pickupProvince).trim()
        : onboarding?.address?.pickupProvince || '';
      const pickupDist = req.body.pickupDistrict !== undefined
        ? String(req.body.pickupDistrict).trim()
        : onboarding?.address?.pickupDistrict || '';

      addressUpdate['address.returnAddress'] = pickupAddr;
      addressUpdate['address.returnProvince'] = pickupProv;
      addressUpdate['address.returnDistrict'] = pickupDist;
    }

    if (Object.keys(errors).length > 0) {
      return next(httpError(422, 'Validation failed', errors));
    }

    // Update onboarding address
    await SellerOnboarding.findOneAndUpdate(
      { userId: sellerId },
      { $set: addressUpdate },
      { upsert: false, new: true }
    );

    // Return updated data (optimized query)
    const updated = await SellerOnboarding.findOne({ userId: sellerId })
      .select('address')
      .lean();

    const address = updated?.address || {};
    return successResponse(res, {
      pickupAddress: address.pickupAddress || '',
      pickupProvince: address.pickupProvince || '',
      pickupDistrict: address.pickupDistrict || '',
      returnAddress: address.returnAddress || '',
      returnProvince: address.returnProvince || '',
      returnDistrict: address.returnDistrict || '',
      sameAsPickup: address.sameAsPickup || false,
    });
  } catch (e) {
    next(e);
  }
}
