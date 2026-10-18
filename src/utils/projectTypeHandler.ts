import { FeatureItem, ProjectType } from '../types/pricing';

/**
 * Features that are strictly incompatible or inappropriate for specific project types.
 */
export const INCOMPATIBLE_FEATURES_BY_PROJECT_TYPE: Record<string, string[]> = {
  landing_page: [
    'f_inventory',
    'f_roles',
    'f_qr_code',
    'f_pdf_invoice',
    'f_shipping_sar',
    'f_shipping_usd',
    'f_kargo_try',
    'f_zatca',
    'f_efatura',
    'f_payment_sar',
    'f_payment_usd',
    'f_payment_try',
  ],
  restaurant_menu: [
    'f_inventory',
    'f_roles',
    'f_calendar',
    'f_pdf_invoice',
    'f_shipping_sar',
    'f_shipping_usd',
    'f_kargo_try',
  ],
  factory_corp: [
    'f_qr_code',
    'f_inventory',
    'f_calendar',
    'f_shipping_sar',
    'f_shipping_usd',
    'f_kargo_try',
  ],
  portfolio_booking: [
    'f_qr_code',
    'f_inventory',
    'f_roles',
    'f_shipping_sar',
    'f_shipping_usd',
    'f_kargo_try',
  ],
  custom_erp: [
    'f_qr_code',
    'f_pixel_analytics',
  ],
  ecommerce: [
    'f_qr_code',
    'f_calendar',
  ],
};

export interface ProjectTypeSwitchResult {
  updatedFeatures: FeatureItem[];
  deliveryDays: number;
  deactivatedFeatureNames: string[];
  activatedFeatureNames: string[];
}

/**
 * Handles switching project type:
 * - Activates default features for the new project type.
 * - Deactivates features that are incompatible or inappropriate for the new archetype.
 * - Preserves user-created custom features (isCustom: true).
 * - Always ensures core features (like f_responsive) remain active.
 */
export function handleProjectTypeSwitch(
  newProjectTypeId: string,
  projectTypes: ProjectType[],
  currentFeatures: FeatureItem[]
): ProjectTypeSwitchResult {
  const targetPt = projectTypes.find((p) => p.id === newProjectTypeId) || projectTypes[0];
  const targetDefaults = new Set(targetPt.defaultFeatures || []);
  const incompatibleIds = new Set(INCOMPATIBLE_FEATURES_BY_PROJECT_TYPE[newProjectTypeId] || []);

  const deactivatedFeatureNames: string[] = [];
  const activatedFeatureNames: string[] = [];

  const updatedFeatures = currentFeatures.map((feature) => {
    // 1. User-created custom features are always preserved as the user intentionally set them
    if (feature.isCustom) {
      return { ...feature };
    }

    // 2. Core universal features (responsive design) always stay active
    if (feature.id === 'f_responsive') {
      return { ...feature, active: true };
    }

    // 3. If feature is a default for the new project type, activate it
    if (targetDefaults.has(feature.id)) {
      if (!feature.active) {
        activatedFeatureNames.push(feature.name);
      }
      return { ...feature, active: true };
    }

    // 4. If feature is strictly incompatible with the new archetype, deactivate it
    if (incompatibleIds.has(feature.id)) {
      if (feature.active) {
        deactivatedFeatureNames.push(feature.name);
      }
      return { ...feature, active: false };
    }

    return { ...feature };
  });

  return {
    updatedFeatures,
    deliveryDays: targetPt.typicalDays,
    deactivatedFeatureNames,
    activatedFeatureNames,
  };
}
