export const cacheName = 'sbanken-ynab';
export const cacheRegex = /^\/(?!sw\.js$)[^/]*\.(js|css)$/i;

export enum ServiceWorkerMessageType {
  CheckForUpdates = 'service-worker/check-for-updates',
  HasUpdates = 'service-worker/has-updates',
}
