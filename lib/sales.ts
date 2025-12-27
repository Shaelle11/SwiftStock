/**
 * Sales calculation utilities
 */

interface SalesItem {
  price: number;
  quantity: number;
}

/**
 * Calculate subtotal for a list of items
 * @param items - Array of items with price and quantity
 * @returns The subtotal amount
 */
export function calculateSubtotal(items: SalesItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Calculate total with discount
 * @param subtotal - The subtotal amount
 * @param discountPercent - Discount percentage (0-100)
 * @returns The discounted amount
 */
export function applyDiscount(subtotal: number, discountPercent: number): number {
  const discountAmount = (subtotal * discountPercent) / 100;
  return Math.max(0, subtotal - discountAmount);
}

/**
 * Calculate final total with tax and discount
 * @param subtotal - The subtotal amount
 * @param taxAmount - The tax amount
 * @param discountPercent - Discount percentage (optional)
 * @returns The final total
 */
export function calculateTotal(
  subtotal: number, 
  taxAmount: number, 
  discountPercent: number = 0
): number {
  const discountedSubtotal = applyDiscount(subtotal, discountPercent);
  return discountedSubtotal + taxAmount;
}

/**
 * Calculate profit margin percentage
 * @param costPrice - The cost price
 * @param sellingPrice - The selling price
 * @returns Profit margin as percentage
 */
export function calculateProfitMargin(costPrice: number, sellingPrice: number): number {
  if (costPrice <= 0) return 0;
  return ((sellingPrice - costPrice) / costPrice) * 100;
}

/**
 * Calculate profit amount
 * @param costPrice - The cost price
 * @param sellingPrice - The selling price
 * @param quantity - The quantity sold
 * @returns Total profit amount
 */
export function calculateProfit(
  costPrice: number, 
  sellingPrice: number, 
  quantity: number
): number {
  return (sellingPrice - costPrice) * quantity;
}

/**
 * Calculate VAT (15% for Nigeria)
 * @param amount - The amount to calculate VAT on
 * @returns The VAT amount
 */
export function calculateVAT(amount: number): number {
  const VAT_RATE = 0.15; // 15% VAT rate for Nigeria
  return Math.round(amount * VAT_RATE * 100) / 100;
}
