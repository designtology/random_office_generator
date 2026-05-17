# Procedural Office Floor Generator

A procedural office building generator with two runtime targets: a Three.js web viewer for rapid prototyping and visualization, and a Unity 6 game built on the same generation pipeline.

---

## Repository Structure

```
unity_ai_test/
├── threejs/               Three.js web viewer + JSON generator scripts
│   ├── src/               Vite browser application source
│   ├── scripts/           Node.js CLI generator scripts (JSON output)
│   │   └── data/          Room profiles and building style definitions
│   └── public/data/       Generated JSON floor files served by Vite
├── scripts/               Original Node.js generator scripts (JS module output)
│   └── data/              Same room profiles and building style definitions
├── ai_test/               Unity 6 project (URP, C#)
│   └── Assets/Scripts/    Generation pipeline, rendering, UI, gameplay
└── assets/                Reference data (asset dimensions, placement rules)
```

---

## Three.js Web Viewer

An interactive browser-based viewer for generated office floors. Load JSON floor files, explore the layout in 3D, generate new floors on the fly, and save them to disk.

### Prerequisites

- Node.js 18 or later
- npm

### Installation

```bash
cd threejs
npm install
```

### Running the Dev Server

```bash
npm run dev
```

Opens at `http://localhost:5173`. The dev server also provides the `/api/save-floor` endpoint used by the Save button.

### Building for Static Hosting

```bash
npm run build
```

Output goes to `threejs/dist/`. Note: the Save button falls back to a browser download in static mode since the save endpoint requires the dev server.

---

### Viewer Interface

**Opening floors**

- Click **Open JSON** to pick any `.json` floor file from your system.
- Drag and drop a `.json` file directly onto the viewer.
- Use the **pre-generated dropdown** to load any floor previously saved to `public/data/`.

**Randomize button**

Generates a complete floor directly in the browser — no server or CLI required. Picks a random building name, a random style, and a random seed, runs the full BSP pipeline, and loads the result immediately. The floor is held in memory; use **Save** to write it to disk.

**Save button**

Posts the current floor JSON to `/api/save-floor` on the Vite dev server, which writes the file to `threejs/public/data/` and registers it in `index.json` so it appears in the dropdown on next load. In static/built mode, falls back to a browser download instead.

**Layer toggles**

Four toggles in the top bar show or hide individual layers:

| Toggle | What it controls |
|--------|-----------------|
| Floor | Floor tile geometry |
| Walls | Exterior walls, interior partitions, windows, doors |
| Interior | Furniture, equipment, props |
| Labels | Room name labels floating above the floor |

**Hover tooltip**

Hover over any wall or interior asset to see its asset name.

**Navigation**

| Action | Control |
|--------|---------|
| Orbit | Left mouse drag |
| Pan | Right mouse drag |
| Zoom | Scroll wheel |

---

## Generator Scripts

Two sets of scripts exist. Both implement the same pipeline; they differ only in output format and destination.

| Location | Output format | Output path |
|----------|--------------|-------------|
| `threejs/scripts/` | `.json` | `threejs/public/data/` |
| `scripts/` | `.js` ES modules | `webapp/src/data/` |

The `threejs/scripts/` versions are documented below and are the ones you want for use with the viewer.

---

### generate-building.mjs

Generates the structural layout of one floor: corridor plan, BSP room partition, door placement, wall map, floor tile map, and interior assets. Writes a single JSON file and updates `public/data/index.json`.

```
node scripts/generate-building.mjs <name> [fresh] [style] [cols rows] [seed]
```

**Parameters**

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `name` | Yes | | Output filename. Letters and digits only, must start with a letter. Floor 1 writes `name.json`; subsequent runs on the same name write `name2.json`, `name3.json`, and so on automatically. |
| `fresh` | No | `false` | Pass `true` to give each additional floor a new random corridor and spine layout. Pass `false` (or omit) to keep the same spine position across all floors for a structurally consistent stacked building. |
| `style` | No | `corporate` | Interior decoration style. Position-independent: can appear anywhere in the argument list. Valid values: `corporate`, `tech`, `insurance`, `legal`, `creative`. |
| `cols rows` | No | random | Grid dimensions as two integers. `cols` is clamped to 10-20; `rows` is clamped to 18-30. Applies to floor 1 only. For floor 2 and above, dimensions are read from the existing floor 1 JSON and these arguments are ignored. |
| `seed` | No | random | Integer RNG seed. Providing the same seed with the same arguments produces an identical floor every time. |

**Examples**

```bash
# New building, random size, random seed, corporate style (default)
node scripts/generate-building.mjs HQ

# Fixed size, specific seed, tech style
node scripts/generate-building.mjs HQ 15 24 42 tech

# Add a second floor (inherits size and spine from floor 1)
node scripts/generate-building.mjs HQ

# Add a third floor with a fresh corridor plan
node scripts/generate-building.mjs HQ true

# Deterministic 20x30 legal office
node scripts/generate-building.mjs LegalTower 20 30 999 legal
```

