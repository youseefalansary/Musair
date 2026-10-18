# Musair — مُسعّر

**الإصدار: v1.0.0**

استوديو لحساب تكاليف وربحية مشاريع الويب وتجهيز عروض الأسعار ورسائل WhatsApp، مع دعم العربية والإنجليزية والتركية وعملات EGP وSAR وUSD وTRY.

## تنزيلات الإصدار 1.0

- **Android APK:** [تحميل مباشر](https://github.com/youseefalansary/Musair/releases/download/v1.0.0/Musair-v1.0.0-Android.apk)
- **Windows 64-bit:** [تحميل مباشر](https://github.com/youseefalansary/Musair/releases/download/v1.0.0/Musair-v1.0.0-Windows-x64.zip) — فك الضغط ثم شغّل `Musair.exe` من المجلد المستخرج.
- **ملفات المشروع المصدرية:** [تحميل مباشر](https://github.com/youseefalansary/Musair/releases/download/v1.0.0/Musair-v1.0.0-Source.zip)

## ملاحظات الاستخدام

- نسخة Android هي APK تجريبي موقّع بمفتاح Debug للتثبيت المباشر؛ ليست إصدار متجر Google Play.
- تحفظ بيانات البرنامج ومفتاح Gemini محليًا على الجهاز. لا توجد مزامنة تلقائية بين الهاتف والكمبيوتر.
- أدخل مفتاح Gemini بنفسك من إعدادات التطبيق عند الحاجة. لا يُضمَّن المفتاح في APK أو نسخة Windows أو المستودع.
- احتفظ بنسخ احتياطية من بياناتك، خصوصًا قبل نقلها إلى جهاز آخر.

## البناء محليًا

المتطلبات: Node.js 22.12 أو أحدث، pnpm 11.25.0، Java 21 وAndroid SDK 36 لبناء Android.

```bash
pnpm install
pnpm lint
pnpm android:apk
pnpm desktop:windows
```

- يخرج APK في `android/app/build/outputs/apk/debug/app-debug.apk`، ويُنسخ إلى `release/` عند تجهيز الإصدار.
- يخرج تطبيق Windows x64 في `release/windows/Musair-win32-x64/`، وتُنشأ حزمة ZIP قابلة للتشغيل في `release/`.
