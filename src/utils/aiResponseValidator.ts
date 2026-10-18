import { AIAnalysisResult } from '../services/geminiChatAnalyzer';

const VALID_PROJECT_TYPE_IDS = [
  'factory_corp',
  'restaurant_menu',
  'ecommerce',
  'landing_page',
  'custom_erp',
  'portfolio_booking',
] as const;

type ValidProjectTypeId = typeof VALID_PROJECT_TYPE_IDS[number];

const KNOWN_FEATURE_IDS = new Set([
  'f_responsive',
  'f_wa_order',
  'f_dashboard',
  'f_seo',
  'f_qr_code',
  'f_bilingual',
  'f_payment',
  'f_payment_sar',
  'f_payment_usd',
  'f_payment_try',
  'f_inventory',
  'f_pdf_invoice',
  'f_pixel_analytics',
  'f_roles',
  'f_backup',
  'f_calendar',
  'f_zatca',
  'f_efatura',
  'f_shipping_sar',
  'f_shipping_usd',
  'f_kargo_try',
  'f_kvkk',
  'f_vat_sar',
  'f_compliance_usd',
  'f_eta_invoice',
]);

const VALID_CATEGORIES = new Set(['ux', 'integrations', 'commerce', 'admin', 'seo', 'core']);

/**
 * Validates and sanitizes raw JSON output from Gemini AI before applying to state.
 */
export function validateAndSanitizeAIResponse(raw: unknown): {
  isValid: boolean;
  result: AIAnalysisResult;
  errors: string[];
} {
  const errors: string[] = [];
  let parsed: any = raw;

  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch (e: any) {
      return {
        isValid: false,
        result: getDefaultResult(),
        errors: ['فشل تحليل استجابة الذكاء الاصطناعي JSON: ' + (e.message || '')],
      };
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      isValid: false,
      result: getDefaultResult(),
      errors: ['تنسيق استجابة الذكاء الاصطناعي غير مطابق للكائن المتوقع.'],
    };
  }

  // 1. Project Type ID
  let projectTypeId: ValidProjectTypeId = 'factory_corp';
  if (VALID_PROJECT_TYPE_IDS.includes(parsed.projectTypeId)) {
    projectTypeId = parsed.projectTypeId;
  } else if (typeof parsed.projectTypeId === 'string') {
    const lower = parsed.projectTypeId.toLowerCase().replace(/[^a-z]/g, '');
    if (lower.includes('restaurant') || lower.includes('menu') || lower.includes('food')) {
      projectTypeId = 'restaurant_menu';
    } else if (lower.includes('ecom') || lower.includes('store') || lower.includes('shop') || lower.includes('ticaret')) {
      projectTypeId = 'ecommerce';
    } else if (lower.includes('landing') || lower.includes('onepage')) {
      projectTypeId = 'landing_page';
    } else if (lower.includes('erp') || lower.includes('admin') || lower.includes('portal')) {
      projectTypeId = 'custom_erp';
    } else if (lower.includes('port') || lower.includes('book') || lower.includes('clinic') || lower.includes('randevu')) {
      projectTypeId = 'portfolio_booking';
    } else {
      errors.push(`نوع المشروع "${parsed.projectTypeId}" غير معروف وتم التعيين إلى موقع تعريفي.`);
      projectTypeId = 'factory_corp';
    }
  }

  // 2. Detected Features
  const detectedFeatureIds: string[] = ['f_responsive'];
  if (Array.isArray(parsed.detectedFeatureIds)) {
    for (const fid of parsed.detectedFeatureIds) {
      const cleanId = String(fid || '').trim();
      if (KNOWN_FEATURE_IDS.has(cleanId) && !detectedFeatureIds.includes(cleanId)) {
        detectedFeatureIds.push(cleanId);
      }
    }
  }

  // 3. Custom Features
  const customFeatures: AIAnalysisResult['customFeatures'] = [];
  if (Array.isArray(parsed.customFeatures)) {
    for (const cf of parsed.customFeatures) {
      if (cf && typeof cf === 'object' && typeof cf.name === 'string' && cf.name.trim()) {
        const priceNum = Number(cf.price);
        const safePrice = isNaN(priceNum) || priceNum < 0 ? 500 : Math.round(priceNum);
        const category = VALID_CATEGORIES.has(cf.category) ? cf.category : 'ux';
        customFeatures.push({
          name: cf.name.trim().slice(0, 80),
          price: safePrice,
          category: category as any,
        });
      }
    }
  }

  // 4. Delivery Days (clamped between 1 and 90)
  let deliveryDays = 5;
  const rawDays = Number(parsed.deliveryDays);
  if (!isNaN(rawDays) && rawDays >= 1) {
    deliveryDays = Math.min(90, Math.max(1, Math.round(rawDays)));
  }

  // 5. Client strings
  const clientName = typeof parsed.clientName === 'string' ? parsed.clientName.trim() : 'عميل محتمل';
  const companyName = typeof parsed.companyName === 'string' ? parsed.companyName.trim() : '';
  const clientPhone = typeof parsed.clientPhone === 'string' ? parsed.clientPhone.trim() : '';
  const analysisSummary = typeof parsed.analysisSummary === 'string'
    ? parsed.analysisSummary.trim()
    : 'تم التعرف على تفاصيل العرض تلقائياً.';

  return {
    isValid: errors.length === 0,
    result: {
      clientName: clientName || 'عميل محتمل',
      companyName,
      clientPhone,
      projectTypeId,
      detectedFeatureIds,
      customFeatures,
      deliveryDays,
      analysisSummary,
    },
    errors,
  };
}

function getDefaultResult(): AIAnalysisResult {
  return {
    clientName: 'عميل محتمل',
    companyName: '',
    clientPhone: '',
    projectTypeId: 'factory_corp',
    detectedFeatureIds: ['f_responsive'],
    customFeatures: [],
    deliveryDays: 5,
    analysisSummary: 'تم التعيين إلى الإعداد الافتراضي.',
  };
}
