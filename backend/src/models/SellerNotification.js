import mongoose from 'mongoose';

const sellerNotificationSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    notificationCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['order', 'withdrawal', 'payout', 'return', 'review', 'system'],
      default: 'system',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
    readAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['info', 'success', 'warning', 'critical'],
      default: 'info',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        // Note: Raw database ID removed from JSON output (Daraz/Amazon style)
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

sellerNotificationSchema.virtual('isRead').get(function sellerIsRead() {
  return Boolean(this.readAt);
});

// Generate unique notification code (Daraz/Amazon style - public identifier)
async function generateNotificationCode(doc) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  let notificationCode = `NOTIF-${timestamp}-${random}`;
  let counter = 1;

  while (
    await mongoose.models.SellerNotification?.exists({
      notificationCode,
      _id: { $ne: doc._id },
    })
  ) {
    notificationCode = `NOTIF-${timestamp}-${random}-${counter}`;
    counter++;
  }
  return notificationCode;
}

sellerNotificationSchema.pre('save', async function (next) {
  try {
    if (!this.notificationCode) {
      this.notificationCode = await generateNotificationCode(this);
    }
    next();
  } catch (err) {
    next(err);
  }
});

sellerNotificationSchema.index({ sellerId: 1, createdAt: -1 });
sellerNotificationSchema.index({ sellerId: 1, readAt: 1 });
sellerNotificationSchema.index({ notificationCode: 1 });

export const SellerNotification =
  mongoose.models.SellerNotification ||
  mongoose.model('SellerNotification', sellerNotificationSchema);




