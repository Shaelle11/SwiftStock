'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
  secondaryColor: string;
  accentColor: string;
  _count: {
    products: number;
  };
}

export default function ExplorePage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/public/stores');
      if (response.ok) {
        const data = await response.json();
        // Only show public stores
        setStores((data.stores || []).filter((store: Store) => store.isPublic));
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
    return matchesSearch;
  });

  const categories = [
    { id: 'all', name: 'All Stores', count: stores.length },
    { id: 'retail', name: 'Retail', count: 12 },
    { id: 'food', name: 'Food & Dining', count: 8 },
    { id: 'services', name: 'Services', count: 15 },
    { id: 'electronics', name: 'Electronics', count: 6 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Discover Local Businesses
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Find amazing products and services from businesses in your community. Support local, shop smart.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 text-lg"
                  placeholder="Search stores, products, or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Discovering amazing stores...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg inline-block mb-4">
                {error}
              </div>
              <div>
                <button
                  onClick={fetchStores}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Stores Grid */}
          {!loading && !error && (
            <div>
              {/* Stats */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchQuery ? `Search Results (${filteredStores.length})` : `All Stores (${filteredStores.length})`}
                </h2>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Showing public stores
                </div>
              </div>

              {filteredStores.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">
                    {searchQuery ? 'No stores found' : 'No public stores available'}
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {searchQuery 
                      ? 'Try adjusting your search terms or browse all categories.' 
                      : 'Check back later or encourage local businesses to join SwiftStock.'}
                  </p>
                  <div className="mt-6">
                    {searchQuery ? (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        Clear Search
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push('/auth/register')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        Join SwiftStock
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredStores.map((store) => (
                    <div
                      key={store.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                      onClick={() => router.push(`/store/${store.slug}`)}
                    >
                      {/* Store Header */}
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform"
                            style={{ backgroundColor: store.primaryColor }}
                          >
                            {store.logoUrl ? (
                              <Image 
                                src={store.logoUrl} 
                                alt={store.name} 
                                width={48}
                                height={48}
                                className="w-full h-full object-cover rounded-xl" 
                              />
                            ) : (
                              store.name.charAt(0)
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
                              {store.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {store._count.products} product{store._count.products !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        
                        {store.description && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                            {store.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {store.address}
                          </div>
                          <span 
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: store.accentColor }}
                          >
                            {store.isActive ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CTA Section */}
          {!loading && !error && filteredStores.length > 0 && (
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-8 rounded-xl mt-12 text-center">
              <h3 className="text-2xl font-bold mb-4">Want to list your business?</h3>
              <p className="text-green-100 mb-6">
                Join SwiftStock and create your own online store to reach more customers.
              </p>
              <button
                onClick={() => router.push('/auth/register')}
                className="bg-white hover:bg-gray-100 text-green-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Selling Today
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}