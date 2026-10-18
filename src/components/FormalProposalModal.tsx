import React, { useState, useEffect } from 'react';
import {
  ProjectType,
  FeatureItem,
  ExternalCostItem,
  CurrencyConfig,
  ClientProfile,
  AgencyProfile,
  ProposalLanguage,
} from '../types/pricing';
import { Printer, X, Check, Copy, ArrowRight, Settings, ShieldCheck, Building2 } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import { getMarketData } from '../data/marketDefaults';
import { AppLanguage, TRANSLATIONS } from '../i18n/translations';

interface FormalProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectType: ProjectType;
  features: FeatureItem[];
  externalCosts: ExternalCostItem[];
  currency: CurrencyConfig;
  client: ClientProfile;
  agency: AgencyProfile;
  deliveryDays: number;
  milestoneMode: '40-30-30' | '50-50';
  lang: AppLanguage;
  isDark: boolean;
  defaultProposalLang?: ProposalLanguage;
  onOpenSettings?: () => void;
}

export const FormalProposalModal: React.FC<FormalProposalModalProps> = ({
  isOpen,
  onClose,
  projectType,
  features,
  externalCosts,
  currency,
  client,
  agency,
  deliveryDays,
  milestoneMode,
  lang,
  isDark,
  defaultProposalLang,
  onOpenSettings,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const [copiedToast, setCopiedToast] = useState(false);

  // Proposal Language for client: Arabic, English, or Turkish
  const [proposalLang, setProposalLang] = useState<ProposalLanguage>(() => {
    const saved = localStorage.getItem('musair_proposal_lang');
    if (saved === 'en' || saved === 'tk' || saved === 'ar') return saved as ProposalLanguage;
    return defaultProposalLang || 'ar';
  });

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const market = getMarketData(currency.code);
  const activeFeatures = features.filter((f) => f.active);
  const basePrice = projectType.basePrice;
  const featuresTotal = activeFeatures.reduce((acc, f) => acc + f.price, 0);
  const externalTotal = externalCosts.reduce((acc, i) => acc + i.cost + i.commission, 0);
  const grandTotal = basePrice + featuresTotal + externalTotal;

  // Milestones
  const depositPercent = milestoneMode === '40-30-30' ? 0.40 : 0.50;
  const depositAmount = Math.round(grandTotal * depositPercent);
  const midAmount = milestoneMode === '40-30-30' ? Math.round(grandTotal * 0.30) : 0;
  const finalPercent = milestoneMode === '40-30-30' ? 0.30 : 0.50;
  const finalAmount = Math.round(grandTotal * finalPercent);

  const isArabic = proposalLang === 'ar';
  const isTurkish = proposalLang === 'tk';

  const todayStrAr = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const todayStrEn = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const todayStrTk = new Date().toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const quoteNumber = `QUO-${currency.code}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = async () => {
    const area = document.getElementById('proposalPrintArea');
    if (area) {
      const text = area.innerText;
      const success = await copyToClipboard(text);
      if (success) {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2500);
      }
    }
  };

  const handleToggleProposalLang = (newLang: ProposalLanguage) => {
    setProposalLang(newLang);
    localStorage.setItem('musair_proposal_lang', newLang);
  };

  // Localized getters for Project Type and Features inside proposal
  const getProjName = () => {
    if (isTurkish) return projectType.nameTk || projectType.nameEn || projectType.name;
    if (!isArabic) return projectType.nameEn || projectType.name;
    return projectType.name;
  };

  const getProjDesc = () => {
    if (isTurkish) return projectType.descriptionTk || projectType.descriptionEn || projectType.description;
    if (!isArabic) return projectType.descriptionEn || projectType.description;
    return projectType.description;
  };

  const getFeatureName = (f: FeatureItem) => {
    if (isTurkish) return f.nameTk || f.nameEn || f.name;
    if (!isArabic) return f.nameEn || f.name;
    return f.name;
  };

  const getFeatureDesc = (f: FeatureItem) => {
    if (isTurkish) return f.descriptionTk || f.descriptionEn || f.description || 'Onaylanmış teknik modül';
    if (!isArabic) return f.descriptionEn || f.description || 'Standard verified feature module';
    return f.description || 'ميزة برمجية معتمدة';
  };

  const getExternalName = (item: ExternalCostItem) => {
    if (isTurkish) return item.nameTk || item.nameEn || item.name;
    if (!isArabic) return item.nameEn || item.name;
    return item.name;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Floating Exit Button */}
      <button
        type="button"
        onClick={onClose}
        className="no-print fixed top-3 left-3 sm:top-4 sm:left-4 z-[80] bg-neutral-900/95 hover:bg-red-600 text-white border border-neutral-700 hover:border-red-500 px-3 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold backdrop-blur-md transition-all cursor-pointer ring-1 ring-white/10"
        title="Esc"
      >
        <X className="w-4 h-4" />
        <span className="hidden sm:inline">{t.cancelBtn}</span>
      </button>

      {/* Sticky Top Control Bar (Hidden on print) */}
      <div className="no-print flex-shrink-0 w-full z-30 flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md">
        
        {/* Return Button & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-lg ring-2 ring-amber-400/50 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            <span>{t.backToPricingBtn}</span>
            <kbd className="hidden md:inline bg-neutral-900/20 px-1.5 py-0.5 rounded text-[10px] font-mono">Esc</kbd>
          </button>
          <span className="text-neutral-700 hidden sm:inline">|</span>
          <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-bold">{t.proposalModalTitle}</span>
            <span className="text-amber-400 font-mono font-bold text-xs">
              ({market.currency.marketName})
            </span>
          </div>
        </div>

        {/* Client Proposal Document Language Selector & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Explicit 3-Way Proposal Language Toggle */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700/80 p-1 rounded-xl text-xs">
            <span className="text-[11px] text-neutral-400 font-medium px-1.5 hidden sm:inline">
              {t.proposalClientLangSelector}
            </span>
            <button
              type="button"
              onClick={() => handleToggleProposalLang('ar')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                proposalLang === 'ar'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="العرض باللغة العربية"
            >
              <span>🇪🇬</span>
              <span>عربي</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleProposalLang('en')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                proposalLang === 'en'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Proposal in English"
            >
              <span>🇺🇸</span>
              <span>English</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleProposalLang('tk')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                proposalLang === 'tk'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Türkçe Resmi Teklif"
            >
              <span>🇹🇷</span>
              <span>Türkçe</span>
            </button>
          </div>

          {onOpenSettings && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="text-xs text-neutral-400 hover:text-amber-400 hidden xl:flex items-center gap-1 font-medium px-2 py-1 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{t.tabSettings}</span>
            </button>
          )}

          {/* Copy Text Button */}
          <button
            type="button"
            onClick={handleCopyText}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-white cursor-pointer"
          >
            {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copiedToast ? t.copiedSuccess : 'Copy Text'}</span>
          </button>

          {/* Print / PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 transition-colors shadow cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printPdf}</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Printable Document Container */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 flex justify-center bg-black/40"
      >
        <div
          id="proposalPrintArea"
          dir={isArabic ? 'rtl' : 'ltr'}
          className={`w-full max-w-4xl text-neutral-900 bg-white font-sans selection:bg-amber-100 rounded-2xl shadow-2xl p-6 sm:p-10 my-2 print-card ${
            isArabic ? 'text-right' : 'text-left'
          }`}
        >
          {/* Header Row: Agency Info & Quote Reference */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-neutral-900 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 bg-amber-500 rounded-sm inline-block"></span>
                <span className="text-xl font-black tracking-tight text-neutral-950">{agency.name}</span>
              </div>
              <p className="text-xs text-neutral-600 font-medium">{agency.tagline}</p>
              <div className="text-[11px] text-neutral-500 mt-2 space-y-0.5">
                <p>
                  {isTurkish ? 'Telefon / WhatsApp: ' : isArabic ? 'الهاتف / واتساب: ' : 'Phone / WhatsApp: '}
                  <span dir="ltr">{agency.phone}</span> | {isTurkish ? 'E-posta: ' : isArabic ? 'البريد: ' : 'Email: '}{agency.email}
                </p>
                <p>{agency.location}</p>

                {/* Country / Market specific IDs */}
                {currency.code === 'SAR' && agency.zatcaTaxNumber && (
                  <p className="font-mono text-[10px] text-neutral-600">
                    {isArabic ? 'الرقم الضريبي (ZATCA): ' : 'Tax Number (ZATCA): '}{agency.zatcaTaxNumber} {agency.commercialReg ? `| CR: ${agency.commercialReg}` : ''}
                  </p>
                )}
                {currency.code === 'TRY' && (agency.tryTaxNumber || agency.tryTaxOffice) && (
                  <p className="font-mono text-[10px] text-neutral-600">
                    {isTurkish ? 'Vergi Bilgileri: ' : isArabic ? 'البيانات الضريبية: ' : 'Tax Details: '}
                    {agency.tryTaxOffice ? `${agency.tryTaxOffice} ` : ''}{agency.tryTaxNumber ? `(VKN: ${agency.tryTaxNumber})` : ''}
                  </p>
                )}
              </div>
            </div>

            <div className={`text-xs text-neutral-700 space-y-1 ${isArabic ? 'sm:text-left' : 'sm:text-right'}`}>
              <div className="bg-neutral-100 px-3 py-1.5 rounded font-mono font-bold text-neutral-900 inline-block">
                {quoteNumber}
              </div>
              <p className="text-[11px] text-neutral-500">
                {isTurkish ? `Düzenleme Tarihi: ${todayStrTk}` : isArabic ? `تاريخ الإصدار: ${todayStrAr}` : `Date of Issuance: ${todayStrEn}`}
              </p>
              <p className="text-[11px] text-neutral-500 font-medium">
                {isTurkish
                  ? `Geçerlilik: ${market.contractConfig.validityDays} Takvim Günü`
                  : isArabic
                  ? `صلاحية العرض: ${market.contractConfig.validityDays} يوماً`
                  : `Validity: ${market.contractConfig.validityDays} Calendar Days`}
              </p>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                {market.currency.countryName}
              </div>
            </div>
          </div>

          {/* Client Recipient Box */}
          <div className="my-6 p-4 rounded-xl bg-neutral-50 border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider mb-0.5">
                {isTurkish ? 'Muhatap / Müşteri:' : isArabic ? 'مقدم إلى:' : 'Prepared For:'}
              </span>
              <p className="font-extrabold text-sm text-neutral-900">
                {client.name || (isTurkish ? 'Sayın Müşteri' : isArabic ? 'عميلنا العزيز' : 'Valued Client')}
              </p>
              {client.company && <p className="text-neutral-700 font-medium">{client.company}</p>}
              {client.phone && <p className="text-neutral-500 text-[11px] mt-0.5 font-mono" dir="ltr">{client.phone}</p>}
            </div>

            <div className={isArabic ? 'sm:text-left' : 'sm:text-right'}>
              <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider mb-0.5">
                {isTurkish ? 'Proje Spesifikasyonu:' : isArabic ? 'المواصفات المطلوبة:' : 'Project Specification:'}
              </span>
              <p className="font-bold text-neutral-900 text-sm">
                {getProjName()}
              </p>
              <p className="text-[11px] text-neutral-600 mt-0.5">
                {isTurkish
                  ? `Teslimat Süresi: Yaklaşık ${deliveryDays} iş günü`
                  : isArabic
                  ? `مدة التسليم: ${deliveryDays} أيام عمل`
                  : `Estimated Delivery: ${deliveryDays} business days`}
              </p>
            </div>
          </div>

          {/* Scope & Features Table */}
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 mb-2 border-b pb-1">
              {isTurkish
                ? '1. Teslim Edilecek Modüller ve Teknik Özellikler:'
                : isArabic
                ? '1. نطاق العمل والمخرجات المشمولة بالعرض:'
                : '1. Technical Deliverables & Specifications Included:'}
            </h3>
            <table className={`w-full text-xs border-collapse ${isArabic ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300 text-neutral-700">
                  <th className="py-2 px-3 font-bold w-12 text-center">#</th>
                  <th className="py-2 px-3 font-bold">
                    {isTurkish ? 'Modül / Özellik' : isArabic ? 'البند والميزة' : 'Deliverable & Module'}
                  </th>
                  <th className="py-2 px-3 font-bold">
                    {isTurkish ? 'Teknik Kapsam ve Detay' : isArabic ? 'المواصفات الفنية المعتمدة' : 'Technical Scope & Details'}
                  </th>
                  <th className="py-2 px-3 font-bold text-center">
                    {isTurkish ? 'Durum' : isArabic ? 'الحالة' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr className="bg-white">
                  <td className="py-2.5 px-3 font-mono text-center text-neutral-500">01</td>
                  <td className="py-2.5 px-3 font-bold text-neutral-900">
                    {getProjName()}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600 text-[11px]">
                    {getProjDesc()}
                  </td>
                  <td className="py-2.5 px-3 text-center text-emerald-700 font-bold text-[11px]">
                    {isTurkish ? 'Temel Mimari' : isArabic ? 'أساسي مشمول' : 'Core Included'}
                  </td>
                </tr>

                {activeFeatures.map((feat, idx) => (
                  <tr key={feat.id} className={idx % 2 === 0 ? 'bg-neutral-50/50' : 'bg-white'}>
                    <td className="py-2.5 px-3 font-mono text-center text-neutral-500">
                      {(idx + 2).toString().padStart(2, '0')}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-neutral-900">
                      {getFeatureName(feat)}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 text-[11px]">
                      {getFeatureDesc(feat)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-emerald-700 font-bold text-[11px]">
                      {isTurkish ? 'Dahil' : isArabic ? 'مشمول' : 'Included'}
                    </td>
                  </tr>
                ))}

                {externalCosts.map((ext, idx) => (
                  <tr key={ext.id} className="bg-amber-50/30">
                    <td className="py-2.5 px-3 font-mono text-center text-neutral-500">
                      {(activeFeatures.length + idx + 2).toString().padStart(2, '0')}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-neutral-900">
                      {getExternalName(ext)}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 text-[11px]">
                      {ext.provider} ({ext.billingPeriod === 'yearly' ? (isTurkish ? 'Yıllık Abonelik' : isArabic ? 'اشتراك سنوي' : 'Annual') : (isTurkish ? 'Aylık' : isArabic ? 'شهري' : 'Monthly')})
                    </td>
                    <td className="py-2.5 px-3 text-center text-emerald-700 font-bold text-[11px]">
                      {isTurkish ? 'Dahil' : isArabic ? 'مشمول' : 'Included'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary & Payment Milestones Box */}
          <div className="mb-6 p-4 rounded-xl border-2 border-neutral-900 bg-neutral-950 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-neutral-800 gap-2">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  {isTurkish
                    ? '2. Toplam Sabit Sözleşme Yatırımı:'
                    : isArabic
                    ? '2. إجمالي الاستثمار المالي للعقد:'
                    : '2. Total Fixed Contract Investment:'}
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono-numbers text-white">
                  {isArabic
                    ? `${grandTotal.toLocaleString()} ${currency.symbol}`
                    : `${currency.symbol}${grandTotal.toLocaleString()}`}
                </span>
              </div>
              <span className="text-xs text-neutral-400">
                {isTurkish
                  ? 'Tüm yazılım, tasarım, bulut kurulumu ve garanti süresi dahildir'
                  : isArabic
                  ? 'شامل كافة مراحل البرمجة والتصميم وتجهيز السيرفر والضمان'
                  : 'All-inclusive investment covering programming, infrastructure & warranty'}
              </span>
            </div>

            {/* Milestones */}
            <div className="mt-3 space-y-1.5 text-xs">
              <span className="font-bold text-neutral-300 block mb-1">
                {isTurkish ? 'Sözleşmeye Bağlı Ödeme Planı:' : isArabic ? 'جدول الدفعات المعتمد:' : 'Contractual Payment Schedule:'}
              </span>
              <p className="text-amber-400 font-bold font-mono">
                {isTurkish
                  ? `1. Başlangıç ve Bulut Kurulum Kaporası (%${Math.round(depositPercent * 100)}): ${depositAmount.toLocaleString()} ${currency.symbol}`
                  : isArabic
                  ? `1. دفعة البداية وتأمين البنية (%${Math.round(depositPercent * 100)}): ${depositAmount.toLocaleString()} ${currency.symbol}`
                  : `1. Project Kickoff & Setup Deposit (%${Math.round(depositPercent * 100)}): ${currency.symbol}${depositAmount.toLocaleString()}`}
              </p>
              {milestoneMode === '40-30-30' && (
                <p className="text-neutral-300 font-mono text-[11px]">
                  {isTurkish
                    ? `2. Beta Test ve Ön İnceleme Aşaması (%30): ${midAmount.toLocaleString()} ${currency.symbol}`
                    : isArabic
                    ? `2. دفعة المراجعة والتسليم الأولي (30%): ${midAmount.toLocaleString()} ${currency.symbol}`
                    : `2. Staging Demo Review Milestone (30%): ${currency.symbol}${midAmount.toLocaleString()}`}
                </p>
              )}
              <p className="text-neutral-300 font-mono text-[11px]">
                {isTurkish
                  ? `${milestoneMode === '40-30-30' ? '3' : '2'}. Canlıya Alma ve Nihai Onay Kalan Bakiye: ${finalAmount.toLocaleString()} ${currency.symbol}`
                  : isArabic
                  ? `${milestoneMode === '40-30-30' ? '3' : '2'}. الدفعة الختامية عند الإطلاق الحي: ${finalAmount.toLocaleString()} ${currency.symbol}`
                  : `${milestoneMode === '40-30-30' ? '3' : '2'}. Final Milestone upon Client Approval & Live Cutover: ${currency.symbol}${finalAmount.toLocaleString()}`}
              </p>
            </div>
          </div>

          {/* Payment Channels tailored to the market */}
          <div className="mb-6 p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/80 text-xs">
            <span className="font-bold text-neutral-900 block mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {isTurkish
                  ? `Kabul Edilen Ödeme Kanalları (${market.currency.countryName}):`
                  : isArabic
                  ? `قنوات الدفع والتحويل المعتمدة (${market.currency.countryName}):`
                  : `Accepted Payment Rails (${market.currency.countryName}):`}
              </span>
            </span>

            {/* Turkish Market (TRY) Payment Methods */}
            {currency.code === 'TRY' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-neutral-700">
                <div>
                  <span className="text-neutral-500 block">
                    {isTurkish ? 'Banka Havalesi / TR IBAN:' : isArabic ? 'التحويل البنكي (TR IBAN):' : 'Bank Wire / TR IBAN:'}
                  </span>
                  <span className="font-mono font-bold text-neutral-900 block">{agency.tryIban || 'TR00 0006 2000 0000 0000 0000 00'}</span>
                  <span className="text-[10px] text-neutral-500">{agency.tryBankName || 'Garanti BBVA / İş Bankası'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">
                    {isTurkish ? 'FAST / Kolay Adres:' : isArabic ? 'التحويل السريع FAST:' : 'FAST / Instant Transfer:'}
                  </span>
                  <span className="font-mono font-bold text-neutral-900 block">{agency.paparaOrFast || agency.email}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">
                    {isTurkish ? 'Online Kredi Kartı:' : isArabic ? 'الدفع الإلكتروني:' : 'Online Card Checkout:'}
                  </span>
                  <span className="text-emerald-700 font-bold block">İyzico & PayTR (3D Secure)</span>
                </div>
              </div>
            )}

            {/* Saudi Arabia (SAR) Payment Methods */}
            {currency.code === 'SAR' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-neutral-700">
                <div>
                  <span className="text-neutral-500 block">
                    {isTurkish ? 'Banka Havalesi / IBAN:' : isArabic ? 'الحساب البنكي (IBAN):' : 'Bank Wire / IBAN:'}
                  </span>
                  <span className="font-mono font-bold text-neutral-900 block">{agency.sarIban || 'SA0380000000000000000000'}</span>
                  <span className="text-[10px] text-neutral-500">{agency.sarBankName || 'مصرف الراجحي'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">
                    {isTurkish ? 'STC Pay / Sarie:' : isArabic ? 'STC Pay / محفظة فورية:' : 'STC Pay / Sarie:'}
                  </span>
                  <span className="font-mono font-bold text-neutral-900 block">{agency.stcPayHandle || agency.phone}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">
                    {isTurkish ? 'Online Ödeme:' : isArabic ? 'الدفع الإلكتروني:' : 'Online Checkout:'}
                  </span>
                  <span className="text-emerald-700 font-bold block">بطاقات مدى (Mada) & Apple Pay</span>
                </div>
              </div>
            )}

            {/* Global / USD Payment Methods */}
            {currency.code === 'USD' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-neutral-700">
                <div>
                  <span className="text-neutral-500 block">
                    {isTurkish ? 'Uluslararası Havale (Wire):' : isArabic ? 'التحويل البنكي الدولي (Wire Transfer):' : 'International Wire Transfer:'}
                  </span>
                  <span className="font-mono font-bold text-neutral-900 block">{agency.intlWireAccount || 'Routing: 121000358 | Account: 987654321'}</span>
                  {agency.swiftBic && <span className="text-[10px] text-neutral-500">SWIFT/BIC: {agency.swiftBic}</span>}
                </div>
                <div>
                  <span className="text-neutral-500 block">
                    {isTurkish ? 'Stripe Ödeme:' : isArabic ? 'الدفع الإلكتروني (Stripe):' : 'Stripe Online Checkout:'}
                  </span>
                  <span className="font-mono font-bold text-neutral-900 block">{agency.paypalOrStripe || 'Cards & Apple Pay Checkout'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">
                    {isTurkish ? 'PayPal / Wise:' : isArabic ? 'حساب (PayPal / Wise):' : 'PayPal / Wise Business:'}
                  </span>
                  <span className="font-mono text-neutral-900 block">{agency.email}</span>
                </div>
              </div>
            )}

            {/* Egyptian Market (EGP) Payment Methods */}
            {currency.code === 'EGP' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-neutral-700">
                {agency.instapayHandle && (
                  <div>
                    <span className="text-neutral-500 block">
                      {isTurkish ? 'InstaPay Hesabı:' : isArabic ? 'عنوان الدفع اللحظي (InstaPay):' : 'InstaPay Handle:'}
                    </span>
                    <span className="font-mono font-bold text-neutral-900">{agency.instapayHandle}</span>
                  </div>
                )}
                {agency.vodafoneCash && (
                  <div>
                    <span className="text-neutral-500 block">
                      {isTurkish ? 'Mobil Cüzdan:' : isArabic ? 'المحافظ الإلكترونية:' : 'Vodafone Cash & Mobile Wallets:'}
                    </span>
                    <span className="font-mono font-bold text-neutral-900">{agency.vodafoneCash}</span>
                  </div>
                )}
                {agency.bankAccount && (
                  <div>
                    <span className="text-neutral-500 block">
                      {isTurkish ? 'Banka Hesabı:' : isArabic ? 'الحساب البنكي:' : 'Egyptian Bank Account:'}
                    </span>
                    <span className="text-neutral-900 font-medium">{agency.bankAccount}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contract Terms & SLA Guarantees */}
          <div className="mb-8 text-[11px] text-neutral-600 space-y-1.5 border-t pt-4 border-neutral-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {isTurkish
                    ? `Hizmet Seviyesi Taahhütleri (${market.contractConfig.governingLawTk || market.contractConfig.governingLaw}):`
                    : isArabic
                    ? `شروط وضمانات التعاقد (${market.contractConfig.governingLaw}):`
                    : `SLA Guarantees & Terms (${market.contractConfig.governingLawEn || market.contractConfig.governingLaw}):`}
                </span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                {isTurkish
                  ? `Sertifikalı Garanti: ${market.contractConfig.warrantyDays} Gün`
                  : isArabic
                  ? `ضمان معتمد: ${market.contractConfig.warrantyDays} يوماً`
                  : `Certified Warranty: ${market.contractConfig.warrantyDays} Days`}
              </span>
            </div>

            {isTurkish ? (
              (market.contractConfig.guaranteePointsTk || [
                'Nihai ödeme tamamlandığında tüm kaynak kodlar ve alan adı mülkiyeti müşteriye devredilir.',
                `Canlı yayına alma sonrasında ${market.contractConfig.warrantyDays} takvim günü boyunca sertifikalı teknik garanti.`,
                'Ödeme altyapısı canlıya alınmadan önce test ortamında doğrulanır.',
                'Kapsam dışı ek talepler yazılı bir Değişiklik Talebi (Change Request) ile fiyatlandırılır.',
                `Bu teklif düzenleme tarihinden itibaren ${market.contractConfig.validityDays} gün boyunca geçerlidir.`,
              ]).map((point, pIdx) => <p key={pIdx}>• {point}</p>)
            ) : isArabic ? (
              market.contractConfig.guaranteePoints.map((point, pIdx) => (
                <p key={pIdx}>• {point}</p>
              ))
            ) : (
              (market.contractConfig.guaranteePointsEn || [
                'Full intellectual property rights and repository code ownership transfer to client upon final milestone clearance.',
                `Includes ${market.contractConfig.warrantyDays} calendar days of certified post-launch warranty covering bug fixes and maintenance.`,
                'All transactions and payment gateways tested in dedicated sandbox environment prior to live deployment.',
                'Written change requests required for any feature additions outside the specified scope of work.',
                `Proposal valid for ${market.contractConfig.validityDays} calendar days from date of issuance.`,
              ]).map((point, pIdx) => <p key={pIdx}>• {point}</p>)
            )}
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end pt-6 border-t-2 border-neutral-900 text-xs">
            <div>
              <p className="font-bold text-neutral-900">
                {isTurkish ? 'Hizmet Veren (Geliştirici / Stüdyo):' : isArabic ? 'الطرف الأول (الجهة المنفذة):' : 'Party A (Developer / Studio):'}
              </p>
              <p className="text-neutral-600 mt-1">{agency.name}</p>
              <div className="w-32 border-b border-dashed border-neutral-400 mt-8"></div>
            </div>
            <div className={isArabic ? 'text-left' : 'text-right'}>
              <p className="font-bold text-neutral-900">
                {isTurkish ? 'Hizmet Alan (Müşteri / Yetkili İmza):' : isArabic ? 'الطرف الثاني (العميل أو المفوض):' : 'Party B (Client / Authorized Representative):'}
              </p>
              <p className="text-neutral-600 mt-1">
                {client.name || (isTurkish ? 'Yetkili İmza' : isArabic ? 'المفوض بالتوقيع' : 'Authorized Signatory')}
              </p>
              <div className={`w-32 border-b border-dashed border-neutral-400 mt-8 ${isArabic ? 'mr-auto' : 'ml-auto'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Footer (Hidden on print) */}
      <div className="no-print flex-shrink-0 w-full z-30 flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-md shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-lg cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
          <span>{t.backToPricingBtn}</span>
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-white cursor-pointer"
          >
            {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedToast ? t.copiedSuccess : 'Copy Text'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-2 transition-colors shadow-lg cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printPdf}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
