'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Redirect if not a customer
    if (user && user.userType !== 'customer') {
      router.push('/dashboard');
      return;
    }

    // Redirect to login if not authenticated
    if (!user) {
      router.push('/auth/customer/login');
      return;
    }

    // Load stores
    fetchStores();
  }, [user, router]);

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

  if (!user || user.userType !== 'customer') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-xl mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user.firstName}!</h1>
                <p className="text-green-100">Discover amazing products from local businesses</p>
              </div>
              <div className="hidden md:block">
                <svg className="w-16 h-16 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Account Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Your Orders</h3>
                  <p className="text-sm text-gray-600">Track your recent purchases</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Favorites</h3>
                  <p className="text-sm text-gray-600">Your saved items</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                  <p className="text-sm text-gray-600">Manage your account</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stores Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover Local Stores</h2>
              <p className="text-gray-600">Browse and shop from amazing local businesses</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Search stores and products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-2 text-gray-600">Loading stores...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg inline-block">
                  {error}
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchStores}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery ? 'Try adjusting your search terms.' : 'Check back later for new stores.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStores.map((store) => (
                      <div
                        key={store.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/store/${store.slug}`)}
                      >
                        <div className="flex items-center mb-3">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: store.primaryColor }}
                          >
                            {store.name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <h3 className="font-semibold text-gray-900">{store.name}</h3>
                            <p className="text-sm text-gray-500">{store._count.products} products</p>
                          </div>
                        </div>
                        
                        {store.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {store.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{store.address}</span>
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: store.accentColor }}
                          >
                            {store.isActive ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}