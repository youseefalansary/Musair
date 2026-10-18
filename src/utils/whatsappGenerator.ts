import { ProjectType, FeatureItem, CurrencyConfig, ClientProfile, AgencyProfile } from '../types/pricing';
import { AppLanguage } from '../i18n/translations';

export type WhatsAppTone = 'formal' | 'friendly' | 'value';

export interface WhatsAppGeneratorOptions {
  projectType: ProjectType;
  features: FeatureItem[];
  grandTotal: number;
  depositAmount: number;
  deliveryDays: number;
  currency: CurrencyConfig;
  client: ClientProfile;
  agency: AgencyProfile;
  lang: AppLanguage;
  tone: WhatsAppTone;
}

/**
 * Returns static currency disclaimer string when currency is not EGP.
 */
export function getCurrencyDisclaimer(currencyCode: string, lang: AppLanguage): string {
  if (currencyCode === 'EGP') return '';
  if (lang === 'en') {
    return ' *(All prices in ' + currencyCode + ')*';
  }
  if (lang === 'tk') {
    return ' *(Tüm tutarlar ' + currencyCode + ' cinsindendir)*';
  }
  return ' *(الأسعار محددة بالـ ' + currencyCode + ')*';
}

/**
 * Generates ready-to-send WhatsApp pitch message formatted for the selected tone and message language.
 */
