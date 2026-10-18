export type CurrencyCode = 'EGP' | 'SAR' | 'USD' | 'TRY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  countryName: string;
  marketName: string;
  flag: string;
  rateAgainstEgp: number; // reference rate e.g. 1 for EGP, 0.076 for SAR, 0.020 for USD, 0.95 for TRY
}

export type ProposalLanguage = 'ar' | 'en' | 'tk';

export type FeatureCategory = 'core' | 'ux' | 'commerce' | 'integrations' | 'admin' | 'seo';

export interface ProjectType {
  id: string;
  name: string;
  nameEn?: string;
  nameTk?: string;
  tagline: string;
  taglineEn?: string;
  taglineTk?: string;
  basePrice: number; // in native active currency
  typicalDays: number;
  recommendedStack: string;
  description: string;
  descriptionEn?: string;
  descriptionTk?: string;
  defaultFeatures: string[]; // Feature IDs
}

export interface FeatureItem {
  id: string;
  name: string;
  nameEn?: string;
  nameTk?: string;
  category: FeatureCategory;
  price: number; // in native active currency
  active: boolean;
  description?: string;
  descriptionEn?: string;
  descriptionTk?: string;
  isCustom?: boolean;
}

export interface ExternalCostItem {
  id: string;
  name: string;
  nameEn?: string;
  nameTk?: string;
  provider: string;
  cost: number; // Actual out-of-pocket cost in native active currency
  commission: number; // Developer setup & management fee in native active currency
  billingPeriod: 'yearly' | 'monthly' | 'one-time';
}

export interface PaymentMilestone {
  label: string;
  percentage: number;
  description: string;
}

export interface AgencyProfile {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  location: string;
  taxNumber?: string;
  // Egyptian Payment Channels
  instapayHandle?: string;
  bankAccount?: string;
  vodafoneCash?: string;
  // Saudi / Gulf Payment Channels
  sarBankName?: string;
  sarIban?: string;
  stcPayHandle?: string;
  zatcaTaxNumber?: string;
  commercialReg?: string;
  // International / Global Channels
  intlWireAccount?: string;
  swiftBic?: string;
  paypalOrStripe?: string;
  // Turkish Payment Channels (TRY)
  tryBankName?: string;
  tryIban?: string;
  tryTaxOffice?: string;
  tryTaxNumber?: string;
  paparaOrFast?: string;
}

export interface ClientProfile {
  name: string;
  company: string;
  phone: string;
  projectTitle: string;
  notes: string;
}

export interface MarketContractConfig {
  governingLaw: string;
  governingLawEn?: string;
  governingLawTk?: string;
  taxTitle: string;
  defaultTaxRatePercent: number;
  validityDays: number;
  warrantyDays: number;
  revisionRounds: number;
  guaranteePoints: string[];
  guaranteePointsEn?: string[];
  guaranteePointsTk?: string[];
}

export interface MarketObjectionPlaybook {
  priceObjectionTitle: string;
  priceObjectionSubtitle: string;
  priceObjectionScript: string;
  futureWorkTrapTitle: string;
  futureWorkTrapSubtitle: string;
  futureWorkTrapScript: string;
  // Localized variants for English and Turkish view
  priceObjectionTitleEn?: string;
  priceObjectionSubtitleEn?: string;
  priceObjectionScriptEn?: string;
  futureWorkTrapTitleEn?: string;
  futureWorkTrapSubtitleEn?: string;
  futureWorkTrapScriptEn?: string;
  priceObjectionTitleTk?: string;
  priceObjectionSubtitleTk?: string;
  priceObjectionScriptTk?: string;
  futureWorkTrapTitleTk?: string;
  futureWorkTrapSubtitleTk?: string;
  futureWorkTrapScriptTk?: string;
}

export interface MarketData {
  currency: CurrencyConfig;
  projectTypes: ProjectType[];
  features: FeatureItem[];
  externalCosts: ExternalCostItem[];
  defaultAgency: AgencyProfile;
  contractConfig: MarketContractConfig;
  negotiationTips: Array<{
    title: string;
    text: string;
    titleEn?: string;
    textEn?: string;
    titleTk?: string;
    textTk?: string;
  }>;
  objectionPlaybook: MarketObjectionPlaybook;
}

export interface SavedQuote {
  id: string;
  clientName: string;
  companyName: string;
  projectTypeId: string;
  createdAt: string;
  totalEGP: number;
  featuresCount: number;
  // Full fidelity snapshot fields
  client?: ClientProfile;
  features?: FeatureItem[];
  externalCosts?: ExternalCostItem[];
  deliveryDays?: number;
  currencyCode?: CurrencyCode;
  milestoneMode?: '40-30-30' | '50-50';
  projectBasePrice?: number;
}