**Floor stacking**

Re-running the script with the same name auto-increments the floor number. Floor 2+ inherits the building dimensions, window positions, entrance column, and (unless `fresh` is set) the corridor spine from floor 1.

```bash
node scripts/generate-building.mjs Tower 18 26 1 corporate   # Tower.json
node scripts/generate-building.mjs Tower                     # Tower2.json
node scripts/generate-building.mjs Tower                     # Tower3.json
```

---

### generate-interior.mjs

Populates the `interiorMap` of an existing floor file with furniture and props. Reads the floor JSON, rolls asset slots for every room that has a profile defined, and writes the result back to the same file.

This script is called automatically by `generate-building.mjs` after each floor is written. Run it manually only when you want to re-roll just the interior of an existing floor without changing the layout.

```
node scripts/generate-interior.mjs <name> [floor] [style] [seed]
```

**Parameters**

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `name` | Yes | | Building name. Must match an existing JSON file in `public/data/`. |
| `floor` | No | `1` | Floor number to populate. |
| `style` | No | `corporate` | Interior style. Position-independent. Same values as above. |
| `seed` | No | random | Integer RNG seed. |

**Examples**

```bash
# Re-roll interior of floor 1 with a different style
node scripts/generate-interior.mjs HQ 1 creative

# Re-roll floor 2 with a specific seed
node scripts/generate-interior.mjs HQ 2 tech 77
```

---

## Building Styles

Each style biases asset selection and slot probabilities within every room type. The underlying room layout and wall structure are identical regardless of style.

| Style | Character |
|-------|-----------|
| `corporate` | Formal enterprise: strong branding, structured waiting areas, digital signage |
| `tech` | Open-plan and equipment-heavy: server racks, multiple monitors, standing desks |
| `insurance` | Conservative and document-heavy: filing cabinets, formal meeting rooms |
| `legal` | Prestige materials: bookcases, credenzas, formal seating, trophy displays |
| `creative` | Informal and eclectic: lounge seating, collaboration areas, art on walls |

---

## Generation Pipeline

Each floor is generated by the following steps in sequence. All steps are deterministic given the same seed.

1. **Dimensions** — grid size in columns and rows
2. **Window positions** — fixed per building, reused on all floors
3. **Entrance** — glass door on the north exterior wall, near centre, not on a window column
4. **Corridor plan** — reception band at north end, vertical spine, horizontal branches
5. **BSP room partition** — Binary Space Partitioning splits each wing zone into named rooms
6. **Door generation** — one door per adjacent room pair; double door at reception to corridor
7. **Wall map** — exterior boundary walls, interior partitions, corners, windows, doors
8. **Floor map** — tile type assigned per room (carpet, concrete, hardwood)
9. **Interior** — asset slots rolled per room type and style, placed in available interior cells

---

## JSON Floor File Format

```json
{
  "buildingName": "HQ",
  "floor": 1,
  "style": "corporate",
  "COLS": 15,
  "ROWS": 24,
  "CELL_SIZE": 2,
  "SEED": 42,
  "generated": "2025-05-17T10:00:00.000Z",
  "WINDOW_POSITIONS": { "north": [], "south": [], "westEast": [] },
  "ENTRANCE_COL": 7,
  "CORRIDOR_PLAN": { "spineL": 7, "spineR": 8, "recBottom": 2, "recL": 0, "recR": 14, "branchSets": [] },
  "roomLayout": [["reception", "reception", ...], ...],
  "floorMap":   [[["floor_tile_concrete", 0, [0, 2, 0]], ...], ...],
  "wallMap":    [[["wall_straight_standard", 0], null, ...], ...],
  "interiorMap":[[["desk_executive_large_wood", 0], null, ...], ...]
}
```

**Cell format** (same across all three map layers):

| Value | Meaning |
|-------|---------|
| `null` | Empty cell |
| `["assetName", rotY]` | Single asset at cell centre |
| `["assetName", rotY, [ox, oy, oz]]` | Single asset with fine-tune offset in world units |
| `[["name1", rotY1], ["name2", rotY2]]` | Multi-asset cell (first element is itself an array) |

`rotY` uses the webapp convention: `0` = north (−Z), `90` = west (−X), `180` = south (+Z), `270` = east (+X).

---

## Unity Project

Located in `ai_test/`. Built with Unity 6 (URP 17.4.0). The C# generation pipeline is a direct port of the JavaScript generator and produces identical layouts from the same seed.

The Unity project includes a full gameplay loop on top of the procedural generation: task-based objectives, an economy system with purchasable perks, and a level and step progression UI. See `logik.md` for the full feature list and architecture notes.

**To open:** add `ai_test/` as an existing project in Unity Hub.

---

## Requirements

| Component | Requirement |
|-----------|-------------|
| Three.js viewer | Node.js 18+, npm |
| Generator scripts | Node.js 18+ |
| Unity project | Unity 6000.4.0f1, URP 17.4.0 |
