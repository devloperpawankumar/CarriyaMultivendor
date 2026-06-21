import { BuyerAddress } from '../models/BuyerAddress.js';
import { httpError } from '../middleware/errors.js';
import crypto from 'crypto';

const normalizeField = (value) => (typeof value === 'string' ? value.trim() : '');

// Generate a public identifier from MongoDB ObjectId (Amazon/Daraz style - no raw database IDs)
function generatePublicAddressId(objectId) {
  if (!objectId) return null;
  // Create a hash-based public identifier (not the raw database ID)
  const idString = objectId.toString();
  const hash = crypto.createHash('sha256').update(idString).digest('hex');
  // Use first 16 characters as public ID (shorter, cleaner)
  return hash.substring(0, 16);
}

// Find address by public ID (reverse lookup)
async function findAddressByPublicId(publicId, userId) {
  if (!publicId || !userId) return null;
  
  // Get all addresses for the user and find matching public ID
  const addresses = await BuyerAddress.find({ userId }).lean();
  for (const address of addresses) {
    const computedPublicId = generatePublicAddressId(address._id);
    if (computedPublicId === publicId) {
      return address;
    }
  }
  return null;
}

function buildAddressPayload(body = {}) {
  return {
    label: normalizeField(body.label) || undefined,
    fullName: normalizeField(body.fullName),
    contactNumber: normalizeField(body.contactNumber),
    streetAddress: normalizeField(body.streetAddress),
    locality: normalizeField(body.locality),
    province: normalizeField(body.province),
    city: normalizeField(body.city),
    area: normalizeField(body.area),
    addressNotes: normalizeField(body.addressNotes),
  };
}

function validatePayload(payload) {
  const errors = {};
  if (!payload.fullName) errors.fullName = 'Full name is required';
  if (!payload.contactNumber || !/^\+?\d{7,15}$/.test(payload.contactNumber.replace(/\s+/g, ''))) {
    errors.contactNumber = 'Valid phone number is required';
  }
  if (!payload.streetAddress) errors.streetAddress = 'Street address is required';
  if (!payload.locality) errors.locality = 'Locality / landmark is required';
  if (!payload.province) errors.province = 'Province is required';
  if (!payload.city) errors.city = 'City is required';
  if (!payload.area) errors.area = 'Area is required';
  if (!payload.addressNotes) errors.addressNotes = 'Full address description is required';
  return errors;
}

