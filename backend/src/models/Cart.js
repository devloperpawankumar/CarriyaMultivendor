import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  color: String,
  size: String,
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  // Store product snapshot at time of adding to cart
  productSnapshot: {
    title: String,
    thumbnailUrl: String,
  },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for guest carts
      index: true,
    },
    sessionId: {
      type: String,
      required: false, // For guest carts
      index: true,
    },
    deviceId: {
      type: String,
      required: false, // Alternative guest identifier
      index: true,
    },
    items: [cartItemSchema],
    updatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Update updatedAt on save
cartSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for efficient queries with unique constraints (sparse allows nulls)
// Sparse unique indexes: only enforce uniqueness when the field exists
cartSchema.index({ userId: 1 }, { unique: true, sparse: true });
cartSchema.index({ sessionId: 1 }, { unique: true, sparse: true });
cartSchema.index({ deviceId: 1 }, { unique: true, sparse: true });

// Instance method to calculate total
cartSchema.methods.calculateTotal = function() {
  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Instance method to get item count
cartSchema.methods.getItemCount = function() {
  return this.items.reduce((count, item) => count + item.quantity, 0);
};

// Static method to get or create cart for user
cartSchema.statics.getOrCreateCart = async function(userId) {
  let cart = await this.findOne({ userId });
  if (!cart) {
    cart = await this.create({ userId, items: [] });
  }
  return cart;
};

// Static method to get or create cart for guest (session or device)
cartSchema.statics.getOrCreateGuestCart = async function(sessionId, deviceId) {
  // Try to find by sessionId first, then deviceId
  let cart = sessionId ? await this.findOne({ sessionId }) : null;
  if (!cart && deviceId) {
    cart = await this.findOne({ deviceId });
  }
  
  if (!cart) {
    const cartData = { items: [] };
    if (sessionId) cartData.sessionId = sessionId;
    if (deviceId) cartData.deviceId = deviceId;
    cart = await this.create(cartData);
  }
  
  return cart;
};

// Static method to merge guest cart into user cart
cartSchema.statics.mergeGuestCartToUser = async function(guestCartId, userId) {
  const guestCart = await this.findById(guestCartId);
  if (!guestCart) return null;
  
  let userCart = await this.findOne({ userId });
  
  if (!userCart) {
    // Create new user cart with guest items
    userCart = await this.create({ userId, items: guestCart.items });
  } else {
    // Merge items intelligently
    const mergedItems = [...userCart.items];
    
    for (const guestItem of guestCart.items) {
      const itemKey = `${guestItem.productId.toString()}_${guestItem.color || 'default'}_${guestItem.size || 'default'}`;
      const existingIndex = mergedItems.findIndex((item) => {
        const existingKey = `${item.productId.toString()}_${item.color || 'default'}_${item.size || 'default'}`;
        return existingKey === itemKey;
      });
      
      if (existingIndex >= 0) {
        // Merge quantities
        mergedItems[existingIndex].quantity += guestItem.quantity;
      } else {
        // Add new item
        mergedItems.push(guestItem);
      }
    }
    
    userCart.items = mergedItems;
    await userCart.save();
  }
  
  // Delete guest cart after merge
  await this.findByIdAndDelete(guestCartId);
  
  return userCart;
};

export const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

