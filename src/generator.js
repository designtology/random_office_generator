/**
 * generator.js — Browser-compatible port of the building + interior pipeline
 *
 * No Node.js imports. Returns plain JSON-serialisable objects.
 * Mirrors scripts/generate-building.mjs + generate-interior.mjs exactly.
 *
 * Exports:
 *   generateFloor(opts)      → complete floor JSON object (all maps + interior)
 *   randomBuildingName()     → adjective + noun string
 *   STYLES                   → valid style names array
 */

import { ROOM_PROFILES }                  from '../scripts/data/roomProfiles.mjs';
import { BUILDING_STYLES, DEFAULT_STYLE } from '../scripts/data/buildingStyles.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

export const STYLES = Object.keys(BUILDING_STYLES);

export function randomBuildingName() {
  const adj  = pick(ADJECTIVES, Math.random);
  const noun = pick(NOUNS, Math.random);
  return adj + noun;
}

/**
 * Generate a complete floor.
 *
 * @param {object} opts
 *   name      {string}  building name (alphanumeric)
 *   cols      {number}  grid width  (10–20, optional — random if omitted)
 *   rows      {number}  grid height (18–30, optional — random if omitted)
 *   seed      {number}  RNG seed    (optional — random if omitted)
 *   style     {string}  building style (default: 'corporate')
 *   floor     {number}  floor index (default: 1)
 *   floor1    {object}  floor-1 data object, required when floor > 1
 *   fresh     {bool}    new corridor plan per floor (default: false)
 * @returns {object} complete floor JSON object
 */
