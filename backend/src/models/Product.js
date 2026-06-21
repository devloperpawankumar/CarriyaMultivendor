import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

const productSchema = new mongoose.Schema(
  {
    // Seller reference
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Basic product information
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    categoryPath: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },

    // Inventory
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    unlimitedStock: {
      type: Boolean,
      default: false,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },

    // Product variants
    sizes: [{
      type: String,
      trim: true,
    }],
    colors: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      hex: {
        type: String,
        trim: true,
        match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      },
    }],

    // Media
    images: [{
      type: String,
      required: true,
    }],
    videos: [{
      type: String,
    }],
    thumbnailUrl: {
      type: String,
    },

    // SEO and discovery
    keywords: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    slugHistory: [{
      type: String,
      trim: true,
      lowercase: true,
    }],

    // Status and visibility
    status: {
      type: String,
      enum: ['draft', 'active', 'out_of_stock', 'archived'],
      default: 'draft',
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Metrics
    views: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
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

    // Metadata
    metadata: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      brand: String,
      sku: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from title before saving
// Professional approach: Always append short unique ID to prevent collisions
// This ensures multiple sellers can have "Laptop" → "laptop-ML1N2", "laptop-ABC123", etc.
const randomSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

const slugify = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

productSchema.statics.generateUniqueSlug = async function (title, excludeId) {
  const ProductModel = this;
  let baseSlug = slugify(title || '');
  if (!baseSlug) baseSlug = 'product';

  // Always append short unique ID for global uniqueness across all sellers
  // Format: "laptop-ML1N2" (SEO-friendly, collision-proof)
  let candidate = `${baseSlug}-${randomSuffix()}`;
  let attempt = 0;
  
  // Ensure uniqueness (very rare collision, but handle it)
  while (
    await ProductModel.exists({
      slug: candidate,
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

productSchema.pre('save', async function (next) {
  if (!this.slug || this.isModified('title')) {
    const candidate = await this.constructor.generateUniqueSlug(this.title || `product-${randomSuffix()}`, this._id);
    if (this.slug && this.slug !== candidate) {
      this.slugHistory = Array.from(new Set([...(this.slugHistory || []), this.slug]));
    }
    this.slug = candidate;
  }
  
  // Calculate original price if discount is set
  if (this.isModified('price') || this.isModified('discount')) {
    if (this.discount > 0) {
      this.originalPrice = this.price;
    } else {
      this.originalPrice = undefined;
    }
  }
  
  // Auto-update status based on stock
  if (!this.unlimitedStock && this.stock === 0 && this.status === 'active') {
    this.status = 'out_of_stock';
  } else if (this.unlimitedStock || this.stock > 0) {
    if (this.status === 'out_of_stock') {
      this.status = 'active';
    }
  }
  
  next();
});

productSchema.pre('findOneAndUpdate', async function productSlugPreUpdate(next) {
  try {
    const update = this.getUpdate() || {};
    const $set = update.$set || {};

    if (Object.prototype.hasOwnProperty.call($set, 'title')) {
      const newTitle = String($set.title || '').trim();
      const query = this.getQuery() || {};

      let existingDoc = null;
      if (query._id) {
        existingDoc = await this.model.findById(query._id).select('slug _id').lean();
      } else {
        existingDoc = await this.model.findOne(query).select('slug _id').lean();
      }

      const excludeId = existingDoc?._id;
      const candidate = await this.model.generateUniqueSlug(newTitle || `product-${randomSuffix()}`, excludeId);

      if (existingDoc?.slug && existingDoc.slug !== candidate) {
        update.$addToSet = {
          ...(update.$addToSet || {}),
          slugHistory: existingDoc.slug,
        };
      }

      $set.slug = candidate;
      update.$set = $set;
      this.setUpdate(update);
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Indexes for efficient queries
productSchema.index({ sellerId: 1, status: 1 });
productSchema.index({ categoryPath: 1, status: 1, isPublished: 1 });
productSchema.index({ status: 1, isPublished: 1, createdAt: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ slugHistory: 1 }, { sparse: true });
productSchema.index({ keywords: 1 });

// Static method to calculate discounted price
productSchema.statics.calculatePrice = function(price, discount) {
  if (!discount || discount <= 0) return price;
  return Math.round(price * (1 - discount / 100));
};

// Instance method to get current price (with discount applied)
productSchema.methods.getCurrentPrice = function() {
  if (this.discount > 0 && this.discount <= 100) {
    return Math.round(this.price * (1 - this.discount / 100));
  }
  return this.price;
};

// Instance method to check if product is available
productSchema.methods.isAvailable = function() {
  return this.status === 'active' && 
         this.isPublished && 
         (this.unlimitedStock || this.stock > 0);
};

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

