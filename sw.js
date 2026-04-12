const CACHE_NAME = 'naolon-v2';

// Install event - تخزين الملفات
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Activate event - تنظيف الكاش القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - جلب الملفات
self.addEventListener('fetch', event => {
  // لو طلب صفحة HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/Naolony/index.html'))
    );
    return;
  }

  // باقي الملفات - Network First
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // نسخ الاستجابة وخزنها
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // لو فشل - رجع للكاش
        return caches.match(event.request);
      })
  );
});
