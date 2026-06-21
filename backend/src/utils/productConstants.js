// Standard product size options
export const STANDARD_SIZES = [
  'XS',    // Extra Small
  'S',     // Small
  'M',     // Medium
  'L',     // Large
  'XL',    // Extra Large
  'XXL',   // 2X Large
  'XXXL',  // 3X Large
  '4XL',   // 4X Large
  '5XL',   // 5X Large
];

// Common color names with their hex values (for reference/validation)
export const COMMON_COLORS = {
  'Red': '#FF3B30',
  'Blue': '#007AFF',
  'Green': '#34C759',
  'Yellow': '#FFCC00',
  'Orange': '#FF9500',
  'Purple': '#AF52DE',
  'Pink': '#FF2D55',
  'Black': '#000000',
  'White': '#FFFFFF',
  'Gray': '#8E8E93',
  'Brown': '#A2845E',
  'Navy': '#003366',
  'Beige': '#F5F5DC',
  'Maroon': '#800000',
  'Teal': '#008080',
  'Cyan': '#00FFFF',
  'Magenta': '#FF00FF',
  'Lime': '#00FF00',
  'Gold': '#FFD700',
  'Silver': '#C0C0C0',
};

// Helper function to get color name from hex (if it's a common color)
export function getColorNameFromHex(hex) {
  if (!hex) return null;
  const normalizedHex = hex.toUpperCase();
  for (const [name, colorHex] of Object.entries(COMMON_COLORS)) {
    if (colorHex.toUpperCase() === normalizedHex) {
      return name;
    }
  }
  return null;
}

// Helper function to normalize size (uppercase, trim)
export function normalizeSize(size) {
  if (!size) return '';
  return String(size).trim().toUpperCase();
}

// Helper function to validate if size is standard
export function isStandardSize(size) {
  return STANDARD_SIZES.includes(normalizeSize(size));
}

