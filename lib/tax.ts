/**
 * Tax Management System
 * 
 * Core principle: "Record Once, Reuse Many Times"
 * 
 * This module handles all tax calculations and ensures Nigerian tax compliance.
 * Every transaction is captured with immutable tax snapshots for audit purposes.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Nigerian VAT Configuration
export const NIGERIA_VAT_RATE = 0.075; // 7.5%

export interface TaxCalculation {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  taxableAmount: number;
  total: number;
}

export interface TaxRecordData {
  storeId: string;
  saleId?: string;
  orderId?: string;
  taxableAmount: number;
  vatRate: number;
  vatCollected: number;
  totalAmount: number;
  transactionType: 'SALE' | 'ORDER';
  paymentMethod: string;
}

/**
 * Calculate tax for a transaction
 * @param subtotal - Amount before tax
 * @param vatRate - VAT rate to apply (default: Nigerian 7.5%)
 */
export function calculateTax(subtotal: number, vatRate: number = NIGERIA_VAT_RATE): TaxCalculation {
  const taxableAmount = subtotal;
  const vatAmount = Math.round((taxableAmount * vatRate) * 100) / 100; // Round to 2 decimal places
  const total = taxableAmount + vatAmount;

  return {
    subtotal,
    vatRate,
    vatAmount,
    taxableAmount,
    total,
  };
}

/**
 * Calculate VAT (Value Added Tax) at 7.5% rate
 * @param amount - The amount to calculate VAT for
 * @returns The VAT amount
 */
export function calculateVAT(amount: number): number {
  return Math.round((amount * NIGERIA_VAT_RATE) * 100) / 100;
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

/**
 * Get store tax settings
 */
export async function getStoreTaxSettings(storeId: string) {
  let settings = await prisma.storeSettings.findUnique({
    where: { storeId },
  });

  // Create default settings if none exist
  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: {
        storeId,
        vatEnabled: true,
        vatRate: NIGERIA_VAT_RATE,
      },
    });
  }

  return settings;
}

/**
 * Create immutable tax record for a transaction
 * This is the core "tax snapshot" that never changes
 */
export async function createTaxRecord(data: TaxRecordData) {
  const now = new Date();
  const taxPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  return await prisma.taxRecord.create({
    data: {
      ...data,
      taxPeriod,
      taxYear: now.getFullYear(),
      taxMonth: now.getMonth() + 1,
    },
  });
}

/**
 * Get tax summary for a specific period
 */
export async function getTaxSummary(storeId: string, period: string) {
  return await prisma.taxSummary.findUnique({
    where: {
      storeId_period: {
        storeId,
        period,
      },
    },
  });
}

/**
 * Generate monthly tax summary
 * This aggregates all tax records for the period
 */
export async function generateMonthlySummary(storeId: string, year: number, month: number) {
  const period = `${year}-${String(month).padStart(2, '0')}`;
  
  // Check if summary already exists
  const existing = await getTaxSummary(storeId, period);
  if (existing && existing.isFinalized) {
    throw new Error(`Tax summary for ${period} is already finalized and cannot be modified`);
  }

  // Aggregate tax records for the period
  const taxRecords = await prisma.taxRecord.findMany({
    where: {
      storeId,
      taxYear: year,
      taxMonth: month,
    },
  });

  const totals = taxRecords.reduce(
    (acc: {
      totalSales: number;
      totalVatCollected: number;
      totalOrders: number;
      totalRevenue: number;
    }, record: {
      taxableAmount: number;
      vatCollected: number;
      totalAmount: number;
    }) => ({
      totalSales: acc.totalSales + record.taxableAmount,
      totalVatCollected: acc.totalVatCollected + record.vatCollected,
      totalOrders: acc.totalOrders + 1,
      totalRevenue: acc.totalRevenue + record.totalAmount,
    }),
    {
      totalSales: 0,
      totalVatCollected: 0,
      totalOrders: 0,
      totalRevenue: 0,
    }
  );

  // Upsert the summary
  return await prisma.taxSummary.upsert({
    where: {
      storeId_period: {
        storeId,
        period,
      },
    },
    update: {
      ...totals,
      generatedAt: new Date(),
    },
    create: {
      storeId,
      period,
      year,
      month,
      ...totals,
    },
  });
}

/**
 * Get tax records for a date range
 */
export async function getTaxRecords(
  storeId: string,
  startDate: Date,
  endDate: Date
) {
  return await prisma.taxRecord.findMany({
    where: {
      storeId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      sale: {
        include: {
          items: true,
        },
      },
      order: {
        include: {
          items: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Export tax data as CSV
 */
export function generateTaxCSV(taxRecords: {
  createdAt: Date;
  transactionType: string;
  saleId?: string;
  orderId?: string;
  taxableAmount: number;
  vatRate: number;
  vatCollected: number;
  totalAmount: number;
  paymentMethod: string;
}[]): string {
  const headers = [
    'Date',
    'Transaction Type',
    'Reference ID',
    'Taxable Amount',
    'VAT Rate',
    'VAT Collected',
    'Total Amount',
    'Payment Method',
  ];

  const rows = taxRecords.map(record => [
    new Date(record.createdAt).toISOString().split('T')[0],
    record.transactionType,
    record.saleId || record.orderId || '',
    record.taxableAmount.toFixed(2),
    (record.vatRate * 100).toFixed(1) + '%',
    record.vatCollected.toFixed(2),
    record.totalAmount.toFixed(2),
    record.paymentMethod,
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Get dashboard tax stats
 */
export async function getTaxDashboardStats(storeId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [monthlyRecords, yearlyRecords, currentSettings] = await Promise.all([
    prisma.taxRecord.findMany({
      where: {
        storeId,
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.taxRecord.findMany({
      where: {
        storeId,
        createdAt: { gte: startOfYear },
      },
    }),
    getStoreTaxSettings(storeId),
  ]);

  const monthlyTotals = monthlyRecords.reduce(
    (acc: { revenue: number; vatCollected: number; transactions: number }, record: { totalAmount: number; vatCollected: number }) => ({
      revenue: acc.revenue + record.totalAmount,
      vatCollected: acc.vatCollected + record.vatCollected,
      transactions: acc.transactions + 1,
    }),
    { revenue: 0, vatCollected: 0, transactions: 0 }
  );

  const yearlyTotals = yearlyRecords.reduce(
    (acc: { revenue: number; vatCollected: number; transactions: number }, record: { totalAmount: number; vatCollected: number }) => ({
      revenue: acc.revenue + record.totalAmount,
      vatCollected: acc.vatCollected + record.vatCollected,
      transactions: acc.transactions + 1,
    }),
    { revenue: 0, vatCollected: 0, transactions: 0 }
  );

  return {
    currentMonth: monthlyTotals,
    currentYear: yearlyTotals,
    vatEnabled: currentSettings.vatEnabled,
    vatRate: currentSettings.vatRate,
  };
}
