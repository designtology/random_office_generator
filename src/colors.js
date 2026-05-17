/**
 * colors.js — Color helpers for the office floor viewer
 *
 * Room colors: djb2 hash on room name (same algorithm as Unity's PlaceholderFactory)
 * Asset colors: category-based lookup for wall/door/window/floor types
 */

// ── djb2 hash ──────────────────────────────────────────────────────────────────
// Matches Unity PlaceholderFactory.DjbHash exactly.
function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Convert HSL to a hex color string. h=0–360, s=0–1, l=0–1 */
function hslToHex(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return parseInt(`${f(0)}${f(8)}${f(4)}`, 16);
}

/**
 * Get a deterministic room color from the room name.
 * Uses the same djb2 hash + hue mapping as Unity's PlaceholderFactory.
 * Returns a THREE.Color-compatible integer (0xRRGGBB).
 */
export function roomColor(name) {
  const h = djb2(name);
  const hue = (h % 360 + 360) % 360;
  const sat = 0.35 + 0.25 * ((h >> 8 & 0xFF) / 255);
  const lit = 0.35 + 0.15 * ((h >> 16 & 0xFF) / 255);
  return hslToHex(hue, sat, lit);
}

// ── Asset category colors ──────────────────────────────────────────────────────

const ASSET_COLORS = {
  // Floor tiles
  floor_tile_concrete:       0x888888,
  floor_carpet_modular_tile: 0x6b7a8d,
  floor_hardwood_plank:      0x8b6a3e,
  floor_tile_marble:         0xd0cec8,

  // Walls
  wall_straight_standard:    0xa0a4b0,
  wall_corner_fill:          0x8890a0,
  wall_glass_panel_full:     0x7ab8e0,
  wall_half_partition:       0x9098b0,
  wall_cubicle_panel_fabric: 0x7a8060,

  // Windows
  window_floor_to_ceiling:   0x80d0f0,

  // Doors
  door_double_wood_frame:    0xb87048,
  door_glass_double_frame:   0x60b0e0,
  door_single_wood:          0xc08050,
  door_single_glass:         0x70c0f0,
};

const CATEGORY_COLORS = {
  // Prefixes → colors
  floor_:    0x806050,
  wall_:     0x909aa8,
  window_:   0x88cce8,
  door_:     0xb87848,
  desk_:     0xd4a96a,
  chair_:    0x7a9060,
  table_:    0xc09860,
  shelf_:    0x9b7050,
  monitor_:  0x303050,
  plant_:    0x4a7a3a,
  sofa_:     0x6a5070,
  cabinet_:  0x808878,
  server_:   0x505870,
  rack_:     0x484c60,
  printer_:  0x505060,
  laptop_:   0x383c50,
  phone_:    0x404858,
  display_:  0x283040,
  tv_:       0x202830,
  artwork_:  0x7860a0,
  rug_:      0x607090,
  clock_:    0x508090,
  security_: 0x304050,
  trash_:    0x505840,
  water_:    0x406070,
  task_:     0xe8a030,   // task assets glow orange
};

/**
 * Get a color for a named asset.
 * First checks exact match, then prefix match, then falls back to a djb2 hash color.
 */
export function assetColor(name) {
  if (!name) return 0x888888;

  // Exact match
  if (name in ASSET_COLORS) return ASSET_COLORS[name];

  // Prefix match
  for (const [prefix, color] of Object.entries(CATEGORY_COLORS)) {
    if (name.startsWith(prefix)) return color;
  }

  // Fallback: djb2 hash (dim, so it doesn't overwhelm room colors)
  const h = djb2(name);
  const hue = (h % 360 + 360) % 360;
  return hslToHex(hue, 0.25, 0.30);
}

/**
 * Returns opacity for an asset (0–1).
 * Glass assets are semi-transparent.
 */
export function assetOpacity(name) {
  if (!name) return 1;
  if (name.startsWith('window_') || name.startsWith('wall_glass') || name === 'door_glass_double_frame')
    return 0.35;
  return 1;
}
