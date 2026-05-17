/**
 * main.js — Entry point for the Office Floor Viewer
 */

import { FloorViewer }                        from './viewer.js';
import { generateFloor, randomBuildingName, STYLES } from './generator.js';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const container    = document.getElementById('canvas-container');
const fileBtn      = document.getElementById('file-btn');
const fileInput    = document.getElementById('file-input');
const jsonSelect   = document.getElementById('json-select');
const infoLabel    = document.getElementById('info-label');
const dropOverlay  = document.getElementById('drop-overlay');
const welcome      = document.getElementById('welcome');
const statCols     = document.getElementById('stat-cols');
const statRows     = document.getElementById('stat-rows');
const statRooms    = document.getElementById('stat-rooms');
const statSeed     = document.getElementById('stat-seed');
const statStyle    = document.getElementById('stat-style');
const randomizeBtn = document.getElementById('randomize-btn');
const saveBtn      = document.getElementById('save-btn');
const tooltip      = document.getElementById('asset-tooltip');

// ── Init viewer ───────────────────────────────────────────────────────────────
const viewer = new FloorViewer(container);

// Current floor data (for saving)
let _currentFloorData = null;

// ── File open button ──────────────────────────────────────────────────────────
fileBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) loadFile(file);
  fileInput.value = '';
});

// ── Drag & drop ───────────────────────────────────────────────────────────────
let _dragCount = 0;

document.addEventListener('dragenter', (e) => {
  e.preventDefault();
  _dragCount++;
  dropOverlay.classList.add('visible');
});
document.addEventListener('dragleave', (e) => {
  e.preventDefault();
  if (--_dragCount <= 0) { _dragCount = 0; dropOverlay.classList.remove('visible'); }
});
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => {
  e.preventDefault();
  _dragCount = 0;
  dropOverlay.classList.remove('visible');
  const file = e.dataTransfer.files[0];
  if (file?.name.endsWith('.json')) loadFile(file);
  else showError('Please drop a .json floor file.');
});

// ── Pre-generated file dropdown ───────────────────────────────────────────────
async function refreshDropdown() {
  try {
    const res = await fetch('/data/index.json');
    if (!res.ok) return;
    const list = await res.json();
    if (!Array.isArray(list) || !list.length) return;

    // Keep only placeholder option, rebuild the rest
    while (jsonSelect.options.length > 1) jsonSelect.remove(1);

    for (const entry of list) {
      const opt = document.createElement('option');
      if (typeof entry === 'string') {
        opt.value = `/data/${entry}`;
        opt.textContent = entry.replace('.json', '');
      } else {
        opt.value = `/data/${entry.file}`;
        opt.textContent = entry.name ?? entry.file.replace('.json', '');
      }
      jsonSelect.appendChild(opt);
    }
  } catch { /* No index.json — silent */ }
}
refreshDropdown();

jsonSelect.addEventListener('change', async () => {
  const url = jsonSelect.value;
  if (!url) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    loadFloor(data, url.split('/').pop());
  } catch (e) {
    showError(`Failed to load: ${e.message}`);
  }
});

// ── Layer toggles ─────────────────────────────────────────────────────────────
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    viewer.setLayerVisible(btn.dataset.layer, btn.classList.contains('active'));
  });
});

// ── Randomize ─────────────────────────────────────────────────────────────────
randomizeBtn.addEventListener('click', () => {
  if (randomizeBtn.classList.contains('busy')) return;
  randomizeBtn.classList.add('busy');
  randomizeBtn.textContent = '⏳ Generating…';

  // Defer to next frame so the UI update paints before the heavy JS runs
  requestAnimationFrame(() => {
    try {
      const name  = randomBuildingName();
      const style = STYLES[Math.floor(Math.random() * STYLES.length)];
      const data  = generateFloor({ name, style });
      loadFloor(data, `${name}.json (unsaved)`);
    } catch (e) {
      showError(`Generation failed: ${e.message}`);
    } finally {
      randomizeBtn.classList.remove('busy');
      randomizeBtn.innerHTML = '&#x2728; Randomize';
    }
  });
});

// ── Save ──────────────────────────────────────────────────────────────────────
saveBtn.addEventListener('click', async () => {
  if (!_currentFloorData) return;
  saveBtn.disabled = true;
  saveBtn.textContent = '💾 Saving…';

  try {
    const res = await fetch('/api/save-floor', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(_currentFloorData),
    });

    if (res.ok) {
      const { filename, label } = await res.json();
      showSuccess(`Saved → public/data/${filename}`);
      // Add to dropdown if not already there
      const val = `/data/${filename}`;
      if (![...jsonSelect.options].some(o => o.value === val)) {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = label ?? filename.replace('.json', '');
        jsonSelect.appendChild(opt);
      }
    } else {
      // Dev server not running or build mode — fall back to browser download
      downloadJson(_currentFloorData);
    }
  } catch {
    // Network error (e.g. built/static mode) — download instead
    downloadJson(_currentFloorData);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '&#x1F4BE; Save';
  }
});

function downloadJson(data) {
  const name     = data.buildingName ?? 'floor';
  const floor    = data.floor ?? 1;
  const filename = floor === 1 ? `${name}.json` : `${name}${floor}.json`;
  const blob     = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement('a');
  a.href         = url;
  a.download     = filename;
  a.click();
  URL.revokeObjectURL(url);
  showSuccess(`Downloaded ${filename}`);
}

// ── Hover tooltip ─────────────────────────────────────────────────────────────
viewer.onHover = (name, x, y) => {
  if (!name) {
    tooltip.style.display = 'none';
    return;
  }
  tooltip.textContent    = name;
  tooltip.style.display  = 'block';
  // Keep tooltip inside viewport
  const tw = tooltip.offsetWidth;
  const th = tooltip.offsetHeight;
  tooltip.style.left = `${Math.min(x + 14, window.innerWidth  - tw - 8)}px`;
  tooltip.style.top  = `${Math.min(y + 14, window.innerHeight - th - 8)}px`;
};

// ── Load a File object (local) ────────────────────────────────────────────────
function loadFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      loadFloor(data, file.name);
    } catch (err) {
      showError(`Invalid JSON: ${err.message}`);
    }
  };
  reader.readAsText(file);
}

// ── Load a floor data object ──────────────────────────────────────────────────
function loadFloor(data, label = 'floor') {
  if (!data.COLS || !data.ROWS) {
    showError('Invalid floor file — missing COLS or ROWS.');
    return;
  }

  _currentFloorData = data;
  const stats = viewer.load(data);

  welcome.classList.add('hidden');
  saveBtn.disabled     = false;
  infoLabel.style.color = '';
  infoLabel.textContent = `${label}  —  ${data.COLS}×${data.ROWS}  seed:${data.SEED ?? '?'}`;

  statCols.textContent  = data.COLS;
  statRows.textContent  = data.ROWS;
  statRooms.textContent = stats.rooms;
  statSeed.textContent  = data.SEED ?? '?';
  statStyle.textContent = data.style ?? 'unknown';
}

// ── Feedback helpers ──────────────────────────────────────────────────────────
function showError(msg) {
  infoLabel.style.color = '#e05050';
  infoLabel.textContent = `⚠ ${msg}`;
  setTimeout(() => { infoLabel.style.color = ''; }, 4000);
}

function showSuccess(msg) {
  infoLabel.style.color = '#50d080';
  infoLabel.textContent = `✓ ${msg}`;
  setTimeout(() => { infoLabel.style.color = ''; }, 3000);
}
