import { User } from '../models/User.js';

/**
 * Creates an initial admin user when env vars are provided.
 *
 * Env vars:
 * - ADMIN_EMAIL
 * - ADMIN_PASSWORD
 * - ADMIN_FIRST_NAME (optional)
 * - ADMIN_LAST_NAME (optional)
 *
 * Safe behavior:
 * - If ADMIN_EMAIL/PASSWORD are missing: does nothing
 * - If user already exists: does nothing
 */
export async function bootstrapAdmin() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '').trim();
  if (!email || !password) return { created: false, reason: 'missing_env' };

  const existing = await User.findOne({ email }).lean();
  if (existing) return { created: false, reason: 'already_exists' };

  const passwordHash = await User.hashPassword(password);
  const firstName = String(process.env.ADMIN_FIRST_NAME || 'Admin').trim();
  const lastName = String(process.env.ADMIN_LAST_NAME || '').trim();

  await User.create({
    email,
    passwordHash,
    firstName,
    lastName,
    role: 'admin',
    isEmailVerified: true,
    isActive: true,
  });

  return { created: true, reason: 'created' };
}


