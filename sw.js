const CACHE_NAME = 'naolon-v1';
const urlsToCache = [
  '/Naolony/',
  '/Naolony/index.html',
  '/Naolony/style.css',
  '/Naolony/app.js'
];

// تثبيت الكاش عند التحميل الأول
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// تفعيل وتحديث الكاش
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cache => cache !== CACHE_NAME)
          .map(cache => caches.delete(cache))
      );
    })
  );
  self.clients.claim();
});

// جلب من الكاش أو الشبكة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // لو موجود في الكاش → رجعه
        if (response) return response;
        
        // لا → جيب من الشبكة وخزنه
        return fetch(event.request).then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        });
      })
      .catch(() => {
        // لو مفيش نت → صفحة أوفلاين
        if (event.request.destination === 'document') {
          return caches.match('/Naolony/index.html');
        }
      })
  );
});