import React from 'react';
import { CurrencyConfig } from '../types/pricing';
import { MessageSquare, FileText, TrendingUp, Wallet, Check, Globe2 } from 'lucide-react';
import { AppLanguage, TRANSLATIONS } from '../i18n/translations';

interface FinancialSummaryPanelProps {
  basePrice?: number;
  basePriceEgp?: number;
  featuresTotal?: number;
  featuresTotalEgp?: number;
  externalActualCost?: number;
  externalActualCostEgp?: number;
  externalCommission?: number;
  externalCommissionEgp?: number;
  currency: CurrencyConfig;
  lang: AppLanguage;
  isDark: boolean;
  onOpenProposal: () => void;
  onOpenWhatsApp: () => void;
  onOpenNegotiation: () => void;
  onDirectCopyWhatsApp: () => void;
  copiedToast: boolean;
  milestoneMode: '40-30-30' | '50-50';
}

export const FinancialSummaryPanel: React.FC<FinancialSummaryPanelProps> = ({
  basePrice,
  basePriceEgp = 0,
  featuresTotal,
  featuresTotalEgp = 0,
  externalActualCost,
  externalActualCostEgp = 0,
  externalCommission,
  externalCommissionEgp = 0,
  currency,
  lang,
  isDark,
  onOpenProposal,
  onOpenWhatsApp,
  onOpenNegotiation,
  onDirectCopyWhatsApp,
  copiedToast,
  milestoneMode,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

  const actualBase = typeof basePrice === 'number' ? basePrice : basePriceEgp;
  const actualFeatures = typeof featuresTotal === 'number' ? featuresTotal : featuresTotalEgp;
  const actualExtCost = typeof externalActualCost === 'number' ? externalActualCost : externalActualCostEgp;
  const actualExtComm = typeof externalCommission === 'number' ? externalCommission : externalCommissionEgp;

  const grandTotal = actualBase + actualFeatures + actualExtCost + actualExtComm;
  const developerNetProfit = actualBase + actualFeatures + actualExtComm;

  // Negotiation buffers calculated in native market currency
  const anchorPrice = grandTotal;
  const bufferStep = currency.code === 'USD' ? 25 : currency.code === 'SAR' ? 50 : currency.code === 'TRY' ? 250 : 100;
  const discountBuffer = Math.max(bufferStep, Math.round((grandTotal * 0.08) / bufferStep) * bufferStep);
  const fastClosePrice = Math.max(actualExtCost + bufferStep * 2, grandTotal - discountBuffer);
  const floorDiscount = Math.max(bufferStep * 2, Math.round((grandTotal * 0.15) / bufferStep) * bufferStep);
  const walkAwayFloor = Math.max(actualExtCost + bufferStep, grandTotal - floorDiscount);

  // Milestones calculation
  const depositPercent = milestoneMode === '40-30-30' ? 0.40 : 0.50;
  const depositAmount = Math.round(grandTotal * depositPercent);
  const midAmount = milestoneMode === '40-30-30' ? Math.round(grandTotal * 0.30) : 0;
  const finalPercent = milestoneMode === '40-30-30' ? 0.30 : 0.50;
  const finalAmount = Math.round(grandTotal * finalPercent);

  return (
    <aside
      className={`border rounded-2xl p-5 sticky top-20 transition-all space-y-4 ${
        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200 shadow-lg'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3 border-dashed border-neutral-700/40">
        <div>
          <span className="text-xs font-bold tracking-tight text-amber-500 block">{t.financialSummaryTitle}</span>
          <h3 className="text-sm font-extrabold">{t.grandTotalLabel}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <span>{currency.flag}</span>
            <span className="font-mono">{currency.code}</span>
          </span>
        </div>
      </div>

      {/* Grand Total Hero Box */}
      <div
        className={`p-4 rounded-xl border text-center transition-colors ${
          isDark ? 'bg-neutral-950 border-amber-500/40' : 'bg-stone-50 border-stone-800'
        }`}
      >
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-400 mb-1">
          <Globe2 className="w-3.5 h-3.5 text-amber-500" />
          <span>{currency.marketName}</span>
        </div>
        <div className="flex items-baseline justify-center gap-1.5 font-mono-numbers">
          <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
            {grandTotal.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-neutral-300">{currency.symbol}</span>
        </div>
        <div className="mt-2 pt-2 border-t border-dashed border-neutral-700/30 flex items-center justify-between text-[11px]">
          <span className="text-neutral-400">{t.netProfitLabel}:</span>
          <span className="font-mono-numbers font-bold text-emerald-400">
            {developerNetProfit.toLocaleString()} {currency.symbol}
          </span>
        </div>
      </div>

      {/* Subtotals Breakdown */}
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between py-1 border-b border-neutral-700/20">
          <span className="text-neutral-400">{t.baseStructureLabel}</span>
          <span className="font-mono-numbers font-semibold">
            {actualBase.toLocaleString()} {currency.symbol}
          </span>
        </div>
        <div className="flex justify-between py-1 border-b border-neutral-700/20">
          <span className="text-neutral-400">{t.selectedFeaturesLabel}</span>
          <span className="font-mono-numbers font-semibold">
            {actualFeatures.toLocaleString()} {currency.symbol}
          </span>
        </div>
        <div className="flex justify-between py-1 border-b border-neutral-700/20">
          <span className="text-neutral-400">{t.serverCostLabel}</span>
          <span className="font-mono-numbers font-semibold text-neutral-400">
            {actualExtCost.toLocaleString()} {currency.symbol}
          </span>
        </div>
        <div className="flex justify-between py-1 border-b border-neutral-700/20">
          <span className="text-amber-500 font-medium">{t.serverCommissionLabel}</span>
          <span className="font-mono-numbers font-bold text-amber-500">
            +{actualExtComm.toLocaleString()} {currency.symbol}
          </span>
        </div>
      </div>

      {/* Negotiation Bands */}
      <div
        className={`p-3 rounded-xl border text-xs space-y-2 ${
          isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-stone-50 border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            {t.negotiationBandsTitle}
          </span>
          <button
            type="button"
            onClick={onOpenNegotiation}
            className="text-[10px] text-amber-500 hover:underline font-semibold cursor-pointer"
          >
            {t.tabNegotiation}
          </button>
        </div>
        <div className="flex justify-between items-center py-1 px-2 rounded bg-neutral-900/50 border border-neutral-800/80">
          <span className="text-neutral-400 text-[11px]">{t.anchorPriceLabel}</span>
          <span className="font-mono-numbers font-bold text-amber-400">
            {anchorPrice.toLocaleString()} {currency.symbol}
          </span>
        </div>
        <div className="flex justify-between items-center py-1 px-2 rounded bg-neutral-900/50 border border-neutral-800/80">
          <span className="text-blue-400 text-[11px]">{t.fastClosePriceLabel}</span>
          <span className="font-mono-numbers font-bold text-neutral-200">
            {fastClosePrice.toLocaleString()} {currency.symbol}
          </span>
        </div>
        <div className="flex justify-between items-center py-1 px-2 rounded bg-rose-950/20 border border-rose-500/20">
          <span className="text-rose-400 text-[11px]">{t.walkAwayFloorLabel}</span>
          <span className="font-mono-numbers font-bold text-rose-300">
            {walkAwayFloor.toLocaleString()} {currency.symbol}
          </span>
        </div>
      </div>

      {/* Payment Milestones */}
      <div className="space-y-2 pt-1 border-t border-neutral-700/30 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-amber-500" />
            {t.paymentScheduleTitle}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
              isDark
                ? 'bg-neutral-950 border-neutral-800 text-amber-400'
                : 'bg-stone-100 border-stone-300 text-stone-800'
            }`}
          >
            {milestoneMode === '40-30-30' ? '40% / 30% / 30%' : '50% / 50%'}
          </span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-neutral-400">
              1. {t.depositLabel} ({Math.round(depositPercent * 100)}%):
            </span>
            <span className="font-mono-numbers font-bold text-amber-400">
              {depositAmount.toLocaleString()} {currency.symbol}
            </span>
          </div>
          {milestoneMode === '40-30-30' && (
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">2. {t.midPaymentLabel} (30%):</span>
              <span className="font-mono-numbers text-neutral-300">
                {midAmount.toLocaleString()} {currency.symbol}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-neutral-400">
              {milestoneMode === '40-30-30' ? '3' : '2'}. {t.finalPaymentLabel} ({Math.round(finalPercent * 100)}%):
            </span>
            <span className="font-mono-numbers text-neutral-300">
              {finalAmount.toLocaleString()} {currency.symbol}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={onOpenProposal}
          className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>{t.openProposalBtn}</span>
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenWhatsApp}
            className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-950 border-neutral-800 text-neutral-200 hover:text-white hover:border-neutral-700'
                : 'bg-stone-50 border-stone-300 text-stone-800 hover:bg-stone-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.tabWhatsApp}</span>
          </button>
          <button
            type="button"
            onClick={onDirectCopyWhatsApp}
            className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-950 border-neutral-800 text-neutral-200 hover:text-white hover:border-neutral-700'
                : 'bg-stone-50 border-stone-300 text-stone-800 hover:bg-stone-100'
            }`}
          >
            {copiedToast ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <span className="text-amber-500">⚡</span>
            )}
            <span>{copiedToast ? t.copiedSuccess : t.copyWhatsAppBtn}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
