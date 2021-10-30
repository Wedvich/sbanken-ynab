import { ServiceWorkerActionTypes } from './constants';

const revision = process.env.REVISION;
const staticCacheName = `sbanken-ynab-${revision}`;
const cacheRegExp = /.(css|js|woff2?)$/i;

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then(async (cache) => {
      const assets = ['/'];
      try {
        const manifest: any = await (await fetch('manifest.json')).json();
        Array.prototype.push.apply(
          assets,
          Object.values<string>(manifest as { [s: string]: string } | ArrayLike<string>).filter(
            (v) => cacheRegExp.test(v)
          )
        );
      } finally {
        await cache.addAll(assets);
      }
    })
  );
});

self.addEventListener('activate', (event) => {
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
  if (event.request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(caches.match('/'));
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => response ?? fetch(event.request))
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data.type === ServiceWorkerActionTypes.ApplyUpdate) {
    void self.skipWaiting();
  }
});
