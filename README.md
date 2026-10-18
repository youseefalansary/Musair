# Musair — مُسعّر

**الإصدار: v1.0.0**

استوديو لحساب تكاليف وربحية مشاريع الويب وتجهيز عروض الأسعار ورسائل WhatsApp، مع دعم العربية والإنجليزية والتركية وعملات EGP وSAR وUSD وTRY.

## نسخة Android الموصى بها

- **أفضل نسخة Android للمشروع — مُسعّر - الهاتف v1.0.1:** [تحميل APK](https://github.com/youseefalansary/Musair/raw/refs/heads/main/release/Musair-v1.0.1-Android.apk)

هذا APK مستقل ومخصص للهاتف، أُضيف كملف جديد بعد تعديل التطبيق. معرّف التطبيق `com.aistudio.musair.kxmqv`، لذلك يمكن تثبيته بجانب v1.0.0 دون إزالة النسخة القديمة. تم التحقق من نجاح البناء وتوقيع APK؛ لكنه إصدار تجريبي موقّع بمفتاح Debug وليس منشورًا على Google Play.

## تنزيلات الإصدار السابق v1.0.0

- **Android APK:** [تحميل مباشر](https://github.com/youseefalansary/Musair/releases/download/v1.0.0/Musair-v1.0.0-Android.apk)
- **Windows 64-bit:** [تحميل مباشر](https://github.com/youseefalansary/Musair/releases/download/v1.0.0/Musair-v1.0.0-Windows-x64.zip) — فك الضغط ثم شغّل `Musair.exe` من المجلد المستخرج.
- **ملفات المشروع المصدرية:** [تحميل مباشر](https://github.com/youseefalansary/Musair/releases/download/v1.0.0/Musair-v1.0.0-Source.zip)

## ملاحظات الاستخدام

- النسخة الموصى بها لأجهزة Android هي `Musair-v1.0.1-Android.apk`؛ والإصدار السابق v1.0.0 ما زال محفوظًا.
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
