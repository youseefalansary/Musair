import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import { analyzeClientChatWithGemini, AIAnalysisResult } from '../services/geminiChatAnalyzer';
import { TRANSLATIONS, AppLanguage } from '../i18n/translations';

interface ChatToQuoteCardProps {
  onApplyAnalysis: (result: AIAnalysisResult) => void;
  lang: AppLanguage;
  isDark: boolean;
  onOpenSettings: () => void;
}

export const ChatToQuoteCard: React.FC<ChatToQuoteCardProps> = ({
  onApplyAnalysis,
  lang,
  isDark,
  onOpenSettings,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const apiKey = localStorage.getItem('gemini_api_key') || '';

  const [chatText, setChatText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<AIAnalysisResult | null>(null);

  // Sample chats localized for each language
  const sampleChatsArabic = {
    restaurant: `السلام عليكم، أنا صاحب مطعم وعايز منيو QR كود للطاولات والزبون يمسح الكود ويطلب مباشرة عبر الواتساب مع لوكيشن الفروع (التواصل مع أ/ محمود 01011223344).`,
    ecommerce: `مساء الخير، محتاجين متجر إلكتروني لبيع الملابس والأحذية الرياضية، يكون فيه سلة مشتريات وبوابة دفع بالفيزا والمحافظ الإلكترونية، وتتبع الشحنات مع فواتير PDF (أ/ سارة - شركة فيت زون 01234567890).`,
    factory: `تحياتنا، نحن شركة صناعية متخصصة في خطوط الإنتاج، نرغب بموقع تعريفي مؤسسي يعرض سابقة أعمالنا والشهادات ونماذج طلب عروض الأسعار مع تهيئة سيو لجوجل (م/ أحمد - مصنع الأمل 01099887766).`,
  };

  const sampleChatsEnglish = {
    restaurant: `Hi! We run an Italian pizzeria and want a digital QR menu app for our 30 dining tables where diners can scan and order directly to our WhatsApp line with dietary filters. Contact: David, 555-019-2834.`,
    ecommerce: `Hello, we need a modern multi-currency e-commerce store with Stripe card checkout, product inventory sync, and automated DHL shipping tracking labels. Company: Horizon Apparel LLC, contact: Sarah.`,
    factory: `Greetings, we are an industrial manufacturing company needing an enterprise corporate portal showcasing our credentials, machinery catalog downloads, and B2B RFP request forms. Contact: Mark, Apex Steel.`,
  };

  const sampleChatsTurkish = {
    restaurant: `Merhaba, Kadıköy'deki restoranımız için masalara özel QR menü istiyoruz. Müşteriler masadan karekodu okutup siparişi doğrudan kurumsal WhatsApp hattımıza gönderebilsin. Yetkili: Emre Bey, 0532 000 0000.`,
    ecommerce: `İyi günler, kadın giyim üzerine e-ticaret sitesi yaptırmak istiyoruz. İyzico ile kredi kartı ödemesi, Yurtiçi kargo entegrasyonu, stok takibi ve e-arşiv fatura olsun. Şirket: ModaLine Tekstil, yetkili: Zeynep Hanım.`,
    factory: `Selamlar, organize sanayi bölgesinde faaliyet gösteren ambalaj fabrikamız için kurumsal tanıtım sitesi istiyoruz. Ürün katalogları indirilebilsin, B2B teklif formu ve Google SEO uyumu olsun. Firma: Güven Ambalaj Sanayi.`,
  };

  const sampleChats =
    lang === 'tk' ? sampleChatsTurkish : lang === 'en' ? sampleChatsEnglish : sampleChatsArabic;

  const handleAnalyze = async () => {
    setErrorMsg(null);
    setLastAnalysis(null);
    const keyToUse = apiKey.trim() || localStorage.getItem('gemini_api_key') || '';
    if (!keyToUse) {
      setErrorMsg(t.keyMissing);
      return;
    }
    if (!chatText.trim()) {
      setErrorMsg(lang === 'ar' ? 'يرجى لصق نص المحادثة أولاً!' : lang === 'tk' ? 'Lütfen önce sohbet metnini yapıştırın!' : 'Please paste chat text first!');
      return;
    }

    setIsLoading(true);
    try {
      const result = await analyzeClientChatWithGemini(chatText, keyToUse);
      setLastAnalysis(result);
      onApplyAnalysis(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while calling Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = (sampleKey: 'restaurant' | 'ecommerce' | 'factory') => {
    setChatText(sampleChats[sampleKey]);
    setErrorMsg(null);
  };

  return (
    <div
      className={`border rounded-2xl p-5 sm:p-6 transition-all shadow-md relative overflow-hidden ${
        isDark
          ? 'bg-neutral-900/60 border-neutral-800'
          : 'bg-white border-stone-200'
      }`}
    >
      {/* Top Banner / Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b pb-3 border-dashed border-neutral-700/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight flex items-center gap-2">
              <span>{t.aiCardTitle}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                gemini-2.5-flash
              </span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-stone-600'}`}>
              {t.aiCardDesc}
            </p>
          </div>
        </div>

        {/* API Key Status Indicator */}
        <div className="flex items-center gap-2 text-xs">
          {apiKey ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.keySaved}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 text-amber-400 hover:underline font-bold text-[11px] cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{t.keyMissing}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSettings}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
            }`}
          >
            <Settings className="w-3 h-3 text-amber-500" />
            <span>{t.tabSettings}</span>
          </button>
        </div>
      </div>

      {/* Sample Chats Quick-Action Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-xs">
        <span className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>
          {t.samplePromptLabel}
        </span>
        <button
          type="button"
          onClick={() => handleLoadSample('restaurant')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
            isDark
              ? 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-amber-400'
              : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-800'
          }`}
        >
          {t.sampleRestaurant}
        </button>
        <button
          type="button"
          onClick={() => handleLoadSample('ecommerce')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
            isDark
              ? 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-amber-400'
              : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-800'
          }`}
        >
          {t.sampleEcommerce}
        </button>
        <button
          type="button"
          onClick={() => handleLoadSample('factory')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
            isDark
              ? 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-amber-400'
              : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-800'
          }`}
        >
          {t.sampleFactory}
        </button>
      </div>

      {/* Textarea for pasting chat transcript */}
      <div className="relative mb-3">
        <textarea
          rows={5}
          value={chatText}
          onChange={(e) => setChatText(e.target.value)}
          placeholder={t.pasteChatPlaceholder}
          className={`w-full p-3.5 rounded-xl border text-xs leading-relaxed focus:outline-none resize-y ${
            isDark
              ? 'bg-neutral-950 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20'
              : 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-stone-800'
          }`}
        />
      </div>

      {/* Error notice */}
      {errorMsg && (
        <div className="mb-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          {!apiKey && (
            <button
              onClick={onOpenSettings}
              className="text-amber-400 underline whitespace-nowrap text-xs font-bold cursor-pointer"
            >
              {t.tabSettings}
            </button>
          )}
        </div>
      )}

      {/* Success Banner */}
      {lastAnalysis && (
        <div className="mb-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <p className="font-bold text-white mb-0.5">{t.aiSuccessNotice}</p>
              <p className="text-[11px] text-emerald-200 leading-relaxed">
                {lastAnalysis.analysisSummary}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
            {lastAnalysis.detectedFeatureIds.length} modules
          </span>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <span className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-stone-500'}`}>
          {t.aiNoteExplanation}
        </span>
        <button
          type="button"
          disabled={isLoading}
          onClick={handleAnalyze}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
            isLoading
              ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
              <span>{t.analyzing}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t.analyzeBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
