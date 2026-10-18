import React, { useState } from 'react';
import {
  Building,
  Globe2,
  Languages,
  FileCheck2,
  Database,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
  Download,
  Upload,
  ExternalLink,
  ArrowRight,
  Copy,
  ClipboardCheck,
  Smartphone,
  Monitor,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { AgencyProfile, CurrencyCode, ProposalLanguage } from '../types/pricing';
import { AppLanguage, LANGUAGES, TRANSLATIONS } from '../i18n/translations';
import { copyToClipboard } from '../utils/clipboard';
import { PriceInput } from './PriceInput';

interface ContractSettings {
  revisionRounds: number;
  validityDays: number;
  warrantyDays: number;
  contentGraceDays: number;
}

interface SettingsPageProps {
  agency: AgencyProfile;
  onUpdateAgency: (updated: Partial<AgencyProfile>) => void;
  lang: AppLanguage;
  onChangeLanguage: (l: AppLanguage) => void;
  currency: CurrencyCode;
  onChangeCurrency: (c: CurrencyCode) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  milestoneMode: '40-30-30' | '50-50';
  onChangeMilestoneMode: (mode: '40-30-30' | '50-50') => void;
  defaultProposalLang?: ProposalLanguage;
  onChangeDefaultProposalLang?: (pl: ProposalLanguage) => void;
  initialSection?: 'localization' | 'preferences' | 'agency' | 'ai' | 'contracts' | 'data';
  onResetDefaults: () => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  onGetBackupJson?: () => string;
  onBackToPricing: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  agency,
  onUpdateAgency,
  lang,
  onChangeLanguage,
  currency,
  onChangeCurrency,
  isDark,
  onToggleTheme,
  milestoneMode,
  onChangeMilestoneMode,
  defaultProposalLang = 'ar',
  onChangeDefaultProposalLang,
  initialSection = 'localization',
  onResetDefaults,
  onExportData,
  onImportData,
  onGetBackupJson,
  onBackToPricing,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

  // Active settings section: 'localization' is a dedicated section now!
  const [activeSection, setActiveSection] = useState<'localization' | 'preferences' | 'agency' | 'ai' | 'contracts' | 'data'>(
    initialSection || 'localization'
  );

  // Local state for Gemini Key
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  // Backup states
  const [hasCopiedBackup, setHasCopiedBackup] = useState<boolean>(false);
  const [showPasteModal, setShowPasteModal] = useState<boolean>(false);
  const [pastedJson, setPastedJson] = useState<string>('');
  const [pasteError, setPasteError] = useState<string | null>(null);

  // Proposal default language
  const [clientDeliverablesLang, setClientDeliverablesLang] = useState<ProposalLanguage>(() => {
    const saved = localStorage.getItem('musair_proposal_lang');
    return (saved as ProposalLanguage) || defaultProposalLang || 'ar';
  });

  // Contract clauses settings
  const [contracts, setContracts] = useState<ContractSettings>(() => {
    const saved = localStorage.getItem('musair_contracts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { revisionRounds: 2, validityDays: 15, warrantyDays: 30, contentGraceDays: 3 };
      }
    }
    return { revisionRounds: 2, validityDays: 15, warrantyDays: 30, contentGraceDays: 3 };
  });

  const handleSaveAll = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    localStorage.setItem('musair_contracts', JSON.stringify(contracts));
    localStorage.setItem('musair_proposal_lang', clientDeliverablesLang);
    localStorage.setItem('musair_whatsapp_lang', clientDeliverablesLang);
    if (onChangeDefaultProposalLang) {
      onChangeDefaultProposalLang(clientDeliverablesLang);
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleTestApiKey = async () => {
    const key = apiKey.trim();
    if (!key) {
      setTestStatus('error');
      setTestMessage(lang === 'ar' ? 'يرجى إدخال مفتاح API أولاً' : lang === 'tk' ? 'Lütfen önce API anahtarı girin' : 'Please enter an API key');
      return;
    }
    setTestStatus('testing');
    setTestMessage(lang === 'ar' ? 'جاري اختبار الاتصال مع Gemini...' : lang === 'tk' ? 'Gemini bağlantısı test ediliyor...' : 'Testing connection to Gemini...');
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Ping test' }] }],
        }),
      });
      if (res.ok) {
        setTestStatus('success');
        setTestMessage(lang === 'ar' ? 'تم التحقق بنجاح! المفتاح سليم ويعمل.' : lang === 'tk' ? 'Bağlantı başarılı! API Anahtarı aktif.' : 'API Key is valid and connected!');
        localStorage.setItem('gemini_api_key', key);
      } else {
        const data = await res.json().catch(() => ({}));
        setTestStatus('error');
        setTestMessage(data?.error?.message || (lang === 'ar' ? 'فشل التحقق من المفتاح.' : 'Invalid API Key'));
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || 'Error');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportData(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSelectLanguage = (newLang: AppLanguage) => {
    onChangeLanguage(newLang);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header Bar */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToPricing}
            className={`p-2 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
              isDark ? 'bg-neutral-950 border-neutral-800 hover:text-amber-400' : 'bg-stone-50 border-stone-300 hover:text-stone-900'
            }`}
            title={t.backToPricingBtn}
          >
            <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t.settingsTitle}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-normal">
                {currency} • {lang.toUpperCase()}
              </span>
            </h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>
              {t.settingsDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 transition-colors shadow cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{t.saveSettingsBtn}</span>
          </button>

          <button
            type="button"
            onClick={onBackToPricing}
            className={`px-3 py-2 rounded-xl text-xs border font-medium transition-colors cursor-pointer ${
              isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white' : 'bg-stone-100 border-stone-300 text-stone-700'
            }`}
          >
            {t.backToPricingBtn}
          </button>
        </div>
      </div>

      {/* Saved Toast notice */}
      {savedNotice && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 animate-in fade-in shadow-lg">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{t.settingsSavedNotice}</span>
        </div>
      )}

      {/* Full Page Content: Left Sidebar Tabs (6 items) + Right Detailed Sections */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Sidebar (3 cols) */}
        <div className={`md:col-span-3 border rounded-2xl p-3 space-y-1.5 ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          {/* 1. Dedicated Language & Localization Tab */}
          <button
            type="button"
            onClick={() => setActiveSection('localization')}
            className={`w-full text-start p-3 rounded-xl font-medium flex items-center gap-3 transition-colors cursor-pointer ${
              activeSection === 'localization'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                  : 'bg-stone-900 text-white font-bold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <Languages className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="text-start">
              <span className="block text-xs font-bold">{t.secLocalization}</span>
              <span className="text-[10px] text-neutral-500">AR • EN • TK</span>
            </div>
          </button>

          {/* 2. Preferences & Currency Tab */}
          <button
            type="button"
            onClick={() => setActiveSection('preferences')}
            className={`w-full text-start p-3 rounded-xl font-medium flex items-center gap-3 transition-colors cursor-pointer ${
              activeSection === 'preferences'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                  : 'bg-stone-900 text-white font-bold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="text-start">
              <span className="block text-xs font-bold">{t.secPreferences}</span>
              <span className="text-[10px] text-neutral-500">EGP • SAR • USD • TRY</span>
            </div>
          </button>

          {/* 3. Agency & Banking Tab */}
          <button
            type="button"
            onClick={() => setActiveSection('agency')}
            className={`w-full text-start p-3 rounded-xl font-medium flex items-center gap-3 transition-colors cursor-pointer ${
              activeSection === 'agency'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                  : 'bg-stone-900 text-white font-bold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <Building className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="text-start">
              <span className="block text-xs font-bold">{t.secAgency}</span>
              <span className="text-[10px] text-neutral-500">الحسابات والآيبان البنكي</span>
            </div>
          </button>

          {/* 4. AI Gemini Tab */}
          <button
            type="button"
            onClick={() => setActiveSection('ai')}
            className={`w-full text-start p-3 rounded-xl font-medium flex items-center gap-3 transition-colors cursor-pointer ${
              activeSection === 'ai'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                  : 'bg-stone-900 text-white font-bold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="text-start">
              <span className="block text-xs font-bold">{t.secAi}</span>
              <span className="text-[10px] text-neutral-500">مفتاح API وموديل 2.5 Flash</span>
            </div>
          </button>

          {/* 5. Contracts & SLA Tab */}
          <button
            type="button"
            onClick={() => setActiveSection('contracts')}
            className={`w-full text-start p-3 rounded-xl font-medium flex items-center gap-3 transition-colors cursor-pointer ${
              activeSection === 'contracts'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                  : 'bg-stone-900 text-white font-bold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="text-start">
              <span className="block text-xs font-bold">{t.secContracts}</span>
              <span className="text-[10px] text-neutral-500">أيام الضمان وجولات المراجعة</span>
            </div>
          </button>

          {/* 6. Data Management Tab */}
          <button
            type="button"
            onClick={() => setActiveSection('data')}
            className={`w-full text-start p-3 rounded-xl font-medium flex items-center gap-3 transition-colors cursor-pointer ${
              activeSection === 'data'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                  : 'bg-stone-900 text-white font-bold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <Database className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="text-start">
              <span className="block text-xs font-bold">{t.secData}</span>
              <span className="text-[10px] text-neutral-500">تصدير واستيراد وسحب النسخ</span>
            </div>
          </button>
        </div>

        {/* Detailed Content Panel (9 cols) */}
        <div className={`md:col-span-9 border rounded-2xl p-6 sm:p-8 ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          
          {/* SECTION 1: Dedicated Language & Localization Section */}
          {activeSection === 'localization' && (
            <div className="space-y-6">
              <div className="border-b pb-3 border-neutral-700/40">
                <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <Languages className="w-5 h-5 text-amber-500" />
                  <span>{t.localizationSectionTitle}</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  {t.localizationSectionDesc}
                </p>
              </div>

              {/* Separation of Concerns Banner */}
              <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                isDark ? 'bg-neutral-950/70 border-neutral-800 text-neutral-300' : 'bg-stone-50 border-stone-300 text-stone-800'
              }`}>
                <div className="flex items-center gap-2 mb-1.5 font-bold text-amber-400">
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{t.independenceNoticeTitle}</span>
                </div>
                <p className="text-[11px] mb-3 opacity-90">
                  {t.independenceNoticeBody}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                  <span className={`px-2.5 py-1 rounded-lg border ${
                    isDark ? 'bg-neutral-900 border-neutral-700 text-amber-300' : 'bg-white border-stone-300 text-stone-900 font-semibold'
                  }`}>
                    UI Interface: <strong>{lang.toUpperCase()} ({LANGUAGES[lang]?.name})</strong>
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg border ${
                    isDark ? 'bg-neutral-900 border-neutral-700 text-blue-300' : 'bg-white border-stone-300 text-stone-900 font-semibold'
                  }`}>
                    Client Proposal: <strong>{clientDeliverablesLang.toUpperCase()}</strong>
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg border ${
                    isDark ? 'bg-neutral-900 border-neutral-700 text-emerald-300' : 'bg-white border-stone-300 text-stone-900 font-semibold'
                  }`}>
                    Pricing Currency: <strong>{currency}</strong>
                  </span>
                </div>
              </div>

              {/* Card 1: Global UI Interface Language (AR, EN, TK) */}
              <div className={`p-5 rounded-xl border space-y-3 ${
                isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center justify-between">
                    <span>{t.globalUiLangTitle}</span>
                    <span className="text-[11px] text-amber-400 font-mono font-semibold">
                      {t.activeLangBadge}: {LANGUAGES[lang]?.name}
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {t.globalUiLangDesc}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                  {[
                    { code: 'ar' as AppLanguage, flag: '🇪🇬', name: 'العربية', native: 'Arabic (العربية)', dir: 'RTL (من اليمين لليسار)' },
                    { code: 'en' as AppLanguage, flag: '🇺🇸', name: 'English', native: 'English (US/Global)', dir: 'LTR (Left-to-Right)' },
                    { code: 'tk' as AppLanguage, flag: '🇹🇷', name: 'Türkçe', native: 'Türkçe (Türkiye)', dir: 'LTR (Soldan Sağa)' },
                  ].map((lItem) => {
                    const isSelected = lang === lItem.code;
                    return (
                      <div
                        key={lItem.code}
                        onClick={() => handleSelectLanguage(lItem.code)}
                        className={`p-4 rounded-xl border text-start transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? isDark
                              ? 'bg-neutral-900 border-amber-500 ring-2 ring-amber-500/30'
                              : 'bg-white border-stone-900 ring-2 ring-stone-900/10'
                            : isDark
                            ? 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                            : 'bg-white border-stone-300 hover:border-stone-400'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl">{lItem.flag}</span>
                          {isSelected ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-neutral-950">
                              {t.activeLangBadge}
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-neutral-700"></span>
                          )}
                        </div>

                        <div>
                          <span className={`text-sm font-extrabold block ${
                            isSelected ? (isDark ? 'text-amber-400' : 'text-stone-900') : (isDark ? 'text-neutral-200' : 'text-stone-800')
                          }`}>
                            {lItem.name}
                          </span>
                          <span className="text-[11px] text-neutral-400 block mt-0.5 font-medium">
                            {lItem.native}
                          </span>
                          <span className="text-[10px] text-neutral-500 block mt-1 font-mono">
                            {lItem.dir}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 2: Client Deliverables Language (Separate Configuration) */}
              <div className={`p-5 rounded-xl border space-y-3 ${
                isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center justify-between">
                    <span>{t.clientProposalLangTitle}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
                      Independent
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {t.clientProposalLangDesc}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {[
                    { code: 'ar' as ProposalLanguage, flag: '🇪🇬', label: 'العربية (وثيقة رسمية)' },
                    { code: 'en' as ProposalLanguage, flag: '🇺🇸', label: 'English (International)' },
                    { code: 'tk' as ProposalLanguage, flag: '🇹🇷', label: 'Türkçe (Resmi Teklif)' },
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setClientDeliverablesLang(item.code);
                        localStorage.setItem('musair_proposal_lang', item.code);
                        localStorage.setItem('musair_whatsapp_lang', item.code);
                        if (onChangeDefaultProposalLang) onChangeDefaultProposalLang(item.code);
                        setSavedNotice(true);
                        setTimeout(() => setSavedNotice(false), 2000);
                      }}
                      className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                        clientDeliverablesLang === item.code
                          ? isDark
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold ring-1 ring-amber-500/40'
                            : 'bg-stone-900 text-white font-bold'
                          : isDark
                          ? 'border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                          : 'border-stone-300 text-stone-600 hover:border-stone-400 hover:text-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{item.flag}</span>
                        <span className="font-bold text-xs">{item.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Currency & Market Preferences */}
          {activeSection === 'preferences' && (
            <div className="space-y-6">
              <div className="border-b pb-3 border-neutral-700/40">
                <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span>{t.secPreferences}</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  ضبط سوق العملة المعتمد لتقدير التكاليف وحساب الهوامش، ونظام الدفعات والمظهر
                </p>
              </div>

              {/* Decoupling banner */}
              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <p className="font-bold flex items-center gap-1.5">
                  <span>ℹ️</span>
                  <span>{t.currencyDecoupledNotice}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* 1. Currency & Market System (4 Currencies including TRY) */}
                <div className={`p-4 rounded-xl border sm:col-span-2 ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                  <label className="block font-bold text-neutral-200 mb-2">
                    {t.currencyMarketTitle}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { code: 'EGP' as CurrencyCode, flag: '🇪🇬', title: 'مصر (EGP)', symbol: 'ج.م' },
                      { code: 'SAR' as CurrencyCode, flag: '🇸🇦', title: 'السعودية (SAR)', symbol: 'ر.س' },
                      { code: 'USD' as CurrencyCode, flag: '🇺🇸', title: 'الدولي (USD)', symbol: '$' },
                      { code: 'TRY' as CurrencyCode, flag: '🇹🇷', title: 'تركيا (TRY)', symbol: '₺' },
                    ].map((m) => (
                      <button
                        key={m.code}
                        type="button"
                        onClick={() => onChangeCurrency(m.code)}
                        className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                          currency === m.code
                            ? isDark
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold ring-1 ring-amber-500/40'
                              : 'bg-stone-900 text-white font-bold'
                            : isDark
                            ? 'border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                            : 'border-stone-300 text-stone-600 hover:border-stone-400 hover:text-stone-900'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-base">{m.flag}</span>
                          <span className="font-mono text-xs font-bold">{m.code}</span>
                        </div>
                        <span className="text-[11px] block font-semibold">{m.title}</span>
                        <span className="text-[10px] block opacity-75 font-mono">{m.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Mode */}
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                  <label className="block font-bold text-neutral-200 mb-2">{t.themeTitle}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { if (!isDark) onToggleTheme(); }}
                      className={`p-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                        isDark ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold' : 'border-neutral-700 text-neutral-400'
                      }`}
                    >
                      Dark (داكن)
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (isDark) onToggleTheme(); }}
                      className={`p-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                        !isDark ? 'bg-stone-900 text-white font-bold border-stone-900' : 'border-neutral-700 text-neutral-400'
                      }`}
                    >
                      Light (فاتح)
                    </button>
                  </div>
                </div>

                {/* Milestones Default */}
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                  <label className="block font-bold text-neutral-200 mb-2">{t.milestonesTitle}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onChangeMilestoneMode('40-30-30')}
                      className={`p-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                        milestoneMode === '40-30-30' ? isDark ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold' : 'bg-stone-900 text-white' : 'border-neutral-700 text-neutral-400'
                      }`}
                    >
                      40% / 30% / 30%
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeMilestoneMode('50-50')}
                      className={`p-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                        milestoneMode === '50-50' ? isDark ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold' : 'bg-stone-900 text-white' : 'border-neutral-700 text-neutral-400'
                      }`}
                    >
                      50% / 50%
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Agency & Payment Accounts */}
          {activeSection === 'agency' && (
            <div className="space-y-6">
              <div className="border-b pb-3 border-neutral-700/40">
                <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>{t.secAgency}</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  تظهر هذه البيانات في ترويسة وتذييل وثيقة العرض الرسمي (PDF) ورسائل الواتساب
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">{t.agencyNameLabel}</label>
                  <input
                    type="text"
                    value={agency.name}
                    onChange={(e) => onUpdateAgency({ name: e.target.value })}
                    placeholder="e.g. CodeOne Studio"
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white focus:border-amber-500' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">{t.agencyTaglineLabel}</label>
                  <input
                    type="text"
                    value={agency.tagline}
                    onChange={(e) => onUpdateAgency({ tagline: e.target.value })}
                    placeholder="e.g. High Performance Web & Cloud Architecture"
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white focus:border-amber-500' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">{t.agencyPhoneLabel}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={agency.phone}
                    onChange={(e) => onUpdateAgency({ phone: e.target.value })}
                    placeholder="+90 555... / 01000..."
                    className={`w-full px-3.5 py-2 rounded-xl border font-mono focus:outline-none ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white focus:border-amber-500' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">{t.agencyEmailLabel}</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={agency.email}
                    onChange={(e) => onUpdateAgency({ email: e.target.value })}
                    placeholder="contact@studio.com"
                    className={`w-full px-3.5 py-2 rounded-xl border font-mono focus:outline-none ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white focus:border-amber-500' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-neutral-400 mb-1 font-medium">{t.agencyLocationLabel}</label>
                  <input
                    type="text"
                    value={agency.location}
                    onChange={(e) => onUpdateAgency({ location: e.target.value })}
                    placeholder="e.g. Istanbul, Türkiye / Cairo, Egypt / San Francisco"
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white focus:border-amber-500' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              {/* Multi-Market Payment Accounts */}
              <div className="pt-4 border-t border-neutral-700/40 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                    <span>{t.paymentChannelsTitle}</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {t.paymentChannelsDesc}
                  </p>
                </div>

                {/* 1. Turkish Channels (TRY) */}
                <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                  <span className="text-xs font-bold text-amber-500 block">🇹🇷 {t.tryChannelsTitle}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">{t.tryBankLabel}</label>
                      <input
                        type="text"
                        value={agency.tryBankName || ''}
                        onChange={(e) => onUpdateAgency({ tryBankName: e.target.value })}
                        placeholder="Garanti BBVA / Türkiye İş Bankası"
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">{t.tryIbanLabel}</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={agency.tryIban || ''}
                        onChange={(e) => onUpdateAgency({ tryIban: e.target.value })}
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                        className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">{t.paparaFastLabel}</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={agency.paparaOrFast || ''}
                        onChange={(e) => onUpdateAgency({ paparaOrFast: e.target.value })}
                        placeholder="FAST / Kolay Adres"
                        className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">{t.tryTaxOfficeLabel}</label>
                      <input
                        type="text"
                        value={agency.tryTaxOffice || ''}
                        onChange={(e) => onUpdateAgency({ tryTaxOffice: e.target.value })}
                        placeholder="Kadıköy Vergi Dairesi"
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">{t.tryTaxNumberLabel}</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={agency.tryTaxNumber || ''}
                        onChange={(e) => onUpdateAgency({ tryTaxNumber: e.target.value })}
                        placeholder="1234567890"
                        className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Egyptian Channels (EGP) */}
                <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                  <span className="text-xs font-bold text-amber-500 block">🇪🇬 {t.egpChannelsTitle}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">عنوان الدفع (InstaPay):</label>
                      <input
                        type="text"
                        value={agency.instapayHandle || ''}
                        onChange={(e) => onUpdateAgency({ instapayHandle: e.target.value })}
                        placeholder="username@instapay"
                        className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">محافظ إلكترونية (فودافون كاش):</label>
                      <input
                        type="text"
                        value={agency.vodafoneCash || ''}
                        onChange={(e) => onUpdateAgency({ vodafoneCash: e.target.value })}
                        placeholder="010xxxxxxxx"
                        className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">الحساب البنكي (CIB/NBE):</label>
                      <input
                        type="text"
                        value={agency.bankAccount || ''}
                        onChange={(e) => onUpdateAgency({ bankAccount: e.target.value })}
                        placeholder="CIB / NBE - رقم الحساب..."
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Saudi & Gulf Channels (SAR) */}
                <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                  <span className="text-xs font-bold text-amber-500 block">🇸🇦 {t.sarChannelsTitle}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">البنك السعودي:</label>
                      <input
                        type="text"
                        value={agency.sarBankName || ''}
                        onChange={(e) => onUpdateAgency({ sarBankName: e.target.value })}
                        placeholder="الراجحي / الأهلي SNB"
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">الآيبان البنكي (IBAN):</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={agency.sarIban || ''}
                        onChange={(e) => onUpdateAgency({ sarIban: e.target.value })}
                        placeholder="SA0380000000000000000000"
                        className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">محفظة STC Pay / سريع:</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={agency.stcPayHandle || ''}
                        onChange={(e) => onUpdateAgency({ stcPayHandle: e.target.value })}
                        placeholder="05xxxxxxxx"
                        className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Global Channels (USD) */}
                <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                  <span className="text-xs font-bold text-amber-500 block">🇺🇸 {t.usdChannelsTitle}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">International Wire / Routing:</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={agency.intlWireAccount || ''}
                        onChange={(e) => onUpdateAgency({ intlWireAccount: e.target.value })}
                        placeholder="Routing / Account Number"
                        className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">SWIFT / BIC Code:</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={agency.swiftBic || ''}
                        onChange={(e) => onUpdateAgency({ swiftBic: e.target.value })}
                        placeholder="CHASUS33"
                        className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">Stripe / PayPal / Wise:</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={agency.paypalOrStripe || ''}
                        onChange={(e) => onUpdateAgency({ paypalOrStripe: e.target.value })}
                        placeholder="payments@studio.com"
                        className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Gemini AI Configuration */}
          {activeSection === 'ai' && (
            <div className="space-y-6">
              <div className="border-b pb-3 border-neutral-700/40">
                <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{t.secAi}</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  ربط مفتاح Google Gemini API لتشغيل ميزة استخراج التسعير التلقائي من محادثات العملاء
                </p>
              </div>

              <div className={`p-5 rounded-xl border space-y-4 ${
                isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <div>
                  <label className="block text-xs font-bold text-neutral-200 mb-2">
                    {t.geminiKeyLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={t.geminiKeyPlaceholder}
                      className={`w-full pr-3 pl-10 py-2.5 rounded-xl border text-xs font-mono focus:outline-none ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute left-3 top-3 text-neutral-400 hover:text-white cursor-pointer"
                      title={showKey ? 'إخفاء' : 'إظهار'}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestApiKey}
                      disabled={testStatus === 'testing'}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-neutral-900 hover:bg-neutral-800 text-amber-400 border-neutral-700'
                          : 'bg-white hover:bg-stone-100 text-stone-900 border-stone-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{testStatus === 'testing' ? t.analyzing : 'اختبار الاتصال'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem('gemini_api_key', apiKey.trim());
                        setSavedNotice(true);
                        setTimeout(() => setSavedNotice(false), 2000);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors cursor-pointer"
                    >
                      {t.saveKey}
                    </button>
                  </div>

                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-500 hover:underline flex items-center gap-1.5 text-xs font-medium"
                  >
                    <span>الحصول على مفتاح مجاني من Google AI Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {testMessage && (
                  <div className={`p-3 rounded-xl border text-xs ${
                    testStatus === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : testStatus === 'error'
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                  }`}>
                    {testMessage}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: Contract Terms (SLA) */}
          {activeSection === 'contracts' && (
            <div className="space-y-6">
              <div className="border-b pb-3 border-neutral-700/40">
                <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4" />
                  <span>{t.secContracts}</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  البنود الافتراضية لفترات الضمان والمراجعات التي تظهر في وثائق العروض الرسمية
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                  <label className="block text-neutral-300 font-bold mb-1.5">عدد جولات المراجعة والتعديل:</label>
                  <div className="flex items-center gap-2">
                    <PriceInput
                      min={1}
                      max={10}
                      value={contracts.revisionRounds}
                      onChange={(val) => setContracts({ ...contracts, revisionRounds: val || 1 })}
                      className={`w-20 px-3 py-1.5 rounded-lg border font-mono font-bold focus:outline-none ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                    <span className="text-neutral-400">جولات (المعتمد: 2-3)</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                  <label className="block text-neutral-300 font-bold mb-1.5">مدة الضمان الفني المجاني:</label>
                  <div className="flex items-center gap-2">
                    <PriceInput
                      min={7}
                      max={180}
                      value={contracts.warrantyDays}
                      onChange={(val) => setContracts({ ...contracts, warrantyDays: val || 30 })}
                      className={`w-20 px-3 py-1.5 rounded-lg border font-mono font-bold focus:outline-none ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                    <span className="text-neutral-400">يوماً بعد الإطلاق</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                  <label className="block text-neutral-300 font-bold mb-1.5">فترة صلاحية العرض المالي:</label>
                  <div className="flex items-center gap-2">
                    <PriceInput
                      min={1}
                      max={90}
                      value={contracts.validityDays}
                      onChange={(val) => setContracts({ ...contracts, validityDays: val || 15 })}
                      className={`w-20 px-3 py-1.5 rounded-lg border font-mono font-bold focus:outline-none ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                    <span className="text-neutral-400">يوماً من تاريخ الإصدار</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                  <label className="block text-neutral-300 font-bold mb-1.5">مهلة تسليم العميل للمواد والمحتوى:</label>
                  <div className="flex items-center gap-2">
                    <PriceInput
                      min={1}
                      max={30}
                      value={contracts.contentGraceDays}
                      onChange={(val) => setContracts({ ...contracts, contentGraceDays: val || 3 })}
                      className={`w-20 px-3 py-1.5 rounded-lg border font-mono font-bold focus:outline-none ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                    <span className="text-neutral-400">أيام عمل</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: Data & Backup */}
          {activeSection === 'data' && (
            <div className="space-y-6">
              <div className="border-b pb-3 border-neutral-700/40">
                <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>{t.secData}</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  تصدير وحفظ واسترجاع كافة الأسعار والمشاريع والعروض المحفوظة
                </p>
              </div>

              {/* APK & Desktop readiness */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Smartphone className="w-4 h-4" />
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">متوافق 100% مع تطبيقات الموبايل والديسكتوب والويب</span>
                    <span className="text-[11px] opacity-80 block">يعمل بدون خادم خارجي مع حفظ فوري لكافة التعديلات محلياً.</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Export Options */}
                <div className={`p-5 rounded-xl border space-y-3 ${
                  isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <h4 className="font-bold text-neutral-200 text-sm">تصدير نسخة احتياطية:</h4>
                  <p className="text-[11px] text-neutral-400">
                    تنزيل ملف JSON كامل يحتوي على كل الإعدادات والأسعار والمشاريع المحفوظة
                  </p>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={onExportData}
                      className="px-3.5 py-2 rounded-xl font-bold bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>تنزيل ملف JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const jsonStr = onGetBackupJson ? onGetBackupJson() : '';
                        if (jsonStr) {
                          const success = await copyToClipboard(jsonStr);
                          if (success) {
                            setHasCopiedBackup(true);
                            setTimeout(() => setHasCopiedBackup(false), 2500);
                          }
                        }
                      }}
                      className={`px-3.5 py-2 rounded-xl font-bold border flex items-center gap-2 transition-colors cursor-pointer ${
                        hasCopiedBackup
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                      }`}
                    >
                      {hasCopiedBackup ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{hasCopiedBackup ? 'تم النسخ!' : 'نسخ نص JSON'}</span>
                    </button>
                  </div>
                </div>

                {/* Import Options */}
                <div className={`p-5 rounded-xl border space-y-3 ${
                  isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <h4 className="font-bold text-neutral-200 text-sm">استيراد نسخة احتياطية:</h4>
                  <p className="text-[11px] text-neutral-400">
                    استرجاع بياناتك السابقة عبر رفع ملف JSON أو لصق النص المنسوخ
                  </p>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>رفع ملف JSON</span>
                      <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasteModal(!showPasteModal);
                        setPasteError(null);
                      }}
                      className="px-3.5 py-2 rounded-xl font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>لصق كود JSON مباشرة</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Paste JSON Modal */}
              {showPasteModal && (
                <div className={`p-4 rounded-xl border space-y-3 animate-in fade-in duration-200 ${
                  isDark ? 'bg-neutral-950 border-amber-500/40' : 'bg-stone-50 border-stone-300'
                }`}>
                  <label className="block text-xs font-bold text-neutral-200">
                    الصق نص JSON للنسخة الاحتياطية هنا:
                  </label>
                  <textarea
                    rows={4}
                    value={pastedJson}
                    onChange={(e) => {
                      setPastedJson(e.target.value);
                      setPasteError(null);
                    }}
                    placeholder='{"agency": {...}, "projectTypes": [...]}'
                    className={`w-full p-3 rounded-xl border text-xs font-mono focus:outline-none ${
                      isDark ? 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900'
                    }`}
                  />
                  {pasteError && (
                    <p className="text-rose-400 text-xs font-semibold">{pasteError}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!pastedJson.trim()) {
                          setPasteError('يرجى لصق نص JSON أولاً.');
                          return;
                        }
                        try {
                          onImportData(pastedJson);
                          setShowPasteModal(false);
                          setPastedJson('');
                        } catch (err: any) {
                          setPasteError('خطأ أثناء معالجة بيانات JSON.');
                        }
                      }}
                      className="px-4 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs transition-colors cursor-pointer"
                    >
                      استيراد وتطبيق البيانات
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasteModal(false)}
                      className="px-3 py-2 rounded-xl text-neutral-400 hover:text-white text-xs cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Factory Reset */}
              <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-950/20 text-xs space-y-3 mt-4">
                <h4 className="font-bold text-rose-400 text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>استعادة أسعار وباقات المصنع الافتراضية:</span>
                </h4>
                <p className="text-neutral-400 text-xs">
                  يقوم هذا الخيار بإعادة ضبط كافة أسعار المشاريع والمزايا للقيم الافتراضية المعتمدة للسوق النشط.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('هل أنت متأكد من رغبتك في استعادة الإعدادات والأسعار الافتراضية؟')) {
                      onResetDefaults();
                    }
                  }}
                  className="px-4 py-2 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                >
                  استعادة الافتراضيات الآن
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