export async function getDefaultBuyerAddress(req, res, next) {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) return next(httpError(401, 'Unauthorized'));

    const address =
      (await BuyerAddress.findOne({ userId: buyerId, isDefault: true }).lean()) ||
      (await BuyerAddress.findOne({ userId: buyerId }).sort({ updatedAt: -1 }).lean());

    if (!address) {
      return res.json({
        success: true,
        data: null,
      });
    }

    // Return only public fields (Daraz/Amazon style - no raw database IDs)
    return res.json({
      success: true,
      data: {
        addressId: generatePublicAddressId(address._id), // Public identifier (not raw database ID)
        fullName: address.fullName,
        contactNumber: address.contactNumber,
        streetAddress: address.streetAddress,
        locality: address.locality,
        province: address.province,
        city: address.city,
        area: address.area,
        addressNotes: address.addressNotes,
        label: address.label || undefined,
        isDefault: address.isDefault || false,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function saveDefaultBuyerAddress(req, res, next) {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) return next(httpError(401, 'Unauthorized'));

    const payload = buildAddressPayload(req.body);
    const errors = validatePayload(payload);
    if (Object.keys(errors).length) {
      return next(httpError(422, 'Validation failed', errors));
    }

    let address = await BuyerAddress.findOne({ userId: buyerId, isDefault: true });
    if (!address) {
      address = await BuyerAddress.create({ ...payload, userId: buyerId, isDefault: true });
    } else {
      Object.assign(address, payload);
      address.isDefault = true;
      await address.save();
    }

    // Return only public fields (Daraz/Amazon style - no raw database IDs)
    const addressObj = address.toObject();
    return res.json({
      success: true,
      data: {
        addressId: generatePublicAddressId(addressObj._id), // Public identifier (not raw database ID)
        fullName: addressObj.fullName,
        contactNumber: addressObj.contactNumber,
        streetAddress: addressObj.streetAddress,
        locality: addressObj.locality,
        province: addressObj.province,
        city: addressObj.city,
        area: addressObj.area,
        addressNotes: addressObj.addressNotes,
        label: addressObj.label || undefined,
        isDefault: addressObj.isDefault || false,
        createdAt: addressObj.createdAt,
        updatedAt: addressObj.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listBuyerAddresses(req, res, next) {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) return next(httpError(401, 'Unauthorized'));

    const addresses = await BuyerAddress.find({ userId: buyerId })
      .sort({ isDefault: -1, updatedAt: -1 })
      .lean();

    // Return only public fields (Daraz/Amazon style - no raw database IDs)
    return res.json({
      success: true,
      data: addresses.map((address) => ({
        addressId: generatePublicAddressId(address._id), // Public identifier (not raw database ID)
        fullName: address.fullName,
        contactNumber: address.contactNumber,
        streetAddress: address.streetAddress,
        locality: address.locality,
        province: address.province,
        city: address.city,
        area: address.area,
        addressNotes: address.addressNotes,
        label: address.label || undefined,
        isDefault: address.isDefault || false,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new address
 * POST /api/buyer/addresses
 */
export async function createBuyerAddress(req, res, next) {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) return next(httpError(401, 'Unauthorized'));

    const payload = buildAddressPayload(req.body);
    const errors = validatePayload(payload);
    if (Object.keys(errors).length) {
      return next(httpError(422, 'Validation failed', errors));
    }

    // If this is set as default, unset other defaults
    if (req.body.isDefault) {
      await BuyerAddress.updateMany(
        { userId: buyerId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const address = await BuyerAddress.create({
      ...payload,
      userId: buyerId,
      isDefault: req.body.isDefault || false,
    });

    const addressObj = address.toObject();
    return res.json({
      success: true,
      data: {
        addressId: generatePublicAddressId(addressObj._id), // Public identifier (not raw database ID)
        fullName: addressObj.fullName,
        contactNumber: addressObj.contactNumber,
        streetAddress: addressObj.streetAddress,
        locality: addressObj.locality,
        province: addressObj.province,
        city: addressObj.city,
        area: addressObj.area,
        addressNotes: addressObj.addressNotes,
        label: addressObj.label || undefined,
        isDefault: addressObj.isDefault || false,
        createdAt: addressObj.createdAt,
        updatedAt: addressObj.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an address
 * PATCH /api/buyer/addresses/:addressId
 */
export async function updateBuyerAddress(req, res, next) {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) return next(httpError(401, 'Unauthorized'));

    const { addressId } = req.params;
    if (!addressId) {
      return next(httpError(422, 'Validation failed', { addressId: 'Address ID is required' }));
    }

    // Find address by public ID (not raw database ID)
    const address = await findAddressByPublicId(addressId, buyerId);
    if (!address) {
      return next(httpError(404, 'Address not found'));
    }
    
    // Convert to Mongoose document for updates
    const addressDoc = await BuyerAddress.findById(address._id);
    if (!addressDoc) {
      return next(httpError(404, 'Address not found'));
    }

    const payload = buildAddressPayload(req.body);
    const errors = validatePayload(payload);
    if (Object.keys(errors).length) {
      return next(httpError(422, 'Validation failed', errors));
    }

    // If setting as default, unset other defaults
    if (req.body.isDefault === true && !addressDoc.isDefault) {
      await BuyerAddress.updateMany(
        { userId: buyerId, isDefault: true, _id: { $ne: addressDoc._id } },
        { $set: { isDefault: false } }
      );
    }

    Object.assign(addressDoc, payload);
    if (req.body.isDefault !== undefined) {
      addressDoc.isDefault = req.body.isDefault;
    }
    await addressDoc.save();

    const addressObj = addressDoc.toObject();
    return res.json({
      success: true,
      data: {
        addressId: generatePublicAddressId(addressObj._id), // Public identifier (not raw database ID)
        fullName: addressObj.fullName,
        contactNumber: addressObj.contactNumber,
        streetAddress: addressObj.streetAddress,
        locality: addressObj.locality,
        province: addressObj.province,
        city: addressObj.city,
        area: addressObj.area,
        addressNotes: addressObj.addressNotes,
        label: addressObj.label || undefined,
        isDefault: addressObj.isDefault || false,
        createdAt: addressObj.createdAt,
        updatedAt: addressObj.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an address
 * DELETE /api/buyer/addresses/:addressId
 */
export async function deleteBuyerAddress(req, res, next) {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) return next(httpError(401, 'Unauthorized'));

    const { addressId } = req.params;
    if (!addressId) {
      return next(httpError(422, 'Validation failed', { addressId: 'Address ID is required' }));
    }

    // Find address by public ID (not raw database ID)
    const address = await findAddressByPublicId(addressId, buyerId);
    if (!address) {
      return next(httpError(404, 'Address not found'));
    }

    await BuyerAddress.deleteOne({ _id: address._id, userId: buyerId });

    return res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Set an address as default
 * PATCH /api/buyer/addresses/:addressId/set-default
 */
export async function setDefaultAddress(req, res, next) {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) return next(httpError(401, 'Unauthorized'));

    const { addressId } = req.params;
    if (!addressId) {
      return next(httpError(422, 'Validation failed', { addressId: 'Address ID is required' }));
    }

    // Find address by public ID (not raw database ID)
    const address = await findAddressByPublicId(addressId, buyerId);
    if (!address) {
      return next(httpError(404, 'Address not found'));
    }
    
    // Convert to Mongoose document for updates
    const addressDoc = await BuyerAddress.findById(address._id);
    if (!addressDoc) {
      return next(httpError(404, 'Address not found'));
    }

    // Unset all other defaults
    await BuyerAddress.updateMany(
      { userId: buyerId, isDefault: true, _id: { $ne: addressDoc._id } },
      { $set: { isDefault: false } }
    );

    // Set this as default
    addressDoc.isDefault = true;
    await addressDoc.save();

    const addressObj = addressDoc.toObject();
    return res.json({
      success: true,
      data: {
        addressId: generatePublicAddressId(addressObj._id), // Public identifier (not raw database ID)
        fullName: addressObj.fullName,
        contactNumber: addressObj.contactNumber,
        streetAddress: addressObj.streetAddress,
        locality: addressObj.locality,
        province: addressObj.province,
        city: addressObj.city,
        area: addressObj.area,
        addressNotes: addressObj.addressNotes,
        label: addressObj.label || undefined,
        isDefault: addressObj.isDefault || false,
        createdAt: addressObj.createdAt,
        updatedAt: addressObj.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}


