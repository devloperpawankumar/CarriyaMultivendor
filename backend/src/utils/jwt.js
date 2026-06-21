import jwt from 'jsonwebtoken';

const defaultExpiry = '7d';

export function signJwt(payload, options = {}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  return jwt.sign(payload, secret, { expiresIn: options.expiresIn || defaultExpiry });
}

export function verifyJwt(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}


