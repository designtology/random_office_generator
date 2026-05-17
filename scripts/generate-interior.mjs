#!/usr/bin/env node
/**
 * generate-interior.mjs — Interior asset placer
 * (threejs edition — reads/writes JSON from threejs/public/data/)
 *
 * Usage:
 *   node scripts/generate-interior.mjs <name>                  # floor 1, corporate style, random seed
 *   node scripts/generate-interior.mjs <name> 2                # floor 2
 *   node scripts/generate-interior.mjs <name> 1 tech           # floor 1, tech style
 *   node scripts/generate-interior.mjs <name> 1 insurance 42   # fully deterministic
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname }            from 'path';
import { fileURLToPath }               from 'url';

import { ROOM_PROFILES }                from './data/roomProfiles.mjs';
import { BUILDING_STYLES, DEFAULT_STYLE } from './data/buildingStyles.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = resolve(__dirname, '..', 'public', 'data');

// ═══════════════════════════════════════════════════════════════════════════════
// CLI ARGS
// ═══════════════════════════════════════════════════════════════════════════════

const [,, argName, ...rest] = process.argv;

if (!argName) {
  console.error('\nUsage: node scripts/generate-interior.mjs <name> [floor] [style] [seed]\n');
  console.error('  name    building name, e.g. "myBuilding"');
  console.error('  floor   floor number (default: 1)');
  console.error(`  style   ${Object.keys(BUILDING_STYLES).join(' | ')}  (default: ${DEFAULT_STYLE})`);
  console.error('  seed    RNG seed for deterministic output (optional)\n');
  process.exit(1);
}

const VALID_STYLES = Object.keys(BUILDING_STYLES);
let argStyle = DEFAULT_STYLE;
const styleIdx = rest.findIndex(a => VALID_STYLES.includes(a));
if (styleIdx >= 0) {
  argStyle = rest[styleIdx];
  rest.splice(styleIdx, 1);
}

const [argFloor, argSeed] = rest;

const FLOOR = argFloor ? parseInt(argFloor) : 1;
const STYLE = argStyle;
const seed  = argSeed  ? parseInt(argSeed)  : (Math.random() * 0xFFFFFFFF) >>> 0;

const fileName  = FLOOR === 1 ? `${argName}.json` : `${argName}${FLOOR}.json`;
const filePath  = resolve(DATA_DIR, fileName);

// ═══════════════════════════════════════════════════════════════════════════════
// SEEDED RNG — mulberry32
// ═══════════════════════════════════════════════════════════════════════════════

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = makeRng(seed);

function randInt(min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function densityMultiplier(interiorCells) {
  return Math.min(4, Math.max(1, Math.round(interiorCells / 4)));
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOAD FLOOR FILE (JSON)
// ═══════════════════════════════════════════════════════════════════════════════

let floorData;
try {
  floorData = JSON.parse(readFileSync(filePath, 'utf8'));
} catch (e) {
  console.error(`\nCould not load floor file: ${fileName}`);
  console.error('Make sure the building exists (run generate-building.mjs first).\n');
  console.error(e.message);
  process.exit(1);
}

const { roomLayout, wallMap, COLS, ROWS } = floorData;

if (!roomLayout || !wallMap || !COLS || !ROWS) {
  console.error(`\nFloor file "${fileName}" is missing required fields.`);
  console.error('It may be an old-format file. Regenerate it with generate-building.mjs.\n');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD INTERIOR CELL MAP
// ═══════════════════════════════════════════════════════════════════════════════

const roomCells = new Map(); // roomName → [{r, c}, ...]  (interior cells only)
const roomArea  = new Map(); // roomName → total cell count

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const name = roomLayout[r]?.[c];
    if (!name) continue;
    roomArea.set(name, (roomArea.get(name) ?? 0) + 1);
    const hasWall = wallMap[r]?.[c] !== null && wallMap[r]?.[c] !== undefined;
    if (hasWall) continue;
    if (!roomCells.has(name)) roomCells.set(name, []);
    roomCells.get(name).push({ r, c });
  }
}

const PLANT_RULE_THRESHOLD = 16;
const PLANT_ASSET = 'plant_large_floor_potted_fiddle';

// ═══════════════════════════════════════════════════════════════════════════════
// SLOT RESOLUTION
// ═══════════════════════════════════════════════════════════════════════════════

const styleOverrides = BUILDING_STYLES[STYLE].slotOverrides ?? {};

function resolveSlot(roomType, baseSlot) {
  const roomOverrides = styleOverrides[roomType] ?? {};
  const over = roomOverrides[baseSlot.id] ?? {};
  return {
    ...baseSlot,
    chance: over.chance  ?? baseSlot.chance,
    count:  over.count   ?? baseSlot.count ?? 1,
    assets: over.assets  ?? baseSlot.assets,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERIOR GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

const interiorMap = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));

const stats = { rooms: 0, assetsPlaced: 0, cellsMissed: 0, plantRuleApplied: 0 };

for (const [roomName, profile] of Object.entries(ROOM_PROFILES)) {
  const matchingRooms = [...roomCells.entries()].filter(([name]) => name === roomName);
  if (matchingRooms.length === 0) continue;

  stats.rooms += matchingRooms.length;

  for (const [, cells] of matchingRooms) {
    const available = shuffle(cells);
    let nextCell = 0;

    for (const baseSlot of profile.slots) {
      const slot = resolveSlot(roomName, baseSlot);
      if (rng() > slot.chance) continue;

      const slotMax = Array.isArray(slot.count) ? slot.count[1] : (slot.count ?? 1);
      const mult    = slotMax >= 3 ? densityMultiplier(cells.length) : 1;
      const count   = Array.isArray(slot.count)
        ? randInt(slot.count[0] * mult, slot.count[1] * mult)
        : Math.round((slot.count ?? 1) * mult);

      const asset = pick(slot.assets);

      for (let i = 0; i < count; i++) {
        if (nextCell >= available.length) { stats.cellsMissed++; break; }
        const { r, c } = available[nextCell++];
        interiorMap[r][c] = [asset, 0];
        stats.assetsPlaced++;
      }
    }

    if (!profile.skipPlantRule && (roomArea.get(roomName) ?? 0) > PLANT_RULE_THRESHOLD) {
      const hasPlant = cells.some(({ r, c }) =>
        Array.isArray(interiorMap[r][c]) && interiorMap[r][c][0] === PLANT_ASSET
      );
      if (!hasPlant && nextCell < available.length) {
        const { r, c } = available[nextCell++];
        interiorMap[r][c] = [PLANT_ASSET, 0];
        stats.assetsPlaced++;
        stats.plantRuleApplied++;
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// WRITE BACK (merge interiorMap into JSON)
// ═══════════════════════════════════════════════════════════════════════════════

floorData.interiorMap = interiorMap;
floorData.style = STYLE;
writeFileSync(filePath, JSON.stringify(floorData, null, 2), 'utf8');

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

const styleLabel = `${BUILDING_STYLES[STYLE].name} (${STYLE})`;
console.log('\n╔══════════════════════════════════════════════╗');
console.log('║  Interior Generator — Complete (JSON)        ║');
console.log('╠══════════════════════════════════════════════╣');
console.log(`║  Building  : ${String(argName + ' floor ' + FLOOR).padEnd(30)} ║`);
console.log(`║  Style     : ${String(styleLabel).padEnd(30)} ║`);
console.log(`║  Seed      : ${String(seed).padEnd(30)} ║`);
console.log(`║  Rooms     : ${String(stats.rooms + ' with profiles').padEnd(30)} ║`);
console.log(`║  Placed    : ${String(stats.assetsPlaced + ' assets').padEnd(30)} ║`);
if (stats.plantRuleApplied > 0)
  console.log(`║  Plant rule: ${String(stats.plantRuleApplied + ' rooms auto-planted').padEnd(30)} ║`);
if (stats.cellsMissed > 0)
  console.log(`║  Skipped   : ${String(stats.cellsMissed + ' (room full)').padEnd(30)} ║`);
console.log('╠══════════════════════════════════════════════╣');
console.log(`║  Output    : ${String('public/data/' + fileName).padEnd(30)} ║`);
console.log('╚══════════════════════════════════════════════╝\n');
