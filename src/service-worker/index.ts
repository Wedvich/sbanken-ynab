import { ServiceWorkerActionTypes } from './constants';
import type { Manifest } from 'vite';

const staticCacheName = `sbanken-ynab-${VITE_REVISION}`;
const cacheRegExp = /.(css|js|woff2?)$/i;
const unversionedAssets = ['/', '/index.html', '/robots.txt', '/app.json'];

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then(async (cache) => {
      const assets = ['/'];
      try {
        const manifest: Manifest = await (await fetch('manifest.json', { cache: 'reload' })).json();
        Array.prototype.push.apply(
          assets,
          Object.values(manifest)
            .filter((v) => cacheRegExp.test(v.file))
            .map((v) => `/${v.file}`)
        );
      } finally {
        await cache.addAll(
          assets.map((asset) =>
            unversionedAssets.includes(asset)
              ? new Request(asset, {
                  cache: 'reload',
                })
              : asset
          )
        );
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
    event.respondWith(caches.match('/') as Promise<Response>);
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
