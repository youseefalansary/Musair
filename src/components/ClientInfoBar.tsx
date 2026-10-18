import React from 'react';
import { ClientProfile } from '../types/pricing';
import { User, Building, Phone, Clock, FileSpreadsheet } from 'lucide-react';
import { AppLanguage, TRANSLATIONS } from '../i18n/translations';
import { PriceInput } from './PriceInput';

interface ClientInfoBarProps {
  client: ClientProfile;
  onChangeClient: (updated: Partial<ClientProfile>) => void;
  deliveryDays: number;
  onChangeDeliveryDays: (days: number) => void;
  lang: AppLanguage;
  isDark: boolean;
  onOpenSavedQuotes: () => void;
}

export const ClientInfoBar: React.FC<ClientInfoBarProps> = ({
  client,
  onChangeClient,
  deliveryDays,
  onChangeDeliveryDays,
  lang,
  isDark,
  onOpenSavedQuotes,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

  return (
    <div
      className={`border rounded-xl p-4 transition-colors ${
        isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-stone-200 shadow-sm'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b pb-2.5 border-dashed border-neutral-700/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {t.clientDataTitle}
          </span>
          <span className="text-neutral-500 text-xs">|</span>
          <span className="text-xs text-neutral-400">{t.clientDataDesc}</span>
        </div>
        <button
          type="button"
          onClick={onOpenSavedQuotes}
          className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
            isDark
              ? 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-amber-500/50 hover:text-amber-300'
              : 'bg-stone-100 border-stone-300 text-stone-700 hover:border-stone-400 hover:text-stone-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>{t.savedQuotesBtn}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Client Name */}
        <div>
          <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-600'}`}>
            {t.clientName}
          </label>
          <div className="relative">
            <User className={`w-3.5 h-3.5 absolute ${lang === 'ar' ? 'right-2.5' : 'left-2.5'} top-2.5 pointer-events-none ${isDark ? 'text-neutral-500' : 'text-stone-400'}`} />
            <input
              type="text"
              value={client.name}
              onChange={(e) => onChangeClient({ name: e.target.value })}
              placeholder={t.clientNamePlaceholder}
              className={`w-full ${lang === 'ar' ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${
                isDark
                  ? 'bg-neutral-950 border-neutral-800 text-neutral-100 focus:border-amber-500 focus:ring-amber-500/30'
                  : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-600 focus:ring-stone-400/20'
              }`}
            />
          </div>
        </div>

        {/* Company / Business */}
        <div>
          <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-600'}`}>
            {t.clientCompany}
          </label>
          <div className="relative">
            <Building className={`w-3.5 h-3.5 absolute ${lang === 'ar' ? 'right-2.5' : 'left-2.5'} top-2.5 pointer-events-none ${isDark ? 'text-neutral-500' : 'text-stone-400'}`} />
            <input
              type="text"
              value={client.company}
              onChange={(e) => onChangeClient({ company: e.target.value })}
              placeholder={t.clientCompanyPlaceholder}
              className={`w-full ${lang === 'ar' ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${
                isDark
                  ? 'bg-neutral-950 border-neutral-800 text-neutral-100 focus:border-amber-500 focus:ring-amber-500/30'
                  : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-600 focus:ring-stone-400/20'
              }`}
            />
          </div>
        </div>

        {/* Mobile / WhatsApp */}
        <div>
          <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-600'}`}>
            {t.clientPhone}
          </label>
          <div className="relative">
            <Phone className={`w-3.5 h-3.5 absolute ${lang === 'ar' ? 'right-2.5' : 'left-2.5'} top-2.5 pointer-events-none ${isDark ? 'text-neutral-500' : 'text-stone-400'}`} />
            <input
              type="text"
              dir="ltr"
              value={client.phone}
              onChange={(e) => onChangeClient({ phone: e.target.value })}
              placeholder="01012345678 / +90 555..."
              className={`w-full ${lang === 'ar' ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-1.5 rounded-lg border text-xs font-mono-numbers focus:outline-none focus:ring-1 ${
                isDark
                  ? 'bg-neutral-950 border-neutral-800 text-neutral-100 focus:border-amber-500 focus:ring-amber-500/30'
                  : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-600 focus:ring-stone-400/20'
              }`}
            />
          </div>
        </div>

        {/* Delivery Duration */}
        <div>
          <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-neutral-400' : 'text-stone-600'}`}>
            {t.deliveryDays}
          </label>
          <div className="relative">
            <Clock className={`w-3.5 h-3.5 absolute ${lang === 'ar' ? 'right-2.5' : 'left-2.5'} top-2.5 pointer-events-none ${isDark ? 'text-neutral-500' : 'text-stone-400'}`} />
            <div className="flex items-center gap-1.5">
              <PriceInput
                min={1}
                max={90}
                value={deliveryDays}
                onChange={(val) => onChangeDeliveryDays(val || 1)}
                className={`w-full ${lang === 'ar' ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-1.5 rounded-lg border text-xs font-mono-numbers focus:outline-none focus:ring-1 ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-100 focus:border-amber-500 focus:ring-amber-500/30'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-600 focus:ring-stone-400/20'
                }`}
              />
              <span className={`text-[11px] whitespace-nowrap ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>{t.daysUnit}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
