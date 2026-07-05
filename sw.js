// =============================================================================
// Sintro Sticheditor service worker.
//
// Cache-first with stale-while-revalidate: every GET is served from cache
// immediately, while a background fetch refreshes the entry for next time.
// A cache miss falls through to the network.
//
// CACHE_NAME is stamped at delivery time, never hand-edited:
//   * GitHub Actions deploy stamps the release tag (see .github/workflows/deploy.yml).
//   * `npm run prod` stamps a startup timestamp for a local production dry-run.
//   * `npm run dev` leaves the placeholder untouched — that literal value is
//     the "development" signal, switching the fetch handler to network-first
//     so reloads pick up edits immediately.
// =============================================================================

const CACHE_NAME = '__CACHE_VERSION__';
const IS_DEV = CACHE_NAME === '__CACHE_VERSION__';
const ASSETS = [
    './',
    'index.html',
    'sticheditor.js',
    'manifest.webmanifest',
    'icon.svg',
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
        )
    );
});

const fetchAndCache = (request, cache) => fetch(request).then((response) => {
    if (response && response.ok && new URL(request.url).origin === self.location.origin) {
        cache.put(request, response.clone()).catch(() => {});
    }
    return response;
}).catch(() => null);

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        if (IS_DEV) {
            const fresh = await fetchAndCache(event.request, cache);
            if (fresh) return fresh;
            return (await cache.match(event.request)) || new Response('', { status: 504, statusText: 'offline-no-cache' });
        }
        const cached = await cache.match(event.request);
        const networkFetch = fetchAndCache(event.request, cache);
        if (cached) {
            event.waitUntil(networkFetch);
            return cached;
        }
        return (await networkFetch) || new Response('', { status: 504, statusText: 'offline-no-cache' });
    })());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
