import {
  AgencyProfile,
  ProjectType,
  FeatureItem,
  ExternalCostItem,
  SavedQuote,
  CurrencyCode,
} from '../types/pricing';
import { AppLanguage } from '../i18n/translations';

export interface ValidatedBackupData {
  agency?: AgencyProfile;
  projectTypes?: ProjectType[];
  features?: FeatureItem[];
  externalCosts?: ExternalCostItem[];
  savedQuotes?: SavedQuote[];
  milestoneMode?: '40-30-30' | '50-50';
  currencyCode?: CurrencyCode;
  lang?: AppLanguage;
  exportedAt?: string;
}

export interface BackupValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: ValidatedBackupData;
}

const VALID_CURRENCIES: CurrencyCode[] = ['EGP', 'SAR', 'USD', 'TRY'];
const VALID_LANGS: AppLanguage[] = ['ar', 'en', 'tk'];
const VALID_MILESTONES = ['40-30-30', '50-50'];

/**
 * Validates and sanitizes a raw JSON string or object for import.
 */
export function validateBackupData(input: unknown): BackupValidationResult {
  const errors: string[] = [];

  // 1. JSON parsing if string provided
  let raw: any;
  if (typeof input === 'string') {
    if (!input.trim()) {
      return { isValid: false, errors: ['النص البرمجي لملف النسخ الاحتياطي فارغ.'] };
    }
    try {
      raw = JSON.parse(input);
    } catch (e: any) {
      return { isValid: false, errors: ['خطأ في صياغة ملف JSON: ' + (e.message || '')] };
    }
  } else {
    raw = input;
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { isValid: false, errors: ['يجب أن يكون ملف النسخ كائناً صحيحاً (JSON Object).'] };
  }

  const sanitized: ValidatedBackupData = {};

  // 2. Validate Agency Profile
  if (raw.agency !== undefined) {
    if (typeof raw.agency !== 'object' || raw.agency === null || Array.isArray(raw.agency)) {
      errors.push('تنسيق بيانات الاستوديو (agency) غير صالح.');
    } else {
      sanitized.agency = {
        name: String(raw.agency.name || 'استوديو كود ون').trim(),
        tagline: String(raw.agency.tagline || '').trim(),
        phone: String(raw.agency.phone || '').trim(),
        email: String(raw.agency.email || '').trim(),
        location: String(raw.agency.location || '').trim(),
        taxNumber: raw.agency.taxNumber ? String(raw.agency.taxNumber).trim() : undefined,
        instapayHandle: raw.agency.instapayHandle ? String(raw.agency.instapayHandle).trim() : undefined,
        bankAccount: raw.agency.bankAccount ? String(raw.agency.bankAccount).trim() : undefined,
        vodafoneCash: raw.agency.vodafoneCash ? String(raw.agency.vodafoneCash).trim() : undefined,
        sarBankName: raw.agency.sarBankName ? String(raw.agency.sarBankName).trim() : undefined,
        sarIban: raw.agency.sarIban ? String(raw.agency.sarIban).trim() : undefined,
        stcPayHandle: raw.agency.stcPayHandle ? String(raw.agency.stcPayHandle).trim() : undefined,
        zatcaTaxNumber: raw.agency.zatcaTaxNumber ? String(raw.agency.zatcaTaxNumber).trim() : undefined,
        commercialReg: raw.agency.commercialReg ? String(raw.agency.commercialReg).trim() : undefined,
        intlWireAccount: raw.agency.intlWireAccount ? String(raw.agency.intlWireAccount).trim() : undefined,
        swiftBic: raw.agency.swiftBic ? String(raw.agency.swiftBic).trim() : undefined,
        paypalOrStripe: raw.agency.paypalOrStripe ? String(raw.agency.paypalOrStripe).trim() : undefined,
        tryBankName: raw.agency.tryBankName ? String(raw.agency.tryBankName).trim() : undefined,
        tryIban: raw.agency.tryIban ? String(raw.agency.tryIban).trim() : undefined,
        tryTaxOffice: raw.agency.tryTaxOffice ? String(raw.agency.tryTaxOffice).trim() : undefined,
        tryTaxNumber: raw.agency.tryTaxNumber ? String(raw.agency.tryTaxNumber).trim() : undefined,
        paparaOrFast: raw.agency.paparaOrFast ? String(raw.agency.paparaOrFast).trim() : undefined,
      };
    }
  }

  // 3. Validate Project Types
  if (raw.projectTypes !== undefined) {
    if (!Array.isArray(raw.projectTypes)) {
      errors.push('تنسيق أنواع المشاريع (projectTypes) غير صالح.');
    } else {
      const validTypes: ProjectType[] = [];
      for (let i = 0; i < raw.projectTypes.length; i++) {
        const pt = raw.projectTypes[i];
        if (!pt || typeof pt !== 'object' || !pt.id || !pt.name) {
          errors.push(`العنصر رقم ${i + 1} في أنواع المشاريع غير مكتمل.`);
          continue;
        }
        const basePrice = Number(pt.basePrice);
        if (isNaN(basePrice) || basePrice < 0) {
          errors.push(`السعر الأساسي للمشروع "${pt.name}" غير صالح.`);
          continue;
        }
        validTypes.push({
          id: String(pt.id).trim(),
          name: String(pt.name).trim(),
          nameEn: pt.nameEn ? String(pt.nameEn).trim() : undefined,
          nameTk: pt.nameTk ? String(pt.nameTk).trim() : undefined,
          tagline: String(pt.tagline || '').trim(),
          taglineEn: pt.taglineEn ? String(pt.taglineEn).trim() : undefined,
          taglineTk: pt.taglineTk ? String(pt.taglineTk).trim() : undefined,
          basePrice: Math.round(basePrice),
          typicalDays: Math.max(1, Math.round(Number(pt.typicalDays) || 5)),
          recommendedStack: String(pt.recommendedStack || '').trim(),
          description: String(pt.description || '').trim(),
          descriptionEn: pt.descriptionEn ? String(pt.descriptionEn).trim() : undefined,
          descriptionTk: pt.descriptionTk ? String(pt.descriptionTk).trim() : undefined,
          defaultFeatures: Array.isArray(pt.defaultFeatures)
            ? pt.defaultFeatures.map((f: any) => String(f).trim()).filter(Boolean)
            : [],
        });
      }
      if (validTypes.length > 0) {
        sanitized.projectTypes = validTypes;
      }
    }
  }

  // 4. Validate Features
  if (raw.features !== undefined) {
    if (!Array.isArray(raw.features)) {
      errors.push('تنسيق المزايا (features) غير صالح.');
    } else {
      const validFeatures: FeatureItem[] = [];
      for (let i = 0; i < raw.features.length; i++) {
        const feat = raw.features[i];
        if (!feat || typeof feat !== 'object' || !feat.id || !feat.name) {
          errors.push(`الميزة رقم ${i + 1} غير مكتملة.`);
          continue;
        }
        const price = Number(feat.price);
        if (isNaN(price) || price < 0) {
          errors.push(`سعر الميزة "${feat.name}" غير صالح.`);
          continue;
        }
        validFeatures.push({
          id: String(feat.id).trim(),
          name: String(feat.name).trim(),
          nameEn: feat.nameEn ? String(feat.nameEn).trim() : undefined,
          nameTk: feat.nameTk ? String(feat.nameTk).trim() : undefined,
          category: feat.category || 'ux',
          price: Math.round(price),
          active: Boolean(feat.active),
          description: feat.description ? String(feat.description).trim() : undefined,
          descriptionEn: feat.descriptionEn ? String(feat.descriptionEn).trim() : undefined,
          descriptionTk: feat.descriptionTk ? String(feat.descriptionTk).trim() : undefined,
          isCustom: Boolean(feat.isCustom),
        });
      }
      if (validFeatures.length > 0) {
        sanitized.features = validFeatures;
      }
    }
  }

  // 5. Validate External Costs
  if (raw.externalCosts !== undefined) {
    if (!Array.isArray(raw.externalCosts)) {
      errors.push('تنسيق التكاليف السحابية (externalCosts) غير صالح.');
    } else {
      const validCosts: ExternalCostItem[] = [];
      for (let i = 0; i < raw.externalCosts.length; i++) {
        const item = raw.externalCosts[i];
        if (!item || typeof item !== 'object' || !item.id || !item.name) {
          continue;
        }
        const cost = Number(item.cost);
        const commission = Number(item.commission);
        validCosts.push({
          id: String(item.id).trim(),
          name: String(item.name).trim(),
          nameEn: item.nameEn ? String(item.nameEn).trim() : undefined,
          nameTk: item.nameTk ? String(item.nameTk).trim() : undefined,
          provider: String(item.provider || '').trim(),
          cost: isNaN(cost) || cost < 0 ? 0 : Math.round(cost),
          commission: isNaN(commission) || commission < 0 ? 0 : Math.round(commission),
          billingPeriod: item.billingPeriod === 'monthly' || item.billingPeriod === 'one-time' ? item.billingPeriod : 'yearly',
        });
      }
      sanitized.externalCosts = validCosts;
    }
  }

  // 6. Validate Saved Quotes
  if (raw.savedQuotes !== undefined) {
    if (!Array.isArray(raw.savedQuotes)) {
      errors.push('تنسيق العروض المحفوظة (savedQuotes) غير صالح.');
    } else {
      const validQuotes: SavedQuote[] = [];
      for (const q of raw.savedQuotes) {
        if (!q || typeof q !== 'object' || !q.id) continue;
        validQuotes.push({
          id: String(q.id),
          clientName: String(q.clientName || 'عميل').trim(),
          companyName: String(q.companyName || '').trim(),
          projectTypeId: String(q.projectTypeId || 'factory_corp').trim(),
          createdAt: String(q.createdAt || new Date().toLocaleDateString()).trim(),
          totalEGP: Math.max(0, Number(q.totalEGP) || 0),
          featuresCount: Math.max(0, Number(q.featuresCount) || 0),
          client: q.client && typeof q.client === 'object' ? {
            name: String(q.client.name || '').trim(),
            company: String(q.client.company || '').trim(),
            phone: String(q.client.phone || '').trim(),
            projectTitle: String(q.client.projectTitle || '').trim(),
            notes: String(q.client.notes || '').trim(),
          } : undefined,
          features: Array.isArray(q.features) ? q.features : undefined,
          externalCosts: Array.isArray(q.externalCosts) ? q.externalCosts : undefined,
          deliveryDays: typeof q.deliveryDays === 'number' ? q.deliveryDays : undefined,
          currencyCode: VALID_CURRENCIES.includes(q.currencyCode) ? q.currencyCode : undefined,
          milestoneMode: VALID_MILESTONES.includes(q.milestoneMode) ? q.milestoneMode : undefined,
          projectBasePrice: typeof q.projectBasePrice === 'number' ? q.projectBasePrice : undefined,
        });
      }
      sanitized.savedQuotes = validQuotes;
    }
  }

  // 7. Validate Milestone Mode
  if (raw.milestoneMode !== undefined) {
    if (VALID_MILESTONES.includes(raw.milestoneMode)) {
      sanitized.milestoneMode = raw.milestoneMode;
    } else {
      errors.push(`قيمة نظام الدفعات "${raw.milestoneMode}" غير مدعومة.`);
    }
  }

  // 8. Validate Currency Code
  if (raw.currencyCode !== undefined) {
    if (VALID_CURRENCIES.includes(raw.currencyCode)) {
      sanitized.currencyCode = raw.currencyCode;
    } else {
      errors.push(`رمز العملة "${raw.currencyCode}" غير مدعوم. العملات المتاحة: EGP, SAR, USD, TRY.`);
    }
  }

  // 9. Validate Language
  if (raw.lang !== undefined) {
    if (VALID_LANGS.includes(raw.lang)) {
      sanitized.lang = raw.lang;
    } else {
      errors.push(`اللغة "${raw.lang}" غير مدعومة. اللغات المدعومة: ar, en, tk.`);
    }
  }

  if (raw.exportedAt) {
    sanitized.exportedAt = String(raw.exportedAt);
  }

  const hasKeys = Object.keys(sanitized).length > 0;
  if (!hasKeys && errors.length === 0) {
    errors.push('ملف النسخ الاحتياطي لا يحتوي على أي حقول مفهومة.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: sanitized,
  };
}
