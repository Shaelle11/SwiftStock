import type { Product } from '@/lib/types';

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Rice (50kg)",
    description: "High quality long grain rice, perfect for various dishes",
    category: "Grains",
    costPrice: 5000,
    sellingPrice: 6500,
    stockQuantity: 25,
    lowStockThreshold: 5,
    barcode: "1234567890123",
    imageUrl: "/images/products/rice.jpg",
    isActive: true,
    storeId: "store-1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-12-26")
  },
  {
    id: "2",
    name: "Black Beans (25kg)",
    description: "Fresh black beans, rich in protein and nutrients",
    category: "Grains",
    costPrice: 3000,
    sellingPrice: 4000,
    stockQuantity: 0,
    lowStockThreshold: 3,
    barcode: "1234567890124",
    imageUrl: "/images/products/beans.jpg",
    isActive: true,
    storeId: "store-1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-12-25")
  },
  {
    id: "3",
    name: "Fresh Tomatoes (1 crate)",
    description: "Farm fresh tomatoes, perfect for cooking and salads",
    category: "Vegetables",
    costPrice: 2500,
    sellingPrice: 3200,
    stockQuantity: 15,
    lowStockThreshold: 5,
    barcode: "1234567890125",
    imageUrl: "/images/products/tomatoes.jpg",
    isActive: true,
    storeId: "store-1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-12-26")
  },
  {
    id: "4",
    name: "Cooking Oil (5L)",
    description: "Pure vegetable cooking oil for all your cooking needs",
    category: "Condiments",
    costPrice: 1800,
    sellingPrice: 2300,
    stockQuantity: 8,
    lowStockThreshold: 10,
    barcode: "1234567890126",
    imageUrl: "/images/products/oil.jpg",
    isActive: true,
    storeId: "store-1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-12-26")
  },
  {
    id: "5",
    name: "Sugar (50kg)",
    description: "Premium white sugar for sweetening and baking",
    category: "Condiments",
    costPrice: 4500,
    sellingPrice: 5800,
    stockQuantity: 12,
    lowStockThreshold: 4,
    barcode: "1234567890127",
    imageUrl: "/images/products/sugar.jpg",
    isActive: true,
    storeId: "store-1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-12-26")
  },
  {
    id: "6",
    name: "Garri (50kg)",
    description: "Premium quality garri, a staple Nigerian food",
    category: "Grains",
    costPrice: 3500,
    sellingPrice: 4500,
    stockQuantity: 20,
    lowStockThreshold: 6,
    barcode: "1234567890128",
    imageUrl: "/images/products/garri.jpg",
    isActive: true,
    storeId: "store-1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-12-26")
  }
];

export const mockCategories = [
  "Grains",
  "Vegetables",
  "Fruits", 
  "Condiments",
  "Beverages",
  "Dairy",
  "Meat & Poultry",
  "Seafood",
  "Snacks",
  "Household Items"
];

// Helper function to get products by category
export function getProductsByCategory(category: string): Product[] {
  return mockProducts.filter(product => product.category === category);
}

// Helper function to get low stock products
export function getLowStockProducts(): Product[] {
  return mockProducts.filter(product => product.stockQuantity <= product.lowStockThreshold);
}

// Helper function to get out of stock products
export function getOutOfStockProducts(): Product[] {
  return mockProducts.filter(product => product.stockQuantity === 0);
}

// Helper function to search products
export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description?.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery) ||
    product.barcode?.includes(query)
  );
}
