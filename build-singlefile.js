// =============================================================================
// build-singlefile.js — produce a self-contained sintro-sticheditor.html
//
// Inlines sticheditor.js into index.html so the result runs from a plain
// file:// double-click (no server, no ES-module fetch). The Node CLI tail of
// sticheditor.js and the PWA-only markup (manifest link + service-worker
// registration) are stripped — they are meaningless in a single file.
//
// Usage:  node build-singlefile.js [output.html]
// =============================================================================
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || join(HERE, 'sintro-sticheditor.html');

// 1. Library, minus the trailing Node-only CLI block (marked by this section
//    comment in sticheditor.js — keep the two in sync).
let lib = readFileSync(join(HERE, 'sticheditor.js'), 'utf8');
const CLI_MARKER = '\n// ── Node CLI';
const cliAt = lib.indexOf(CLI_MARKER);
if (cliAt === -1) throw new Error('Node CLI marker not found in sticheditor.js');
lib = lib.slice(0, cliAt).trimEnd() + '\n';

// 2. Page, minus PWA-only markup (between the PWA markers).
let html = readFileSync(join(HERE, 'index.html'), 'utf8');
html = html.replace(/[ \t]*<!-- PWA:START -->[\s\S]*?<!-- PWA:END -->\n?/g, '');

// 3. Replace the module import with the inlined library.
const IMPORT = /^[ \t]*import \{[^}]*\} from '\.\/sticheditor\.js';[ \t]*$/m;
if (!IMPORT.test(html)) throw new Error('import of ./sticheditor.js not found in index.html');
html = html.replace(IMPORT, lib);

if (html.includes("from './sticheditor.js'")) throw new Error('a sticheditor.js import survived inlining');

writeFileSync(OUT, html);
console.log(`Wrote ${OUT} (${(html.length / 1024).toFixed(1)} KiB, self-contained)`);
