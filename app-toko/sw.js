// ============================================================
//  sw.js — Service Worker (PWA)
//  Strategi: Network-First → selalu coba ambil versi terbaru,
//            fallback ke cache jika offline.
// ============================================================

// ⬆️ Ganti versi ini setiap kali ada update besar pada file app
const CACHE_NAME = 'toko-pwa-v2';

const urlsToCache = [
    './',
    './index.html',
    './app.js',
    './manifest.json'
];

// ── 1. INSTALL: Pre-cache file utama ─────────────────────────
self.addEventListener('install', event => {
    console.log('[SW] Install — cache:', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
    // Paksa SW baru langsung aktif (tanpa tunggu tab lama tutup)
    self.skipWaiting();
});

// ── 2. ACTIVATE: Hapus cache lama secara otomatis ────────────
self.addEventListener('activate', event => {
    console.log('[SW] Activate — membersihkan cache lama...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME) // semua selain versi saat ini
                    .map(name => {
                        console.log('[SW] Hapus cache lama:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    // Ambil alih semua tab yang terbuka segera
    self.clients.claim();
});

// ── 3. FETCH: Network-First Strategy ─────────────────────────
// Selalu coba ambil dari NETWORK dulu.
// Jika gagal (offline), baru ambil dari CACHE.
self.addEventListener('fetch', event => {
    // Abaikan request non-HTTP (chrome-extension, dll)
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Berhasil dari network → update cache sekaligus
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    // Hanya cache file lokal, bukan request ke API PHP
                    if (!event.request.url.includes('api-toko')) {
                        cache.put(event.request, responseClone);
                    }
                });
                return networkResponse;
            })
            .catch(() => {
                // Network gagal (offline) → fallback ke cache
                console.log('[SW] Offline! Ambil dari cache:', event.request.url);
                return caches.match(event.request);
            })
    );
});