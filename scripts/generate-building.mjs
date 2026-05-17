#!/usr/bin/env node
/**
 * generate-building.mjs — Procedural office building floor generator
 * (threejs edition — outputs JSON to threejs/public/data/)
 *
 * Usage:
 *   node scripts/generate-building.mjs <name>                # floor auto-detected, random size + seed
 *   node scripts/generate-building.mjs <name> 14 24          # fixed size, random seed
 *   node scripts/generate-building.mjs <name> 14 24 42       # fully deterministic
 *
 * Output:
 *   Floor 1 → public/data/{name}.json
 *   Floor N → public/data/{name}N.json
 *
 * Also updates public/data/index.json with the file listing.
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname }                                    from 'path';
import { fileURLToPath }                                       from 'url';
import { execFileSync }                                        from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const COLS_MIN     = 10;
const COLS_MAX     = 20;
const ROWS_MIN     = 18;
const ROWS_MAX     = 30;
const MIN_ROOM_W   = 4;
const MIN_ROOM_H   = 4;
const WING_MIN_W   = 3;
const WIN_STEP_WE  = 3;
const SPLIT_AREA_RATIO = 0.14;

const ROOM_TYPES = [
  'reception', 'open_office', 'meeting_room', 'breakroom',
  'server_room', 'executive_suite', 'boardroom', 'lounge',
  'tech_office', 'wellness_pod', 'creative_lab', 'design_studio',
  'maker_space', 'collab_lounge', 'innovation_hub', 'cafeteria',
  'conference_room', 'storage_room', 'hr_office', 'it_lab',
  'training_room', 'print_room', 'quiet_room', 'phone_booth',
  'library', 'media_room', 'showroom', 'fitness_room',
];

const FLOOR_TILE = {
  reception:       'floor_tile_concrete',
  breakroom:       'floor_tile_concrete',
  server_room:     'floor_tile_concrete',
  cafeteria:       'floor_tile_concrete',
  corridor:        'floor_tile_concrete',
  storage_room:    'floor_tile_concrete',
  print_room:      'floor_tile_concrete',
  it_lab:          'floor_tile_concrete',
  executive_suite: 'floor_hardwood_plank',
  boardroom:       'floor_hardwood_plank',
  innovation_hub:  'floor_hardwood_plank',
  lounge:          'floor_hardwood_plank',
  showroom:        'floor_hardwood_plank',
  library:         'floor_hardwood_plank',
  fitness_room:    'floor_hardwood_plank',
};
const getFloorTile = (type) => FLOOR_TILE[type] ?? 'floor_carpet_modular_tile';

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

// ═══════════════════════════════════════════════════════════════════════════════
// CLI ARGS
// ═══════════════════════════════════════════════════════════════════════════════

const [,, argName, ...rawRest] = process.argv;

if (!argName) {
  console.error('\nUsage: node scripts/generate-building.mjs <name> [fresh] [style] [cols rows] [seed]\n');
  console.error('  name        building name (required)');
  console.error('  fresh       "true" = new corridor per floor  (default: false)');
  console.error('  style       corporate|tech|insurance|legal|creative (default: corporate)');
  console.error('  cols rows   initial size, floor 1 only');
  console.error('  seed        RNG seed for deterministic output\n');
  process.exit(1);
}

let argFreshCorridor = false;
let rest = rawRest;
if (rest[0] === 'true' || rest[0] === 'false') {
  argFreshCorridor = rest[0] === 'true';
  rest = rest.slice(1);
}

const VALID_STYLES = ['corporate', 'tech', 'insurance', 'legal', 'creative'];
let argStyle = 'corporate';
const styleIdx = rest.findIndex(a => VALID_STYLES.includes(a));
if (styleIdx >= 0) {
  argStyle = rest[styleIdx];
  rest = [...rest.slice(0, styleIdx), ...rest.slice(styleIdx + 1)];
}

if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(argName)) {
  console.error(`\nInvalid name "${argName}". Use letters/digits only, starting with a letter.\n`);
  process.exit(1);
}

// ── Output paths (JSON in public/data/) ───────────────────────────────────────
const DATA_DIR = resolve(__dirname, '..', 'public', 'data');
const floorFile = (n) =>
  resolve(DATA_DIR, n === 1 ? `${argName}.json` : `${argName}${n}.json`);

let FLOOR = 1;
while (existsSync(floorFile(FLOOR))) FLOOR++;
const OUT_FILE = floorFile(FLOOR);

// ── Arg parsing ───────────────────────────────────────────────────────────────
let argCols, argRows, argSeed;
if (FLOOR === 1) {
  if (rest.length >= 2) [argCols, argRows, argSeed] = rest;
  else                  [argSeed]                   = rest;
} else {
  [argSeed] = rest;
}

const seed = argSeed ? parseInt(argSeed) : (Math.random() * 0xFFFFFFFF) >>> 0;

// ── Dimensions & window positions ─────────────────────────────────────────────
let COLS, ROWS, WINDOWS, ENTRANCE_COL, CORRIDOR_PLAN;

if (FLOOR === 1) {
  const rng0 = makeRng(seed);
  COLS = argCols
    ? Math.max(COLS_MIN, Math.min(COLS_MAX, parseInt(argCols)))
    : COLS_MIN + Math.floor(rng0() * (COLS_MAX - COLS_MIN + 1));
  ROWS = argRows
    ? Math.max(ROWS_MIN, Math.min(ROWS_MAX, parseInt(argRows)))
    : ROWS_MIN + Math.floor(rng0() * (ROWS_MAX - ROWS_MIN + 1));
  WINDOWS      = computeWindowPositions(COLS, ROWS);
  ENTRANCE_COL = chooseEntranceCol(COLS, WINDOWS.north);
} else {
  // Read from floor 1 JSON
  const floor1 = JSON.parse(readFileSync(floorFile(1), 'utf8'));
  COLS         = floor1.COLS;
  ROWS         = floor1.ROWS;
  WINDOWS      = floor1.WINDOW_POSITIONS;
  ENTRANCE_COL = floor1.ENTRANCE_COL;
  if (!argFreshCorridor) CORRIDOR_PLAN = floor1.CORRIDOR_PLAN;
}

const rng = makeRng(seed);

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 — WINDOW POSITIONS
// ═══════════════════════════════════════════════════════════════════════════════

function computeWindowPositions(cols, rows) {
  const north   = [];
  const south   = [];
  const westEast = [];
  for (let c = 2; c <= cols - 2; c += 2) north.push(c);
  for (let c = 1; c <= cols - 2; c += 2) south.push(c);
  for (let r = 1; r < rows - 1; r += WIN_STEP_WE) westEast.push(r);
  return { north, south, westEast };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2 — ENTRANCE POSITION
// ═══════════════════════════════════════════════════════════════════════════════

function chooseEntranceCol(cols, northWindows) {
  const center  = Math.floor(cols / 2);
  const winSet  = new Set(northWindows);
  for (let offset = 0; offset < cols; offset++) {
    for (const delta of [0, 1, -1]) {
      const c = center + delta * offset;
      if (c > 0 && c < cols - 1 && !winSet.has(c)) return c;
    }
  }
  return 1;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3 — CORRIDOR PLAN
// ═══════════════════════════════════════════════════════════════════════════════

function planCorridor(cols, rows, northWindows, entranceCol) {
  const recBottom = 2;
  const winSet    = new Set(northWindows);

  const minSpineL = WING_MIN_W;
  const maxSpineL = cols - WING_MIN_W - 2;
  const range     = maxSpineL - minSpineL + 1;

  let spineL = minSpineL + Math.floor(rng() * range);
  for (let i = 0; i < range && winSet.has(spineL); i++)
    spineL = minSpineL + ((spineL - minSpineL + 1) % range);
  if (winSet.has(spineL)) spineL = minSpineL;
  const spineR = spineL + 1;

  const minRecW  = Math.min(8, cols);
  const recWidth = minRecW + Math.floor(rng() * (cols - minRecW + 1));

  let recL = Math.max(0, entranceCol - Math.floor(recWidth / 2));
  let recR = recL + recWidth - 1;
  if (recR >= cols) { recR = cols - 1; recL = Math.max(0, recR - recWidth + 1); }
  recL = Math.min(recL, spineL);
  recR = Math.max(recR, spineR);

  if (recL > 0 && recL < WING_MIN_W) recL = 0;
  if (cols - 1 - recR > 0 && cols - 1 - recR < WING_MIN_W) recR = cols - 1;

  const branchSets = [];
  if (cols >= 15 && rows >= 15) {
    const zoneStart = recBottom + 1;
    const zoneEnd   = rows - 1;
    const minPos = zoneStart + MIN_ROOM_H;
    const maxPos = zoneEnd - 1 - MIN_ROOM_H;

    if (maxPos >= minPos) {
      const hi1 = Math.min(maxPos, zoneStart + Math.floor((zoneEnd - zoneStart) * 0.55));
      const b1  = minPos + Math.floor(rng() * Math.max(1, hi1 - minPos + 1));
      branchSets.push({ r1: b1, r2: b1 + 1 });

      if (rows >= 22) {
        const minPos2 = b1 + 2 + MIN_ROOM_H;
        const maxPos2 = zoneEnd - 1 - MIN_ROOM_H;
        if (maxPos2 >= minPos2) {
          const hi2 = Math.min(maxPos2, b1 + 2 + Math.floor((zoneEnd - b1 - 2) * 0.65));
          const b2  = minPos2 + Math.floor(rng() * Math.max(1, hi2 - minPos2 + 1));
          branchSets.push({ r1: b2, r2: b2 + 1 });
        }
      }
    }
  }

  return { spineL, spineR, recBottom, recL, recR, branchSets };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4 — BSP ROOM BLUEPRINT
// ═══════════════════════════════════════════════════════════════════════════════

function buildBlueprint(cols, rows, corridorPlan) {
  const { spineL, spineR, recBottom, recL, recR, branchSets } = corridorPlan;
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(''));

  for (let r = 0; r <= recBottom; r++)
    for (let c = recL; c <= recR; c++)
      grid[r][c] = 'reception';

  for (let r = recBottom + 1; r < rows; r++) {
    grid[r][spineL] = 'corridor';
    grid[r][spineR] = 'corridor';
  }

  for (const { r1, r2 } of branchSets) {
    for (let c = 0; c < cols; c++) {
      grid[r1][c] = 'corridor';
      grid[r2][c] = 'corridor';
    }
  }

  const zones = [];
  if (recL > 0)
    zones.push({ x: 0,      y: 0, w: recL,        h: recBottom + 1 });
  if (recR < cols - 1)
    zones.push({ x: recR+1, y: 0, w: cols-recR-1, h: recBottom + 1 });

  let bandStart = recBottom + 1;
  for (const { r1, r2 } of branchSets) {
    if (r1 - 1 >= bandStart) {
      const h = r1 - bandStart;
      if (spineL > 0)            zones.push({ x: 0,        y: bandStart, w: spineL,        h });
      if (cols - spineR - 1 > 0) zones.push({ x: spineR+1, y: bandStart, w: cols-spineR-1, h });
    }
    bandStart = r2 + 1;
  }
  if (rows - 1 >= bandStart) {
    const h = rows - bandStart;
    if (spineL > 0)            zones.push({ x: 0,        y: bandStart, w: spineL,        h });
    if (cols - spineR - 1 > 0) zones.push({ x: spineR+1, y: bandStart, w: cols-spineR-1, h });
  }

  const regions = [];
  const alwaysSplit = Math.max(60, Math.round(cols * rows * SPLIT_AREA_RATIO));

  function bsp(x, y, w, h) {
    const canH = h >= MIN_ROOM_H * 2;
    const canV = w >= MIN_ROOM_W * 2;
    if (!canH && !canV) { regions.push({ x, y, w, h }); return; }

    const stopProb = Math.max(0, 1 - (w * h) / alwaysSplit);
    if (rng() < stopProb) { regions.push({ x, y, w, h }); return; }

    const doH = canH && (!canV || (h >= w ? rng() < 0.62 : rng() < 0.38));
    if (doH) {
      const range = h - 2 * MIN_ROOM_H;
      const split = MIN_ROOM_H + (range > 0 ? Math.floor(rng() * (range + 1)) : 0);
      bsp(x, y,         w, split);
      bsp(x, y + split, w, h - split);
    } else {
      const range = w - 2 * MIN_ROOM_W;
      const split = MIN_ROOM_W + (range > 0 ? Math.floor(rng() * (range + 1)) : 0);
      bsp(x,         y, split,     h);
      bsp(x + split, y, w - split, h);
    }
  }

  for (const { x, y, w, h } of zones) {
    if (w >= 1 && h >= 1) bsp(x, y, w, h);
  }

  const pool = shuffle([...ROOM_TYPES].filter(t => t !== 'reception' && t !== 'corridor'));
  while (pool.length < regions.length) pool.push(`room_${pool.length}`);

  regions.forEach((reg, i) => {
    const name = pool[i];
    for (let r = reg.y; r < reg.y + reg.h; r++)
      for (let c = reg.x; c < reg.x + reg.w; c++)
        grid[r][c] = name;
  });

  return { grid, regions };
}

if (FLOOR === 1 || argFreshCorridor)
  CORRIDOR_PLAN = planCorridor(COLS, ROWS, WINDOWS.north, ENTRANCE_COL);

const { grid: blueprint, regions } = buildBlueprint(COLS, ROWS, CORRIDOR_PLAN);

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4 — DOOR GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

function buildDoors(grid, cols, rows, entranceCol) {
  const doors      = new Map();
  const nullBehind = new Map();
  const paired     = new Set();

  const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  const corridorAdjacent = new Set();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 'corridor') continue;
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const n = grid[nr][nc];
          if (n !== 'corridor') corridorAdjacent.add(n);
        }
      }
    }
  }

  function skipPair(a, b) {
    if (a === 'corridor' || b === 'corridor') return false;
    if (a === 'reception' || b === 'reception') return true;
    return corridorAdjacent.has(a) && corridorAdjacent.has(b);
  }

  function placeDoor(r, c, dir, glass = false) {
    doors.set(`${r},${c}`, { dir, glass });
    const offsets  = { N: [-1, 0], S: [1, 0], W: [0, -1], E: [0, 1] };
    const opposite = { N: 'S',    S: 'N',    W: 'E',     E: 'W'    };
    const [dr, dc] = offsets[dir];
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      nullBehind.set(`${nr},${nc}`, opposite[dir]);
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const room = grid[r][c];

      if (r + 1 < rows) {
        const below = grid[r + 1][c];
        if (below !== room) {
          const pk = pairKey(room, below);
          if (!paired.has(pk)) {
            paired.add(pk);
            if (!skipPair(room, below)) {
              const shared = [];
              for (let cc = 0; cc < cols; cc++) {
                if (grid[r][cc] === room && grid[r + 1][cc] === below) shared.push(cc);
              }
              const isRecCorridor =
                (room === 'reception' || below === 'reception') &&
                (room === 'corridor'  || below === 'corridor');
              if (isRecCorridor) {
                shared.forEach(col => placeDoor(r, col, 'S'));
              } else {
                const interior = shared.length > 2 ? shared.slice(1, -1) : shared;
                const doorCol  = interior[Math.floor(interior.length / 2)];
                const dRoom = grid[r][doorCol];
                const colIsCorner = (doorCol > 0 && grid[r][doorCol - 1] !== dRoom) ||
                                    (doorCol < cols - 1 && grid[r][doorCol + 1] !== dRoom);
                if (!colIsCorner) placeDoor(r, doorCol, 'S');
              }
            }
          }
        }
      }

      if (c + 1 < cols) {
        const right = grid[r][c + 1];
        if (right !== room) {
          const pk = pairKey(room, right);
          if (!paired.has(pk)) {
            paired.add(pk);
            if (!skipPair(room, right)) {
              const shared = [];
              for (let rr = 0; rr < rows; rr++) {
                if (grid[rr][c] === room && grid[rr][c + 1] === right) shared.push(rr);
              }
              const interior = shared.length > 2 ? shared.slice(1, -1) : shared;
              const doorRow  = interior[Math.floor(interior.length / 2)];
              const dRoom = grid[doorRow][c];
              const rowIsCorner = (doorRow > 0 && grid[doorRow - 1][c] !== dRoom) ||
                                  (doorRow < rows - 1 && grid[doorRow + 1][c] !== dRoom);
              if (!rowIsCorner) placeDoor(doorRow, c, 'E');
            }
          }
        }
      }
    }
  }

  placeDoor(0, entranceCol, 'N', true);
  return { doors, nullBehind };
}

const { doors, nullBehind } = buildDoors(blueprint, COLS, ROWS, ENTRANCE_COL);

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 5 — WALL MAP
// ═══════════════════════════════════════════════════════════════════════════════

function buildWallMap(grid, cols, rows, windows, doors, nullBehind, entranceCol) {
  const winN  = new Set(windows.north);
  const winS  = new Set(windows.south);
  const winWE = new Set(windows.westEast);

  function faceAsset(r, c, dir) {
    const onNorthEdge = r === 0;
    const onSouthEdge = r === rows - 1;
    const onWestEdge  = c === 0;
    const onEastEdge  = c === cols - 1;
    const isBuildingCorner =
      (onNorthEdge && (onWestEdge || onEastEdge)) ||
      (onSouthEdge && (onWestEdge || onEastEdge));
    const door = doors.get(`${r},${c}`);

    switch (dir) {
      case 'N': {
        if (onNorthEdge) {
          if (isBuildingCorner) return ['window_floor_to_ceiling', 0];
          if (door?.dir === 'N') return door.glass
            ? ['door_glass_double_frame', 0]
            : ['door_double_wood_frame', 0];
          if (winN.has(c)) return ['window_floor_to_ceiling', 0];
          return ['wall_straight_standard', 0];
        }
        if (door?.dir === 'N') return ['door_double_wood_frame', 0];
        return ['wall_straight_standard', 0];
      }
      case 'S': {
        if (onSouthEdge) {
          if (isBuildingCorner) return ['window_floor_to_ceiling', 180];
          if (door?.dir === 'S') return door.glass
            ? ['door_glass_double_frame', 180]
            : ['door_double_wood_frame', 180];
          if (winS.has(c)) return ['window_floor_to_ceiling', 180];
          return ['wall_straight_standard', 180];
        }
        if (door?.dir === 'S') return ['door_double_wood_frame', 180];
        return ['wall_straight_standard', 180];
      }
      case 'W': {
        if (onWestEdge) {
          if (onNorthEdge || onSouthEdge) return ['window_floor_to_ceiling', 90];
          if (door?.dir === 'W') return ['door_double_wood_frame', 90];
          if (winWE.has(r)) return ['window_floor_to_ceiling', 90];
          return ['wall_straight_standard', 90];
        }
        if (door?.dir === 'W') return ['door_double_wood_frame', 90];
        return ['wall_straight_standard', 90];
      }
      case 'E': {
        if (onEastEdge) {
          if (onNorthEdge || onSouthEdge) return ['window_floor_to_ceiling', 270];
          if (door?.dir === 'E') return ['door_double_wood_frame', 270];
          if (winWE.has(r)) return ['window_floor_to_ceiling', 270];
          return ['wall_straight_standard', 270];
        }
        if (door?.dir === 'E') return ['door_double_wood_frame', 270];
        return ['wall_straight_standard', 270];
      }
    }
  }

  const wallMap = Array.from({ length: rows }, () => new Array(cols).fill(null));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const suppressedFace = nullBehind.get(`${r},${c}`);
      const room = grid[r][c];
      const needN = suppressedFace !== 'N' && (r === 0          || grid[r - 1][c] !== room);
      const needS = suppressedFace !== 'S' && (r === rows - 1   || grid[r + 1][c] !== room);
      const needW = suppressedFace !== 'W' && (c === 0          || grid[r][c - 1] !== room);
      const needE = suppressedFace !== 'E' && (c === cols - 1   || grid[r][c + 1] !== room);

      if (!needN && !needS && !needW && !needE) { wallMap[r][c] = null; continue; }

      const faces = [];
      if (needN) faces.push(faceAsset(r, c, 'N'));
      if (needS) faces.push(faceAsset(r, c, 'S'));
      if (needW) faces.push(faceAsset(r, c, 'W'));
      if (needE) faces.push(faceAsset(r, c, 'E'));

      if (faces.length === 1) { wallMap[r][c] = faces[0]; continue; }

      const isPerpendicularCorner = (needN || needS) && (needW || needE) && faces.length === 2;
      if (isPerpendicularCorner) {
        const onPerimeter = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
        if (onPerimeter) {
          wallMap[r][c] = faces;
        } else {
          const cornerRotY = needN && needW ? 0
                           : needN && needE ? 90
                           : needS && needE ? 180
                           :                  270;
          wallMap[r][c] = ['wall_corner_fill', cornerRotY];
        }
      } else {
        wallMap[r][c] = faces;
      }
    }
  }

  return wallMap;
}

const wallMap = buildWallMap(blueprint, COLS, ROWS, WINDOWS, doors, nullBehind, ENTRANCE_COL);

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 6 — FLOOR MAP
// ═══════════════════════════════════════════════════════════════════════════════

const floorMap = Array.from({ length: ROWS }, (_, r) =>
  Array.from({ length: COLS }, (_, c) => [getFloorTile(blueprint[r][c]), 0, [0, 2, 0]])
);

// Empty interior map (to be filled by generate-interior.mjs)
const interiorMap = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 7 — WRITE JSON
// ═══════════════════════════════════════════════════════════════════════════════

const output = {
  buildingName:     argName,
  floor:            FLOOR,
  style:            argStyle,
  COLS,
  ROWS,
  CELL_SIZE:        2,
  SEED:             seed,
  generated:        new Date().toISOString(),
  WINDOW_POSITIONS: WINDOWS,
  ENTRANCE_COL,
  CORRIDOR_PLAN,
  roomLayout:       blueprint,
  floorMap,
  wallMap,
  interiorMap,
};

mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf8');

// ── Update index.json ─────────────────────────────────────────────────────────
const indexFile = resolve(DATA_DIR, 'index.json');
let index = [];
try { index = JSON.parse(readFileSync(indexFile, 'utf8')); } catch {}
const outFileName = (FLOOR === 1 ? `${argName}.json` : `${argName}${FLOOR}.json`);
if (!index.some(e => e.file === outFileName)) {
  index.push({ name: `${argName} floor ${FLOOR}`, file: outFileName });
  writeFileSync(indexFile, JSON.stringify(index, null, 2), 'utf8');
}

// ── Console summary ───────────────────────────────────────────────────────────
const uniqueRooms = [...new Set(blueprint.flat())];
const doorCount   = doors.size;

console.log('\n╔══════════════════════════════════════════════╗');
console.log('║  Building Generator — Complete (JSON)        ║');
console.log('╠══════════════════════════════════════════════╣');
console.log(`║  Building  : ${String(argName + '  (floor ' + FLOOR + ')').padEnd(30)} ║`);
console.log(`║  Size      : ${String(COLS + ' cols × ' + ROWS + ' rows').padEnd(30)} ║`);
console.log(`║  Seed      : ${String(seed).padEnd(30)} ║`);
console.log(`║  Rooms     : ${String(uniqueRooms.length).padEnd(30)} ║`);
console.log(`║  Doors     : ${String(doorCount + ' (incl. entrance)').padEnd(30)} ║`);
console.log(`║  Spine     : ${String('cols ' + CORRIDOR_PLAN.spineL + '-' + CORRIDOR_PLAN.spineR).padEnd(30)} ║`);
const branchDesc = CORRIDOR_PLAN.branchSets.length === 0 ? 'none'
  : CORRIDOR_PLAN.branchSets.map(b => `rows ${b.r1}-${b.r2}`).join(', ');
console.log(`║  Branches  : ${String(branchDesc).padEnd(30)} ║`);
console.log('╠══════════════════════════════════════════════╣');
console.log(`║  Output    : ${String('public/data/' + outFileName).padEnd(30)} ║`);
console.log('╚══════════════════════════════════════════════╝\n');

// ── Auto-generate interior ─────────────────────────────────────────────────────
try {
  const interiorScript = resolve(__dirname, 'generate-interior.mjs');
  execFileSync(process.execPath, [interiorScript, argName, String(FLOOR), argStyle, String(seed)], {
    stdio: 'inherit',
  });
} catch (e) {
  console.error('\nWarning: interior auto-generation failed:', e.message, '\n');
}
