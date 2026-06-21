import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema(
  {
    // Seller information
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Withdrawal details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ['Bank', 'JazzCash', 'Easypaisa'],
      required: true,
    },

    // Status tracking
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },

    // Seller account details (for transfer)
    sellerAccountDetails: {
      bankName: String,
      accountNumber: String,
      accountTitle: String,
      iban: String,
      jazzcashNumber: String,
      easypaisaNumber: String,
    },

    // Processing information
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },

    // Transaction tracking
    transactionId: {
      type: String,
    },
    transactionReference: {
      type: String,
    },

    // Admin notes
    adminNotes: {
      type: String,
      maxlength: 1000,
    },
    rejectionReason: {
      type: String,
    },

    // Request ID for tracking
    requestId: {
      type: String,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique request ID
async function generateRequestId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  let requestId = `WD-${timestamp}-${random}`;
  let counter = 1;

  while (
    await mongoose.models.Withdrawal?.exists({
      requestId,
    })
  ) {
    requestId = `WD-${timestamp}-${random}-${counter}`;
    counter++;
  }
  return requestId;
}

withdrawalSchema.pre('validate', async function (next) {
  try {
    if (!this.requestId) {
      this.requestId = await generateRequestId();
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Indexes for efficient queries
withdrawalSchema.index({ sellerId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });
withdrawalSchema.index({ requestId: 1 });

// Instance method to check if withdrawal can be cancelled
withdrawalSchema.methods.canBeCancelled = function() {
  return ['pending', 'processing'].includes(this.status);
};

// Instance method to mark as completed
withdrawalSchema.methods.markAsCompleted = function(transactionId, transactionReference) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.transactionId = transactionId;
  this.transactionReference = transactionReference;
  return this.save();
};

export const Withdrawal = mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);

