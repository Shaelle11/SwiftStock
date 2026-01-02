'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { api, formatCurrency, debounce } from '@/lib/utils/api';
import { canSell } from '@/lib/inventory';
import type { Product, PaginatedResponse } from '@/lib/types';

interface ProductPickerProps {
  onAddToCart: (product: Product, quantity?: number) => void;
}

export default function ProductPicker({ onAddToCart }: ProductPickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string, category: string) => {
      await loadProducts(1, query, category);
    }, 300),
    []
  );

  const loadProducts = async (page: number = 1, search: string = '', category: string = '') => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '12',
      };

      if (search) params.search = search;
      if (category) params.category = category;

      const response = await api.get<PaginatedResponse<Product>>('/api/products', params);
      
      if (response.success && response.data) {
        setProducts(response.data.items);
        setTotalPages(response.data.pagination.pages);
        setCurrentPage(response.data.pagination.page);
      } else {
        setError(response.error || 'Failed to load products');
      }
    } catch {
      setError('An error occurred while loading products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get<string[]>('/api/products/categories');
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    debouncedSearch(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, debouncedSearch]);

  const handleAddToCart = (product: Product) => {
    if (!canSell(product, 1)) {
      alert('Product is out of stock!');
      return;
    }
    onAddToCart(product, 1);
  };

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) {
      return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (product.stockQuantity <= product.lowStockThreshold) {
      return { text: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    } else {
      return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="page-title text-teal-800">Product Selection</h1>
            <p className="text-gray-600 text-sm">Choose products to add to the cart</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
            <span>{products.length} products available</span>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="" className="text-gray-600">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category} className="text-gray-900">{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
              <div className="text-gray-500">Loading products...</div>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <svg className="w-12 h-12 text-teal-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
            <p className="text-gray-600 mb-2">No products found</p>
            {searchQuery || selectedCategory ? (
              <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
            ) : (
              <p className="text-sm text-gray-500">Add some products to get started</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                const canAddToCart = canSell(product, 1);

                return (
                  <div key={product.id} className="card hover:shadow-md transition-shadow">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                          width={64}
                          height={64}
                        />
                      ) : (
                        <div className="text-teal-400 text-4xl">📦</div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg text-gray-900">
                          {formatCurrency(product.sellingPrice)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600">
                        Stock: {product.stockQuantity} units
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!canAddToCart}
                        className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                          canAddToCart
                            ? 'btn btn-primary'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {canAddToCart ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => loadProducts(currentPage - 1, searchQuery, selectedCategory)}
                  disabled={currentPage <= 1}
                  className="btn btn-secondary text-sm px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => loadProducts(currentPage + 1, searchQuery, selectedCategory)}
                  disabled={currentPage >= totalPages}
                  className="btn btn-secondary text-sm px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
