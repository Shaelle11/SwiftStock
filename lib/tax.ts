/**
 * Tax calculation utilities
 */

/**
 * Calculate VAT (Value Added Tax) at 7.5% rate
 * @param amount - The amount to calculate VAT for
 * @returns The VAT amount
 */
export function calculateVAT(amount: number): number {
  return amount * 0.075;
}

/**
 * Calculate tax with custom rate
 * @param amount - The amount to calculate tax for
 * @param rate - Tax rate as decimal (e.g., 0.075 for 7.5%)
 * @returns The tax amount
 */
export function calculateTax(amount: number, rate: number): number {
  return amount * rate;
}

/**
 * Calculate total amount including VAT
 * @param amount - The base amount
 * @returns Total amount with VAT included
 */
export function addVAT(amount: number): number {
  return amount + calculateVAT(amount);
}

/**
 * Calculate base amount from total with VAT
 * @param totalWithVAT - The total amount including VAT
 * @returns The base amount before VAT
 */
export function removeVAT(totalWithVAT: number): number {
  return totalWithVAT / 1.075;
}
