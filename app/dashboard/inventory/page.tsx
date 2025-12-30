'use client';

import { useState, useEffect, useContext } from 'react';
import { useAuth, AuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/utils/api';
import { getStoreBrandStyles } from '@/lib/store-branding';
import ProductTable from '@/components/features/inventory/ProductTable';
import Link from 'next/link';
import type { Product, PaginatedResponse } from '@/lib/types';

export default function InventoryPage() {
  const { user } = useAuth();
  const { store } = useContext(AuthContext)!;
  const brandStyles = getStoreBrandStyles(store);
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);

  const loadProducts = async (page: number = 1, search: string = '', category: string = '') => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '20',
      };

      if (search) params.search = search;
      if (category) params.category = category;

      const response = await api.get<PaginatedResponse<Product>>('/api/products', params);
      
      if (response.success && response.data) {
        setProducts(response.data.items);
        setTotalPages(response.data.pagination.pages);
        setCurrentPage(response.data.pagination.page);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(response.data.items.map(product => product.category))
        );
        setCategories(uniqueCategories);
      } else {
        setError(response.message || 'Failed to load products');
        setProducts([]);
      }
    } catch (err) {
      setError('Failed to load products');
      setProducts([]);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  // Auto-refresh when window gains focus (useful when returning from POS)
  useEffect(() => {
    const handleFocus = () => {
      if (user && document.visibilityState === 'visible') {
        loadProducts(currentPage, searchQuery, selectedCategory);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [user, currentPage, searchQuery, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts(1, searchQuery, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    loadProducts(1, searchQuery, category);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadProducts(page, searchQuery, selectedCategory);
  };

  const handleEditProduct = (product: Product) => {
    router.push(`/dashboard/inventory/${product.id}`);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/api/products/${product.id}`);
      
      if (response.success) {
        // Refresh the products list
        loadProducts(currentPage, searchQuery, selectedCategory);
      } else {
        alert('Failed to delete product: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('An error occurred while deleting the product');
    }
  };

  const handleViewProduct = (product: Product) => {
    router.push(`/dashboard/inventory/${product.id}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600">Manage your products and stock levels</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Products</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadProducts(currentPage, searchQuery, selectedCategory)}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <Link 
                href="/dashboard/inventory/new"
                className="text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
                style={brandStyles.buttonStyle}
              >
                Add Product
              </Link>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading inventory...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <ProductTable 
                products={products} 
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onView={handleViewProduct}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 border rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery || selectedCategory 
                  ? 'No products found matching your criteria.' 
                  : 'No products found. Start by adding your first product.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}