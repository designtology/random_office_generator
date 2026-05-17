# Procedural Office Floor Generator

A procedural office building generator and interactive 3D viewer. Generate office floor plans via the browser or the command line, explore them in Three.js, and save them as JSON.

---

## What it does

The generator creates randomised multi-room office floor plans using Binary Space Partitioning. Each floor has a reception area, a corridor spine with horizontal branches, and a set of named rooms carved around the corridor. Rooms are populated with furniture and props according to the chosen building style. Every result is deterministic — the same seed always produces the same floor.

The viewer renders the result as coloured placeholder boxes in a navigable 3D scene. Walls, windows, and doors are snapped to cell edges. Room labels float above the floor. Hover over any asset to see its name.

---

## Quick start

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

---

## Viewer

### Opening a floor

- Click **Open JSON** to load any `.json` floor file from your system.
- Drag and drop a `.json` file onto the viewer.
- Use the dropdown to load any floor previously saved to `public/data/`.

### Randomize

Generates a complete floor directly in the browser — no command line needed. Picks a random name, a random style, and a random seed, runs the full generation pipeline, and displays the result immediately.

### Save

Writes the current floor to `public/data/` via the Vite dev server and registers it in `public/data/index.json` so it appears in the dropdown on next load. Falls back to a browser download if the dev server is not running.

### Layer toggles

| Toggle | What it shows |
|--------|--------------|
| Floor | Floor tile geometry |
| Walls | Exterior walls, partitions, windows, doors |
| Interior | Furniture, equipment, props |
| Labels | Room name labels |

### Navigation

| Action | Control |
|--------|---------|
| Orbit | Left mouse drag |
| Pan | Right mouse drag |
| Zoom | Scroll wheel |

### Hover tooltip

Move the mouse over any wall or interior asset to see its asset name.

---

## Command line generator

Pre-generate floors and drop them into `public/data/` so they appear in the viewer dropdown on startup.

### generate-building.mjs

```
node scripts/generate-building.mjs <name> [fresh] [style] [cols rows] [seed]
```

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `name` | Yes | | Output filename. Letters and digits only, must start with a letter. Floor 1 writes `name.json`; re-running the same name writes `name2.json`, `name3.json`, and so on. |
| `fresh` | No | `false` | `true` gives each additional floor a new random corridor layout. `false` keeps the same spine across all floors. |
| `style` | No | `corporate` | Interior style. Position-independent. Values: `corporate` `tech` `insurance` `legal` `creative` |
| `cols rows` | No | random | Grid size. `cols` clamped to 10-20, `rows` clamped to 18-30. Floor 1 only — ignored on subsequent floors. |
| `seed` | No | random | Integer RNG seed. Same seed and arguments always produce the same floor. |

**Examples**

```bash
# Random floor, corporate style
node scripts/generate-building.mjs HQ

# Fixed size, specific seed, tech style
node scripts/generate-building.mjs HQ 15 24 42 tech

# Add a second floor (inherits size and layout from floor 1)
node scripts/generate-building.mjs HQ

# Add a third floor with a fresh corridor
node scripts/generate-building.mjs HQ true

# Stack three floors in one go
node scripts/generate-building.mjs Tower 18 26 1 legal
node scripts/generate-building.mjs Tower
node scripts/generate-building.mjs Tower
```

### generate-interior.mjs

Populates the furniture of an existing floor without changing its layout. Called automatically by `generate-building.mjs` — run it manually only to re-roll the interior with a different style or seed.

```
node scripts/generate-interior.mjs <name> [floor] [style] [seed]
```

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `name` | Yes | | Must match an existing file in `public/data/`. |
| `floor` | No | `1` | Floor number to repopulate. |
| `style` | No | `corporate` | Interior style. Position-independent. |
| `seed` | No | random | Integer RNG seed. |

```bash
# Re-roll the interior with a different style
node scripts/generate-interior.mjs HQ 1 creative

# Re-roll floor 2 with a fixed seed
node scripts/generate-interior.mjs HQ 2 tech 77
```

---

## Building styles

| Style | Character |
|-------|-----------|
| `corporate` | Formal enterprise: strong branding, structured waiting areas, digital signage |
| `tech` | Open-plan and equipment-heavy: server racks, multiple monitors, standing desks |
| `insurance` | Conservative and document-heavy: filing cabinets, formal meeting rooms |
| `legal` | Prestige materials: bookcases, credenzas, formal seating, trophy displays |
| `creative` | Informal and eclectic: lounge seating, collaboration areas, art on walls |

---

## Generation pipeline

Each floor is built by the following steps in order. All steps are deterministic given the same seed.

1. **Dimensions** — grid size in columns and rows
2. **Window positions** — fixed per building, reused on all floors
3. **Entrance** — glass door on the north wall near centre, not on a window column
4. **Corridor plan** — reception band, vertical spine, horizontal branches
5. **BSP partition** — Binary Space Partitioning splits each wing into named rooms
6. **Door generation** — one door per adjacent room pair; double door at reception
7. **Wall map** — exterior walls, interior partitions, corners, windows, doors
8. **Floor map** — tile type per room (carpet, concrete, hardwood)
9. **Interior** — asset slots rolled per room type and style

---

## JSON format

```json
{
  "buildingName": "HQ",
  "floor": 1,
  "style": "corporate",
  "COLS": 15,
  "ROWS": 24,
  "CELL_SIZE": 2,
  "SEED": 42,
  "WINDOW_POSITIONS": { "north": [], "south": [], "westEast": [] },
  "ENTRANCE_COL": 7,
  "CORRIDOR_PLAN": { "spineL": 7, "spineR": 8, "recBottom": 2, "recL": 0, "recR": 14, "branchSets": [] },
  "roomLayout":   [["reception", "corridor", ...], ...],
  "floorMap":     [[["floor_tile_concrete", 0, [0, 2, 0]], ...], ...],
  "wallMap":      [[["wall_straight_standard", 0], null, ...], ...],
  "interiorMap":  [[["desk_executive_large_wood", 0], null, ...], ...]
}
```

**Cell format** (same across all three map layers):

| Value | Meaning |
|-------|---------|
| `null` | Empty cell |
| `["assetName", rotY]` | Single asset at cell centre |
| `["assetName", rotY, [ox, oy, oz]]` | Single asset with world-unit offset |
| `[["name1", rotY1], ["name2", rotY2]]` | Multiple assets in one cell |

`rotY` convention: `0` = north (−Z), `90` = west (−X), `180` = south (+Z), `270` = east (+X).

---

## Requirements

- Node.js 18 or later
- npm
