// Input sanitization utilities to prevent XSS and injection attacks

/**
 * Sanitize string input - remove dangerous characters and trim whitespace
 */
export function sanitizeString(input, options = {}) {
  if (typeof input !== 'string') {
    return input;
  }

  let sanitized = input.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters except newlines and tabs
  if (!options.allowNewlines) {
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  } else {
    sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  }

  // Limit length
  const maxLength = options.maxLength || 10000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitize email - normalize and validate format
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return email;
  }

  const sanitized = email.trim().toLowerCase();
  
  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
    return email; // Return original if invalid, let validator handle it
  }

  return sanitized;
}

/**
 * Sanitize phone number - keep only digits
 */
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') {
    return phone;
  }

  return phone.replace(/\D/g, '');
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input, options = {}) {
  if (typeof input === 'number') {
    return input;
  }

  if (typeof input === 'string') {
    const num = parseFloat(input);
    if (isNaN(num)) {
      return input; // Return original, let validator handle
    }

    if (options.min !== undefined && num < options.min) {
      return options.min;
    }

    if (options.max !== undefined && num > options.max) {
      return options.max;
    }

    return options.integer ? Math.floor(num) : num;
  }

  return input;
}

/**
 * Sanitize URL - validate and normalize
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') {
    return url;
  }

  const sanitized = url.trim();

  // Basic URL validation
  try {
    const urlObj = new URL(sanitized);
    return urlObj.toString();
  } catch {
    // If not a valid URL, return original (let validator handle)
    return url;
  }
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj, schema = {}) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip prototype properties
    if (!obj.hasOwnProperty(key)) {
      continue;
    }

    const fieldSchema = schema[key] || {};
    let sanitizedValue = value;

    // Apply sanitization based on type or schema
    if (fieldSchema.type === 'string') {
      sanitizedValue = sanitizeString(value, fieldSchema.options);
    } else if (fieldSchema.type === 'email') {
      sanitizedValue = sanitizeEmail(value);
    } else if (fieldSchema.type === 'phone') {
      sanitizedValue = sanitizePhone(value);
    } else if (fieldSchema.type === 'number') {
      sanitizedValue = sanitizeNumber(value, fieldSchema.options);
    } else if (fieldSchema.type === 'url') {
      sanitizedValue = sanitizeUrl(value);
    } else if (Array.isArray(value)) {
      sanitizedValue = value.map((item) => {
        if (fieldSchema.itemType === 'string') {
          return sanitizeString(item, fieldSchema.options);
        }
        return item;
      });
    } else if (typeof value === 'string') {
      // Default string sanitization
      sanitizedValue = sanitizeString(value);
    }

    sanitized[key] = sanitizedValue;
  }

  return sanitized;
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeBody(schema = {}) {
  return (req, _res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body, schema);
    }
    next();
  };
}

/**
 * Middleware to sanitize query parameters
 */
export function sanitizeQuery() {
  return (req, _res, next) => {
    if (req.query && typeof req.query === 'object') {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          req.query[key] = sanitizeString(value, { maxLength: 200 });
        }
      }
    }
    next();
  };
}

