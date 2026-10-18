import React, { useState, useEffect } from 'react';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { ProjectType, FeatureItem, CurrencyConfig, ClientProfile, AgencyProfile } from '../types/pricing';
import { X, Copy, ExternalLink, Check, MessageSquare } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import { AppLanguage, TRANSLATIONS } from '../i18n/translations';
import { generateWhatsAppMessage, WhatsAppTone } from '../utils/whatsappGenerator';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectType: ProjectType;
  features: FeatureItem[];
  grandTotal: number;
  depositAmount: number;
  deliveryDays: number;
  currency: CurrencyConfig;
  client: ClientProfile;
  agency: AgencyProfile;
  lang: AppLanguage;
  isDark: boolean;
  defaultMessageLang?: AppLanguage;
  onCopySuccess: () => void;
  hasCopied: boolean;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  projectType,
  features,
  grandTotal,
  depositAmount,
  deliveryDays,
  currency,
  client,
  agency,
  lang,
  isDark,
  defaultMessageLang,
  onCopySuccess,
  hasCopied,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

  // Client message language: Arabic, English, or Turkish
  const [messageLang, setMessageLang] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('musair_whatsapp_lang');
    if (saved === 'en' || saved === 'tk' || saved === 'ar') return saved as AppLanguage;
    return defaultMessageLang || 'ar';
  });

  const [tone, setTone] = useState<WhatsAppTone>('formal');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const messageContent = generateWhatsAppMessage({
    projectType,
    features,
    grandTotal,
    depositAmount,
    deliveryDays,
    currency,
    client,
    agency,
    lang: messageLang,
    tone,
  });

  const handleOpenWhatsAppWeb = async () => {
    let cleanPhone = client.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('01')) {
      cleanPhone = '2' + cleanPhone; // Egypt country code
    } else if (cleanPhone.startsWith('05')) {
      cleanPhone = '966' + cleanPhone.substring(1); // Saudi country code
    } else if (cleanPhone.startsWith('05') && currency.code === 'TRY') {
      cleanPhone = '90' + cleanPhone.substring(1); // Turkey country code
    }

    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageContent)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(messageContent)}`;

    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url });
      return;
    }

    const win = window.open(url, '_blank');
    if ((!win || win.closed || typeof win.closed === 'undefined') && !navigator.userAgent.includes('Electron')) {
      window.location.href = url;
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(messageContent);
    if (success) {
      onCopySuccess();
    }
  };

  const handleToggleLang = (targetLang: AppLanguage) => {
    setMessageLang(targetLang);
    localStorage.setItem('musair_whatsapp_lang', targetLang);
  };

  const toneLabels: Record<WhatsAppTone, string> = {
    formal: t.toneFormal,
    friendly: t.toneFriendly,
    value: t.toneValue,
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl p-5 sm:p-6 transition-all my-4 ${
        isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-stone-300 text-stone-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-700/30 mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold">
              {t.whatsAppModalTitle} ({currency.symbol} {currency.marketName})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Esc"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Message Language Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl border bg-neutral-950/60 border-neutral-800 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-300">{t.whatsAppClientLangSelector}</span>
            <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-700">
              <button
                type="button"
                onClick={() => handleToggleLang('ar')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  messageLang === 'ar'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>🇪🇬</span>
                <span>عربي</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleLang('en')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  messageLang === 'en'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>🇺🇸</span>
                <span>English</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleLang('tk')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  messageLang === 'tk'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>🇹🇷</span>
                <span>Türkçe</span>
              </button>
            </div>
          </div>

          <span className="text-[11px] text-amber-400 font-mono">
            {currency.code} ({currency.symbol})
          </span>
        </div>

        {/* Tone Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg border mb-4 text-xs overflow-x-auto bg-neutral-950/40 border-neutral-800">
          {(['formal', 'friendly', 'value'] as WhatsAppTone[]).map((toneKey) => (
            <button
              key={toneKey}
              type="button"
              onClick={() => setTone(toneKey)}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                tone === toneKey
                  ? isDark ? 'bg-neutral-800 text-amber-400 font-bold' : 'bg-stone-900 text-white font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {toneLabels[toneKey]}
            </button>
          ))}
        </div>

        {/* Message Preview Textarea */}
        <div className="relative mb-4">
          <textarea
            readOnly
            value={messageContent}
            rows={12}
            dir={messageLang === 'ar' ? 'rtl' : 'ltr'}
            className={`w-full p-4 rounded-xl border text-xs font-sans leading-relaxed focus:outline-none resize-none ${
              isDark
                ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                : 'bg-stone-50 border-stone-300 text-stone-900'
            }`}
          />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-700/30">
          <span className="text-[11px] text-neutral-400">
            {client.phone ? `${t.clientPhone}: ${client.phone}` : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                hasCopied
                  ? 'bg-emerald-600 text-white'
                  : isDark
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300'
              }`}
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{t.copiedSuccess}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.copyMessageBtn}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsAppWeb}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t.openWhatsAppWebBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
