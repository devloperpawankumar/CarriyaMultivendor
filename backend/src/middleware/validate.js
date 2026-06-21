// Minimal schema validator with per-field checks and error aggregation

export function validate(schema) {
  return (req, _res, next) => {
    const errors = {};

    const sources = { body: req.body || {}, query: req.query || {}, params: req.params || {} };
    for (const [where, fields] of Object.entries(schema)) {
      const data = sources[where] || {};
      for (const [field, rules] of Object.entries(fields)) {
        const value = data[field];
        for (const rule of rules) {
          const result = rule.validator(value, data);
          if (result !== true) {
            errors[field] = rule.message;
            break;
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.statusCode = 422;
      err.fieldErrors = errors;
      return next(err);
    }

    next();
  };
}

// Common rules
export const isRequired = (message = 'This field is required') => ({
  validator: (v) => v !== undefined && v !== null && String(v).trim() !== '',
  message,
});

export const isEmail = (message = 'Invalid email') => ({
  validator: (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  message,
});

export const minLength = (n, message) => ({
  validator: (v) => typeof v === 'string' && v.length >= n,
  message: message || `Must be at least ${n} characters`,
});

export const isPhone = (message = 'Invalid phone') => ({
  validator: (v) => typeof v === 'string' && /\d{6,}/.test(v.replace(/\D/g, '')),
  message,
});


// Strong password: at least 8 chars, one lowercase, one uppercase, one number, one special
export const isStrongPassword = (message = 'Password must be 8+ chars with upper, lower, number, and special char') => ({
  validator: (v) =>
    typeof v === 'string' &&
    /[a-z]/.test(v) &&
    /[A-Z]/.test(v) &&
    /\d/.test(v) &&
    /[^A-Za-z0-9]/.test(v) &&
    v.length >= 8,
  message,
});

// Field match validator (e.g., confirmPassword matches password)
export const matchesField = (otherField, message = 'Fields do not match') => ({
  validator: (_v, data) => String(data?.[otherField] ?? '') === String(_v ?? ''),
  message,
});

// Letters and spaces only (for simple name validation)
export const isAlphaSpace = (message = 'Only letters and spaces allowed') => ({
  validator: (v) => typeof v === 'string' && /^[A-Za-z\s'-]{2,}$/.test(v.trim()),
  message,
});


