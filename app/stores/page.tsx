'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  _count: {
    products: number;
  };
}

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/public/stores');
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores || []);
      } else {
        setError('Failed to load stores');
      }
    } catch (error) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-xl mb-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Explore Local Stores</h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Discover amazing products from local businesses in your area. Support your community while finding exactly what you need.
              </p>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Find What You&apos;re Looking For</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="Search stores by name, type, or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading stores...</p>
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
              {filteredStores.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No stores found</h3>
                  <p className="mt-2 text-gray-500">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Check back later for new stores.'}
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => router.push('/auth/customer/register')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Join as Customer
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {searchQuery ? `Search Results (${filteredStores.length})` : `All Stores (${filteredStores.length})`}
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStores.map((store) => (
                      <div
                        key={store.id}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => router.push(`/store/${store.slug}`)}
                      >
                        <div className="flex items-center mb-4">
                          <div 
                            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform"
                            style={{ backgroundColor: store.primaryColor }}
                          >
                            {store.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                              {store.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {store._count.products} product{store._count.products !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        
                        {store.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {store.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Location</p>
                            <p className="text-sm text-gray-700">{store.address}</p>
                          </div>
                          <span 
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                            style={{ backgroundColor: store.accentColor }}
                          >
                            {store.isActive ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* CTA Section */}
          {!loading && !error && filteredStores.length > 0 && (
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-8 rounded-xl mt-12 text-center">
              <h3 className="text-2xl font-bold mb-4">Start Shopping Today!</h3>
              <p className="text-green-100 mb-6">
                Create your customer account to start ordering from these amazing local businesses.
              </p>
              <button
                onClick={() => router.push('/auth/customer/register')}
                className="bg-white hover:bg-gray-100 text-green-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Customer Account
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}