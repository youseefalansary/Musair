import React, { useState } from 'react';
import { FeatureItem, FeatureCategory, CurrencyConfig } from '../types/pricing';
import { Plus, Search, Trash2, SlidersHorizontal } from 'lucide-react';
import { PriceInput } from './PriceInput';
import { AppLanguage, TRANSLATIONS } from '../i18n/translations';

interface FeaturesManagerProps {
  features: FeatureItem[];
  onToggleFeature: (id: string) => void;
  onUpdateFeaturePrice: (id: string, newPrice: number) => void;
  onAddCustomFeature: (name: string, price: number, category: FeatureCategory) => void;
  onDeleteFeature: (id: string) => void;
  currency: CurrencyConfig;
  lang: AppLanguage;
  isDark: boolean;
}

export const FeaturesManager: React.FC<FeaturesManagerProps> = ({
  features,
  onToggleFeature,
  onUpdateFeaturePrice,
  onAddCustomFeature,
  onDeleteFeature,
  currency,
  lang,
  isDark,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState('');
  const defaultCustomPrice = currency.code === 'TRY' ? 3000 : currency.code === 'USD' ? 150 : currency.code === 'SAR' ? 350 : 500;
  const [newFeaturePrice, setNewFeaturePrice] = useState(String(defaultCustomPrice));
  const [newFeatureCat, setNewFeatureCat] = useState<FeatureCategory>('ux');

  const categoryLabels: Record<string, string> = {
    all: t.catAll,
    ux: t.catUx,
    integrations: t.catIntegrations,
    commerce: t.catCommerce,
    admin: t.catAdmin,
    seo: t.catSeo,
    core: t.catCore,
  };

  const filteredFeatures = features.filter((f) => {
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    const nameMatch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.nameEn && f.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.nameTk && f.nameTk.toLowerCase().includes(searchQuery.toLowerCase()));
    const descMatch =
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.descriptionEn && f.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.descriptionTk && f.descriptionTk.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && (nameMatch || descMatch);
  });

  const activeCount = features.filter((f) => f.active).length;
  const activeFeaturesTotal = features
    .filter((f) => f.active)
    .reduce((acc, f) => acc + f.price, 0);

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim()) return;
    onAddCustomFeature(newFeatureName.trim(), Math.max(0, parseFloat(newFeaturePrice) || 0), newFeatureCat);
    setNewFeatureName('');
    setNewFeaturePrice(String(defaultCustomPrice));
    setShowAddModal(false);
  };

  return (
    <section className={`border rounded-xl p-5 transition-colors ${isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-stone-200 shadow-sm'}`}>
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b pb-3 border-dashed border-neutral-700/40">
        <div>
          <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {t.featuresSectionTitle}
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
            <span>{t.activeFeaturesSummary.replace('{active}', String(activeCount)).replace('{total}', String(features.length))}</span>
            <span>•</span>
            <span className="font-mono-numbers text-amber-500 font-bold">
              {t.featuresTotalSubtotal} {activeFeaturesTotal.toLocaleString()} {currency.symbol}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isDark
              ? 'bg-neutral-900 hover:bg-neutral-800 text-amber-400 border-amber-500/40 hover:border-amber-400'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border-stone-300'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.addFeatureBtn}</span>
        </button>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3">
        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {Object.entries(categoryLabels).map(([catKey, label]) => (
            <button
              key={catKey}
              type="button"
              onClick={() => setSelectedCategory(catKey)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === catKey
                  ? isDark
                    ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40'
                    : 'bg-stone-900 text-white font-bold'
                  : isDark
                  ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-56 shrink-0">
          <Search className={`w-3.5 h-3.5 absolute ${lang === 'ar' ? 'right-2.5' : 'left-2.5'} top-2.5 pointer-events-none ${isDark ? 'text-neutral-500' : 'text-stone-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchFeaturesPlaceholder}
            className={`w-full ${lang === 'ar' ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-1 rounded-lg border text-xs focus:outline-none focus:ring-1 ${
              isDark
                ? 'bg-neutral-950 border-neutral-800 text-neutral-100 focus:border-amber-500'
                : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-500'
            }`}
          />
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-2">
        {filteredFeatures.map((item) => {
          const localizedName =
            lang === 'tk'
              ? item.nameTk || item.nameEn || item.name
              : lang === 'en'
              ? item.nameEn || item.name
              : item.name;

          const localizedDesc =
            lang === 'tk'
              ? item.descriptionTk || item.descriptionEn || item.description
              : lang === 'en'
              ? item.descriptionEn || item.description
              : item.description;

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.active
                  ? isDark
                    ? 'bg-neutral-900/90 border-amber-500/50'
                    : 'bg-stone-50 border-stone-800'
                  : isDark
                  ? 'bg-neutral-950/40 border-neutral-800/80 opacity-75 hover:opacity-100'
                  : 'bg-white border-stone-200 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Checkbox & Name */}
              <div className="flex items-start gap-3 flex-1 select-none cursor-pointer" onClick={() => onToggleFeature(item.id)}>
                <input
                  type="checkbox"
                  checked={item.active}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 rounded transition-colors accent-amber-500 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold leading-snug ${item.active ? (isDark ? 'text-neutral-100' : 'text-stone-900') : (isDark ? 'text-neutral-400' : 'text-stone-500')}`}>
                      {localizedName}
                    </span>
                    {item.isCustom && (
                      <span className="text-[10px] text-amber-500 font-mono">[{t.customFeatureBadge}]</span>
                    )}
                  </div>
                  {localizedDesc && (
                    <p className={`text-[11px] leading-relaxed ${isDark ? 'text-neutral-400' : 'text-stone-600'}`}>
                      {localizedDesc}
                    </p>
                  )}
                </div>
              </div>

              {/* Price input & actions */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-700/20">
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <span className={`text-[11px] ${isDark ? 'text-neutral-500' : 'text-stone-400'}`}>{t.priceLabel}</span>
                  <PriceInput
                    value={item.price}
                    onChange={(val) => onUpdateFeaturePrice(item.id, val)}
                    className={`w-20 text-left px-2 py-1 rounded text-xs font-mono-numbers font-bold border focus:outline-none ${
                      item.active
                        ? isDark
                          ? 'bg-neutral-950 border-amber-500/40 text-amber-400'
                          : 'bg-white border-stone-800 text-stone-900'
                        : isDark
                        ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        : 'bg-stone-100 border-stone-300 text-stone-500'
                    }`}
                  />
                  <span className="text-[11px] font-mono-numbers text-amber-500 font-bold">{currency.symbol}</span>
                </div>

                {item.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFeature(item.id);
                    }}
                    title={t.deleteTooltip}
                    className="p-1 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredFeatures.length === 0 && (
          <div className="text-center py-8 text-neutral-400 text-xs">
            {t.noFeaturesFound}
          </div>
        )}
      </div>

      {/* Add Custom Feature Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl ${isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-stone-300 text-stone-900'}`}>
            <h3 className="text-sm font-bold mb-3 border-b pb-2 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <span>{t.addCustomModalTitle}</span>
            </h3>
            <form onSubmit={handleSaveCustom} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium">{t.featureNameLabel}</label>
                <input
                  type="text"
                  required
                  placeholder={t.featureNamePlaceholder}
                  value={newFeatureName}
                  onChange={(e) => setNewFeatureName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${isDark ? 'bg-neutral-950 border-neutral-800 text-white focus:border-amber-500' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium">{t.featurePriceLabel}</label>
                  <PriceInput
                    min={0}
                    value={parseFloat(newFeaturePrice) || 0}
                    onChange={(val) => setNewFeaturePrice(String(val))}
                    className={`w-full px-3 py-2 rounded-lg border font-mono-numbers focus:outline-none ${isDark ? 'bg-neutral-950 border-neutral-800 text-white focus:border-amber-500' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">{t.featureCategoryLabel}</label>
                  <select
                    value={newFeatureCat}
                    onChange={(e) => setNewFeatureCat(e.target.value as FeatureCategory)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
                  >
                    <option value="ux">{t.catUx}</option>
                    <option value="integrations">{t.catIntegrations}</option>
                    <option value="commerce">{t.catCommerce}</option>
                    <option value="admin">{t.catAdmin}</option>
                    <option value="seo">{t.catSeo}</option>
                    <option value="core">{t.catCore}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-700/40">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer ${isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300' : 'bg-stone-100 border-stone-300 text-stone-700'}`}
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors cursor-pointer"
                >
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
