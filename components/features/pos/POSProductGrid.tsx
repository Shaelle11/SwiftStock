'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils/api';
import type { Product } from '@/lib/types';

interface POSProductGridProps {
  products: Product[];
  categories: string[];
  loading: boolean;
  searchQuery: string;
  selectedCategory: string;
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function POSProductGrid({
  products,
  categories,
  loading,
  searchQuery,
  selectedCategory,
  onSearch,
  onCategoryFilter,
  onAddToCart
}: POSProductGridProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) return 'out-of-stock';
    if (product.stockQuantity <= product.lowStockThreshold) return 'low-stock';
    return 'in-stock';
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'out-of-stock': return 'text-red-600';
      case 'low-stock': return 'text-amber-600';
      default: return 'text-green-600';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            ref={searchInputRef}
            id="pos-search"
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryFilter('')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === '' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryFilter(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded mb-2 w-1/2"></div>
                <div className="bg-gray-200 h-8 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {products.map((product) => {
              const stockStatus = getStockStatus(product);
              const isOutOfStock = stockStatus === 'out-of-stock';
              
              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 ${
                    isOutOfStock 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:shadow-lg hover:border-blue-300 cursor-pointer'
                  }`}
                  onClick={() => !isOutOfStock && onAddToCart(product)}
                >
                  {/* Product Image */}
                  <div className="relative h-32 bg-gray-100 flex items-center justify-center">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="text-gray-400 text-2xl">📦</div>
                    )}
                    
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {product.sku && <span>SKU: {product.sku}</span>}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                      <span className={`text-sm font-medium ${getStockColor(stockStatus)}`}>
                        Stock: {product.stockQuantity}
                      </span>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isOutOfStock) onAddToCart(product);
                      }}
                      disabled={isOutOfStock}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        isOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                      }`}
                    >
                      {isOutOfStock ? 'Out of Stock' : '+ Add'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-6m-10 0h6" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
            <p className="text-gray-500 text-center max-w-md">
              {searchQuery || selectedCategory 
                ? 'Try adjusting your search or filter to find products.'
                : 'No products available. Add products to your inventory to start selling.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Utility class for line clamping
const styles = `
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
`;