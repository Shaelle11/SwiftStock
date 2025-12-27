// Core type definitions for SwiftStock
export type UserRole = 'admin' | 'cashier' | 'customer';

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface User {
  id: string;
  email: string;
  password?: string; // Optional for client-side
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Store information for admin/cashier users
  storeId?: string;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  slug: string; // For public store URL
  isActive: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  // Branding
  logo?: string;
  theme?: StoreTheme;
}

export interface StoreTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  costPrice: number; // Purchase price
  sellingPrice: number; // Retail price
  stockQuantity: number;
  lowStockThreshold: number;
  barcode?: string;
  imageUrl?: string;
  isActive: boolean;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  storeId: string;
  cashierId: string; // User who recorded the sale
  customerId?: string; // Optional for walk-in customers
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'other';
  notes?: string;
  createdAt: Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string; // Store name at time of sale
  unitPrice: number; // Price at time of sale
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  customerId?: string; // null for guest carts
  storeId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // For guest carts
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  customerId?: string; // null for guest orders
  customerInfo: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

// Dashboard Analytics Types
export interface DashboardStats {
  todayStats: DailyStats;
  weeklyStats: WeeklyStats;
  monthlyStats: MonthlyStats;
  lowStockProducts: Product[];
  recentSales: Sale[];
  topProducts: ProductSalesData[];
}

export interface DailyStats {
  date: string;
  totalSales: number;
  totalRevenue: number;
  transactionCount: number;
  averageOrderValue: number;
}

export interface WeeklyStats {
  week: string;
  totalSales: number;
  totalRevenue: number;
  transactionCount: number;
  dailyBreakdown: DailyStats[];
}

export interface MonthlyStats {
  month: string;
  totalSales: number;
  totalRevenue: number;
  transactionCount: number;
  weeklyBreakdown: WeeklyStats[];
}

export interface ProductSalesData {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface ProductFormData {
  name: string;
  description?: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  barcode?: string;
  imageUrl?: string;
}

export interface SaleFormData {
  customerId?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  paymentMethod: 'cash' | 'card' | 'transfer' | 'other';
  notes?: string;
  discount?: number;
}

export interface CheckoutFormData {
  customerInfo: CustomerInfo;
  paymentMethod: string;
  notes?: string;
}

// Filter and Search Types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

export interface SalesFilters {
  startDate?: Date;
  endDate?: Date;
  cashierId?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Constants
export const USER_ROLES: UserRole[] = ['admin', 'cashier', 'customer'];
export const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];
export const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded'];
export const PAYMENT_METHODS = ['cash', 'card', 'transfer', 'other'] as const;

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}