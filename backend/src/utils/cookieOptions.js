/**
 * Auth cookie settings for dev vs production.
 * Set COOKIE_SAME_SITE=lax when frontend and API share the same domain (recommended on Hostinger).
 * Set COOKIE_SAME_SITE=none when frontend and API are on different subdomains/origins.
 */
export function getAuthCookieOptions({ session = false, maxAgeMs } = {}) {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = isProd ? process.env.COOKIE_SAME_SITE || 'lax' : 'lax';

  const base = {
    httpOnly: true,
    sameSite,
    secure: isProd,
    path: '/',
  };

  if (session) return base;
  return { ...base, maxAge: maxAgeMs ?? 7 * 24 * 60 * 60 * 1000 };
}
