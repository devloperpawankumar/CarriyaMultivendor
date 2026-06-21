import mongoose from 'mongoose';

const jobLockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    acquiredAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically clear stale locks after expiration
jobLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const JobLock = mongoose.models.JobLock || mongoose.model('JobLock', jobLockSchema);