export function generateFloor({
  name    = 'Building',
  cols    = null,
  rows    = null,
  seed    = null,
  style   = DEFAULT_STYLE,
  floor   = 1,
  floor1  = null,
  fresh   = false,
} = {}) {
  const SEED = seed != null ? (seed >>> 0) : ((Math.random() * 0xFFFFFFFF) >>> 0);

  // ── Dimensions & shared building data ───────────────────────────────────────
  let COLS, ROWS, WINDOWS, ENTRANCE_COL, CORRIDOR_PLAN;

  if (floor === 1) {
    const rng0 = makeRng(SEED);
    COLS = cols != null
      ? Math.max(COLS_MIN, Math.min(COLS_MAX, cols))
      : COLS_MIN + Math.floor(rng0() * (COLS_MAX - COLS_MIN + 1));
    ROWS = rows != null
      ? Math.max(ROWS_MIN, Math.min(ROWS_MAX, rows))
      : ROWS_MIN + Math.floor(rng0() * (ROWS_MAX - ROWS_MIN + 1));
    WINDOWS      = computeWindowPositions(COLS, ROWS);
    ENTRANCE_COL = chooseEntranceCol(COLS, WINDOWS.north);
  } else {
    if (!floor1) throw new Error('floor1 data required for floor > 1');
    COLS         = floor1.COLS;
    ROWS         = floor1.ROWS;
    WINDOWS      = floor1.WINDOW_POSITIONS;
    ENTRANCE_COL = floor1.ENTRANCE_COL;
    if (!fresh) CORRIDOR_PLAN = floor1.CORRIDOR_PLAN;
  }

  const rng = makeRng(SEED);

  // ── Corridor plan ───────────────────────────────────────────────────────────
  if (floor === 1 || fresh)
    CORRIDOR_PLAN = planCorridor(rng, COLS, ROWS, WINDOWS.north, ENTRANCE_COL);

  // ── Room blueprint (BSP) ────────────────────────────────────────────────────
  const { grid: roomLayout } = buildBlueprint(rng, COLS, ROWS, CORRIDOR_PLAN);

  // ── Doors ───────────────────────────────────────────────────────────────────
  const { doors, nullBehind } = buildDoors(roomLayout, COLS, ROWS, ENTRANCE_COL);

  // ── Wall map ────────────────────────────────────────────────────────────────
  const wallMap = buildWallMap(roomLayout, COLS, ROWS, WINDOWS, doors, nullBehind, ENTRANCE_COL);

  // ── Floor map ───────────────────────────────────────────────────────────────
  const floorMap = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => [getFloorTile(roomLayout[r][c]), 0, [0, 2, 0]])
  );

  // ── Interior map ────────────────────────────────────────────────────────────
  const interiorMap = buildInterior(rng, COLS, ROWS, roomLayout, wallMap, style);

  return {
    buildingName:     name,
    floor,
    style,
    COLS,
    ROWS,
    CELL_SIZE:        2,
    SEED,
    generated:        new Date().toISOString(),
    WINDOW_POSITIONS: WINDOWS,
    ENTRANCE_COL,
    CORRIDOR_PLAN,
    roomLayout,
    floorMap,
    wallMap,
    interiorMap,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const COLS_MIN   = 10;
const COLS_MAX   = 20;
const ROWS_MIN   = 18;
const ROWS_MAX   = 30;
const MIN_ROOM_W = 4;
const MIN_ROOM_H = 4;
const WING_MIN_W = 3;
const WIN_STEP_WE = 3;
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

// ─────────────────────────────────────────────────────────────────────────────
// RNG — mulberry32
// ─────────────────────────────────────────────────────────────────────────────

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(min, max, rng) {
  return min + Math.floor(rng() * (max - min + 1));
}

// ─────────────────────────────────────────────────────────────────────────────
// WINDOW POSITIONS
// ─────────────────────────────────────────────────────────────────────────────

function computeWindowPositions(cols, rows) {
  const north = [], south = [], westEast = [];
  for (let c = 2; c <= cols - 2; c += 2) north.push(c);
  for (let c = 1; c <= cols - 2; c += 2) south.push(c);
  for (let r = 1; r < rows - 1; r += WIN_STEP_WE) westEast.push(r);
  return { north, south, westEast };
}

function chooseEntranceCol(cols, northWindows) {
  const center = Math.floor(cols / 2);
  const winSet = new Set(northWindows);
  for (let offset = 0; offset < cols; offset++)
    for (const delta of [0, 1, -1]) {
      const c = center + delta * offset;
      if (c > 0 && c < cols - 1 && !winSet.has(c)) return c;
    }
  return 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORRIDOR PLAN
// ─────────────────────────────────────────────────────────────────────────────

function planCorridor(rng, cols, rows, northWindows, entranceCol) {
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
    const minPos    = zoneStart + MIN_ROOM_H;
    const maxPos    = zoneEnd - 1 - MIN_ROOM_H;
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

// ─────────────────────────────────────────────────────────────────────────────
// BSP ROOM BLUEPRINT
// ─────────────────────────────────────────────────────────────────────────────

function buildBlueprint(rng, cols, rows, corridorPlan) {
  const { spineL, spineR, recBottom, recL, recR, branchSets } = corridorPlan;
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(''));

  for (let r = 0; r <= recBottom; r++)
    for (let c = recL; c <= recR; c++)
      grid[r][c] = 'reception';

  for (let r = recBottom + 1; r < rows; r++) {
    grid[r][spineL] = 'corridor';
    grid[r][spineR] = 'corridor';
  }
  for (const { r1, r2 } of branchSets)
    for (let c = 0; c < cols; c++) { grid[r1][c] = 'corridor'; grid[r2][c] = 'corridor'; }

  const zones = [];
  if (recL > 0)        zones.push({ x: 0,       y: 0, w: recL,        h: recBottom + 1 });
  if (recR < cols - 1) zones.push({ x: recR + 1, y: 0, w: cols-recR-1, h: recBottom + 1 });

  let bandStart = recBottom + 1;
  for (const { r1, r2 } of branchSets) {
    if (r1 - 1 >= bandStart) {
      const h = r1 - bandStart;
      if (spineL > 0)            zones.push({ x: 0,         y: bandStart, w: spineL,        h });
      if (cols - spineR - 1 > 0) zones.push({ x: spineR + 1, y: bandStart, w: cols-spineR-1, h });
    }
    bandStart = r2 + 1;
  }
  if (rows - 1 >= bandStart) {
    const h = rows - bandStart;
    if (spineL > 0)            zones.push({ x: 0,         y: bandStart, w: spineL,        h });
    if (cols - spineR - 1 > 0) zones.push({ x: spineR + 1, y: bandStart, w: cols-spineR-1, h });
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
      bsp(x, y, w, split); bsp(x, y + split, w, h - split);
    } else {
      const range = w - 2 * MIN_ROOM_W;
      const split = MIN_ROOM_W + (range > 0 ? Math.floor(rng() * (range + 1)) : 0);
      bsp(x, y, split, h); bsp(x + split, y, w - split, h);
    }
  }
  for (const { x, y, w, h } of zones) if (w >= 1 && h >= 1) bsp(x, y, w, h);

  const pool = shuffle([...ROOM_TYPES].filter(t => t !== 'reception' && t !== 'corridor'), rng);
  while (pool.length < regions.length) pool.push(`room_${pool.length}`);
  regions.forEach((reg, i) => {
    const name = pool[i];
    for (let r = reg.y; r < reg.y + reg.h; r++)
      for (let c = reg.x; c < reg.x + reg.w; c++)
        grid[r][c] = name;
  });

  return { grid, regions };
}

// ─────────────────────────────────────────────────────────────────────────────
// DOOR GENERATION
// ─────────────────────────────────────────────────────────────────────────────

function buildDoors(grid, cols, rows, entranceCol) {
  const doors      = new Map();
  const nullBehind = new Map();
  const paired     = new Set();
  const pairKey    = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  const corridorAdjacent = new Set();
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 'corridor') continue;
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = r+dr, nc = c+dc;
        if (nr>=0 && nr<rows && nc>=0 && nc<cols && grid[nr][nc]!=='corridor')
          corridorAdjacent.add(grid[nr][nc]);
      }
    }

  function skipPair(a, b) {
    if (a==='corridor'||b==='corridor') return false;
    if (a==='reception'||b==='reception') return true;
    return corridorAdjacent.has(a) && corridorAdjacent.has(b);
  }
  function placeDoor(r, c, dir, glass=false) {
    doors.set(`${r},${c}`, { dir, glass });
    const offsets  = { N:[-1,0], S:[1,0], W:[0,-1], E:[0,1] };
    const opposite = { N:'S', S:'N', W:'E', E:'W' };
    const [dr, dc] = offsets[dir];
    const nr=r+dr, nc=c+dc;
    if (nr>=0&&nr<rows&&nc>=0&&nc<cols)
      nullBehind.set(`${nr},${nc}`, opposite[dir]);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const room = grid[r][c];
      if (r+1<rows) {
        const below = grid[r+1][c];
        if (below!==room) {
          const pk = pairKey(room, below);
          if (!paired.has(pk)) {
            paired.add(pk);
            if (!skipPair(room, below)) {
              const shared=[];
              for (let cc=0;cc<cols;cc++) if(grid[r][cc]===room&&grid[r+1][cc]===below) shared.push(cc);
              const isRecCorridor=(room==='reception'||below==='reception')&&(room==='corridor'||below==='corridor');
              if (isRecCorridor) { shared.forEach(col=>placeDoor(r,col,'S')); }
              else {
                const interior=shared.length>2?shared.slice(1,-1):shared;
                const doorCol=interior[Math.floor(interior.length/2)];
                const dRoom=grid[r][doorCol];
                const colIsCorner=(doorCol>0&&grid[r][doorCol-1]!==dRoom)||(doorCol<cols-1&&grid[r][doorCol+1]!==dRoom);
                if (!colIsCorner) placeDoor(r,doorCol,'S');
              }
            }
          }
        }
      }
      if (c+1<cols) {
        const right=grid[r][c+1];
        if (right!==room) {
          const pk=pairKey(room,right);
          if (!paired.has(pk)) {
            paired.add(pk);
            if (!skipPair(room,right)) {
              const shared=[];
              for (let rr=0;rr<rows;rr++) if(grid[rr][c]===room&&grid[rr][c+1]===right) shared.push(rr);
              const interior=shared.length>2?shared.slice(1,-1):shared;
              const doorRow=interior[Math.floor(interior.length/2)];
              const dRoom=grid[doorRow][c];
              const rowIsCorner=(doorRow>0&&grid[doorRow-1][c]!==dRoom)||(doorRow<rows-1&&grid[doorRow+1][c]!==dRoom);
              if (!rowIsCorner) placeDoor(doorRow,c,'E');
            }
          }
        }
      }
    }
  }
  placeDoor(0, entranceCol, 'N', true);
  return { doors, nullBehind };
}

