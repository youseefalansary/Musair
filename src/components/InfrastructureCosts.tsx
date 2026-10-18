import React, { useState } from 'react';
import { ExternalCostItem, CurrencyConfig } from '../types/pricing';
import { Plus, Trash2, Server } from 'lucide-react';
import { PriceInput } from './PriceInput';
import { AppLanguage, TRANSLATIONS } from '../i18n/translations';

interface InfrastructureCostsProps {
  items: ExternalCostItem[];
  onUpdateItem: (id: string, updates: Partial<ExternalCostItem>) => void;
  onAddItem: (item: ExternalCostItem) => void;
  onRemoveItem: (id: string) => void;
  currency: CurrencyConfig;
  lang: AppLanguage;
  isDark: boolean;
}

export const InfrastructureCosts: React.FC<InfrastructureCostsProps> = ({
  items,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  currency,
  lang,
  isDark,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newProvider, setNewProvider] = useState('');
  const defaultCost = currency.code === 'TRY' ? 1500 : currency.code === 'USD' ? 50 : currency.code === 'SAR' ? 200 : 500;
  const defaultComm = currency.code === 'TRY' ? 750 : currency.code === 'USD' ? 30 : currency.code === 'SAR' ? 100 : 250;
  const [newCost, setNewCost] = useState(String(defaultCost));
  const [newCommission, setNewCommission] = useState(String(defaultComm));

  const totalActualCost = items.reduce((sum, i) => sum + i.cost, 0);
  const totalCommission = items.reduce((sum, i) => sum + i.commission, 0);
  const totalClientBilled = totalActualCost + totalCommission;

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddItem({
      id: 'ext_' + Date.now(),
      name: newName.trim(),
      provider: newProvider.trim() || 'Custom Provider',
      cost: Math.max(0, parseFloat(newCost) || 0),
      commission: Math.max(0, parseFloat(newCommission) || 0),
      billingPeriod: 'yearly',
    });
    setNewName('');
    setNewProvider('');
    setNewCost(String(defaultCost));
    setNewCommission(String(defaultComm));
    setShowAddForm(false);
  };

  return (
    <section className={`border rounded-xl p-5 transition-colors ${isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-stone-200 shadow-sm'}`}>
      
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b pb-3 border-dashed border-neutral-700/40">
        <div>
          <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {t.infraSectionTitle}
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>
            {t.infraSectionDesc}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isDark
              ? 'bg-neutral-900 hover:bg-neutral-800 text-amber-400 border-amber-500/40 hover:border-amber-400'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border-stone-300'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.addInfraBtn}</span>
        </button>
      </div>

      {/* Quick Summary Bar */}
      <div className={`p-3 rounded-lg border mb-3 flex flex-wrap items-center justify-between gap-3 text-xs ${isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
        <div className="flex items-center gap-4">
          <div>
            <span className="text-neutral-400 text-[11px] block">{t.actualCostBilled}</span>
            <span className="font-mono-numbers font-bold text-neutral-300">{totalActualCost.toLocaleString()} {currency.symbol}</span>
          </div>
          <div>
            <span className="text-amber-500 text-[11px] block">{t.yourCommissionBilled}</span>
            <span className="font-mono-numbers font-bold text-amber-400">+{totalCommission.toLocaleString()} {currency.symbol}</span>
          </div>
        </div>
        <div className="text-left">
          <span className="text-neutral-400 text-[11px] block">{t.totalClientInfra}</span>
          <span className="font-mono-numbers font-extrabold text-amber-500 text-sm">
            {totalClientBilled.toLocaleString()} {currency.symbol}
          </span>
        </div>
      </div>

      {/* Items Table / Cards */}
      <div className="space-y-2">
        {items.map((item) => {
          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-colors grid grid-cols-1 md:grid-cols-12 gap-3 items-center ${
                isDark ? 'bg-neutral-950/50 border-neutral-800/80' : 'bg-white border-stone-200'
              }`}
            >
              {/* Name & Provider */}
              <div className="md:col-span-5 space-y-1">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                  className={`w-full text-xs font-bold px-2 py-1 rounded border focus:outline-none ${isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-stone-50 border-stone-200 text-stone-900'}`}
                />
                <input
                  type="text"
                  value={item.provider}
                  onChange={(e) => onUpdateItem(item.id, { provider: e.target.value })}
                  placeholder="Provider e.g. Cloudflare / Hetzner"
                  className={`w-full text-[11px] px-2 py-0.5 rounded border focus:outline-none ${isDark ? 'bg-neutral-900/40 border-neutral-800 text-neutral-400' : 'bg-stone-50/60 border-stone-200 text-stone-500'}`}
                />
              </div>

              {/* Actual Cost */}
              <div className="md:col-span-3">
                <label className="text-[10px] text-neutral-400 block mb-0.5">{t.actualCostInputLabel}</label>
                <div className="flex items-center gap-1">
                  <PriceInput
                    min={0}
                    value={item.cost}
                    onChange={(val) => onUpdateItem(item.id, { cost: val })}
                    className={`w-full px-2 py-1 rounded text-xs font-mono-numbers border focus:outline-none ${isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                  />
                  <span className="text-[10px] font-mono-numbers text-neutral-400 font-bold">{currency.symbol}</span>
                </div>
              </div>

              {/* Your Commission */}
              <div className="md:col-span-3">
                <label className="text-[10px] text-amber-500 font-semibold block mb-0.5">{t.commissionInputLabel}</label>
                <div className="flex items-center gap-1">
                  <PriceInput
                    min={0}
                    value={item.commission}
                    onChange={(val) => onUpdateItem(item.id, { commission: val })}
                    className={`w-full px-2 py-1 rounded text-xs font-mono-numbers font-bold border focus:outline-none ${isDark ? 'bg-neutral-900 border-amber-500/40 text-amber-400' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
                  />
                  <span className="text-[10px] font-mono-numbers text-amber-500 font-bold">{currency.symbol}</span>
                </div>
              </div>

              {/* Delete button */}
              <div className="md:col-span-1 flex items-center justify-between md:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  title={t.deleteTooltip}
                  className="p-1 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Item Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl ${isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-stone-300 text-stone-900'}`}>
            <h3 className="text-sm font-bold mb-3 border-b pb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-500" />
              <span>{t.addInfraModalTitle}</span>
            </h3>
            <form onSubmit={handleAddNew} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium">{t.infraNameLabel}</label>
                <input
                  type="text"
                  required
                  placeholder={t.infraNamePlaceholder}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">{t.infraProviderLabel}</label>
                <input
                  type="text"
                  placeholder={t.infraProviderPlaceholder}
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium">{t.actualCostInputLabel} ({currency.symbol}):</label>
                  <PriceInput
                    min={0}
                    value={parseFloat(newCost) || 0}
                    onChange={(val) => setNewCost(String(val))}
                    className={`w-full px-3 py-2 rounded-lg border font-mono-numbers focus:outline-none ${isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-amber-500 font-bold">{t.commissionInputLabel} ({currency.symbol}):</label>
                  <PriceInput
                    min={0}
                    value={parseFloat(newCommission) || 0}
                    onChange={(val) => setNewCommission(String(val))}
                    className={`w-full px-3 py-2 rounded-lg border font-mono-numbers focus:outline-none ${isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-700/40">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
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
