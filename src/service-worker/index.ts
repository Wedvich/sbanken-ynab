import { cacheName, cacheRegex, ServiceWorkerMessageType } from './constants';

const serviceWorker: ServiceWorkerGlobalScope = self as any;

let updated = false;

serviceWorker.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(serviceWorker.skipWaiting());
  updated = true;
});

serviceWorker.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(serviceWorker.clients.claim());
});

serviceWorker.addEventListener('message', (event: MessageEvent) => {
  switch (event.data?.type as ServiceWorkerMessageType) {
    case ServiceWorkerMessageType.CheckForUpdates: {
      event.ports[0].postMessage({ type: ServiceWorkerMessageType.HasUpdates, updated });
      break;
    }
  }
});

serviceWorker.addEventListener('fetch', (event: FetchEvent) => {
  let { request } = event;
  const requestUrl = new URL(request.url);

  // Don't cache external requests.
  if (requestUrl.origin !== serviceWorker.origin) {
    event.respondWith(fetch(request));
    return;
  }

  // Rewrite SPA requests to the root URL.
  if (!cacheRegex.test(requestUrl.pathname)) {
    requestUrl.pathname = '/';
    request = new Request(requestUrl.href, { ...request });
  }

  event.respondWith(
    caches.open(cacheName).then((cache) => cache.match(request).then((cacheResponse) => {
      if (requestUrl.pathname === '/') {
        const networkResponse = fetch(request).then((networkResponse) => {
          void cache.put(request, networkResponse.clone());
          return networkResponse;
        });
        return cacheResponse || networkResponse;
      }

      if (cacheResponse) {
        return cacheResponse;
      }

      return fetch(request).then((networkResponse) => {
        void cache.put(request, networkResponse.clone());
        return networkResponse;
      });
    }))
  );
});