// ─────────────────────────────────────────────────────────────────────────────
// WALL MAP
// ─────────────────────────────────────────────────────────────────────────────

function buildWallMap(grid, cols, rows, windows, doors, nullBehind, entranceCol) {
  const winN  = new Set(windows.north);
  const winS  = new Set(windows.south);
  const winWE = new Set(windows.westEast);

  function faceAsset(r, c, dir) {
    const onN=r===0, onS=r===rows-1, onW=c===0, onE=c===cols-1;
    const isCorner=(onN&&(onW||onE))||(onS&&(onW||onE));
    const door=doors.get(`${r},${c}`);
    switch(dir){
      case 'N': if(onN){ if(isCorner) return['window_floor_to_ceiling',0]; if(door?.dir==='N') return door.glass?['door_glass_double_frame',0]:['door_double_wood_frame',0]; if(winN.has(c)) return['window_floor_to_ceiling',0]; return['wall_straight_standard',0]; } if(door?.dir==='N') return['door_double_wood_frame',0]; return['wall_straight_standard',0];
      case 'S': if(onS){ if(isCorner) return['window_floor_to_ceiling',180]; if(door?.dir==='S') return door.glass?['door_glass_double_frame',180]:['door_double_wood_frame',180]; if(winS.has(c)) return['window_floor_to_ceiling',180]; return['wall_straight_standard',180]; } if(door?.dir==='S') return['door_double_wood_frame',180]; return['wall_straight_standard',180];
      case 'W': if(onW){ if(onN||onS) return['window_floor_to_ceiling',90]; if(door?.dir==='W') return['door_double_wood_frame',90]; if(winWE.has(r)) return['window_floor_to_ceiling',90]; return['wall_straight_standard',90]; } if(door?.dir==='W') return['door_double_wood_frame',90]; return['wall_straight_standard',90];
      case 'E': if(onE){ if(onN||onS) return['window_floor_to_ceiling',270]; if(door?.dir==='E') return['door_double_wood_frame',270]; if(winWE.has(r)) return['window_floor_to_ceiling',270]; return['wall_straight_standard',270]; } if(door?.dir==='E') return['door_double_wood_frame',270]; return['wall_straight_standard',270];
    }
  }

  const wallMap = Array.from({ length: rows }, () => new Array(cols).fill(null));
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    const sf=nullBehind.get(`${r},${c}`);
    const room=grid[r][c];
    const needN=sf!=='N'&&(r===0||grid[r-1][c]!==room);
    const needS=sf!=='S'&&(r===rows-1||grid[r+1][c]!==room);
    const needW=sf!=='W'&&(c===0||grid[r][c-1]!==room);
    const needE=sf!=='E'&&(c===cols-1||grid[r][c+1]!==room);
    if (!needN&&!needS&&!needW&&!needE){ wallMap[r][c]=null; continue; }
    const faces=[];
    if(needN)faces.push(faceAsset(r,c,'N'));
    if(needS)faces.push(faceAsset(r,c,'S'));
    if(needW)faces.push(faceAsset(r,c,'W'));
    if(needE)faces.push(faceAsset(r,c,'E'));
    if(faces.length===1){ wallMap[r][c]=faces[0]; continue; }
    const isPerpCorner=(needN||needS)&&(needW||needE)&&faces.length===2;
    if(isPerpCorner){
      const onPerim=r===0||r===rows-1||c===0||c===cols-1;
      if(onPerim){ wallMap[r][c]=faces; }
      else {
        const cRot=needN&&needW?0:needN&&needE?90:needS&&needE?180:270;
        wallMap[r][c]=['wall_corner_fill',cRot];
      }
    } else { wallMap[r][c]=faces; }
  }
  return wallMap;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERIOR
