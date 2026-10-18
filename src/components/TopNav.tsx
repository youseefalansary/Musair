import React from 'react';
import { CurrencyCode } from '../types/pricing';
import { Printer, FileText, MessageSquare, ShieldCheck, Sun, Moon, Settings } from 'lucide-react';
import { AppLanguage, TRANSLATIONS, LANGUAGES } from '../i18n/translations';

interface TopNavProps {
  currentTab: 'pricing' | 'proposal' | 'whatsapp' | 'negotiation' | 'settings';
  onSelectTab: (tab: 'pricing' | 'proposal' | 'whatsapp' | 'negotiation' | 'settings') => void;
  currency: CurrencyCode;
  onChangeCurrency: (c: CurrencyCode) => void;
  lang: AppLanguage;
  isDark: boolean;
  onToggleTheme: () => void;
  onReset: () => void;
  onPrintProposal: () => void;
  onOpenSettings: (section?: 'localization' | 'preferences' | 'agency' | 'ai' | 'contracts' | 'data') => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  currency,
  onChangeCurrency,
  lang,
  isDark,
  onToggleTheme,
  onPrintProposal,
  onOpenSettings,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

  const currenciesList: Array<{ code: CurrencyCode; flag: string; name: string }> = [
    { code: 'EGP', flag: '🇪🇬', name: 'ج.م' },
    { code: 'SAR', flag: '🇸🇦', name: 'ر.س' },
    { code: 'USD', flag: '🇺🇸', name: '$' },
    { code: 'TRY', flag: '🇹🇷', name: '₺' },
  ];

  return (
    <header className={`no-print border-b transition-colors ${isDark ? 'bg-neutral-900/90 border-neutral-800 text-neutral-100' : 'bg-stone-50 border-stone-200 text-stone-900'} sticky top-0 z-40 backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm tracking-wider ${isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-stone-900 text-stone-100'}`}>
            M
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight font-sans whitespace-nowrap">
              {t.appTitle} <span className="text-xs font-normal text-amber-500 font-mono-numbers">| {t.appSubtitle}</span>
            </span>
            <span className={`text-[10px] hidden sm:block ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>
              {t.appMarketNote}
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Single line, text with active underlines, zero pills) */}
        <nav className="flex items-center gap-1 sm:gap-3 text-xs font-medium overflow-x-auto py-1">
          <button
            onClick={() => onSelectTab('pricing')}
            className={`px-2.5 py-1.5 transition-all whitespace-nowrap border-b-2 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'pricing'
                ? isDark
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-stone-900 text-stone-950 font-bold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <span>{t.tabPricing}</span>
          </button>

          <button
            onClick={() => onSelectTab('proposal')}
            className={`px-2.5 py-1.5 transition-all whitespace-nowrap border-b-2 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'proposal'
                ? isDark
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-stone-900 text-stone-950 font-bold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.tabProposal}</span>
          </button>

          <button
            onClick={() => onSelectTab('whatsapp')}
            className={`px-2.5 py-1.5 transition-all whitespace-nowrap border-b-2 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'whatsapp'
                ? isDark
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-stone-900 text-stone-950 font-bold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t.tabWhatsApp}</span>
          </button>

          <button
            onClick={() => onSelectTab('negotiation')}
            className={`px-2.5 py-1.5 transition-all whitespace-nowrap border-b-2 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'negotiation'
                ? isDark
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-stone-900 text-stone-950 font-bold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.tabNegotiation}</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('settings');
              onOpenSettings();
            }}
            className={`px-2.5 py-1.5 transition-all whitespace-nowrap border-b-2 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'settings'
                ? isDark
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-stone-900 text-stone-950 font-bold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t.tabSettings}</span>
          </button>
        </nav>

        {/* Action Zone: Currency, Language Indicator, Theme, Print */}
        <div className="flex items-center gap-2">
          {/* Currency Switcher: EGP, SAR, USD, TRY */}
          <div className={`flex items-center text-xs rounded-md border p-0.5 ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-stone-200/60 border-stone-300'}`}>
            {currenciesList.map((cur) => (
              <button
                key={cur.code}
                type="button"
                onClick={() => onChangeCurrency(cur.code)}
                title={`${cur.code} (${cur.name})`}
                className={`px-2 py-0.5 rounded text-[11px] font-mono-numbers font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  currency === cur.code
                    ? isDark
                      ? 'bg-neutral-800 text-amber-400 shadow-sm font-bold'
                      : 'bg-white text-stone-900 shadow-sm font-bold'
                    : isDark
                    ? 'text-neutral-400 hover:text-neutral-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span className="text-[10px]">{cur.flag}</span>
                <span>{cur.code}</span>
              </button>
            ))}
          </div>

          {/* Active Language Badge */}
          <button
            type="button"
            onClick={() => onOpenSettings('localization')}
            title={`${t.activeLangLabel}: ${LANGUAGES[lang]?.name}`}
            className={`px-2 py-1 rounded-md text-[11px] font-bold border font-mono uppercase cursor-pointer transition-colors ${
              isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-amber-400' : 'bg-white border-stone-300 text-stone-700 hover:text-stone-950'
            }`}
          >
            {LANGUAGES[lang]?.flag} {lang.toUpperCase()}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-amber-400' : 'bg-white border-stone-300 text-stone-600 hover:text-stone-900'}`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Print Proposal CTA */}
          <button
            type="button"
            onClick={onPrintProposal}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              isDark
                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.printPdf}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
