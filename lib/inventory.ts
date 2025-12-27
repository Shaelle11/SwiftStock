/**
 * Inventory management utilities
 */

import type { Product } from '@/lib/types';

/**
 * Check if a product can be sold in the requested quantity
 * @param product - The product to check
 * @param quantity - The requested quantity
 * @returns True if product can be sold, false otherwise
 */
export function canSell(product: Product, quantity: number): boolean {
  return product.isActive && product.stockQuantity >= quantity;
}

/**
 * Check if a product is low on stock
 * @param product - The product to check
 * @returns True if product is low on stock
 */
export function isLowStock(product: Product): boolean {
  return product.stockQuantity <= product.lowStockThreshold;
}

/**
 * Check if a product is out of stock
 * @param product - The product to check
 * @returns True if product is out of stock
 */
export function isOutOfStock(product: Product): boolean {
  return product.stockQuantity === 0;
}

/**
 * Calculate stock value (cost price * quantity)
 * @param product - The product
 * @returns Total stock value at cost price
 */
export function calculateStockValue(product: Product): number {
  return product.costPrice * product.stockQuantity;
}

/**
 * Calculate potential revenue (selling price * quantity)
 * @param product - The product
 * @returns Total potential revenue at selling price
 */
export function calculatePotentialRevenue(product: Product): number {
  return product.sellingPrice * product.stockQuantity;
}

/**
 * Update product stock after sale
 * @param product - The product to update
 * @param quantitySold - The quantity sold
 * @returns Updated product with new stock quantity
 */
export function updateStock(product: Product, quantitySold: number): Product {
  return {
    ...product,
    stockQuantity: Math.max(0, product.stockQuantity - quantitySold),
    updatedAt: new Date()
  };
}

/**
 * Get stock status text and styling
 * @param product - The product to check
 * @returns Stock status information
 */
export function getStockStatus(product: Product): {
  status: 'out_of_stock' | 'low_stock' | 'in_stock';
  text: string;
  color: string;
} {
  if (isOutOfStock(product)) {
    return {
      status: 'out_of_stock',
      text: 'Out of Stock',
      color: 'red'
    };
  } else if (isLowStock(product)) {
    return {
      status: 'low_stock',
      text: 'Low Stock',
      color: 'yellow'
    };
  } else {
    return {
      status: 'in_stock',
      text: 'In Stock',
      color: 'green'
    };
  }
}
