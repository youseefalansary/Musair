import React from 'react';
import { ProjectType, CurrencyConfig } from '../types/pricing';
import { Check, Code2, Clock } from 'lucide-react';
import { PriceInput } from './PriceInput';
import { AppLanguage, TRANSLATIONS } from '../i18n/translations';

interface ProjectTypeCardsProps {
  projectTypes: ProjectType[];
  selectedId: string;
  onSelect: (id: string) => void;
  currency: CurrencyConfig;
  onUpdateBasePrice: (id: string, newPrice: number) => void;
  lang: AppLanguage;
  isDark: boolean;
}

export const ProjectTypeCards: React.FC<ProjectTypeCardsProps> = ({
  projectTypes,
  selectedId,
  onSelect,
  currency,
  onUpdateBasePrice,
  lang,
  isDark,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

  return (
    <section className={`border rounded-xl p-5 transition-colors ${isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-stone-200 shadow-sm'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b pb-3 border-dashed border-neutral-700/40">
        <div>
          <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {t.projectTypeSectionTitle}
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>
            {t.projectTypeSectionDesc}
          </p>
        </div>
        <div className={`text-xs ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>
          <span>{t.baseCurrencyLabel}</span>{' '}
          <span className="font-bold text-amber-500 font-mono-numbers">{currency.name} ({currency.symbol})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {projectTypes.map((pt) => {
          const isSelected = pt.id === selectedId;
          const localizedName =
            lang === 'tk'
              ? pt.nameTk || pt.nameEn || pt.name
              : lang === 'en'
              ? pt.nameEn || pt.name
              : pt.name;

          const localizedTagline =
            lang === 'tk'
              ? pt.taglineTk || pt.taglineEn || pt.tagline
              : lang === 'en'
              ? pt.taglineEn || pt.tagline
              : pt.tagline;

          const localizedDesc =
            lang === 'tk'
              ? pt.descriptionTk || pt.descriptionEn || pt.description
              : lang === 'en'
              ? pt.descriptionEn || pt.description
              : pt.description;

          return (
            <div
              key={pt.id}
              onClick={() => onSelect(pt.id)}
              className={`relative cursor-pointer rounded-xl p-4 border transition-all text-right flex flex-col justify-between ${
                isSelected
                  ? isDark
                    ? 'bg-neutral-900 border-amber-500/80 ring-1 ring-amber-500/30'
                    : 'bg-stone-50 border-stone-900 ring-1 ring-stone-900/10'
                  : isDark
                  ? 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <div>
                {/* Header Row: Title & Active Indicator */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className={`text-xs sm:text-sm font-bold leading-snug ${isSelected ? (isDark ? 'text-amber-400' : 'text-stone-900 font-extrabold') : (isDark ? 'text-neutral-200' : 'text-stone-800')}`}>
                    {localizedName}
                  </h3>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                      isSelected
                        ? isDark
                          ? 'bg-amber-500 border-amber-400 text-neutral-950'
                          : 'bg-stone-900 border-stone-900 text-white'
                        : isDark
                        ? 'border-neutral-700'
                        : 'border-stone-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Tagline */}
                <p className={`text-[11px] mb-2 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-stone-600'}`}>
                  {localizedTagline}
                </p>

                {/* Scope Description */}
                <p className={`text-[10px] mb-3 leading-relaxed border-t pt-2 border-dashed ${isDark ? 'border-neutral-800 text-neutral-400' : 'border-stone-100 text-stone-500'}`}>
                  {localizedDesc}
                </p>
              </div>

              {/* Bottom Specs: Tech stack, Timeline, and Editable Base Price */}
              <div className="pt-2 border-t border-neutral-700/30 mt-auto space-y-2">
                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    <span>~{pt.typicalDays} {t.daysUnit}</span>
                  </span>
                  <span className="flex items-center gap-1 truncate max-w-[150px]">
                    <Code2 className="w-3 h-3 text-neutral-500" />
                    <span>{pt.recommendedStack}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[11px] font-medium ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>
                    {t.basePriceLabel}
                  </span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <PriceInput
                      value={pt.basePrice}
                      onChange={(val) => onUpdateBasePrice(pt.id, val)}
                      title={`${t.basePriceLabel} ${currency.name}`}
                      className={`w-24 text-left px-2 py-0.5 rounded text-xs font-mono-numbers font-bold border focus:outline-none ${
                        isSelected
                          ? isDark
                            ? 'bg-neutral-950 border-amber-500/50 text-amber-400'
                            : 'bg-white border-stone-800 text-stone-900'
                          : isDark
                          ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
                          : 'bg-stone-100 border-stone-200 text-stone-700'
                      }`}
                    />
                    <span className="text-[11px] font-mono-numbers text-amber-500 font-bold">{currency.symbol}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
