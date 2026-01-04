// Document Generation Types
// Supporting 4 document families with consistent structure

export enum DocumentFamily {
  TRANSACTION = 'transaction',
  TAX = 'tax', 
  FINANCIAL = 'financial',
  SUPPORTING = 'supporting'
}

export enum DocumentType {
  // A. TRANSACTION DOCUMENTS (Operational)
  POS_RECEIPT = 'pos_receipt',
  ECOMMERCE_RECEIPT = 'ecommerce_receipt',
  
  // B. TAX DOCUMENTS (Compliance) 
  VAT_SUMMARY = 'vat_summary',
  VAT_TRANSACTIONS = 'vat_transactions',
  INPUT_VAT_SCHEDULE = 'input_vat_schedule',
  
  // C. FINANCIAL STATEMENTS (Preparation)
  PROFIT_LOSS = 'profit_loss',
  CASH_FLOW = 'cash_flow',
  BALANCE_SHEET = 'balance_sheet',
  
  // D. SUPPORTING EVIDENCE
  SALES_LEDGER = 'sales_ledger',
  PURCHASE_LEDGER = 'purchase_ledger',
  AUDIT_LOG = 'audit_log',
  TAX_PAYMENT_EVIDENCE = 'tax_payment_evidence'
}

export enum OutputFormat {
  PDF = 'pdf',
  CSV = 'csv',
  EMAIL_PDF = 'email_pdf',
  THERMAL = 'thermal',
  ZIP = 'zip'
}

// Business Identity Configuration (Single source of truth)
export interface BusinessIdentity {
  id: string;
  businessName: string;
  logoUrl?: string;
  logoEnabled: boolean;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  tin?: string; // Tax Identification Number
  cac?: string; // Corporate Affairs Commission
  currency: {
    code: string; // NGN, USD, etc.
    symbol: string; // ₦, $, etc.
    locale: string; // en-NG, en-US, etc.
  };
  footerMessage?: string; // For receipts only
}

// Document Header (Consistent across all documents)
export interface DocumentHeader {
  businessIdentity: BusinessIdentity;
  documentTitle: string;
  documentType: DocumentType;
  reportingPeriod?: {
    startDate: Date;
    endDate: Date;
  };
  generatedAt: Date;
  documentReferenceId: string;
}

// Receipt-specific types
export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ReceiptData {
  header: DocumentHeader;
  receiptNo: string;
  transactionDate: Date;
  items: ReceiptItem[];
  subtotal: number;
  vatAmount: number;
  vatRate: number; // e.g., 7.5 for 7.5%
  totalAmount: number;
  paymentMethod: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

// VAT Document types
export interface VATSummaryData {
  header: DocumentHeader;
  vatableSales: number;
  vatExemptSales: number;
  outputVAT: number;
  inputVAT: number;
  vatPayable: number; // This gets highlighted
  periodLocked: boolean;
  lockDate?: Date;
  transactions: VATTransaction[];
}

export interface VATTransaction {
  date: Date;
  description: string;
  vatableAmount: number;
  vatAmount: number;
  invoiceNo: string;
  type: 'output' | 'input';
}

// Financial Statement types
export interface ProfitLossData {
  header: DocumentHeader;
  revenue: {
    sales: number;
    otherIncome: number;
    total: number;
  };
  costOfGoodsSold: number;
  grossProfit: number;
  expenses: {
    [category: string]: number;
  };
  totalExpenses: number;
  netProfit: number;
  disclaimer: string; // Fixed, non-editable
}

export interface BalanceSheetData {
  header: DocumentHeader;
  assets: {
    current: {
      cash: number;
      inventory: number;
      accountsReceivable: number;
      other: number;
    };
    nonCurrent: {
      equipment: number;
      other: number;
    };
  };
  liabilities: {
    current: {
      accountsPayable: number;
      vatPayable: number;
      other: number;
    };
    nonCurrent: {
      longTermDebt: number;
      other: number;
    };
  };
  equity: {
    retainedEarnings: number;
    currentYearEarnings: number;
  };
  disclaimer: string; // Fixed, non-editable
}

export interface CashFlowData {
  header: DocumentHeader;
  operatingActivities: {
    cashReceipts: number;
    cashPayments: number;
    netCashFromOperations: number;
  };
  investingActivities: {
    equipmentPurchases: number;
    netCashFromInvesting: number;
  };
  financingActivities: {
    loansReceived: number;
    loanRepayments: number;
    netCashFromFinancing: number;
  };
  netCashFlow: number;
  disclaimer: string; // Fixed, non-editable
}

// Supporting Evidence types
export interface SalesLedgerData {
  header: DocumentHeader;
  entries: SalesLedgerEntry[];
  totalSales: number;
  totalVAT: number;
}

export interface SalesLedgerEntry {
  date: Date;
  invoiceNo: string;
  customerName: string;
  description: string;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
}

// Document customization limits
export interface ReceiptCustomization {
  businessName: string; // From BusinessIdentity
  logoEnabled: boolean; // From BusinessIdentity  
  footerMessage?: string; // Limited to 100 characters
  // ❌ Cannot change: VAT labels, calculations, section order
}

// Fixed disclaimers (non-editable)
export const FIXED_DISCLAIMERS = {
  FINANCIAL_DOCUMENT: "This document is generated from recorded transactions and is intended for preparation and record-keeping purposes only.",
  MANAGEMENT_ACCOUNTS: "Management Accounts (Unaudited)",
  VAT_DOCUMENT: "This VAT document is generated from recorded transactions for compliance purposes. Verify all amounts before filing."
} as const;

// Document generation request
export interface DocumentGenerationRequest {
  documentType: DocumentType;
  outputFormat: OutputFormat;
  businessId: string;
  data: any; // Will be typed based on documentType
  customization?: ReceiptCustomization;
}

// Document generation result
export interface DocumentGenerationResult {
  success: boolean;
  documentUrl?: string;
  fileName?: string;
  mimeType?: string;
  error?: string;
}