import { JobLock } from '../models/JobLock.js';

/**
 * Acquire a distributed lock for a job.
 * Returns true if the lock was acquired, false otherwise.
 */
export async function acquireJobLock(name, { ttlMs = 5 * 60 * 1000, metadata = {} } = {}) {
  if (!name) {
    throw new Error('Lock name is required');
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs);

  const result = await JobLock.findOneAndUpdate(
    {
      name,
      $or: [{ expiresAt: { $lte: now } }, { expiresAt: null }],
    },
    {
      $set: {
        name,
        acquiredAt: now,
        expiresAt,
        metadata,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    {
      new: true,
      upsert: true,
    }
  ).lean();

  return Boolean(result);
}

/**
 * Release a previously acquired lock.
 */
export async function releaseJobLock(name) {
  if (!name) return;
  await JobLock.deleteOne({ name });
}


