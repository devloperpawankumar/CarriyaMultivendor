import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  color: String,
  size: String,
  thumbnailUrl: String,
});

const orderSchema = new mongoose.Schema(
  {
    // Order identification
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },

    // User information
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    buyerEmail: {
      type: String,
      required: true,
    },
    buyerPhone: {
      type: String,
    },
    buyerName: {
      type: String,
      required: true,
    },

    // Shipping address
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      district: { type: String },
      postalCode: { type: String },
    },

    // Order items
    items: [orderItemSchema],

    // Pricing breakdown
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment information
    paymentMethod: {
      type: String,
      enum: ['cod', 'bank_transfer', 'jazzcash', 'easypaisa', 'card'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentTransactionId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },

    // Order status
    status: {
      type: String,
      enum: [
        'pending',      // Order placed, awaiting payment/confirmation
        'confirmed',    // Payment confirmed, order being processed
        'processing',   // Seller preparing order
        'shipped',      // Order has been shipped
        'delivered',    // Order delivered successfully
        'cancelled',    // Order cancelled
        'refunded',     // Order refunded
      ],
      default: 'pending',
      index: true,
    },
    statusHistory: [
      {
        from: {
          type: String,
          enum: [
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'refunded',
          ],
        },
        to: {
          type: String,
          enum: [
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'refunded',
          ],
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          role: {
            type: String,
            enum: ['buyer', 'seller', 'admin', 'system'],
            default: 'seller',
          },
        },
        note: {
          type: String,
          maxlength: 500,
        },
      },
    ],

    // Seller information (for multi-seller orders, we'll group by seller)
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Shipping information
    trackingNumber: {
      type: String,
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },

    // Cancellation
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    cancellationNote: {
      type: String,
    },
    cancelledBy: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
    },

    // Notes
    notes: {
      type: String,
      maxlength: 1000,
    },
    adminNotes: {
      type: String,
      maxlength: 1000,
    },

    // Review tracking
    hasReview: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Settlement information (vendor payment solution)
    settlement: {
      commissionAmount: {
        type: Number,
        default: 0,
        min: 0,
      },
      paymentGatewayFee: {
        type: Number,
        default: 0,
        min: 0,
      },
      codFee: {
        type: Number,
        default: 0,
        min: 0,
      },
      sellerPayout: {
        type: Number,
        default: 0,
        min: 0,
      },
      settlementDate: {
        type: Date,
      },
      settledAt: {
        type: Date,
      },
      settlementStatus: {
        type: String,
        enum: ['pending', 'available', 'settled'],
        default: 'pending',
        index: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

async function generateUniqueOrderNumber(doc) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  let orderNumber = `ORD-${timestamp}-${random}`;
  let counter = 1;

  while (
    await mongoose.models.Order?.exists({
      orderNumber,
      _id: { $ne: doc._id },
    })
  ) {
    orderNumber = `ORD-${timestamp}-${random}-${counter}`;
    counter++;
  }
  return orderNumber;
}

orderSchema.pre('validate', async function (next) {
  try {
    if (!this.orderNumber) {
      this.orderNumber = await generateUniqueOrderNumber(this);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Indexes for efficient queries
orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, orderNumber: 1 });
orderSchema.index({ paymentStatus: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ sellerId: 1, 'settlement.settlementStatus': 1 });
orderSchema.index({ 'settlement.settlementDate': 1, 'settlement.settlementStatus': 1 });

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Instance method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed', 'processing'].includes(this.status);
};

// Instance method to check if order can be refunded
orderSchema.methods.canBeRefunded = function() {
  return ['paid', 'confirmed', 'processing', 'shipped'].includes(this.status) &&
         this.paymentStatus === 'paid';
};

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

