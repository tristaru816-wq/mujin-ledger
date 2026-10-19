/* Mujin Ledger - app-shell only. No finance or Firebase data is cached here. */
const CACHE_NAME = 'mujin-shell-v2-1-accounts-20261019';
const SHELL = ['./', './index.html', './pwa.css', './install-guide.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()).catch(() => {}));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('mujin-shell-') && k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy))); }
      return response;
    }).catch(() => caches.match('./index.html')));
  } else if (SHELL.some(path => new URL(path,self.registration.scope).pathname === url.pathname)) {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request,copy))); }
      return response;
    }).catch(() => caches.match(request)));
  }
});
