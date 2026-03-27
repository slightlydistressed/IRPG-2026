const CACHE_NAME = "irpg-2026-v2";
const APP_BASE = "/IRPG-2026";

const PRECACHE_URLS = [
  `${APP_BASE}/`,
  `${APP_BASE}/index.html`,
  `${APP_BASE}/manual.html`,
  `${APP_BASE}/checklists.html`,
  `${APP_BASE}/saved.html`,
  `${APP_BASE}/settings.html`,
  `${APP_BASE}/checklist/index.html`,
  `${APP_BASE}/manifest.webmanifest`,
  `${APP_BASE}/data/toc/irpg-toc.json`,
  `${APP_BASE}/data/checklists/index.json`,
  `${APP_BASE}/data/checklists/size-up-report.json`,
  `${APP_BASE}/data/checklists/risk-management-process.json`,
  `${APP_BASE}/data/checklists/lces.json`,
  `${APP_BASE}/data/checklists/downhill-fireline-checklist.json`,
  `${APP_BASE}/data/checklists/weather.json`,
  `${APP_BASE}/data/checklists/medical-8line.json`,
  `${APP_BASE}/data/documents/manifest.json`,
  `${APP_BASE}/data/ui/navigation.json`,
  `${APP_BASE}/data/ui/home-cards.json`,
  `${APP_BASE}/data/ui/labels.json`,
  `${APP_BASE}/pdf/pms461.pdf`,
  `${APP_BASE}/vendor/pdfjs/pdf.mjs`,
  `${APP_BASE}/vendor/pdfjs/pdf.worker.mjs`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        return response;
      }).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match(`${APP_BASE}/index.html`);
        }
        throw new Error("Network unavailable and asset not cached.");
      });
    })
  );
});