// Very simple in-memory OTP store for demo/dev. Replace with Redis in production.
const phoneToOtp = new Map();
const emailToOtp = new Map();

export function generateAndStoreOtp(phone) {
  const code = String(Math.floor(10000 + Math.random() * 90000)); // 5-digit
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  phoneToOtp.set(normalizePhone(phone), { code, expiresAt });
  return code;
}

export function verifyOtp(phone, code) {
  const entry = phoneToOtp.get(normalizePhone(phone));
  if (!entry) return false;
  const ok = entry.code === String(code) && entry.expiresAt > Date.now();
  if (ok) phoneToOtp.delete(normalizePhone(phone));
  return ok;
}

function normalizePhone(p) {
  return String(p).replace(/\D/g, '');
}

export function generateAndStoreEmailOtp(email) {
  const code = String(Math.floor(10000 + Math.random() * 90000));
  const expiresAt = Date.now() + 5 * 60 * 1000;
  emailToOtp.set(String(email).toLowerCase(), { code, expiresAt });
  return code;
}

export function verifyEmailOtp(email, code) {
  const key = String(email).toLowerCase();
  const entry = emailToOtp.get(key);
  if (!entry) return false;
  const ok = entry.code === String(code) && entry.expiresAt > Date.now();
  if (ok) emailToOtp.delete(key);
  return ok;
}