export function generateWhatsAppMessage(options: WhatsAppGeneratorOptions): string {
  const {
    projectType,
    features,
    grandTotal,
    depositAmount,
    deliveryDays,
    currency,
    client,
    agency,
    lang,
    tone,
  } = options;

  const activeFeatures = (features || []).filter((f) => f && f.active);
  const formattedTotal = `${grandTotal.toLocaleString()} ${currency.symbol}`;
  const formattedDeposit = `${depositAmount.toLocaleString()} ${currency.symbol}`;
  const currencyNote = getCurrencyDisclaimer(currency.code, lang);

  // 1. Turkish Language Generation
  if (lang === 'tk') {
    const clientName = client.name.trim() || 'Sayın Yetkili';
    const companyName = client.company.trim() ? ` (${client.company})` : '';
    const projName = projectType.nameTk || projectType.name;

    const featureLines = activeFeatures
      .map((f) => `  ✓ ${f.nameTk || f.name}`)
      .join('\n');

    if (tone === 'friendly') {
      return `Merhaba ${clientName}, umarım her şey yolundadır! 😊

*${projName}*${companyName} projeniz için hazırladığımız hızlı teklif özeti:

*Dahil Olan Modüller:*
${featureLines}
  ✓ 1 Yıllık Alan Adı ve Hızlı Bulut Sunucu (SSL Dahil)
  ✓ %100 Mobil ve Tablet Uyumlu Tasarım

*Toplam Tutar:* ${formattedTotal}${currencyNote}
*Ödeme Planı:*
  - Başlangıç ve sunucu kaporası (%40-50): ${formattedDeposit}
  - Kalan tutar test onayı ve canlıya alma sonrasında.

*Teslimat:* Yaklaşık ${deliveryDays} iş günü.
Hemen başlamak için bize haber vermeniz yeterli!

Saygılarımla,
${agency.name} | ${agency.phone}`;
    }

    if (tone === 'value') {
      return `Sayın ${clientName},

*${projName}* projeniz için hazırladığımız çözüm; yalnızca standart bir web sitesi değil, firmanızın dijital güvenilirliğini artıran ve müşteri kazandıran kurumsal bir altyapıdır.

*Sağlanan Katma Değer:*
${featureLines}
  ✓ Yüksek performanslı bulut mimarisi ve 1 yıllık SSL koruması
  ✓ Kolay yönetim paneli ile dilediğiniz an içerik ve fiyat güncelleyebilme
  ✓ Arama motorlarında (Google) görünürlük sağlayan teknik altyapı

*Toplam Yatırım:* ${formattedTotal}${currencyNote}
*Başlangıç Ödemesi:* ${formattedDeposit} (Kalan bakiye teslimatta).
*Garanti Güvencesi:* Canlı yayına alma sonrasında 60 gün ücretsiz teknik destek ve hata giderme.

Projeyi birlikte başlatmaktan memnuniyet duyarız.
${agency.name} | ${agency.phone}`;
    }

    // Default Turkish: Formal
    return `Sayın ${clientName}, iyi günler dileriz.

*${projName}*${companyName} projenizle ilgili hazırladığımız teknik ve mali teklif özeti aşağıda bilgilerinize sunulmuştur:

*Kapsam ve Temel Özellikler:*
${featureLines}
  ✓ Resmi alan adı ve kurumsal bulut sunucu (1 yıl ücretsiz SSL ile)
  ✓ Tüm mobil ve masaüstü cihazlarla %100 uyumlu mimari
  ✓ Profesyonel teknik altyapı ve arama motoru optimizasyonu

*Toplam Sözleşme Tutarı:* ${formattedTotal}${currencyNote}

*Ödeme Koşulları:*
  - Proje başlangıç ve sunucu kaporası: ${formattedDeposit}
  - Kalan bakiye inceleme onayı ve canlı yayına alma aşamasında.

*Teslimat Süresi:* ${deliveryDays} ila ${deliveryDays + 2} iş günü.
*Garanti:* Canlı yayına alma sonrasında sözleşmeye bağlı teknik destek.

Detaylı resmi PDF teklifimizi incelemek ve projeyi başlatmak için onayınızı rica eder, iyi çalışmalar dileriz.

${agency.name}
Telefon: ${agency.phone}`;
  }

  // 2. English Language Generation
  if (lang === 'en') {
    const clientName = client.name.trim() || 'Valued Client';
    const companyName = client.company.trim() ? ` for ${client.company}` : '';
    const projName = projectType.nameEn || projectType.name;

    const featureLines = activeFeatures
      .map((f) => `  ✓ ${f.nameEn || f.name}`)
      .join('\n');

    if (tone === 'friendly') {
      return `Hi ${clientName}! Hope you're having a great day! 😊

Here is the quick breakdown for *${projName}*${companyName}:

*What is included:*
${featureLines}
  ✓ Official Domain & High-speed Cloud Hosting with SSL for 1 full year
  ✓ Ultra-fast & 100% Mobile Responsive UX

*Total Investment:* ${formattedTotal}${currencyNote}

*Payment Milestones:*
  - Kickoff deposit: ${formattedDeposit}
  - Balance payable upon preview approval and final live deployment.

*Delivery Timeline:* Around ${deliveryDays} business days.
Let me know if you would like to book your kickoff slot this week!

Cheers,
${agency.name} | ${agency.phone}`;
    }

    if (tone === 'value') {
      return `Dear ${clientName},

Regarding *${projName}*${companyName}; our goal is to deliver a high-converting digital platform that builds trust, protects your brand, and boosts inbound business.

*Core Business Deliverables:*
${featureLines}
  ✓ High-performance, scalable cloud hosting with full SSL security for 1 year
  ✓ User-friendly admin dashboard to edit content and products effortlessly
  ✓ Clean technical SEO foundation for Google search discovery

*Total Investment:* ${formattedTotal}${currencyNote} (Transparent pricing, no hidden costs).
*Kickoff Deposit:* ${formattedDeposit} (balance payable upon total satisfaction).
*Warranty:* Complimentary post-launch warranty & maintenance support.

Ready to assist whenever you would like to proceed!

Best regards,
${agency.name} | ${agency.phone}`;
    }

    // Default English: Formal
    return `Dear ${clientName},

Following our discussion regarding *${projName}*${companyName}, here is our official technical and commercial summary:

*Key Deliverables & Included Specifications:*
${featureLines}
  ✓ Official Domain & Cloud Hosting with SSL certificate for 1 full year
  ✓ 100% Mobile Responsive and SEO-optimized architecture
  ✓ User management and content administration panel

*Total All-Inclusive Amount:* ${formattedTotal}${currencyNote}

*Payment Terms:*
  - Kickoff Deposit: ${formattedDeposit}
  - Remaining Balance payable upon demo review and final deployment.

*Delivery Timeline:* ${deliveryDays} to ${deliveryDays + 2} business days.
*Warranty:* Certified post-launch warranty covering bug fixes.

Looking forward to bringing your vision to life!

${agency.name}
Phone: ${agency.phone}`;
  }

  // 3. Arabic Language Generation
  const clientName = client.name.trim() || (currency.code === 'SAR' ? 'أخي الفاضل' : 'أستاذنا العزيز');
  const companyName = client.company.trim() ? ` - ${client.company}` : '';
  const projName = projectType.name;

  const featureLines = activeFeatures
    .map((f) => `  ✓ ${f.name}`)
    .join('\n');

  // Saudi / Gulf Market Phrasing when currency is SAR
  if (currency.code === 'SAR') {
    if (tone === 'friendly') {
      return `مرحباً أستاذ / ${clientName} 👋
أتمنى لك يوماً رائعاً!

ملخص سريع لمشروع *${projName}*${companyName}:

*المزايا والمواصفات المعتمدة:*
${featureLines}
  ✓ استضافة سحابية خليجية فائقة السرعة مع شهادة SSL.
  ✓ تصميم متجاوب 100% مع أحدث أجهزة الجوال.

*إجمالي العرض:* ${formattedTotal}${currencyNote}
*الدفعات:*
  - دفعة البداية وتأمين السيرفر: ${formattedDeposit} (عبر آيبان بنكي أو STC Pay).
  - باقي الحساب بعد معاينة النسخة التجريبية والاعتماد.

*المدة المتوقعة:* من ${deliveryDays} إلى ${deliveryDays + 2} أيام عمل.
*الضمان:* 90 يوماً دعم فني معتمد مجاناً بعد الإطلاق.

إذا ناسبك العرض، يرجى تأكيد البدء لحجز موعد التنفيذ مباشرة!

${agency.name} | ${agency.phone}`;
    }

    if (tone === 'value') {
      return `السلام عليكم أستاذ / ${clientName}،

بخصوص مشروعكم الموقر *${projName}*${companyName}؛ هدفنا ليس مجرد برمجة موقع، بل بناء واجهة تجارية معتمدة ترفع مبيعاتكم وتبني الثقة مع عملائكم في المملكة.

*القيمة المضافة لمشروعكم:*
${featureLines}
  ✓ بنية سريعة متوافقة مع الأنظمة والفوترة الرسمية
  ✓ لوحة تحكم عربية بالكامل تمكنكم من إدارة كل شيء بسهولة

*إجمالي الاستثمار:* ${formattedTotal}${currencyNote}
*دفعة البدء وتجهيز البنية:* ${formattedDeposit}
*الضمان الذهبي:* 90 يوماً من الدعم الفني المجاني الشامل.

جاهزون للانطلاق فور موافقتكم الكريمة.
${agency.name} | ${agency.phone}`;
    }

    // Default SAR: Formal
    return `السلام عليكم ورحمة الله وبركاته،
سعادة الأستاذ / ${clientName} المحترم.

يسرنا أن نرفع لسعادتكم العرض المالي والفني لتنفيذ مشروع *${projName}*${companyName}:

*نطاق العمل والمخرجات المتفق عليها:*
${featureLines}
  ✓ حجز النطاق الرسمي والاستضافة السحابية مع شهادة SSL لسنة كاملة
  ✓ تصميم متجاوب فائق السرعة متوافق مع كافة الأجهزة بنسبة 100%

*إجمالي قيمة العقد المالي:* ${formattedTotal}${currencyNote}

*جدول الدفعات المعتمد:*
  - دفعة التعاقد والانطلاق (${formattedDeposit}) إلى الحساب البنكي أو STC Pay.
  - الدفعة النهائية تسدد بعد معاينة النسخة التجريبية (Staging) والاعتماد النهائي.

*المدة الزمنية للتسليم:* ${deliveryDays} إلى ${deliveryDays + 2} أيام عمل تبدأ فور استلام المواد وعربون الانطلاق.
*الضمان المعتمد:* 90 يوماً ضمان فني شامل لمعالجة أي ملاحظات.

يسعدنا اعتمادكم للعرض لنبدأ فوراً في مراحل التنفيذ.

${agency.name}
هاتف / واتساب: ${agency.phone}`;
  }

  // Turkish Market Phrasing in Arabic when currency is TRY
  if (currency.code === 'TRY') {
    if (tone === 'friendly') {
      return `مرحباً أستاذ / ${clientName} 👋
أتمنى لك يوماً موفقاً!

ملخص سريع لمشروعك *${projName}*${companyName} بالليرة التركية:

*المواصفات والمزايا المشمولة:*
${featureLines}
  ✓ حجز النطاق (.com / .com.tr) واستضافة سحابية سريعة مع شهادة SSL.
  ✓ تصميم متجاوب 100% ومتوافق مع متصفحات الموبايل والكمبيوتر.

*إجمالي التكلفة:* ${formattedTotal}${currencyNote}
*دفعة البداية:* ${formattedDeposit} (تحويل بنكي TR IBAN أو FAST).
*مدة التسليم:* حوالي ${deliveryDays} أيام عمل.
*الضمان:* 60 يوماً ضمان صيانة ودعم فني مجاني بعد الإطلاق.

جاهزون للبدء فور تأكيدكم!
${agency.name} | ${agency.phone}`;
    }

    return `السلام عليكم أستاذ / ${clientName}،

يسرنا تقديم العرض الفني والمالي لمشروع *${projName}*${companyName} بالسوق التركي:

*المخرجات والمزايا المشمولة:*
${featureLines}
  ✓ نطاق رسمي وخادم سحابي أوروبي سريع مع شهادة SSL لسنة كاملة
  ✓ توافق كامل مع متطلبات الخصوصية والقوانين التجارية

*إجمالي قيمة العرض:* ${formattedTotal}${currencyNote}
*دفعة البداية والتأسيس:* ${formattedDeposit} (عبر الحساب البنكي TR IBAN).
*الدفعة الختامية:* تسدد عند التسليم والموافقة النهائية.
*المدة الزمنية:* ${deliveryDays} إلى ${deliveryDays + 2} أيام عمل.
*الضمان:* 60 يوماً ضمان فني معتمد.

شاكرين ثقتكم الكريمة،
${agency.name}
هاتف: ${agency.phone}`;
  }

  // Default Egyptian / General Arabic (EGP / USD)
  if (tone === 'friendly') {
    return `أهلاً بحضرتك يا أستاذ / ${clientName} 👋
أتمنى تكون بأفضل حال!

ده ملخص سريع وسهل لمشروع *${projName}*${companyName}:

*إيه اللي مشمول في العرض؟*
${featureLines}
  ✓ حجز النطاق الرسمي (.com) وسيرفر سحابي سريع مع شهادة الأمان SSL.
  ✓ تصميم متجاوب 100% يشتغل بسرعة وسلاسة على كل الموبايلات.

*إجمالي التكلفة:* ${formattedTotal}${currencyNote}
*نظام الدفعات:*
  - عربون البداية وحجز السيرفر: ${formattedDeposit}
  - الباقي بعد ما تشوف النسخة التجريبية وتوافق عليها تماماً.

*مدة التسليم:* حوالي ${deliveryDays} أيام عمل.
*فترة الضمان:* 30 يوماً بعد الإطلاق لصيانة ومتابعة الموقع مجاناً.

لو كل شيء تمام ومناسب، بلغني عشان نبدأ في الإجراءات فوراً!

تحياتي،
${agency.name} | ${agency.phone}`;
  }

  if (tone === 'value') {
    return `أهلاً بحضرتك يا فندم، أستاذ / ${clientName}،

بخصوص مشروعكم *${projName}*${companyName}؛ الفكرة مش مجرد كود وخلاص، الفكرة إزاي نوفر لمنشأتكم واجهة احترافية ترفع المبيعات وتبني ثقة قوية وفورية مع عملائكم.

*القيمة المضافة في مشروعكم:*
${featureLines}
  ✓ استضافة سريعة مشفرة تضمن بقاء موقعك أونلاين 24/7 دون بطء
  ✓ لوحة تحكم ذكية وسهلة لتعديل المنتجات والمحتوى بدون مبرمج

*الاستثمار الكلي للمشروع:* ${formattedTotal}${currencyNote}
*عربون البداية وتأمين البنية:* ${formattedDeposit}
*الضمان الفني:* 30 يوماً بعد التسليم لحل أي ملاحظات فوراً مجاناً.

مستعدين للبدء فور إشارتكم الكريمة!
${agency.name} | ${agency.phone}`;
  }

  // Default Arabic: Formal
  return `السلام عليكم ورحمة الله وبركاته،
عناية الأستاذ / ${clientName} المحترم.

تحية طيبة وبعد،،
يسرنا أن نتقدم لحضرتكم بعرض السعر الفني والمالي لمشروع *${projName}*${companyName}:

*نطاق العمل والمخرجات المشمولة بالعرض:*
${featureLines}
  ✓ حجز النطاق الرسمي (.com) واستضافة سحابية سريعة مع شهادة SSL لسنة كاملة
  ✓ تصميم هندسي متجاوب بنسبة 100% مع كافة الشاشات والمتصفحات
  ✓ لوحة تحكم متطورة وسهلة لإدارة المحتوى

*إجمالي الاستثمار المالي للعقد:* ${formattedTotal}${currencyNote}

*جدول الدفعات المعتمد:*
  - دفعة التعاقد والانطلاق (${formattedDeposit}).
  - الدفعة الختامية تسدد بعد المعاينة والموافقة النهائية على الموقع الحي.

*المدة الزمنية المقدرة:* ${deliveryDays} إلى ${deliveryDays + 2} أيام عمل تبدأ فور استلام المواد وعربون التعاقد.
*الضمان الفني:* 30 يوماً دعم فني وصيانة مجانية بعد الإطلاق.

شاكرين ومقدرين حسن تعاونكم، ونتطلع لبدء العمل معاً.

${agency.name}
هاتف: ${agency.phone}`;
}
