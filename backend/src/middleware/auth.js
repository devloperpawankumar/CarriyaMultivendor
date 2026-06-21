import cookieParser from 'cookie-parser';
import { verifyJwt } from '../utils/jwt.js';
import { User } from '../models/User.js';

export const cookies = cookieParser();

export async function requireAuth(req, res, next) {
  const token = req.cookies?.token || (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      ...(process.env.NODE_ENV !== 'production'
        ? {
            reason: 'missing_token',
            hint: 'Login must set a cookie named "token", or send Authorization: Bearer <jwt>.',
            path: req.originalUrl || req.url,
          }
        : null),
    });
  }
  const payload = verifyJwt(token);
  if (!payload) {
    return res.status(401).json({
      error: 'Unauthorized',
      ...(process.env.NODE_ENV !== 'production'
        ? {
            reason: 'invalid_token',
            hint: 'Your cookie/header token is missing, expired, or signed with a different JWT secret.',
            path: req.originalUrl || req.url,
          }
        : null),
    });
  }
  try {
    // Important: don't trust JWT claims for account state/role.
    // Always re-check current user record (Amazon/Daraz style).
    const dbUser = await User.findById(payload.id).select('role isActive isEmailVerified').lean();
    if (!dbUser) {
      res.clearCookie('token', { path: '/' });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!dbUser.isActive) {
      // Seller "pending approval" is represented by isActive=false + isEmailVerified=false in this codebase
      const code =
        dbUser.role === 'seller' && !dbUser.isEmailVerified ? 'ACCOUNT_PENDING_APPROVAL' : 'ACCOUNT_SUSPENDED';

      res.clearCookie('token', { path: '/' });
      return res.status(403).json({
        success: false,
        error: code === 'ACCOUNT_PENDING_APPROVAL' ? 'Account pending approval' : 'Account suspended',
        meta: { code },
        timestamp: new Date().toISOString(),
      });
    }

    req.user = { ...payload, role: dbUser.role };
    req.authUser = dbUser;
    next();
  } catch (e) {
    next(e);
  }
}

export function optionalAuth(req, _res, next) {
  const token = req.cookies?.token || (req.headers.authorization || '').replace('Bearer ', '');
  const payload = token ? verifyJwt(token) : null;
  if (payload) req.user = payload;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const ok = roles.includes(req.user.role);
    if (!ok) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}