// ─────────────────────────────────────────────────────────────────────────────

const PLANT_RULE_THRESHOLD = 16;
const PLANT_ASSET = 'plant_large_floor_potted_fiddle';

function densityMultiplier(interiorCells) {
  return Math.min(4, Math.max(1, Math.round(interiorCells / 4)));
}

function buildInterior(rng, cols, rows, roomLayout, wallMap, style) {
  const styleOverrides = (BUILDING_STYLES[style] ?? BUILDING_STYLES[DEFAULT_STYLE]).slotOverrides ?? {};

  function resolveSlot(roomType, baseSlot) {
    const over = (styleOverrides[roomType] ?? {})[baseSlot.id] ?? {};
    return { ...baseSlot, chance: over.chance??baseSlot.chance, count: over.count??baseSlot.count??1, assets: over.assets??baseSlot.assets };
  }

  const roomCells = new Map();
  const roomArea  = new Map();
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    const name=roomLayout[r]?.[c]; if(!name) continue;
    roomArea.set(name,(roomArea.get(name)??0)+1);
    if (wallMap[r]?.[c]!=null) continue;
    if(!roomCells.has(name)) roomCells.set(name,[]);
    roomCells.get(name).push({r,c});
  }

  const interiorMap = Array.from({length:rows},()=>new Array(cols).fill(null));

  for (const [roomName, profile] of Object.entries(ROOM_PROFILES)) {
    const matching=[...roomCells.entries()].filter(([n])=>n===roomName);
    if (!matching.length) continue;
    for (const [,cells] of matching) {
      const available=shuffle(cells,rng);
      let next=0;
      for (const baseSlot of profile.slots) {
        const slot=resolveSlot(roomName,baseSlot);
        if(rng()>slot.chance) continue;
        const slotMax=Array.isArray(slot.count)?slot.count[1]:(slot.count??1);
        const mult=slotMax>=3?densityMultiplier(cells.length):1;
        const count=Array.isArray(slot.count)
          ?randInt(slot.count[0]*mult,slot.count[1]*mult,rng)
          :Math.round((slot.count??1)*mult);
        const asset=pick(slot.assets,rng);
        for (let i=0;i<count;i++){
          if(next>=available.length) break;
          const{r,c}=available[next++];
          interiorMap[r][c]=[asset,0];
        }
      }
      if (!profile.skipPlantRule&&(roomArea.get(roomName)??0)>PLANT_RULE_THRESHOLD) {
        const hasPlant=cells.some(({r,c})=>Array.isArray(interiorMap[r][c])&&interiorMap[r][c][0]===PLANT_ASSET);
        if (!hasPlant&&next<available.length){ const{r,c}=available[next++]; interiorMap[r][c]=[PLANT_ASSET,0]; }
      }
    }
  }
  return interiorMap;
}

