// =============================================================================
// Tiny static file server — Node builtins only, runs fully offline.
//
//   `npm run dev`  — serves files raw. sw.js keeps the `__CACHE_VERSION__`
//                    placeholder → service worker is network-first, so code
//                    edits show up on reload.
//   `npm run prod` — sets STAMP_CACHE=1; the server substitutes the placeholder
//                    in sw.js with a per-process timestamp, so the SW behaves
//                    like a deployed release. Restart to "ship" a new version.
//
// PORT env var overrides the default 8000.
// =============================================================================

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url)).replace(/[\\/]+$/, '');
const PORT = Number(process.env.PORT) || 8000;
const STAMP_CACHE = process.env.STAMP_CACHE === '1';
const CACHE_STAMP = `prod-${new Date().toISOString().replace(/[:.]/g, '-')}`;

const MIME = {
    '.html':        'text/html; charset=utf-8',
    '.js':          'application/javascript; charset=utf-8',
    '.css':         'text/css; charset=utf-8',
    '.json':        'application/json; charset=utf-8',
    '.dat':         'application/octet-stream',
    '.svg':         'image/svg+xml',
    '.png':         'image/png',
    '.ico':         'image/x-icon',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
};

createServer(async (req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const requested = urlPath.replace(/^\/+/, '') || 'index.html';
    const filePath = normalize(join(ROOT, requested));

    if (!filePath.startsWith(ROOT + sep)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }
    try {
        const raw = await readFile(filePath);
        const body = (STAMP_CACHE && requested === 'sw.js')
            ? Buffer.from(raw.toString('utf8').replace('__CACHE_VERSION__', CACHE_STAMP))
            : raw;
        res.writeHead(200, {
            'Content-Type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream',
            'Cache-Control': 'no-store',
        });
        res.end(body);
    } catch (_) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}).listen(PORT, () => {
    const mode = STAMP_CACHE ? `prod (cache stamp: ${CACHE_STAMP})` : 'dev';
    console.log(`Sintro Sticheditor ${mode} server: http://localhost:${PORT}`);
});
