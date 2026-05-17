import { defineConfig }                      from 'vite';
import { writeFileSync, readFileSync,
         mkdirSync }                          from 'fs';
import { resolve, dirname }                   from 'path';
import { fileURLToPath }                      from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Vite plugin: POST /api/save-floor ─────────────────────────────────────────
// Writes the posted floor JSON to public/data/ and updates index.json.
// Dev-server only — in production builds the endpoint doesn't exist;
// the Save button falls back to a browser download.
function saveFloorPlugin() {
  return {
    name: 'save-floor',
    configureServer(server) {
      server.middlewares.use('/api/save-floor', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', chunk => (body += chunk.toString()));
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const dataDir = resolve(__dirname, 'public', 'data');
            mkdirSync(dataDir, { recursive: true });

            const buildingName = (data.buildingName || 'floor').replace(/[^a-zA-Z0-9]/g, '_');
            const floor        = data.floor || 1;
            const filename     = floor === 1
              ? `${buildingName}.json`
              : `${buildingName}${floor}.json`;
            const filePath = resolve(dataDir, filename);

            writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

            // Update index.json
            const indexPath = resolve(dataDir, 'index.json');
            let index = [];
            try { index = JSON.parse(readFileSync(indexPath, 'utf8')); } catch {}
            const label = `${buildingName} floor ${floor}`;
            if (!index.some(e => e.file === filename)) {
              index.push({ name: label, file: filename });
              writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, filename, label }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  root:      '.',
  publicDir: 'public',
  plugins:   [saveFloorPlugin()],
  build: {
    outDir:     'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});
