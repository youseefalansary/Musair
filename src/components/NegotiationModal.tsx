import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle2, MessageCircle, AlertTriangle, Globe2 } from 'lucide-react';
import { CurrencyCode } from '../types/pricing';
import { getMarketData } from '../data/marketDefaults';
import { AppLanguage, TRANSLATIONS } from '../i18n/translations';

interface NegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  currencyCode?: CurrencyCode;
  lang: AppLanguage;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({
  isOpen,
  onClose,
  isDark,
  currencyCode = 'EGP',
  lang,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  // Guide display language (defaults to app language, with option to switch)
  const [guideLang, setGuideLang] = useState<AppLanguage>(lang);

  useEffect(() => {
    setGuideLang(lang);
  }, [lang]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const market = getMarketData(currencyCode);
  const playbook = market.objectionPlaybook;
  const tips = market.negotiationTips;

  // Localized getters for Playbook
  const getPriceTitle = () => {
    if (guideLang === 'tk') return playbook.priceObjectionTitleTk || playbook.priceObjectionTitle;
    if (guideLang === 'en') return playbook.priceObjectionTitleEn || playbook.priceObjectionTitle;
    return playbook.priceObjectionTitle;
  };

  const getPriceSub = () => {
    if (guideLang === 'tk') return playbook.priceObjectionSubtitleTk || playbook.priceObjectionSubtitle;
    if (guideLang === 'en') return playbook.priceObjectionSubtitleEn || playbook.priceObjectionSubtitle;
    return playbook.priceObjectionSubtitle;
  };

  const getPriceScript = () => {
    if (guideLang === 'tk') return playbook.priceObjectionScriptTk || playbook.priceObjectionScript;
    if (guideLang === 'en') return playbook.priceObjectionScriptEn || playbook.priceObjectionScript;
    return playbook.priceObjectionScript;
  };

  const getFutureTitle = () => {
    if (guideLang === 'tk') return playbook.futureWorkTrapTitleTk || playbook.futureWorkTrapTitle;
    if (guideLang === 'en') return playbook.futureWorkTrapTitleEn || playbook.futureWorkTrapTitle;
    return playbook.futureWorkTrapTitle;
  };

  const getFutureSub = () => {
    if (guideLang === 'tk') return playbook.futureWorkTrapSubtitleTk || playbook.futureWorkTrapSubtitle;
    if (guideLang === 'en') return playbook.futureWorkTrapSubtitleEn || playbook.futureWorkTrapSubtitle;
    return playbook.futureWorkTrapSubtitle;
  };

  const getFutureScript = () => {
    if (guideLang === 'tk') return playbook.futureWorkTrapScriptTk || playbook.futureWorkTrapScript;
    if (guideLang === 'en') return playbook.futureWorkTrapScriptEn || playbook.futureWorkTrapScript;
    return playbook.futureWorkTrapScript;
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-5 sm:p-6 transition-all ${
          isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-stone-300 text-stone-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-700/30 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>{t.negotiationModalTitle}:</span>
                <span className="text-amber-400 font-extrabold">{market.currency.marketName}</span>
                <span>{market.currency.flag}</span>
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {market.currency.countryName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 3-Language Toggle for Guide */}
            <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-[11px]">
              <button
                type="button"
                onClick={() => setGuideLang('ar')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                  guideLang === 'ar' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                عربي
              </button>
              <button
                type="button"
                onClick={() => setGuideLang('en')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                  guideLang === 'en' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setGuideLang('tk')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                  guideLang === 'tk' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                TR
              </button>
            </div>

            <button onClick={onClose} className="text-neutral-400 hover:text-white p-1 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tactical Playbook */}
        <div className="space-y-4 text-xs" dir={guideLang === 'ar' ? 'rtl' : 'ltr'}>
          {/* Objection 1: Price Objection */}
          <div
            className={`p-4 rounded-xl border ${
              isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'
            }`}
          >
            <h4 className="font-bold text-amber-500 flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{getPriceTitle()}</span>
            </h4>
            <p className={`leading-relaxed mb-2 ${isDark ? 'text-neutral-300' : 'text-stone-700'}`}>
              {getPriceSub()}:
            </p>
            <div
              className={`p-3 rounded-lg border font-mono text-[11px] leading-relaxed ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-stone-300 text-stone-800'
              }`}
            >
              {getPriceScript()}
            </div>
          </div>

          {/* Objection 2: Future Work Trap */}
          <div
            className={`p-4 rounded-xl border ${
              isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'
            }`}
          >
            <h4 className="font-bold text-blue-400 flex items-center gap-1.5 mb-1.5">
              <MessageCircle className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{getFutureTitle()}</span>
            </h4>
            <p className={`leading-relaxed mb-2 ${isDark ? 'text-neutral-300' : 'text-stone-700'}`}>
              {getFutureSub()}:
            </p>
            <div
              className={`p-3 rounded-lg border font-mono text-[11px] leading-relaxed ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-stone-300 text-stone-800'
              }`}
            >
              {getFutureScript()}
            </div>
          </div>

          {/* Pillars for this Market */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {tips.map((tip, idx) => {
              const tipTitle =
                guideLang === 'tk' ? tip.titleTk || tip.title : guideLang === 'en' ? tip.titleEn || tip.title : tip.title;
              const tipText =
                guideLang === 'tk' ? tip.textTk || tip.text : guideLang === 'en' ? tip.textEn || tip.text : tip.text;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${
                    isDark ? 'bg-neutral-950/40 border-neutral-800' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-neutral-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className={isDark ? 'text-white' : 'text-stone-900'}>{tipTitle}</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-neutral-400' : 'text-stone-600'}`}>
                    {tipText}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-700/30 mt-4">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <Globe2 className="w-3.5 h-3.5 text-amber-500" />
            <span>{market.currency.name} ({market.currency.symbol})</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors cursor-pointer"
          >
            {t.cancelBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