// ─────────────────────────────────────────────────────────────────────────────
// RANDOM NAME GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

const ADJECTIVES = [
  'Alpha','Apex','Arc','Arch','Atlas','Beacon','Blue','Cedar','Central','Civic',
  'Clear','Cloud','Core','Crown','Crystal','Delta','Digital','Edge','Elite','Ember',
  'Empire','Eon','Epic','Era','Evergreen','Forge','Frontier','Global','Grand','Green',
  'Grid','Harbor','Haven','High','Hub','Hyper','Icon','Ideal','Impact','Indigo',
  'Infinity','Iron','Keystone','Kite','Landmark','Lux','Metro','Mint','Mosaic','Neo',
  'Nexus','Noble','Nordic','North','Nova','Oaken','Obsidian','Octa','Onyx','Open',
  'Orbit','Pacific','Peak','Pilot','Pinnacle','Pioneer','Pixel','Plaza','Polar','Prime',
  'Prism','Pulse','Quartz','Rapid','Ridge','Rise','Royal','Sapphire','Silver','Slate',
  'Solar','Solid','Spark','Sphere','Summit','Swift','Terra','Titan','Tower','Trans',
  'Trident','Unity','Urban','Vantage','Vertex','Vision','Vortex','Wave','West','Zenith',
];

const NOUNS = [
  'Capital','Center','Centre','Circle','City','Collective','Connect','Core',
  'Court','Crest','Cross','Crown','District','Domain','Drive','Edge',
  'Enterprise','Estate','Exchange','Flow','Forum','Gate','Grid','Grove',
  'Hall','Heights','Hub','Loft','Loop','Park','Place','Plaza',
  'Point','Post','Quarter','Ridge','Rise','Row','Space','Sphere',
  'Spire','Square','Station','Studio','Summit','Terminal','Tower','Trade',
  'Union','Vale','Vault','View','Village','Walk','Works','Yard',
];
