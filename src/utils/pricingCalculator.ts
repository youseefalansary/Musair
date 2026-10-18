import { FeatureItem, ExternalCostItem } from '../types/pricing';

/**
 * Calculates total cost of currently active features in active currency.
 */
export function calculateActiveFeaturesTotal(features: FeatureItem[]): number {
  if (!Array.isArray(features)) return 0;
  return features
    .filter((f) => f && f.active && typeof f.price === 'number' && !isNaN(f.price))
    .reduce((acc, f) => acc + Math.max(0, f.price), 0);
}

/**
 * Calculates infrastructure actual pass-through cost and developer markup.
 */
export function calculateExternalCosts(items: ExternalCostItem[]): {
  actualCost: number;
  commission: number;
  total: number;
} {
  if (!Array.isArray(items)) {
    return { actualCost: 0, commission: 0, total: 0 };
  }
  const actualCost = items.reduce(
    (acc, item) => acc + (typeof item?.cost === 'number' && !isNaN(item.cost) ? Math.max(0, item.cost) : 0),
    0
  );
  const commission = items.reduce(
    (acc, item) => acc + (typeof item?.commission === 'number' && !isNaN(item.commission) ? Math.max(0, item.commission) : 0),
    0
  );
  return {
    actualCost,
    commission,
    total: actualCost + commission,
  };
}

/**
 * Computes the complete project quotation grand total.
 */
export function calculateGrandTotal(
  basePrice: number,
  featuresTotal: number,
  externalActualCost: number,
  externalCommission: number
): number {
  const safeBase = typeof basePrice === 'number' && !isNaN(basePrice) ? Math.max(0, basePrice) : 0;
  const safeFeat = typeof featuresTotal === 'number' && !isNaN(featuresTotal) ? Math.max(0, featuresTotal) : 0;
  const safeExtCost = typeof externalActualCost === 'number' && !isNaN(externalActualCost) ? Math.max(0, externalActualCost) : 0;
  const safeExtComm = typeof externalCommission === 'number' && !isNaN(externalCommission) ? Math.max(0, externalCommission) : 0;
  return safeBase + safeFeat + safeExtCost + safeExtComm;
}

/**
 * Calculates net developer earnings (excludes server pass-through costs).
 */
export function calculateNetEarnings(
  basePrice: number,
  featuresTotal: number,
  externalCommission: number
): number {
  const safeBase = typeof basePrice === 'number' && !isNaN(basePrice) ? Math.max(0, basePrice) : 0;
  const safeFeat = typeof featuresTotal === 'number' && !isNaN(featuresTotal) ? Math.max(0, featuresTotal) : 0;
  const safeExtComm = typeof externalCommission === 'number' && !isNaN(externalCommission) ? Math.max(0, externalCommission) : 0;
  return safeBase + safeFeat + safeExtComm;
}

/**
 * Calculates developer hourly rate based on delivery days and hours/day.
 */
export function calculateHourlyRate(
  netEarnings: number,
  deliveryDays: number,
  hoursPerDay: number = 5
): number {
  const safeDays = Math.max(1, typeof deliveryDays === 'number' && !isNaN(deliveryDays) ? deliveryDays : 1);
  const safeHoursPerDay = Math.max(1, hoursPerDay);
  const estimatedHours = Math.max(8, safeDays * safeHoursPerDay);
  return Math.round(netEarnings / estimatedHours);
}

/**
 * Computes tactical negotiation bands (Anchor, Fast-Close, Walk-Away Floor).
 */
export function calculateNegotiationBands(grandTotal: number, externalActualCost: number, currencyCode: string = 'EGP') {
  const anchorPrice = grandTotal;
  const step = currencyCode === 'USD' ? 25 : currencyCode === 'SAR' ? 50 : currencyCode === 'TRY' ? 250 : 100;
  const discountBuffer = Math.max(step, Math.round((grandTotal * 0.08) / step) * step);
  const fastClosePrice = Math.max(externalActualCost + step * 2, grandTotal - discountBuffer);
  const floorDiscount = Math.max(step * 2, Math.round((grandTotal * 0.15) / step) * step);
  const walkAwayFloor = Math.max(externalActualCost + step, grandTotal - floorDiscount);
  return {
    anchorPrice,
    fastClosePrice,
    walkAwayFloor,
  };
}

/**
 * Computes payment milestone amounts.
 */
export function calculateMilestones(
  grandTotal: number,
  milestoneMode: '40-30-30' | '50-50',
  rateAgainstEgp: number = 1
) {
  const depositPercent = milestoneMode === '40-30-30' ? 0.4 : 0.5;
  const depositAmount = Math.round(grandTotal * depositPercent * rateAgainstEgp);
  const midAmount = milestoneMode === '40-30-30' ? Math.round(grandTotal * 0.3 * rateAgainstEgp) : 0;
  const finalPercent = milestoneMode === '40-30-30' ? 0.3 : 0.5;
  const finalAmount = Math.round(grandTotal * finalPercent * rateAgainstEgp);
  return {
    depositAmount,
    midAmount,
    finalAmount,
    depositPercent,
    finalPercent,
  };
}

/**
 * Converts an EGP amount to target currency.
 */
export function convertAmount(amountInEgp: number, rateAgainstEgp: number): number {
  if (typeof amountInEgp !== 'number' || isNaN(amountInEgp)) return 0;
  const rate = typeof rateAgainstEgp === 'number' && rateAgainstEgp > 0 ? rateAgainstEgp : 1;
  return Math.round(amountInEgp * rate);
}
