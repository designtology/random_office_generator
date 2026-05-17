/**
 * viewer.js — Three.js office floor renderer
 *
 * Renders floorMap, wallMap, and interiorMap from a generated JSON floor file.
 * Uses placeholder boxes colored by room type (djb2) or asset category.
 *
 * Cell format (mirrors Unity/webapp):
 *   null                           → skip
 *   ['filename', rotY]             → single asset at cell center
 *   ['filename', rotY, [ox,oy,oz]] → single asset with fine-tune offset
 *   [['fn1', rotY1], ['fn2', ...]] → multi-asset (cell[0] is array)
 *
 * rotY convention (webapp): 0=north(−Z), 90=west(−X), 180=south(+Z), 270=east(+X)
 * Three.js conversion: rotation.y = degToRad(rotY + 180)
 *
 * Wall snap: wall_*, door_*, window_* pushed to cell edge (thin slab).
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { roomColor, assetColor, assetOpacity } from './colors.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const CELL_SIZE   = 2;       // world units per cell (matches webapp + Unity)
const FLOOR_H     = 0.02;    // height of floor tile placeholder box
const WALL_H      = 2.80;    // height of wall placeholder box
const WALL_D      = 0.15;    // depth (thickness) of wall placeholder box
const INTERIOR_H  = 0.80;    // height of interior asset placeholder box
const FLOOR_STACK = 3.0;     // Y offset per floor index (floor index starts at 1)

// How thick an asset needs to be to NOT qualify for wall-snap
const SNAP_DEPTH_THRESHOLD = 0.5;

// ── Wall-snap categories ───────────────────────────────────────────────────────
function needsWallSnap(name) {
  return (
    name.startsWith('wall_straight') ||
    name.startsWith('wall_glass') ||
    name.startsWith('door_') ||
    name.startsWith('window_')
  );
}

// ── rotY → Three.js euler Y ───────────────────────────────────────────────────
function toThreeRotY(rotY) {
  return THREE.MathUtils.degToRad(rotY + 180);
}

// ── Compute wall-snap offset for thin assets ──────────────────────────────────
// rotY=0 (north/−Z face): push toward −Z edge
// rotY=90 (west/−X face): push toward −X edge
// rotY=180 (south/+Z face): push toward +Z edge
// rotY=270 (east/+X face): push toward +X edge
function wallSnapOffset(rotY) {
  const edge = CELL_SIZE / 2 - WALL_D / 2; // push center to near-edge
  switch (rotY) {
    case   0: return [0, 0, -edge];   // north
    case  90: return [-edge, 0, 0];   // west
    case 180: return [0, 0, +edge];   // south
    case 270: return [+edge, 0, 0];   // east
    default:  return [0, 0, 0];
  }
}

// ── Geometry & material cache ─────────────────────────────────────────────────
const _geoCache  = new Map(); // 'w,h,d' → BoxGeometry
const _matCache  = new Map(); // color|opacity → MeshLambertMaterial

function getGeo(w, h, d) {
  const key = `${w},${h},${d}`;
  if (!_geoCache.has(key)) _geoCache.set(key, new THREE.BoxGeometry(w, h, d));
  return _geoCache.get(key);
}

function getMat(color, opacity = 1) {
  const key = `${color}|${opacity}`;
  if (!_matCache.has(key)) {
    const mat = new THREE.MeshLambertMaterial({
      color,
      transparent: opacity < 1,
      opacity,
      depthWrite: opacity >= 1,
    });
    _matCache.set(key, mat);
  }
  return _matCache.get(key);
}

// ── Label helpers ─────────────────────────────────────────────────────────────
function toTitleCase(name) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function makeLabel(text, x, y, z) {
  const canvas = document.createElement('canvas');
  canvas.width  = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = '#c0c8e8';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  return mesh;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEWER CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class FloorViewer {
  constructor(container) {
    this._container = container;
    this._layers = { floor: true, walls: true, interior: true, labels: true };
    this._layerGroups = {};
    this._loaded = false;

    // Raycaster for hover tooltips
    this._raycaster = new THREE.Raycaster();
    this._mouse     = new THREE.Vector2(-9999, -9999); // off-screen by default
    this._hoverMeshes = []; // meshes to test against (walls + interior)
    this._lastHoverName = null;

    /** Assign a callback: onHover(assetName | null, clientX, clientY) */
    this.onHover = null;

    this._initScene();
    this._initLights();
    this._initControls();
    this._startLoop();

    window.addEventListener('resize', () => this._onResize());
    this._container.addEventListener('mousemove', (e) => this._onMouseMove(e));
    this._container.addEventListener('mouseleave', () => this._clearHover());
  }

  // ── Three.js setup ──────────────────────────────────────────────────────────
  _initScene() {
    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0x0d0e14);
    this._scene.fog = new THREE.FogExp2(0x0d0e14, 0.012);

    const w = this._container.clientWidth;
    const h = this._container.clientHeight;

    this._camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 2000);
    this._camera.position.set(20, 30, 40);

    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this._renderer.setSize(w, h);
    this._renderer.shadowMap.enabled = false;
    this._container.appendChild(this._renderer.domElement);

    // Grid helper (subtle)
    this._grid = new THREE.GridHelper(400, 200, 0x1a1e30, 0x141620);
    this._grid.position.y = -0.01;
    this._scene.add(this._grid);
  }

  _initLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    this._scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(30, 60, 20);
    this._scene.add(dir);

    const fill = new THREE.DirectionalLight(0x8090c0, 0.3);
    fill.position.set(-20, 20, -30);
    this._scene.add(fill);
  }

  _initControls() {
    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enableDamping = true;
    this._controls.dampingFactor = 0.08;
    this._controls.minDistance = 2;
    this._controls.maxDistance = 800;
    this._controls.maxPolarAngle = Math.PI / 2 - 0.02;
  }

  _startLoop() {
    this._renderer.setAnimationLoop(() => {
      this._controls.update();
      this._tickHover();
      this._renderer.render(this._scene, this._camera);
    });
  }

  _onResize() {
    const w = this._container.clientWidth;
    const h = this._container.clientHeight;
    this._camera.aspect = w / h;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(w, h);
  }

  // ── Layer visibility ────────────────────────────────────────────────────────
  setLayerVisible(layer, visible) {
    this._layers[layer] = visible;
    if (this._layerGroups[layer]) {
      this._layerGroups[layer].visible = visible;
    }
  }

  // ── Load floor JSON ─────────────────────────────────────────────────────────
  load(floorData) {
    this._clearFloor();

    const {
      COLS, ROWS, SEED, CELL_SIZE: cs = 2,
      floorMap, wallMap, interiorMap, roomLayout,
      buildingName = '', floor = 1, style = '',
    } = floorData;

    const C = cs; // cell size (usually 2)

    // Per-floor Y offset (floor 1 = y=0, floor 2 = y=3, etc.)
    const baseY = (floor - 1) * FLOOR_STACK;

    // Compute room centroids for labels
    const roomAccum = new Map(); // roomName → {sumX, sumZ, count}

    // ── Layer groups ─────────────────────────────────────────────────────────
    const floorGrp    = new THREE.Group(); floorGrp.name    = 'floor';
    const wallGrp     = new THREE.Group(); wallGrp.name     = 'walls';
    const interiorGrp = new THREE.Group(); interiorGrp.name = 'interior';
    const labelGrp    = new THREE.Group(); labelGrp.name    = 'labels';

    this._scene.add(floorGrp, wallGrp, interiorGrp, labelGrp);
    this._layerGroups = { floor: floorGrp, walls: wallGrp, interior: interiorGrp, labels: labelGrp };

    // Apply current visibility toggles immediately
    for (const [layer, grp] of Object.entries(this._layerGroups)) {
      grp.visible = this._layers[layer] ?? true;
    }

    // ── Floor map ─────────────────────────────────────────────────────────────
    if (floorMap) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = floorMap[r]?.[c];
          if (!cell) continue;
          const cx = c * C + C / 2;
          const cz = r * C + C / 2;
          this._placeCell(cell, cx, baseY - FLOOR_H / 2, cz, C, floorGrp);
        }
      }
    }

    // ── Wall map ──────────────────────────────────────────────────────────────
    if (wallMap) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = wallMap[r]?.[c];
          if (!cell) continue;
          const cx = c * C + C / 2;
          const cz = r * C + C / 2;
          this._placeCell(cell, cx, baseY + WALL_H / 2, cz, C, wallGrp);
        }
      }
    }

    // ── Interior map ─────────────────────────────────────────────────────────
    if (interiorMap) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = interiorMap[r]?.[c];
          if (!cell) continue;
          const cx = c * C + C / 2;
          const cz = r * C + C / 2;
          this._placeCell(cell, cx, baseY + INTERIOR_H / 2, cz, C, interiorGrp);
        }
      }
    }

    // ── Room centroids for labels ─────────────────────────────────────────────
    if (roomLayout) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const name = roomLayout[r]?.[c];
          if (!name) continue;
          const cx = c * C + C / 2;
          const cz = r * C + C / 2;
          if (!roomAccum.has(name)) roomAccum.set(name, { sumX: 0, sumZ: 0, count: 0 });
          const a = roomAccum.get(name);
          a.sumX += cx; a.sumZ += cz; a.count++;
        }
      }

      for (const [name, { sumX, sumZ, count }] of roomAccum) {
        const lx = sumX / count;
        const lz = sumZ / count;
        const ly = baseY + 0.5; // just above floor surface, below interior assets
        const label = makeLabel(toTitleCase(name), lx, ly, lz);
        labelGrp.add(label);
      }
    }

    // ── Collect hover-eligible meshes (walls + interior, not floor/labels) ──
    this._hoverMeshes = [];
    for (const layerName of ['walls', 'interior']) {
      const grp = this._layerGroups[layerName];
      if (grp) grp.traverse(obj => { if (obj.isMesh && obj.userData.name) this._hoverMeshes.push(obj); });
    }

    // ── Fit camera ───────────────────────────────────────────────────────────
    this._fitCamera(COLS * C, ROWS * C, baseY);

    // Store stats
    this._stats = { COLS, ROWS, SEED, rooms: roomAccum.size, style };
    this._loaded = true;

    return this._stats;
  }

  // ── Place a cell (handles null / single / multi-asset) ─────────────────────
  _placeCell(cell, cx, cy, cz, C, group) {
    if (!cell) return;

    // Multi-asset: cell[0] is itself an array
    if (Array.isArray(cell[0])) {
      for (const tuple of cell) {
        this._placeTuple(tuple, cx, cy, cz, C, group);
      }
    } else {
      this._placeTuple(cell, cx, cy, cz, C, group);
    }
  }

  // ── Place a single asset tuple ─────────────────────────────────────────────
  _placeTuple(tuple, cx, cy, cz, C, group) {
    if (!tuple) return;
    const [name, rotY = 0, offset = [0, 0, 0]] = tuple;
    if (!name) return;

    // ── Corner fill hack: emit two perpendicular straight wall slabs ──────────
    // wall_corner_fill rotY encodes which corner:
    //   0=NW (north+west)  90=NE (north+east)
    //   180=SE (south+east)  270=SW (south+west)
    if (name === 'wall_corner_fill') {
      const CORNER_FACES = {
          0: [  0,  90],   // NW: north face + west face
         90: [  0, 270],   // NE: north face + east face
        180: [180, 270],   // SE: south face + east face
        270: [180,  90],   // SW: south face + west face
      };
      const faces = CORNER_FACES[rotY] ?? [0, 90];
      for (const faceRotY of faces) {
        this._placeTuple(['wall_straight_standard', faceRotY], cx, cy, cz, C, group);
      }
      return;
    }

    const [ox, oy, oz] = offset;
    const isFloor    = name.startsWith('floor_');
    const isWall     = needsWallSnap(name);

    // Floor tiles from the generator carry a [0, 2, 0] offset — a Unity rendering
    // pipeline artifact (floor layer rendered at a specific Y in Unity's coordinate
    // system). In Three.js we position floors via cy directly, so strip oy here.
    const effectiveOY = isFloor ? 0 : (oy ?? 0);

    // Dimensions of the placeholder box
    let w, h, d;
    if (isFloor) {
      w = C; h = FLOOR_H; d = C;
    } else if (isWall) {
      w = C; h = WALL_H; d = WALL_D;
    } else {
      // Interior: small box, size varies by category
      w = 0.6; h = INTERIOR_H; d = 0.6;
      if (name.startsWith('desk_') || name.startsWith('table_')) { w = 1.4; h = 0.8; d = 0.8; }
      else if (name.startsWith('sofa_') || name.startsWith('bench_')) { w = 1.6; h = 0.6; d = 0.7; }
      else if (name.startsWith('chair_')) { w = 0.6; h = 0.9; d = 0.6; }
      else if (name.startsWith('shelf_') || name.startsWith('bookcase') || name.startsWith('cabinet')) { w = 0.8; h = 1.8; d = 0.4; }
      else if (name.startsWith('server_') || name.startsWith('rack_')) { w = 0.8; h = 2.0; d = 0.8; }
      else if (name.startsWith('plant_')) { w = 0.5; h = 1.6; d = 0.5; }
      else if (name.startsWith('monitor_')) { w = 0.6; h = 0.4; d = 0.1; }
      else if (name.startsWith('tv_') || name.startsWith('display_')) { w = 1.2; h = 0.7; d = 0.08; }
    }

    // Wall-snap offset for thin boundary assets
    let snapX = 0, snapZ = 0;
    if (isWall) {
      const [sx, , sz] = wallSnapOffset(rotY);
      snapX = sx; snapZ = sz;
    }

    const geo = getGeo(w, h, d);
    const col = assetColor(name);
    const opc = assetOpacity(name);
    const mat = getMat(col, opc);
    const mesh = new THREE.Mesh(geo, mat);

    // Position: cell center + snap + fine-tune offset
    mesh.position.set(
      cx + snapX + (ox ?? 0),
      cy + effectiveOY,
      cz + snapZ + (oz ?? 0),
    );

    // Rotation (rotY in webapp convention → add 180° for Three.js)
    mesh.rotation.y = toThreeRotY(rotY);

    mesh.userData = { name, rotY };
    group.add(mesh);
  }

  // ── Fit camera to floor bounds ─────────────────────────────────────────────
  _fitCamera(width, depth, baseY) {
    const cx = width / 2;
    const cz = depth / 2;
    const dist = Math.max(width, depth) * 0.85;
    this._camera.position.set(cx, dist * 0.7, cz + dist * 0.6);
    this._controls.target.set(cx, baseY, cz);
    this._controls.update();
  }

  // ── Hover / raycasting ────────────────────────────────────────────────────
  _onMouseMove(e) {
    const rect = this._container.getBoundingClientRect();
    this._mouse.set(
      ((e.clientX - rect.left) / rect.width)  *  2 - 1,
      ((e.clientY - rect.top)  / rect.height) * -2 + 1,
    );
    this._clientX = e.clientX;
    this._clientY = e.clientY;
  }

  _clearHover() {
    this._mouse.set(-9999, -9999);
    if (this.onHover) this.onHover(null, 0, 0);
    this._lastHoverName = null;
  }

  _tickHover() {
    if (!this._hoverMeshes.length) return;
    this._raycaster.setFromCamera(this._mouse, this._camera);
    const hits = this._raycaster.intersectObjects(this._hoverMeshes, false);
    const name = hits.length ? (hits[0].object.userData.name ?? null) : null;
    if (name !== this._lastHoverName) {
      this._lastHoverName = name;
      if (this.onHover) this.onHover(name, this._clientX ?? 0, this._clientY ?? 0);
    }
  }

  // ── Clear previous floor ───────────────────────────────────────────────────
  _clearFloor() {
    this._hoverMeshes = [];
    this._lastHoverName = null;
    if (this.onHover) this.onHover(null, 0, 0);

    for (const name of ['floor', 'walls', 'interior', 'labels']) {
      const grp = this._layerGroups[name];
      if (grp) {
        grp.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (obj.material.map) obj.material.map.dispose();
          }
        });
        this._scene.remove(grp);
      }
    }
    this._layerGroups = {};
    this._loaded = false;
  }

  dispose() {
    this._renderer.setAnimationLoop(null);
    this._clearFloor();
    _geoCache.forEach(g => g.dispose());
    _matCache.forEach(m => m.dispose());
    _geoCache.clear();
    _matCache.clear();
    this._renderer.dispose();
    this._container.removeChild(this._renderer.domElement);
  }
}
