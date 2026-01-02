'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

interface Store {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phone: string;
  email: string;
  slug: string;
  isActive: boolean;
  isPublic: boolean;
  logoUrl: string | null;
  primaryColor: string;
  category?: string;
  _count: {
    products: number;
  };
}

export default function ExplorePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/public/stores');
      if (response.ok) {
        const data = await response.json();
        // Only show public and active stores
        setStores((data.stores || []).filter((store: Store) => store.isPublic && store.isActive));
      } else {
        setError('Failed to load stores');
      }
    } catch (error) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || store.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedStores = [...filteredStores].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'new':
        return b.id.localeCompare(a.id); // Assuming newer stores have higher IDs
      case 'popular':
      default:
        return b._count.products - a._count.products; // More products = more popular
    }
  });

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'retail', name: 'Retail' },
    { id: 'food', name: 'Food & Dining' },
    { id: 'services', name: 'Services' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'health', name: 'Health & Beauty' },
  ];

  const sortOptions = [
    { id: 'popular', name: 'Popular' },
    { id: 'new', name: 'New' },
    { id: 'name', name: 'A–Z' },
  ];

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-16 w-16 mb-4"></div>
            <div className="bg-gray-200 h-4 mb-2 rounded"></div>
            <div className="bg-gray-200 h-3 mb-2 rounded w-3/4"></div>
            <div className="bg-gray-200 h-3 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Soft auth banner for guests
  const SoftAuthBanner = () => {
    if (user) return null; // Don't show for logged-in users

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            <p className="text-gray-900 font-medium">Create an account to track orders and shop faster next time.</p>
          </div>
          <div className="flex items-center space-x-4 ml-6">
            <Link 
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Log in
            </Link>
            <Link 
              href="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create account
            </Link>
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20"> {/* Extra bottom padding for auth banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="page-title mb-2">Explore Stores</h1>
            <p className="text-gray-600 text-sm">
              Browse public stores powered by our platform
            </p>
            {stores.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Showing {sortedStores.length} stores
              </p>
            )}
          </div>

          {/* Search & Filters Section */}
          <div className="card mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              
              {/* Search Input */}
              <div className="md:col-span-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search by store name or product"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="" className="text-gray-600">Sort by</option>
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && <LoadingSkeleton />}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <button
                  onClick={fetchStores}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && sortedStores.length === 0 && (
            <div className="text-center py-16">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                No stores match your search yet.
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters or search terms.
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Clear filters
                </button>
                {user && (
                  <Link 
                    href="/app/create-business"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors inline-block"
                  >
                    Create a store
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Store Grid */}
          {!loading && !error && sortedStores.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedStores.map((store) => (
                <div
                  key={store.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => router.push(`/store/${store.slug}`)}
                >
                  {/* Logo */}
                  <div className="mb-4">
                    <div 
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform"
                      style={{ 
                        backgroundColor: store.primaryColor && store.primaryColor !== '' 
                          ? store.primaryColor 
                          : `hsl(${store.name.charCodeAt(0) * 137.5 % 360}, 65%, 55%)`
                      }}
                    >
                      {store.logoUrl ? (
                        <img 
                          src={store.logoUrl} 
                          alt={store.name} 
                          className="w-full h-full object-cover rounded-lg" 
                        />
                      ) : (
                        store.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  {/* Store Name */}
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {store.name}
                  </h3>

                  {/* Short Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {store.description || 'Discover amazing products and services.'}
                  </p>

                  {/* Category */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {store.category || 'General'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {store._count.products} products
                    </span>
                  </div>

                  {/* Visit Store Button */}
                  <div className="mt-4">
                    <div className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center group-hover:bg-blue-700">
                      Visit Store →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Soft Auth Banner - only for guests */}
      <SoftAuthBanner />

      <Footer />
    </div>
  );
}