// اسم الكاش وإصداره لتحديث الملفات المخزنة تلقائياً عند وجود إصدار جديد
const CACHE_NAME = 'lingolearn-pwa-v3';

// الملفات الأساسية التي يتم تخزينها مسبقاً للعمل بدون إنترنت
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
];

// مرحلة التثبيت: حفظ الملفات الأساسية في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => undefined);
    })
  );
  // تفعيل النسخة الجديدة من عامل الخدمة فوراً
  self.skipWaiting();
});

// مرحلة التفعيل: حذف الكاشات القديمة غير المستخدمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((oldName) => caches.delete(oldName))
      )
    )
  );
  // السيطرة الفورية على جميع التبويبات المفتوحة
  self.clients.claim();
});

// مرحلة جلب البيانات: استراتيجية Cache First للملفات الثابتة مع بديل العمل دون اتصال
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // نتعامل فقط مع طلبات GET عبر HTTP/HTTPS (ونستثني طلبات Firebase/API الخارجية الحية)
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // لطلبات التنقل (صفحات HTML): نحاول الشبكة أولاً ثم نعود للكاش أو صفحة البداية دون اتصال
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return (await caches.match('/index.html')) || (await caches.match('/'));
        })
    );
    return;
  }

  // لباقي الملفات الثابتة (الصور، الخطوط، السكربتات، التنسيقات): Cache First أولاً
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // في حال انقطاع الإنترنت بالكامل وعدم وجود الملف في الكاش
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
          return new Response('', { status: 503, statusText: 'Offline' });
        });
    })
  );
});
