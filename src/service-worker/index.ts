import { ServiceWorkerActionTypes } from './constants';

const revision = process.env.REVISION;
const staticCacheName = `sbanken-ynab-${revision}`;
const cacheRegExp = /.(css|js|woff2?)$/i;

const serviceWorker: ServiceWorkerGlobalScope = self as any;

serviceWorker.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then(async (cache) => {
      const assets = ['/'];
      try {
        const manifest = await (await fetch('manifest.json')).json();
        Array.prototype.push.apply(
          assets,
          Object.values<string>(manifest).filter((v) => cacheRegExp.test(v))
        );
      } finally {
        await cache.addAll(assets);
      }
    })
  );
});

serviceWorker.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) => cacheName.startsWith('sbanken-ynab-') && cacheName !== staticCacheName
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      )
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response ?? fetch(event.request))
  );
});

serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === ServiceWorkerActionTypes.ApplyUpdate) {
    void serviceWorker.skipWaiting();
  }
});
