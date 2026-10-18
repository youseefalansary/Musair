import { validateAndSanitizeAIResponse } from '../utils/aiResponseValidator';

export interface AIAnalysisResult {
  clientName: string;
  companyName: string;
  clientPhone: string;
  projectTypeId: 'factory_corp' | 'restaurant_menu' | 'ecommerce' | 'landing_page' | 'custom_erp' | 'portfolio_booking';
  detectedFeatureIds: string[];
  customFeatures: Array<{
    name: string;
    price: number;
    category: 'ux' | 'integrations' | 'commerce' | 'admin' | 'seo' | 'core';
  }>;
  deliveryDays: number;
  analysisSummary: string;
}

const SYSTEM_INSTRUCTION = `أنت خبير تسعير مشاريع ويب محترف. مهمتك قراءة نص محادثة العميل (العربية أو الإنجليزية أو التركية) واستخراج متطلبات الموقع بدقة بصيغة JSON حصراً.

أنواع المشاريع (projectTypeId):
1. 'restaurant_menu': منيو مطعم تفاعلي مع باركود QR أو طلب وجبات.
2. 'factory_corp': موقع تعريفي لشركة أو مصنع أو خدمات مؤسسية.
3. 'ecommerce': متجر إلكتروني به سلة وبوابات دفع وشحن أو منتجات للبيع أونلاين.
4. 'landing_page': صفحة هبوط إعلانية تسويقية سريعة لمنتج محدد أو خدمة.
5. 'custom_erp': نظام إدارة أو بوابة موظفين أو لوحة تحكم عمليات داخلية أو CRM.
6. 'portfolio_booking': موقع استشارات أو محاماة أو عيادة أو أعمال مع حجز مواعيد بالتقويم.

المزايا المعروفة (detectedFeatureIds):
- 'f_responsive': التصميم المتجاوب (دائماً true)
- 'f_wa_order': طلب أو تواصل واتساب مباشر
- 'f_dashboard': لوحة تحكم إدارية لتعديل المحتوى
- 'f_seo': تهيئة محركات البحث
- 'f_qr_code': باركود QR للطاولات أو المعارض
- 'f_bilingual': موقع متعدد اللغات (عربي/إنجليزي/تركي)
- 'f_payment': بوابة دفع إلكتروني
- 'f_inventory': إدارة المخزون وشركات الشحن
- 'f_pdf_invoice': فواتير PDF
- 'f_pixel_analytics': بكسل إعلانات
- 'f_roles': صلاحيات مستخدمين متعددة
- 'f_backup': نسخ احتياطي سحابي
- 'f_calendar': حجز مواعيد وتقويم

استخرج أيضاً:
- clientName: اسم الشخص المتحدث أو "عميل محتمل"
- companyName: اسم الشركة أو النشاط إن وجد
- clientPhone: رقم الهاتف إن وُجد بالمحادثة
- deliveryDays: عدد أيام العمل التقديرية (من 2 إلى 15)
- analysisSummary: تلخيص سريع باللغة المناسبة يوضح ما تم اكتشافه.

أخرج كائن JSON صالح فقط بالشكل:
{
  "clientName": string,
  "companyName": string,
  "clientPhone": string,
  "projectTypeId": "factory_corp" | "restaurant_menu" | "ecommerce" | "landing_page" | "custom_erp" | "portfolio_booking",
  "detectedFeatureIds": string[],
  "customFeatures": [
    { "name": string, "price": number, "category": "ux"|"integrations"|"commerce"|"admin"|"seo"|"core" }
  ],
  "deliveryDays": number,
  "analysisSummary": string
}`;

export async function analyzeClientChatWithGemini(
  chatTranscript: string,
  apiKey: string
): Promise<AIAnalysisResult> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('يرجى حفظ مفتاح Gemini API Key أولاً.');
  }
  if (!chatTranscript || chatTranscript.trim().length < 10) {
    throw new Error('يرجى لصق نص كافٍ لمحادثة العميل.');
  }

  // Model specified by system: gemini-2.5-flash
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
    apiKey.trim()
  )}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `اقرأ المحادثة التالية واستخرج المتطلبات بدقة بصيغة JSON:\n\n${chatTranscript}`,
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [
        {
          text: SYSTEM_INSTRUCTION,
        },
      ],
    },
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData?.error?.message ||
      `خطأ في استدعاء Gemini API (رمز: ${response.status} ${response.statusText})`;
    throw new Error(message);
  }

  const responseData = await response.json();
  const textOutput =
    responseData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!textOutput) {
    throw new Error('لم يرجع نموذج الذكاء الاصطناعي أي استجابة.');
  }

  const { isValid, result, errors } = validateAndSanitizeAIResponse(textOutput);
  if (!isValid && errors.length > 0) {
    console.warn('AI response sanitization warnings:', errors);
  }

  return result;
}
