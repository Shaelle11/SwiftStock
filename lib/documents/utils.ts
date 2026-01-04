// Document generation utilities
// Consistent formatting and structure across all document families

import { BusinessIdentity, DocumentHeader, DocumentType, FIXED_DISCLAIMERS } from './types';

export class DocumentUtils {
  
  // Generate consistent document header across all families
  static generateDocumentHeader(
    businessIdentity: BusinessIdentity,
    documentType: DocumentType,
    documentTitle: string,
    reportingPeriod?: { startDate: Date; endDate: Date }
  ): DocumentHeader {
    return {
      businessIdentity,
      documentTitle,
      documentType,
      reportingPeriod,
      generatedAt: new Date(),
      documentReferenceId: this.generateDocumentReference(documentType)
    };
  }

  // Generate document reference ID
  static generateDocumentReference(documentType: DocumentType): string {
    const prefix = this.getDocumentPrefix(documentType);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  private static getDocumentPrefix(documentType: DocumentType): string {
    switch (documentType) {
      case DocumentType.POS_RECEIPT: return 'POS';
      case DocumentType.ECOMMERCE_RECEIPT: return 'EC';
      case DocumentType.VAT_SUMMARY: return 'VAT';
      case DocumentType.VAT_TRANSACTIONS: return 'VATTX';
      case DocumentType.INPUT_VAT_SCHEDULE: return 'IVAT';
      case DocumentType.PROFIT_LOSS: return 'PL';
      case DocumentType.CASH_FLOW: return 'CF';
      case DocumentType.BALANCE_SHEET: return 'BS';
      case DocumentType.SALES_LEDGER: return 'SL';
      case DocumentType.PURCHASE_LEDGER: return 'PL';
      case DocumentType.AUDIT_LOG: return 'AL';
      case DocumentType.TAX_PAYMENT_EVIDENCE: return 'TPE';
      default: return 'DOC';
    }
  }

  // Format currency consistently
  static formatCurrency(amount: number, currency: BusinessIdentity['currency']): string {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Format currency for CSV (no symbols, clean numbers)
  static formatCurrencyForCSV(amount: number): string {
    return amount.toFixed(2);
  }

  // Format date consistently 
  static formatDate(date: Date, locale: string = 'en-NG'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    }).format(date);
  }

  // Format date and time for receipts
  static formatDateTime(date: Date, locale: string = 'en-NG'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }

  // Format reporting period
  static formatReportingPeriod(period: { startDate: Date; endDate: Date }, locale: string = 'en-NG'): string {
    const start = this.formatDate(period.startDate, locale);
    const end = this.formatDate(period.endDate, locale);
    return `${start} - ${end}`;
  }

  // Calculate VAT amount
  static calculateVAT(amount: number, vatRate: number): number {
    return (amount * vatRate) / 100;
  }

  // Calculate amount excluding VAT
  static calculateExcludingVAT(grossAmount: number, vatRate: number): number {
    return grossAmount / (1 + (vatRate / 100));
  }

  // Get fixed disclaimer for document type
  static getDisclaimer(documentType: DocumentType): string {
    switch (documentType) {
      case DocumentType.VAT_SUMMARY:
      case DocumentType.VAT_TRANSACTIONS:
      case DocumentType.INPUT_VAT_SCHEDULE:
        return FIXED_DISCLAIMERS.VAT_DOCUMENT;
      
      case DocumentType.PROFIT_LOSS:
      case DocumentType.CASH_FLOW:
      case DocumentType.BALANCE_SHEET:
        return FIXED_DISCLAIMERS.FINANCIAL_DOCUMENT;
      
      default:
        return FIXED_DISCLAIMERS.FINANCIAL_DOCUMENT;
    }
  }

  // Validate business identity configuration
  static validateBusinessIdentity(identity: BusinessIdentity): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!identity.businessName?.trim()) {
      errors.push('Business name is required');
    }

    if (!identity.address?.street?.trim()) {
      errors.push('Street address is required');
    }

    if (!identity.address?.city?.trim()) {
      errors.push('City is required');
    }

    if (!identity.currency?.code?.trim()) {
      errors.push('Currency code is required');
    }

    if (!identity.currency?.symbol?.trim()) {
      errors.push('Currency symbol is required');
    }

    if (identity.footerMessage && identity.footerMessage.length > 100) {
      errors.push('Footer message must be 100 characters or less');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Generate file name for document
  static generateFileName(
    documentType: DocumentType, 
    businessName: string, 
    reportingPeriod?: { startDate: Date; endDate: Date }
  ): string {
    const businessSlug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const docTypeSlug = documentType.toLowerCase();
    
    if (reportingPeriod) {
      const startMonth = reportingPeriod.startDate.toISOString().slice(0, 7); // YYYY-MM
      const endMonth = reportingPeriod.endDate.toISOString().slice(0, 7);
      return `${businessSlug}_${docTypeSlug}_${startMonth}_to_${endMonth}`;
    }
    
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `${businessSlug}_${docTypeSlug}_${timestamp}`;
  }

  // Sanitize text for CSV export
  static sanitizeForCSV(text: string): string {
    if (!text) return '';
    // Escape quotes and handle commas
    return text.replace(/"/g, '""');
  }

  // Right-align numbers for table display
  static rightAlignNumber(amount: number, currency: BusinessIdentity['currency']): string {
    const formatted = this.formatCurrency(amount, currency);
    return formatted.padStart(15, ' '); // Consistent alignment
  }

  // Clean table formatting for PDFs
  static formatTableRow(cells: (string | number)[], currency?: BusinessIdentity['currency']): string[] {
    return cells.map(cell => {
      if (typeof cell === 'number' && currency) {
        return this.formatCurrency(cell, currency);
      }
      return String(cell);
    });
  }
}

// Document styling constants
export const DOCUMENT_STYLES = {
  fonts: {
    heading: {
      family: 'Arial, sans-serif',
      size: '16px',
      weight: '500'
    },
    body: {
      family: 'Arial, sans-serif', 
      size: '14px',
      weight: '400'
    },
    table: {
      family: 'Arial, sans-serif',
      size: '12px', 
      weight: '400'
    },
    small: {
      family: 'Arial, sans-serif',
      size: '10px',
      weight: '400'
    }
  },
  colors: {
    text: '#000000',
    muted: '#666666',
    border: '#cccccc',
    highlight: '#e74c3c', // For VAT payable highlighting
    success: '#27ae60',
    warning: '#f39c12'
  },
  spacing: {
    section: '20px',
    subsection: '12px',
    line: '6px'
  }
} as const;