# LingoLearn PWA — بنية المشروع وخطوات الاستخدام

## بنية الملفات التقنية للـ PWA
```
/
├── index.html                        # الصفحة الرئيسية مع meta tags وربط manifest وتسجيل sw.js
├── public/
│   ├── manifest.json                 # إعدادات التطبيق (standalone، #58CC02، الأيقونات)
│   ├── sw.js                         # Service Worker باستراتيجية Cache First + دعم عدم الاتصال
│   ├── .well-known/
│   │   └── assetlinks.json           # ربط تطبيق الأندرويد TWA لإخفاء شريط المتصفح نهائياً
│   └── icons/
│       ├── icon-192x192.png          # أيقونة 192x192 (purpose: any)
│       ├── icon-512x512.png          # أيقونة 512x512 (purpose: any)
│       ├── icon-maskable-512x512.png # أيقونة 512x512 مع هامش أمان (purpose: maskable)
│       └── apple-touch-icon.png      # أيقونة أجهزة iOS بمقاس 180x180
└── README.md                         # شرح البنية وخطوات التحويل إلى تطبيق مستقل
```

> عند البناء باستخدام `npm run build`، يتم نسخ جميع الملفات داخل `public/` تلقائياً إلى جذر مجلد `dist/` لتعمل على المسارات المباشرة `/manifest.json` و `/sw.js` و `/.well-known/assetlinks.json` و `/icons/*`.

---

## خطوات تشغيل التطبيق كـ PWA مستقل (بدون شريط المتصفح)

1. **التشغيل والبناء:**
   - تشغيل محلي: `npm run dev`
   - بناء الإنتاج: `npm run build`
2. **التثبيت على الجوال أو المتصفح:**
   - افتح الموقع عبر HTTPS ثم اضغط زر **Install App** داخل صفحة **Setting** (أو "إضافة إلى الشاشة الرئيسية" في Safari على iOS).
   - بفضل إعداد `display: "standalone"` و `scope: "/"` و `start_url: "/"` سيفتح التطبيق بنافذة مستقلة بدون شريط المتصفح.
3. **عند تحويل الموقع إلى تطبيق Android (TWA / PWABuilder / Bubblewrap):**
   - افتح الملف `public/.well-known/assetlinks.json`.
   - استبدل `com.example.lingolearn` باسم الحزمة الفعلي لتطبيقك (`package_name`).
   - استبدل `00:00:...` ببصمة التوقيع **SHA-256** الخاصة بشهادة تطبيق الأندرويد.
   - تأكد أن رابط `assetlinks.json` متاح عبر HTTPS على النطاق نفسه: `https://YOUR_DOMAIN/.well-known/assetlinks.json` حتى يتحقق Chrome من الملكية ويخفي شريط العنوان بالكامل.
