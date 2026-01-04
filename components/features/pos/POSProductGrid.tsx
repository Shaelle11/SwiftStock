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
      <div className="mb-4 lg:mb-6">
        <div className="relative">
          <input
            ref={searchInputRef}
            id="pos-search"
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full px-4 py-2 lg:py-3 pl-10 lg:pl-12 text-base lg:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
          <svg className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-4 lg:mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryFilter('')}
            className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
              selectedCategory === '' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryFilter(category)}
              className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4 pb-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4 animate-pulse">
                <div className="bg-gray-200 h-24 lg:h-32 rounded-lg mb-3"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded mb-2 w-1/2"></div>
                <div className="bg-gray-200 h-8 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6 pb-4">
            {products.map((product) => {
              const stockStatus = getStockStatus(product);
              const isOutOfStock = stockStatus === 'out-of-stock';
              
              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-200 ${
                    isOutOfStock 
                      ? 'opacity-60 cursor-not-allowed border-gray-200' 
                      : 'hover:shadow-md hover:border-teal-200 hover:scale-[1.02] cursor-pointer border-gray-200'
                  }`}
                  onClick={() => !isOutOfStock && onAddToCart(product)}
                >
                  {/* Product Image */}
                  <div className="relative h-32 lg:h-40 xl:h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="text-gray-300">
                        <svg className="w-12 h-12 lg:w-16 lg:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Stock Status Badge */}
                    <div className="absolute top-2 lg:top-3 right-2 lg:right-3">
                      {isOutOfStock ? (
                        <span className="bg-red-500 text-white px-2 lg:px-3 py-1 rounded-full text-xs font-medium">
                          Out of Stock
                        </span>
                      ) : stockStatus === 'low-stock' ? (
                        <span className="bg-amber-500 text-white px-2 lg:px-3 py-1 rounded-full text-xs font-medium">
                          Low Stock
                        </span>
                      ) : (
                        <span className="bg-green-500 text-white px-2 lg:px-3 py-1 rounded-full text-xs font-medium">
                          In Stock
                        </span>
                      )}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-2 lg:top-3 left-2 lg:left-3">
                      <span className="bg-white bg-opacity-95 text-gray-600 px-2 lg:px-3 py-1 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 lg:p-4 xl:p-6">
                    <div className="mb-3 lg:mb-4">
                      <h3 className="font-semibold text-base lg:text-lg xl:text-xl text-gray-900 mb-2 line-clamp-2 leading-relaxed">
                        {product.name}
                      </h3>
                      
                      {product.description && (
                        <p className="text-xs lg:text-sm text-gray-600 line-clamp-2 mb-2 lg:mb-3 leading-relaxed">
                          {product.description}
                        </p>
                      )}

                      {product.barcode && (
                        <div className="flex items-center text-xs text-gray-500 mb-2 lg:mb-3">
                          <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v8a2 2 0 002 2h2m6-12h2a2 2 0 012 2v8a2 2 0 01-2 2h-2m-6-12v12m6-12v12" />
                          </svg>
                          <span className="font-mono text-xs">{product.barcode}</span>
                        </div>
                      )}
                    </div>

                    {/* Price and Stock Info */}
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <div>
                        <span className="text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900">
                          {formatCurrency(product.sellingPrice)}
                        </span>
                        {product.costPrice > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Cost: {formatCurrency(product.costPrice)}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getStockColor(stockStatus)}`}>
                          {product.stockQuantity} units
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Available
                        </div>
                      </div>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isOutOfStock) onAddToCart(product);
                      }}
                      disabled={isOutOfStock}
                      className={`w-full py-2 lg:py-3 px-3 lg:px-4 rounded-lg font-medium text-sm lg:text-base transition-all duration-200 ${
                        isOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 hover:shadow-md transform hover:scale-[1.02]'
                      }`}
                    >
                      {isOutOfStock ? (
                        <div className="flex items-center justify-center">
                          <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                          </svg>
                          <span className="hidden sm:inline">Out of Stock</span>
                          <span className="sm:hidden">Out</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="hidden sm:inline">Add to Cart</span>
                          <span className="sm:hidden">Add</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 px-4">
            <svg className="w-12 h-12 lg:w-16 lg:h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-6m-10 0h6" />
            </svg>
            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-1">No products found</h3>
            <p className="text-sm lg:text-base text-gray-500 text-center max-w-md">
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
// CSS classes for line clamping are available in Tailwind CSS v3+