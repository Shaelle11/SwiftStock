'use client';

import { useState, useEffect, useContext } from 'react';
import { useAuth, AuthContext } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/utils/api';
import { getStoreBrandStyles } from '@/lib/store-branding';
import ProductTable from '@/components/features/inventory/ProductTable';
import ProductModal from '@/components/features/inventory/ProductModal';
import StockAdjustmentModal from '@/components/features/inventory/StockAdjustmentModal';
import type { Product, PaginatedResponse } from '@/lib/types';

interface InventoryStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
}

export default function BusinessInventory() {
  const { user, token } = useAuth();
  const { store } = useContext(AuthContext)!;
  const brandStyles = getStoreBrandStyles(store);
  const params = useParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<InventoryStats>({ totalProducts: 0, lowStock: 0, outOfStock: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const businessId = params?.businessId as string;

  const calculateStats = (productList: Product[]): InventoryStats => {
    return {
      totalProducts: productList.length,
      lowStock: productList.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold).length,
      outOfStock: productList.filter(p => p.stockQuantity === 0).length
    };
  };

  const loadProducts = async (page: number = 1, search: string = '', category: string = '', status: string = '') => {
    if (!user || !token) return;
    
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '20',
      };

      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;
      if (sortBy) params.sort = sortBy;

      const response = await api.get<PaginatedResponse<Product>>('/api/products', params);
      
      if (response.success && response.data) {
        setProducts(response.data.items);
        setStats(calculateStats(response.data.items));
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
        setStats({ totalProducts: 0, lowStock: 0, outOfStock: 0 });
      }
    } catch (err) {
      setError('Failed to load products');
      setProducts([]);
      setStats({ totalProducts: 0, lowStock: 0, outOfStock: 0 });
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadProducts();
    }
  }, [user, token, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts(1, searchQuery, selectedCategory, statusFilter);
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === 'category') {
      setSelectedCategory(value);
    } else if (type === 'status') {
      setStatusFilter(value);
    }
    setCurrentPage(1);
    loadProducts(1, searchQuery, type === 'category' ? value : selectedCategory, type === 'status' ? value : statusFilter);
  };

  const handleStatusCardClick = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    loadProducts(1, searchQuery, selectedCategory, status);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setStatusFilter('');
    setCurrentPage(1);
    loadProducts(1, '', '', '');
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/api/products/${product.id}`);
      
      if (response.success) {
        loadProducts(currentPage, searchQuery, selectedCategory, statusFilter);
      } else {
        alert('Failed to delete product: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('An error occurred while deleting the product');
    }
  };

  const handleStockAdjustment = (product: Product) => {
    setSelectedProduct(product);
    setShowStockModal(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowAddModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadProducts(page, searchQuery, selectedCategory, statusFilter);
  };

  const exportInventory = () => {
    // This would trigger a CSV export
    console.log('Exporting inventory...');
    alert('Export functionality coming soon!');
  };

  const importCSV = () => {
    // This would open file picker for CSV import
    console.log('Importing CSV...');
    alert('Import functionality coming soon!');
  };

  // Empty states
  const hasFiltersApplied = searchQuery || selectedCategory || statusFilter;
  const noProductsMessage = hasFiltersApplied 
    ? "No products match your filters." 
    : "You haven't added any products yet.";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
            <p className="text-gray-600">Manage products and stock levels</p>
          </div>
          
          {/* Primary Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={importCSV}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Import CSV
            </button>
            <button
              onClick={exportInventory}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Export
            </button>
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
              style={brandStyles.buttonStyle}
            >
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatusCardClick('')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-6m-10 0h6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatusCardClick('low')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatusCardClick('out')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Search, Filter & Sort */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Filters and Sort */}
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="stock">Sort by Stock</option>
                <option value="updated">Recently Updated</option>
                <option value="price">Sort by Price</option>
              </select>

              {hasFiltersApplied && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading inventory...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <ProductTable 
                products={products} 
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onView={handleEditProduct}
                onAdjustStock={handleStockAdjustment}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (page > totalPages) return null;
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 border rounded-lg ${
                            currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Empty State
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-6m-10 0h6" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{noProductsMessage}</h3>
                {!hasFiltersApplied ? (
                  <div className="space-y-3">
                    <p className="text-gray-500">Get started by adding your first product or importing from CSV.</p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={handleAddProduct}
                        className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                        style={brandStyles.buttonStyle}
                      >
                        Add your first product
                      </button>
                      <button
                        onClick={importCSV}
                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Import from CSV
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-500">Try adjusting your search terms or filters.</p>
                    <button
                      onClick={handleClearFilters}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        product={selectedProduct}
        onSave={() => loadProducts(currentPage, searchQuery, selectedCategory, statusFilter)}
        storeId={businessId}
      />

      <StockAdjustmentModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        product={selectedProduct}
        onSave={() => loadProducts(currentPage, searchQuery, selectedCategory, statusFilter)}
      />
    </div>
  );
}