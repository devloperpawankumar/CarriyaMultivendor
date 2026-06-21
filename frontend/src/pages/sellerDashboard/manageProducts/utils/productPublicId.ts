const SEPARATOR = '__';

const sanitizeLabel = (value?: string) => {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const encodeToken = (value: string) => {
  if (!value) return value;
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window
      .btoa(value)
      .replace(/=+$/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
  return value;
};

const decodeToken = (value: string) => {
  if (!value) return value;
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    try {
      const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
      const padLength = (4 - (normalized.length % 4)) % 4;
      return window.atob(normalized + '='.repeat(padLength));
    } catch {
      return value;
    }
  }
  return value;
};

export const buildProductPublicId = (title: string | undefined, id: string) => {
  if (!id) return '';
  const fallbackLabel = `product-${id.slice(-6) || 'ref'}`;
  const label = sanitizeLabel(title) || fallbackLabel;
  return `${label}${SEPARATOR}${encodeToken(id)}`;
};

export const extractProductIdFromPublicId = (publicId: string) => {
  if (!publicId) return publicId;
  const separatorIndex = publicId.lastIndexOf(SEPARATOR);
  if (separatorIndex === -1) {
    return decodeToken(publicId) || publicId;
  }
  const encoded = publicId.slice(separatorIndex + SEPARATOR.length);
  const decoded = decodeToken(encoded);
  return decoded || publicId;
};


