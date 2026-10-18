import React, { useState, useEffect } from 'react';
import { SavedQuote, CurrencyConfig } from '../types/pricing';
import { CURRENCIES } from '../data/marketDefaults';
import { X, FolderOpen, Save, Trash2, Calendar, FileText, CheckCircle2, Layers, Clock, Wallet } from 'lucide-react';
import { AppLanguage, TRANSLATIONS } from '../i18n/translations';

interface SavedQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedQuotes: SavedQuote[];
  onSaveCurrent: (label: string) => void;
  onLoadQuote: (id: string) => void;
  onDeleteQuote: (id: string) => void;
  currency: CurrencyConfig;
  currentClientName: string;
  lang: AppLanguage;
  isDark: boolean;
}

export const SavedQuotesModal: React.FC<SavedQuotesModalProps> = ({
  isOpen,
  onClose,
  savedQuotes,
  onSaveCurrent,
  onLoadQuote,
  onDeleteQuote,
  currency,
  currentClientName,
  lang,
  isDark,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const [saveLabel, setSaveLabel] = useState(
    currentClientName ? `${t.saveQuoteBtn}: ${currentClientName}` : ''
  );
  const [restoredId, setRestoredId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveLabel.trim()) return;
    onSaveCurrent(saveLabel.trim());
    setSaveLabel('');
  };

  const handleLoad = (id: string) => {
    onLoadQuote(id);
    setRestoredId(id);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm"
    >
      <div className={`w-full max-w-xl rounded-2xl border shadow-2xl p-5 sm:p-6 transition-all ${
        isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-stone-300 text-stone-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-700/30 mb-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold">{t.savedQuotesModalTitle}</h3>
              <p className="text-[11px] text-neutral-400">{t.savedQuotesDesc}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Save Current */}
        <form onSubmit={handleSave} className="p-3 rounded-xl border mb-4 bg-neutral-950/50 border-neutral-800 text-xs flex gap-2">
          <input
            type="text"
            required
            placeholder={t.saveQuotePlaceholder}
            value={saveLabel}
            onChange={(e) => setSaveLabel(e.target.value)}
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t.saveQuoteBtn}</span>
          </button>
        </form>

        {/* List of Saved Quotes */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto text-xs pr-1">
          {savedQuotes.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs">
              {t.noSavedQuotes}
            </div>
          ) : (
            savedQuotes.map((q) => {
              const quoteCurrencyCode = q.currencyCode || 'EGP';
              const isRestored = restoredId === q.id;
              const quoteCur = CURRENCIES[quoteCurrencyCode] || currency;

              return (
                <div
                  key={q.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                    isRestored
                      ? 'bg-emerald-950/40 border-emerald-500/50'
                      : isDark
                      ? 'bg-neutral-950/40 border-neutral-800 hover:border-neutral-700'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-neutral-200 text-xs flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{q.clientName}</span>
                      {q.companyName && (
                        <span className="text-[10px] text-neutral-400 font-normal">({q.companyName})</span>
                      )}
                    </h4>

                    {/* Snapshot details badges */}
                    <div className="text-[10px] text-neutral-400 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {q.createdAt}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5 text-amber-500" />
                        {q.featuresCount}
                      </span>
                      {typeof q.deliveryDays === 'number' && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-blue-400" />
                            {q.deliveryDays} {t.daysUnit}
                          </span>
                        </>
                      )}
                      {q.milestoneMode && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Wallet className="w-2.5 h-2.5 text-emerald-400" />
                            {q.milestoneMode}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="font-mono-numbers text-amber-400 font-bold">
                        {q.totalEGP.toLocaleString()} {quoteCur.symbol}
                        <span className="text-[10px] text-neutral-400 font-mono ml-1">({quoteCur.code})</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleLoad(q.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        isRestored
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                      }`}
                    >
                      {isRestored ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t.loadedBadge}</span>
                        </>
                      ) : (
                        <span>{t.loadQuoteBtn}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteQuote(q.id)}
                      title={t.deleteTooltip}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
