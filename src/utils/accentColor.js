// ─── Accent seed color ────────────────────────────────────────────────────────
const ACCENT_PALETTE = [
  "#6366F1", // indigo
  "#0EA5E9", // sky
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EC4899", // pink
  "#8B5CF6", // violet
  "#EF4444", // red
  "#14B8A6", // teal
];

/**
 * Get a consistent accent color for a given name
 * @param {string} name - The name to hash
 * @returns {string} Hex color code
 */
export function getAccentColor(name = "") {
  return ACCENT_PALETTE[name.charCodeAt(0) % ACCENT_PALETTE.length];
}

export { ACCENT_PALETTE };
