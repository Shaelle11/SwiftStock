// App constants
export const APP_NAME = 'SwiftStock';
export const APP_VERSION = '1.0.0';

// API endpoints
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
  },
  PRODUCTS: {
    BASE: '/api/products',
    CATEGORIES: '/api/products/categories',
  },
  SALES: '/api/sales',
  TOOLS: '/api/tools',
} as const;

// UI constants
export const STOCK_LEVELS = {
  LOW: 10,
  MEDIUM: 50,
  HIGH: 100,
} as const;

export const STOCK_STATUS = {
  IN_STOCK: 'in-stock',
  LOW_STOCK: 'low-stock',
  OUT_OF_STOCK: 'out-of-stock',
} as const;