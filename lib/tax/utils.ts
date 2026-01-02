// Nigerian tax and currency utilities

/**
 * Format amount as Nigerian Naira
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format amount as plain number with Nigerian thousand separators
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate VAT from gross amount (VAT-inclusive)
 */
export function calculateVATFromGross(grossAmount: number, vatRate: number = 7.5): {
  vatAmount: number;
  netAmount: number;
} {
  const vatMultiplier = vatRate / 100;
  const vatAmount = (grossAmount * vatMultiplier) / (1 + vatMultiplier);
  const netAmount = grossAmount - vatAmount;
  
  return {
    vatAmount: Math.round(vatAmount * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
  };
}

/**
 * Calculate VAT from net amount (VAT-exclusive)
 */
export function calculateVATFromNet(netAmount: number, vatRate: number = 7.5): {
  vatAmount: number;
  grossAmount: number;
} {
  const vatMultiplier = vatRate / 100;
  const vatAmount = netAmount * vatMultiplier;
  const grossAmount = netAmount + vatAmount;
  
  return {
    vatAmount: Math.round(vatAmount * 100) / 100,
    grossAmount: Math.round(grossAmount * 100) / 100,
  };
}

/**
 * Format Nigerian date for tax documents
 */
export function formatTaxDate(date: Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Generate tax period display string
 */
export function formatTaxPeriod(startDate: Date, endDate: Date): string {
  const start = formatTaxDate(startDate);
  const end = formatTaxDate(endDate);
  return `${start} – ${end}`;
}

/**
 * Validate Nigerian TIN format
 */
export function validateNigerianTIN(tin: string): boolean {
  // Nigerian TIN format: 12345678-0001
  // 8 digits, hyphen, 4 digits
  const tinRegex = /^\d{8}-\d{4}$/;
  return tinRegex.test(tin);
}

/**
 * Validate Nigerian CAC number format
 */
export function validateCACNumber(cacNumber: string): boolean {
  // CAC format variations: RC123456, BN1234567, IT123456
  const cacRegex = /^(RC|BN|IT)\d{6,7}$/i;
  return cacRegex.test(cacNumber);
}

/**
 * Get Nigerian VAT rate (standard 7.5%)
 */
export const NIGERIAN_VAT_RATE = 7.5;

/**
 * Tax categories for Nigerian businesses
 */
export const TAX_CATEGORIES = {
  VATABLE: 'VATABLE',
  VAT_EXEMPT: 'VAT_EXEMPT',
  ZERO_RATED: 'ZERO_RATED',
} as const;

export type TaxCategory = typeof TAX_CATEGORIES[keyof typeof TAX_CATEGORIES];

/**
 * Generate document reference number for tax reports
 */
export function generateTaxReference(prefix: string = 'VAT'): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  
  return `${prefix}-${year}-${month}-${random}`;
}

/**
 * Common tax periods for Nigerian businesses
 */
export const TAX_PERIODS = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  ANNUALLY: 'ANNUALLY',
} as const;

/**
 * Generate monthly tax period dates
 */
export function generateMonthlyTaxPeriod(year: number, month: number): {
  startDate: Date;
  endDate: Date;
} {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month
  
  return { startDate, endDate };
}

/**
 * Payment methods for Nigerian businesses
 */
export const PAYMENT_METHODS = [
  'POS',
  'Transfer',
  'Cash',
  'Cheque',
  'Mobile Money',
  'Online Payment',
] as const;