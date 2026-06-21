import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

const sellerSettingsSchema = new mongoose.Schema(
  {
    // 🔗 Linked seller user (one-to-one relationship)
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // 🔢 Public Seller Code (like Daraz/Amazon - numeric ID for public APIs)
    sellerCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },

    // 🏪 Store Information
    storeName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    storeSlug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    storeSlugHistory: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    storeDescription: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    storeLogo: {
      type: String, // Cloudinary URL
      trim: true,
    },
    storeBanner: {
      type: String, // Cloudinary URL
      trim: true,
    },

    // 📍 Store Contact Information
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    socialMedia: {
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      twitter: { type: String, trim: true },
      linkedin: { type: String, trim: true },
    },

    // 🚚 Shipping Settings
    shippingSettings: {
      freeShippingThreshold: {
        type: Number,
        min: 0,
        default: 0,
      },
      defaultShippingCost: {
        type: Number,
        min: 0,
        default: 0,
      },
      estimatedDeliveryDays: {
        type: Number,
        min: 1,
        default: 7,
      },
      shippingZones: [{
        zone: { type: String, trim: true },
        cost: { type: Number, min: 0 },
      }],
    },

    // 🔔 Notification Preferences
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      orderNotifications: { type: Boolean, default: true },
      productNotifications: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
    },

    // 🎨 Store Customization
    storeTheme: {
      primaryColor: { type: String, trim: true, default: '#2ECC71' },
      secondaryColor: { type: String, trim: true },
    },

    // ✅ Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // 📊 Seller Rating (from reviews)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for faster queries
sellerSettingsSchema.index({ sellerId: 1 });
sellerSettingsSchema.index({ sellerCode: 1 }, { unique: true, sparse: true });
sellerSettingsSchema.index({ storeSlug: 1 }, { unique: true, sparse: true });
sellerSettingsSchema.index({ storeSlugHistory: 1 }, { sparse: true });

// Ensure sellerId is unique
sellerSettingsSchema.index({ sellerId: 1 }, { unique: true });

const randomSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

// Generate unique numeric seller code (Daraz/Amazon style: e.g., "6005013990165")
sellerSettingsSchema.statics.generateSellerCode = async function (excludeId) {
  const SellerSettingsModel = this;
  // Generate 13-digit numeric code (similar to Daraz format)
  const generateCode = () => {
    // Start with a base number (e.g., 6005 for Pakistan region code)
    const base = '6005';
    // Add 9 random digits
    const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    return `${base}${random}`;
  };

  let code = generateCode();
  let attempt = 0;

  // Ensure uniqueness
  while (
    await SellerSettingsModel.exists({
      sellerCode: code,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    attempt += 1;
    code = generateCode();
    if (attempt > 10) {
      // Fallback: use timestamp-based code if collisions persist
      code = `6005${Date.now().toString().slice(-9)}`;
      break;
    }
  }
  return code;
};

const slugify = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

// Generate a unique slug for a given seller name
// Professional approach: Always append short unique ID to prevent collisions
// This ensures multiple sellers can have "My Store" → "my-store-ML1N2", "my-store-ABC123", etc.
sellerSettingsSchema.statics.generateUniqueSlug = async function (candidateName, excludeId) {
  const SellerSettingsModel = this;
  let baseSlug = slugify(candidateName || '');
  if (!baseSlug) baseSlug = 'store';

  // Always append short unique ID for global uniqueness across all sellers
  // Format: "my-store-ML1N2" (SEO-friendly, collision-proof)
  let candidate = `${baseSlug}-${randomSuffix()}`;
  let attempt = 0;
  
  // Ensure uniqueness (very rare collision, but handle it)
  while (
    await SellerSettingsModel.exists({
      storeSlug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    attempt += 1;
    candidate = `${baseSlug}-${randomSuffix()}`;
    if (attempt > 10) {
      // Fallback: use timestamp if somehow 10 random attempts all collide
      candidate = `${baseSlug}-${Date.now().toString(36)}`;
      break;
    }
  }
  return candidate;
};

sellerSettingsSchema.pre('save', async function sellerSlugPreSave(next) {
  try {
    // Auto-generate sellerCode if missing (Daraz/Amazon style public ID)
    if (!this.sellerCode) {
      const code = await this.constructor.generateSellerCode(this._id);
      this.sellerCode = code;
    }

    if (!this.storeSlug || this.isModified('storeName')) {
      const baseSource =
        this.storeName ||
        (this.storeSlug && this.storeSlug.trim()) ||
        `seller-${this.sellerId?.toString().slice(-6) || randomSuffix()}`;

      const candidate = await this.constructor.generateUniqueSlug(baseSource, this._id);
      this.storeSlug = candidate;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Ensure slug regeneration when updating via findOneAndUpdate
sellerSettingsSchema.pre('findOneAndUpdate', async function sellerSlugPreUpdate(next) {
  try {
    const update = this.getUpdate() || {};
    const $set = update.$set || {};

    if (Object.prototype.hasOwnProperty.call($set, 'storeName')) {
      // Compute a fresh slug based on the new storeName
      const newName = String($set.storeName || '').trim();
      const query = this.getQuery() || {};

      // Resolve current document using either _id or sellerId (since updates use sellerId filter)
      let existingDoc = null;
      if (query._id) {
        existingDoc = await this.model.findById(query._id).select('storeSlug').lean();
      } else if (query.sellerId) {
        existingDoc = await this.model.findOne({ sellerId: query.sellerId }).select('storeSlug _id').lean();
      } else {
        existingDoc = await this.model.findOne(query).select('storeSlug _id').lean();
      }

      const excludeId = existingDoc?._id;
      const candidate = await this.model.generateUniqueSlug(newName || `seller-${randomSuffix()}`, excludeId);

      // Inject slug into update
      $set.storeSlug = candidate;

      // Preserve previous slug in history if it changes
      if (existingDoc?.storeSlug && existingDoc.storeSlug !== candidate) {
        update.$addToSet = {
          ...(update.$addToSet || {}),
          storeSlugHistory: existingDoc.storeSlug,
        };
      }
      update.$set = $set;
      this.setUpdate(update);
    }

    next();
  } catch (err) {
    next(err);
  }
});

export const SellerSettings =
  mongoose.models.SellerSettings ||
  mongoose.model('SellerSettings', sellerSettingsSchema);