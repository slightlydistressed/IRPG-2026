// IRPG Offline Service Worker
// - Uses relative URLs so the app can be hosted at / or in a subfolder (e.g., https://intranet/irpg/)
// - Precaches the "shell" and tries to precache large extras (PDF + PDF.js) without failing install.

const CACHE = "irpg-v4";

// Small, critical files that should always be available offline.
const SHELL = [
  "./",
  "./index.html",
  "./styles/app.css",
  "./js/app.js",
  "./js/utils.js",
  "./js/db.js",
  "./js/router.js",
  "./js/pdf-viewer.js",
  "./js/toc-ui.js",
  "./js/checklist-ui.js",
  "./manifest.webmanifest",
  "./data/documents.json",
  "./data/toc.json",
  "./data/docs/irpg/manifest.json",
  "./data/docs/irpg/checklists/index.json",
  "./data/docs/irpg/checklists/sizeup-report.json",
  "./data/docs/irpg/checklists/weather.json",
  "./data/docs/irpg/checklists/medical-8line.json"
];

// Larger assets. We *try* to cache these during install, but don't block the app if caching fails.
// They will still be cached on first successful fetch.
const EXTRAS = [
  "./pdf/pms461.pdf",
  "./vendor/pdf.mjs",
  "./vendor/pdf.worker.mjs",
  "./icons/Fire_192.png",
  "./icons/Fire_512.png"
];

function toScopedUrl(path) {
  return new URL(path, self.registration.scope).toString();
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);

    // Always cache shell.
    await cache.addAll(SHELL.map(toScopedUrl));

    // Best-effort cache extras.
    await Promise.allSettled(EXTRAS.map((p) => cache.add(toScopedUrl(p))));

    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);

    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const res = await fetch(req);
      // Cache same-origin GETs.
      if (res.ok && new URL(req.url).origin === self.location.origin) {
        cache.put(req, res.clone());
      }
      return res;
    } catch {
      // Offline fallback.
      return cached || new Response("Offline.", { status: 503, headers: { "Content-Type": "text/plain" } });
    }
  })());
});
