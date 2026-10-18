import React, { useState, useEffect } from 'react';
import {
  CurrencyCode,
  ProjectType,
  FeatureItem,
  ExternalCostItem,
  ClientProfile,
  AgencyProfile,
  SavedQuote,
  FeatureCategory,
  ProposalLanguage,
} from './types/pricing';
import {
  CURRENCIES,
  MARKETS,
  DEFAULT_AGENCY,
} from './data/marketDefaults';
import { AppLanguage, LANGUAGES, TRANSLATIONS } from './i18n/translations';
import { TopNav } from './components/TopNav';
import { ChatToQuoteCard } from './components/ChatToQuoteCard';
import { ClientInfoBar } from './components/ClientInfoBar';
import { ProjectTypeCards } from './components/ProjectTypeCards';
import { FeaturesManager } from './components/FeaturesManager';
import { InfrastructureCosts } from './components/InfrastructureCosts';
import { FinancialSummaryPanel } from './components/FinancialSummaryPanel';
import { FormalProposalModal } from './components/FormalProposalModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { NegotiationModal } from './components/NegotiationModal';
import { SavedQuotesModal } from './components/SavedQuotesModal';
import { SettingsPage } from './components/SettingsPage';
import { AIAnalysisResult } from './services/geminiChatAnalyzer';
import { copyToClipboard } from './utils/clipboard';
import { validateBackupData } from './utils/backupValidator';
import { handleProjectTypeSwitch } from './utils/projectTypeHandler';
import { generateWhatsAppMessage } from './utils/whatsappGenerator';
import {
  CheckCircle,
  Calculator,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Application Interface Language (AR, EN, TK) - Strictly decoupled from currency!
  const [lang, setLang] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('musair_lang');
    if (saved === 'ar' || saved === 'en' || saved === 'tk') {
      return saved as AppLanguage;
    }
    return 'ar';
  });

  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const currentLangMeta = LANGUAGES[lang] || LANGUAGES.ar;

  // Client deliverables default language (for proposals & messages sent to clients)
  const [defaultProposalLang, setDefaultProposalLang] = useState<ProposalLanguage>(() => {
    const saved = localStorage.getItem('musair_proposal_lang');
    if (saved === 'ar' || saved === 'en' || saved === 'tk') {
      return saved as ProposalLanguage;
    }
    return 'ar';
  });

  // Theme & Currency (default is dark obsidian)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('musair_theme');
    return saved ? saved === 'dark' : true;
  });

  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('musair_currency');
    if (saved === 'EGP' || saved === 'SAR' || saved === 'USD' || saved === 'TRY') {
      return saved as CurrencyCode;
    }
    return 'EGP';
  });

  const currentCurrency = CURRENCIES[currencyCode] || CURRENCIES.EGP;

  // Navigation tab: 'pricing' | 'proposal' | 'whatsapp' | 'negotiation' | 'settings'
  const [currentTab, setCurrentTab] = useState<'pricing' | 'proposal' | 'whatsapp' | 'negotiation' | 'settings'>('pricing');

  // Multi-market data store per currency: remembers custom modifications made in each market
  const [marketStore, setMarketStore] = useState<Record<CurrencyCode, {
    projectTypes: ProjectType[];
    features: FeatureItem[];
    externalCosts: ExternalCostItem[];
    deliveryDays: number;
    selectedProjectTypeId: string;
  }>>(() => {
    const saved = localStorage.getItem('musair_market_store');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.EGP && parsed.SAR && parsed.USD && parsed.TRY) return parsed;
      } catch (e) {
        // fallback to defaults
      }
    }
    return {
      EGP: {
        projectTypes: MARKETS.EGP.projectTypes,
        features: MARKETS.EGP.features,
        externalCosts: MARKETS.EGP.externalCosts,
        deliveryDays: 5,
        selectedProjectTypeId: 'factory_corp',
      },
      SAR: {
        projectTypes: MARKETS.SAR.projectTypes,
        features: MARKETS.SAR.features,
        externalCosts: MARKETS.SAR.externalCosts,
        deliveryDays: 5,
        selectedProjectTypeId: 'factory_corp',
      },
      USD: {
        projectTypes: MARKETS.USD.projectTypes,
        features: MARKETS.USD.features,
        externalCosts: MARKETS.USD.externalCosts,
        deliveryDays: 5,
        selectedProjectTypeId: 'factory_corp',
      },
      TRY: {
        projectTypes: MARKETS.TRY.projectTypes,
        features: MARKETS.TRY.features,
        externalCosts: MARKETS.TRY.externalCosts,
        deliveryDays: 5,
        selectedProjectTypeId: 'factory_corp',
      },
    };
  });

  // Active Market Core Data
  const initialActiveMarket = marketStore[currencyCode] || marketStore.EGP;
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>(initialActiveMarket.projectTypes);
  const [selectedProjectTypeId, setSelectedProjectTypeId] = useState<string>(initialActiveMarket.selectedProjectTypeId || 'factory_corp');
  const [features, setFeatures] = useState<FeatureItem[]>(initialActiveMarket.features);
  const [externalCosts, setExternalCosts] = useState<ExternalCostItem[]>(initialActiveMarket.externalCosts);
  const [deliveryDays, setDeliveryDays] = useState<number>(initialActiveMarket.deliveryDays || 5);
  const [milestoneMode, setMilestoneMode] = useState<'40-30-30' | '50-50'>('40-30-30');

  // Client & Agency Profiles
  const [client, setClient] = useState<ClientProfile>({
    name: 'عميل محتمل',
    company: 'شركة تجارية',
    phone: '01098765432',
    projectTitle: 'موقع ويب تعريفي',
    notes: '',
  });

  const [agency, setAgency] = useState<AgencyProfile>(() => {
    const saved = localStorage.getItem('musair_agency');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_AGENCY;
      }
    }
    return DEFAULT_AGENCY;
  });

  // Saved quotes
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>(() => {
    const saved = localStorage.getItem('musair_saved_quotes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Modals
  const [showProposalModal, setShowProposalModal] = useState<boolean>(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState<boolean>(false);
  const [showSavedQuotesModal, setShowSavedQuotesModal] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [aiSuccessToast, setAiSuccessToast] = useState<string | null>(null);

  // Sync market store whenever active market state changes
  useEffect(() => {
    setMarketStore((prev) => {
      const updated = {
        ...prev,
        [currencyCode]: {
          projectTypes,
          features,
          externalCosts,
          deliveryDays,
          selectedProjectTypeId,
        },
      };
      localStorage.setItem('musair_market_store', JSON.stringify(updated));
      return updated;
    });
  }, [currencyCode, projectTypes, features, externalCosts, deliveryDays, selectedProjectTypeId]);

  // Export / Import Backup Data
  const getBackupJsonString = () => {
    const backupData = {
      agency,
      projectTypes,
      features,
      externalCosts,
      savedQuotes,
      milestoneMode,
      currencyCode,
      lang,
      marketStore,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backupData, null, 2);
  };

  const handleExportData = () => {
    const jsonStr = getBackupJsonString();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `musair-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (jsonStr: string) => {
    const validation = validateBackupData(jsonStr);
    if (!validation.isValid || !validation.sanitizedData) {
      const errorMsg =
        (lang === 'ar' ? 'فشل استيراد النسخة الاحتياطية:\n  ' : 'Import validation failed:\n  ') +
        validation.errors.join('\n  ');
      alert(errorMsg);
      return;
    }
    const data = validation.sanitizedData;
    if (data.agency) setAgency(data.agency);
    if (data.projectTypes) setProjectTypes(data.projectTypes);
    if (data.features) setFeatures(data.features);
    if (data.externalCosts) setExternalCosts(data.externalCosts);
    if (data.savedQuotes) setSavedQuotes(data.savedQuotes);
    if (data.milestoneMode) setMilestoneMode(data.milestoneMode);
    if (data.currencyCode) setCurrencyCode(data.currencyCode);
    if (data.lang) setLang(data.lang);
    alert(
      lang === 'ar'
        ? 'تم التحقق من بيانات النسخة الاحتياطية واستيرادها بنجاح!'
        : lang === 'tk'
        ? 'Yedek veriler başarıyla doğrulandı ve yüklendi!'
        : 'Backup data verified and imported successfully!'
    );
  };

  // Sync language and HTML direction
  useEffect(() => {
    localStorage.setItem('musair_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = currentLangMeta.dir;
  }, [lang, currentLangMeta]);

  // Sync theme
  useEffect(() => {
    localStorage.setItem('musair_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Sync agency
  useEffect(() => {
    localStorage.setItem('musair_agency', JSON.stringify(agency));
  }, [agency]);

  // Sync currency in storage
  useEffect(() => {
    localStorage.setItem('musair_currency', currencyCode);
  }, [currencyCode]);

  // Sync saved quotes
  useEffect(() => {
    localStorage.setItem('musair_saved_quotes', JSON.stringify(savedQuotes));
  }, [savedQuotes]);

  // Active Project Type
  const currentProjectType =
    projectTypes.find((p) => p.id === selectedProjectTypeId) || projectTypes[0];

  // Financial Computations in native active currency
  const activeFeatures = features.filter((f) => f.active);
  const basePrice = currentProjectType.basePrice;
  const featuresTotal = activeFeatures.reduce((acc, f) => acc + f.price, 0);
  const externalActualCost = externalCosts.reduce((acc, i) => acc + i.cost, 0);
  const externalCommission = externalCosts.reduce((acc, i) => acc + i.commission, 0);
  const grandTotal = basePrice + featuresTotal + externalActualCost + externalCommission;

  // Estimated Developer Hourly breakdown in active currency
  const estimatedHours = Math.max(8, deliveryDays * 5);
  const netEarnings = basePrice + featuresTotal + externalCommission;
  const hourlyRate = Math.round(netEarnings / estimatedHours);

  // Switching Currency & Adapting Market System WITHOUT touching UI language!
  const handleChangeCurrency = (newCode: CurrencyCode) => {
    if (newCode === currencyCode) return;

    // 1. Snapshot current active data into store
    const updatedStore = {
      ...marketStore,
      [currencyCode]: {
        projectTypes,
        features,
        externalCosts,
        deliveryDays,
        selectedProjectTypeId,
      },
    };

    // 2. Load target market data
    const defaultMarket = MARKETS[newCode] || MARKETS.EGP;
    const targetData = updatedStore[newCode] || {
      projectTypes: defaultMarket.projectTypes,
      features: defaultMarket.features,
      externalCosts: defaultMarket.externalCosts,
      deliveryDays: 5,
      selectedProjectTypeId: 'factory_corp',
    };

    setMarketStore(updatedStore);
    localStorage.setItem('musair_market_store', JSON.stringify(updatedStore));

    // 3. Switch active states (NEVER change lang here!)
    setCurrencyCode(newCode);
    setProjectTypes(targetData.projectTypes);
    setFeatures(targetData.features);
    setExternalCosts(targetData.externalCosts);
    setDeliveryDays(targetData.deliveryDays || 5);
    setSelectedProjectTypeId(targetData.selectedProjectTypeId || 'factory_corp');

    const targetMeta = CURRENCIES[newCode] || CURRENCIES.EGP;
    setAiSuccessToast(
      lang === 'ar'
        ? `تم التبديل إلى ${targetMeta.marketName} (${targetMeta.symbol}) بنجاح!`
        : lang === 'tk'
        ? `${targetMeta.marketName} (${targetMeta.symbol}) pazar sistemine geçildi!`
        : `Switched to ${targetMeta.marketName} (${targetMeta.code}) market system!`
    );
    setTimeout(() => setAiSuccessToast(null), 4000);
  };

  // Handle AI Chat Analysis Result
  const handleApplyAnalysis = (result: AIAnalysisResult) => {
    if (result.projectTypeId) {
      setSelectedProjectTypeId(result.projectTypeId);
    }
    if (result.deliveryDays) {
      setDeliveryDays(result.deliveryDays);
    } else {
      const pt = projectTypes.find((p) => p.id === result.projectTypeId);
      if (pt) setDeliveryDays(pt.typicalDays);
    }

    setClient((prev) => ({
      ...prev,
      name: result.clientName && result.clientName !== 'عميل محتمل' ? result.clientName : prev.name,
      company: result.companyName || prev.company,
      phone: result.clientPhone || prev.phone,
      notes: result.analysisSummary || prev.notes,
    }));

    setFeatures((prev) => {
      let updated = prev.map((f) => ({
        ...f,
        active: result.detectedFeatureIds.includes(f.id) || f.id === 'f_responsive',
      }));

      if (result.customFeatures && result.customFeatures.length > 0) {
        result.customFeatures.forEach((cf) => {
          const exists = updated.some((item) => item.name.toLowerCase() === cf.name.toLowerCase());
          if (!exists) {
            const defaultCustomPrice =
              currencyCode === 'TRY' ? 2500 : currencyCode === 'USD' ? 150 : currencyCode === 'SAR' ? 350 : 500;
            updated.unshift({
              id: 'custom_' + Date.now() + Math.random().toString(36).substring(2, 5),
              name: cf.name,
              price: cf.price || defaultCustomPrice,
              category: cf.category || 'ux',
              active: true,
              isCustom: true,
              description: 'ميزة مخصصة تمت إضافتها آلياً عبر تحليل المحادثة',
            });
          }
        });
      }
      return updated;
    });

    setAiSuccessToast(result.analysisSummary || t.aiSuccessNotice);
    setTimeout(() => setAiSuccessToast(null), 5000);
  };

  const handleSelectProjectType = (id: string) => {
    setSelectedProjectTypeId(id);
    const { updatedFeatures, deliveryDays: newDays, deactivatedFeatureNames } =
      handleProjectTypeSwitch(id, projectTypes, features);
    setDeliveryDays(newDays);
    setFeatures(updatedFeatures);

    const pt = projectTypes.find((p) => p.id === id);
    if (deactivatedFeatureNames.length > 0) {
      setAiSuccessToast(
        lang === 'ar'
          ? `تم التبديل إلى "${pt?.name || id}" وتحديث المزايا المتوافقة (${deactivatedFeatureNames.slice(0, 2).join('، ')}...)`
          : lang === 'tk'
          ? `"${pt?.nameTk || pt?.name || id}" seçildi ve uyumlu modüller düzenlendi.`
          : `Switched to "${pt?.nameEn || pt?.name || id}" and adjusted compatible features.`
      );
      setTimeout(() => setAiSuccessToast(null), 4000);
    }
  };

  const handleUpdateBasePrice = (id: string, newPrice: number) => {
    setProjectTypes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, basePrice: newPrice } : p))
    );
  };

  const handleToggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f))
    );
  };

  const handleUpdateFeaturePrice = (id: string, newPrice: number) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, price: newPrice } : f))
    );
  };

  const handleAddCustomFeature = (
    name: string,
    price: number,
    category: FeatureCategory
  ) => {
    const newFeature: FeatureItem = {
      id: 'custom_' + Date.now(),
      name,
      price,
      category,
      active: true,
      isCustom: true,
      description: 'ميزة أو خدمة مخصصة حسب متطلبات العميل',
    };
    setFeatures((prev) => [newFeature, ...prev]);
  };

  const handleDeleteFeature = (id: string) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpdateExternalItem = (id: string, updates: Partial<ExternalCostItem>) => {
    setExternalCosts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleAddExternalItem = (item: ExternalCostItem) => {
    setExternalCosts((prev) => [...prev, item]);
  };

  const handleRemoveExternalItem = (id: string) => {
    setExternalCosts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetDefaults = () => {
    const defaultMarket = MARKETS[currencyCode] || MARKETS.EGP;
    setProjectTypes(defaultMarket.projectTypes);
    setSelectedProjectTypeId('factory_corp');
    setFeatures(defaultMarket.features);
    setExternalCosts(defaultMarket.externalCosts);
    setDeliveryDays(5);
    setMarketStore((prev) => ({
      ...prev,
      [currencyCode]: {
        projectTypes: defaultMarket.projectTypes,
        features: defaultMarket.features,
        externalCosts: defaultMarket.externalCosts,
        deliveryDays: 5,
        selectedProjectTypeId: 'factory_corp',
      },
    }));
    setAiSuccessToast(
      lang === 'ar'
        ? `تم استعادة الإعدادات الافتراضية لسوق ${currentCurrency.marketName} (${currentCurrency.symbol})`
        : `Reset defaults for ${currentCurrency.marketName} (${currentCurrency.code})`
    );
    setTimeout(() => setAiSuccessToast(null), 3000);
  };

  const handleSaveCurrentQuote = (label: string) => {
    const newSaved: SavedQuote = {
      id: 'quote_' + Date.now(),
      clientName: label || client.name || (lang === 'ar' ? 'عرض سعر جديد' : 'New Quote'),
      companyName: client.company,
      projectTypeId: selectedProjectTypeId,
      createdAt: new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang === 'tk' ? 'tr-TR' : 'en-US'),
      totalEGP: grandTotal,
      featuresCount: activeFeatures.length,
      client: { ...client },
      features: features.map((f) => ({ ...f })),
      externalCosts: externalCosts.map((c) => ({ ...c })),
      deliveryDays,
      currencyCode,
      milestoneMode,
      projectBasePrice: basePrice,
    };
    setSavedQuotes((prev) => [newSaved, ...prev]);
    setAiSuccessToast(
      lang === 'ar'
        ? `تم حفظ العرض "${newSaved.clientName}" بنجاح (${currentCurrency.symbol})!`
        : `Quote "${newSaved.clientName}" saved with full details (${currentCurrency.code})!`
    );
    setTimeout(() => setAiSuccessToast(null), 3500);
  };

  const handleLoadQuote = (id: string) => {
    const q = savedQuotes.find((item) => item.id === id);
    if (!q) return;

    if (q.currencyCode && q.currencyCode !== currencyCode) {
      setCurrencyCode(q.currencyCode);
    }
    if (q.projectTypeId) {
      setSelectedProjectTypeId(q.projectTypeId);
    }
    if (q.client) {
      setClient({ ...q.client });
    } else {
      setClient((prev) => ({
        ...prev,
        name: q.clientName,
        company: q.companyName,
      }));
    }
    if (q.features && Array.isArray(q.features)) {
      setFeatures(q.features.map((f) => ({ ...f })));
    }
    if (q.externalCosts && Array.isArray(q.externalCosts)) {
      setExternalCosts(q.externalCosts.map((c) => ({ ...c })));
    }
    if (typeof q.deliveryDays === 'number' && q.deliveryDays > 0) {
      setDeliveryDays(q.deliveryDays);
    }
    if (q.milestoneMode) {
      setMilestoneMode(q.milestoneMode);
    }
    if (typeof q.projectBasePrice === 'number' && q.projectTypeId) {
      setProjectTypes((prev) =>
        prev.map((p) => (p.id === q.projectTypeId ? { ...p, basePrice: q.projectBasePrice! } : p))
      );
    }
    setAiSuccessToast(
      lang === 'ar'
        ? `تم استرجاع عرض "${q.clientName}" بكامل بياناته ومزاياه (${q.currencyCode || currencyCode})!`
        : `Quote "${q.clientName}" restored completely with all details!`
    );
    setTimeout(() => setAiSuccessToast(null), 3500);
  };

  const handleDeleteQuote = (id: string) => {
    setSavedQuotes((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDirectCopyWhatsApp = async () => {
    const depositAmount = Math.round(
      grandTotal * (milestoneMode === '40-30-30' ? 0.4 : 0.5)
    );
    const message = generateWhatsAppMessage({
      projectType: currentProjectType,
      features,
      grandTotal,
      depositAmount,
      deliveryDays,
      currency: currentCurrency,
      client,
      agency,
      lang: defaultProposalLang || 'ar',
      tone: 'formal',
    });
    const success = await copyToClipboard(message);
    if (success) {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  const handleSelectTab = (tab: 'pricing' | 'proposal' | 'whatsapp' | 'negotiation' | 'settings') => {
    setCurrentTab(tab);
    if (tab === 'pricing') {
      setShowProposalModal(false);
      setShowWhatsAppModal(false);
      setShowNegotiationModal(false);
    } else if (tab === 'proposal') {
      setShowProposalModal(true);
    } else if (tab === 'whatsapp') {
      setShowWhatsAppModal(true);
    } else if (tab === 'negotiation') {
      setShowNegotiationModal(true);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors font-sans ${
        isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-[#fafafa] text-stone-900'
      }`}
    >
      {/* Top Bar */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        currency={currencyCode}
        onChangeCurrency={handleChangeCurrency}
        lang={lang}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onReset={handleResetDefaults}
        onPrintProposal={() => setShowProposalModal(true)}
        onOpenSettings={() => setCurrentTab('settings')}
      />

      {/* Main Workspace Frame */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Full Page Settings View when Settings tab is active */}
        {currentTab === 'settings' ? (
          <SettingsPage
            agency={agency}
            onUpdateAgency={(up) => setAgency((prev) => ({ ...prev, ...up }))}
            lang={lang}
            onChangeLanguage={setLang}
            currency={currencyCode}
            onChangeCurrency={handleChangeCurrency}
            isDark={isDark}
            onToggleTheme={() => setIsDark(!isDark)}
            milestoneMode={milestoneMode}
            onChangeMilestoneMode={setMilestoneMode}
            defaultProposalLang={defaultProposalLang}
            onChangeDefaultProposalLang={setDefaultProposalLang}
            onResetDefaults={handleResetDefaults}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onGetBackupJson={getBackupJsonString}
            onBackToPricing={() => setCurrentTab('pricing')}
          />
        ) : (
          /* Main Pricing Workbench */
          <>
            {/* 1. Chat-to-Quote via Gemini API Card */}
            <ChatToQuoteCard
              onApplyAnalysis={handleApplyAnalysis}
              lang={lang}
              isDark={isDark}
              onOpenSettings={() => setCurrentTab('settings')}
            />

            {/* 2. Client & Project Credentials Header Bar */}
            <ClientInfoBar
              client={client}
              onChangeClient={(up) => setClient((prev) => ({ ...prev, ...up }))}
              deliveryDays={deliveryDays}
              onChangeDeliveryDays={setDeliveryDays}
              lang={lang}
              isDark={isDark}
              onOpenSavedQuotes={() => setShowSavedQuotesModal(true)}
            />

            {/* 3. 2-Column Split: Controls (8 cols) vs Financial Summary Desk (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Main Controls Area (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. Project Type Selector */}
                <ProjectTypeCards
                  projectTypes={projectTypes}
                  selectedId={selectedProjectTypeId}
                  onSelect={handleSelectProjectType}
                  currency={currentCurrency}
                  onUpdateBasePrice={handleUpdateBasePrice}
                  lang={lang}
                  isDark={isDark}
                />

                {/* 2. Features & Modules Manager */}
                <FeaturesManager
                  features={features}
                  onToggleFeature={handleToggleFeature}
                  onUpdateFeaturePrice={handleUpdateFeaturePrice}
                  onAddCustomFeature={handleAddCustomFeature}
                  onDeleteFeature={handleDeleteFeature}
                  currency={currentCurrency}
                  lang={lang}
                  isDark={isDark}
                />

                {/* 3. Infrastructure & Pass-through Costs */}
                <InfrastructureCosts
                  items={externalCosts}
                  onUpdateItem={handleUpdateExternalItem}
                  onAddItem={handleAddExternalItem}
                  onRemoveItem={handleRemoveExternalItem}
                  currency={currentCurrency}
                  lang={lang}
                  isDark={isDark}
                />

                {/* 4. Strategic Engineering Effort & Profit Margin Analysis */}
                <div
                  className={`border rounded-xl p-5 transition-colors ${
                    isDark ? 'bg-neutral-900/30 border-neutral-800' : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 mb-3 border-dashed border-neutral-700/40">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs sm:text-sm font-bold">
                        {t.internalMarginTitle}
                      </h3>
                    </div>
                    <span className="text-[11px] text-neutral-400">{t.internalMarginNote}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className={`p-3 rounded-lg border ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                      <span className="text-[10px] text-neutral-400 block mb-0.5">{t.estimatedHoursLabel}</span>
                      <span className="font-mono-numbers font-bold text-neutral-200 text-sm">~{estimatedHours} {t.hoursUnit}</span>
                      <span className="text-[9px] text-neutral-500 block mt-0.5">
                        {t.perDayNote}
                      </span>
                    </div>

                    <div className={`p-3 rounded-lg border ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                      <span className="text-[10px] text-neutral-400 block mb-0.5">{t.hourlyRateLabel}</span>
                      <span className="font-mono-numbers font-bold text-amber-400 text-sm">
                        {hourlyRate.toLocaleString()} {currentCurrency.symbol}/{t.hoursUnit.slice(0, 1)}
                      </span>
                      <span className="text-[9px] text-neutral-500 block mt-0.5">
                        ({currentCurrency.marketName})
                      </span>
                    </div>

                    <div className={`p-3 rounded-lg border ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                      <span className="text-[10px] text-neutral-400 block mb-0.5">{t.netEarningsLabel}</span>
                      <span className="font-mono-numbers font-bold text-emerald-400 text-sm">
                        {netEarnings.toLocaleString()} {currentCurrency.symbol}
                      </span>
                      <span className="text-[9px] text-neutral-500 block mt-0.5">
                        {t.afterHostingNote}
                      </span>
                    </div>

                    <div className={`p-3 rounded-lg border ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-stone-50 border-stone-200'}`}>
                      <span className="text-[10px] text-neutral-400 block mb-0.5">{t.marginLabel}</span>
                      <span className="font-mono-numbers font-bold text-amber-500 text-sm">
                        {Math.round((netEarnings / (grandTotal || 1)) * 100)}%
                      </span>
                      <span className="text-[9px] text-neutral-500 block mt-0.5">
                        {t.healthyMarginNote}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary Panel (4 cols) */}
              <div className="lg:col-span-4">
                <FinancialSummaryPanel
                  basePrice={basePrice}
                  featuresTotal={featuresTotal}
                  externalActualCost={externalActualCost}
                  externalCommission={externalCommission}
                  currency={currentCurrency}
                  lang={lang}
                  isDark={isDark}
                  onOpenProposal={() => setShowProposalModal(true)}
                  onOpenWhatsApp={() => setShowWhatsAppModal(true)}
                  onOpenNegotiation={() => setShowNegotiationModal(true)}
                  onDirectCopyWhatsApp={handleDirectCopyWhatsApp}
                  copiedToast={copiedToast}
                  milestoneMode={milestoneMode}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Floating Instant Toasts */}
      {copiedToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-4 h-4" />
          <span>{t.copiedSuccess}</span>
        </div>
      )}

      {aiSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-neutral-950 px-4 py-3 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-amber-300 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-md">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="line-clamp-2">{aiSuccessToast}</span>
        </div>
      )}

      {/* Modals for Proposals, WhatsApp, Negotiation, and Saved Quotes */}
      <FormalProposalModal
        isOpen={showProposalModal}
        onClose={() => {
          setShowProposalModal(false);
          if (currentTab === 'proposal') {
            setCurrentTab('pricing');
          }
        }}
        projectType={currentProjectType}
        features={features}
        externalCosts={externalCosts}
        currency={currentCurrency}
        client={client}
        agency={agency}
        deliveryDays={deliveryDays}
        milestoneMode={milestoneMode}
        lang={lang}
        isDark={isDark}
        defaultProposalLang={defaultProposalLang}
        onOpenSettings={() => setCurrentTab('settings')}
      />

      <WhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={() => {
          setShowWhatsAppModal(false);
          if (currentTab === 'whatsapp') {
            setCurrentTab('pricing');
          }
        }}
        projectType={currentProjectType}
        features={features}
        grandTotal={grandTotal}
        depositAmount={Math.round(
          grandTotal * (milestoneMode === '40-30-30' ? 0.4 : 0.5)
        )}
        deliveryDays={deliveryDays}
        currency={currentCurrency}
        client={client}
        agency={agency}
        lang={lang}
        isDark={isDark}
        defaultMessageLang={defaultProposalLang}
        onCopySuccess={() => {
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 2500);
        }}
        hasCopied={copiedToast}
      />

      <NegotiationModal
        isOpen={showNegotiationModal}
        onClose={() => {
          setShowNegotiationModal(false);
          if (currentTab === 'negotiation') {
            setCurrentTab('pricing');
          }
        }}
        isDark={isDark}
        currencyCode={currencyCode}
        lang={lang}
      />

      <SavedQuotesModal
        isOpen={showSavedQuotesModal}
        onClose={() => setShowSavedQuotesModal(false)}
        savedQuotes={savedQuotes}
        onSaveCurrent={handleSaveCurrentQuote}
        onLoadQuote={handleLoadQuote}
        onDeleteQuote={handleDeleteQuote}
        currency={currentCurrency}
        currentClientName={client.company || client.name}
        lang={lang}
        isDark={isDark}
      />

      {/* Footer */}
      <footer className="no-print max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-neutral-700/20 text-center text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>{t.appSubtitle} • {currentCurrency.marketName}.</p>
        <p className="font-mono text-[11px] text-neutral-400">
          {t.poweredByText}
        </p>
      </footer>
    </div>
  );
}
