'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

interface Business {
  id: string;
  name: string;
  description: string | null;
  address: string;
  slug: string;
  isActive: boolean;
  primaryColor: string;
  _count: {
    products: number;
    sales: number;
  };
}

export default function AppPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserBusinesses = useCallback(async () => {
    try {
      const response = await fetch('/api/stores?owner=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.stores || []);
      }
    } catch (_error) {
      console.error('Failed to load businesses:', _error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user || !token) {
      router.push('/auth/login');
      return;
    }
    
    // Load user's businesses if they have any
    fetchUserBusinesses();
  }, [user, token, router, fetchUserBusinesses]);

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const hasBusinesses = businesses.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="page-title">Welcome back, {user.firstName}!</h1>
            <p className="text-gray-600 text-sm">
              {hasBusinesses 
                ? 'Switch between your businesses or explore the marketplace'
                : 'Manage your orders, explore stores, or create your first business'}
            </p>
          </div>

          {/* Main Content Grid - 2 columns on desktop, stacked on mobile */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN - Primary Focus (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Section A: Your Activity */}
              <div className="card">
                <h2 className="section-header">Your activity</h2>
                
                {/* Activity Items */}
                <div className="space-y-4">
                  {/* Empty state for now - replace with actual activity data */}
                  <div className="empty-state">
                    <div className="bg-gray-50 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                      <svg className="w-6 h-6 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-4 text-sm">You haven&apos;t placed any orders yet. Explore stores to get started.</p>
                    <Link 
                      href="/explore"
                      className="inline-flex items-center text-teal-700 hover:text-teal-800 font-medium text-sm"
                    >
                      Explore stores 
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Section B: Businesses (Context-aware) */}
              <div className="card">
                {!hasBusinesses ? (
                  /* Case 1: User has NO business */
                  <div className="empty-state">
                    <div className="bg-teal-50 p-4 rounded-full w-16 h-16 mx-auto mb-6">
                      <svg className="w-8 h-8 text-teal-700 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="empty-state-title">Start your business journey</div>
                    <p className="empty-state-description max-w-md mx-auto">
                      Create a business to manage inventory, sales, and your online store.
                    </p>
                    <div className="space-y-3">
                      <Link 
                        href="/app/create-business"
                        className="btn btn-primary"
                      >
                        Create your first business
                      </Link>
                      <div>
                        <button className="text-gray-500 hover:text-gray-700 text-sm">
                          Learn more
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Case 2: User HAS businesses */
                  <div>
                    <h2 className="section-header">Your businesses</h2>
                    
                    <div className="space-y-4">
                      {businesses.map((business) => (
                        <div key={business.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white font-semibold text-lg mr-4">
                              {business.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm">{business.name}</h3>
                              <p className="text-xs text-gray-500">
                                {business.isActive ? 'Public' : 'Private'} • Last activity today
                              </p>
                            </div>
                          </div>
                          <Link 
                            href={`/business/${business.slug}/dashboard`}
                            className="text-teal-700 hover:text-teal-800 font-medium text-sm flex items-center"
                          >
                            Manage
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      ))}
                    </div>
                    
                    {/* Footer action */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <Link 
                        href="/app/create-business"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Create another business
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN - Supportive Content (1/3 width) */}
            <div className="space-y-8">
              
              {/* Section C: Explore Prompt */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Discover stores</h2>
                <p className="text-gray-600 mb-6">
                  Browse public stores and shop directly from businesses using the platform.
                </p>
                <Link 
                  href="/explore"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full text-center"
                >
                  Explore marketplace
                </Link>
              </div>

              {/* Section D: Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h2>
                <div className="space-y-3">
                  <Link 
                    href="/explore"
                    className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-gray-900">Explore stores</span>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/app/orders"
                    className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span className="text-gray-900">View my orders</span>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/app/settings"
                    className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-900">Account settings</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}