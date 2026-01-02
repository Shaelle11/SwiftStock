'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';

interface CurrentBusiness {
  id: string;
  name: string;
  logo?: string;
}

interface UserBusiness {
  id: string;
  name: string;
}

interface BusinessLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

const sidebarItems = [
  {
    group: 'Overview',
    items: [
      {
        name: 'Dashboard',
        href: 'dashboard',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        name: 'Analytics',
        href: 'analytics',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    group: 'Sales & Operations',
    items: [
      {
        name: 'Point of Sale',
        href: 'pos',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
      },
      {
        name: 'Orders',
        href: 'orders',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      },
      {
        name: 'Sales History',
        href: 'sales',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ],
  },
  {
    group: 'Inventory & Products',
    items: [
      {
        name: 'Products',
        href: 'inventory',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
        ),
      },
      {
        name: 'Categories',
        href: 'categories',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
      },
      {
        name: 'Stock Alerts',
        href: 'stock-alerts',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      },
    ],
  },
  {
    group: 'Customer Management',
    items: [
      {
        name: 'Customers',
        href: 'customers',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        ),
      },
      {
        name: 'Loyalty Program',
        href: 'loyalty',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ),
      },
    ],
  },
  {
    group: 'Business Settings',
    items: [
      {
        name: 'Store Settings',
        href: 'settings',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      {
        name: 'Team & Staff',
        href: 'team',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
      },
      {
        name: 'Tax & Compliance',
        href: 'tax',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        name: 'Reports',
        href: 'reports',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
    ],
  },
];

export default function BusinessLayout({ children, params }: BusinessLayoutProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [businessSwitcherOpen, setBusinessSwitcherOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Unwrap params Promise for Next.js 16.1.1 compatibility
  const resolvedParams = React.use(params);

  const [currentBusiness, setCurrentBusiness] = useState<CurrentBusiness | null>(null);
  const [userBusinesses, setUserBusinesses] = useState<UserBusiness[]>([]);
  
  // Fetch business data
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!user || !resolvedParams.slug) {
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching business data for:', resolvedParams.slug);
      
      try {
        // Fetch user businesses (includes the current business)
        const businessesResponse = await fetch('/api/stores?owner=true', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (businessesResponse.ok) {
          const businessesData = await businessesResponse.json();
          console.log('User businesses loaded:', businessesData.stores);
          setUserBusinesses(businessesData.stores || []);
          
          // Find the current business from the user's businesses
          const currentBiz = businessesData.stores?.find(
            (store: any) => store.slug === resolvedParams.slug
          );
          
          if (currentBiz) {
            console.log('Current business found:', currentBiz);
            setCurrentBusiness({
              id: currentBiz.id,
              name: currentBiz.name,
              logo: currentBiz.logoUrl
            });
          } else {
            console.error('Business not found in user\'s businesses:', resolvedParams.slug);
            // Redirect to app page if business not found
            router.push('/app');
          }
        } else {
          console.error('Failed to fetch businesses:', businessesResponse.status, businessesResponse.statusText);
        }
        
      } catch (error) {
        console.error('Failed to load business data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBusinessData();
  }, [user, resolvedParams.slug, token]);

  const isActivePath = (href: string) => {
    if (!resolvedParams.slug) return false;
    const fullPath = `/business/${resolvedParams.slug}/${href}`;
    return pathname === fullPath || pathname.startsWith(fullPath);
  };

  // Show loading state initially
  if (!user && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading business dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white shadow-lg">
            {/* Business Switcher */}
            <div className="flex items-center flex-shrink-0 px-4 py-4 border-b border-gray-200">
              <div className="relative flex-1">
                <button
                  onClick={() => setBusinessSwitcherOpen(!businessSwitcherOpen)}
                  className="w-full flex items-center text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                <div className="flex-shrink-0 w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                  {currentBusiness?.logo ? (
                    <Image src={currentBusiness.logo} alt="" width={24} height={24} className="rounded" />
                  ) : (
                    <svg className="w-4 h-4 text-teal-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {currentBusiness?.name || 'Loading...'}
                    </p>
                    <p className="text-xs text-gray-500">Switch business</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Business Switcher Dropdown */}
                {businessSwitcherOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="py-1">
                      {userBusinesses.map((business) => (
                        <button
                          key={business.id}
                          onClick={() => {
                            router.push(`/business/${business.slug}/dashboard`);
                            setBusinessSwitcherOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {business.name}
                        </button>
                      ))}
                      <hr className="my-1" />
                      <button
                        onClick={() => router.push('/app/create-business')}
                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                      >
                        + Create New Business
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-y-auto" style={{ scrollBehavior: 'auto' }}>
              <nav className="flex-1 px-2 py-4 bg-white space-y-6">
                {sidebarItems.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {group.group}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const href = `/business/${resolvedParams.slug}/${item.href}`;
                        const isActive = isActivePath(item.href);
                        
                        return (
                          <Link
                            key={item.name}
                            href={href}
                            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                              isActive
                                ? 'bg-blue-50 text-teal-700 border-l-4 border-teal-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50'
                            }`}
                            scroll={false}
                          >
                            <span className={`mr-3 ${isActive ? 'text-teal-700' : 'text-gray-400'}`}>
                              {item.icon}
                            </span>
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                    {groupIndex < sidebarItems.length - 1 && (
                      <hr className="mt-6 border-gray-200" />
                    )}
                  </div>
                ))}
              </nav>

              {/* Back to App */}
              <div className="flex-shrink-0 px-2 pb-4">
                <Link
                  href="/app"
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to App
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 flex z-40 ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform ease-in-out duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile navigation content */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            {/* Business Switcher - Mobile */}
            <div className="flex items-center flex-shrink-0 px-4 py-4 border-b border-gray-200">
              <div className="relative flex-1">
                <button
                  onClick={() => setBusinessSwitcherOpen(!businessSwitcherOpen)}
                  className="w-full flex items-center text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    {currentBusiness?.logo ? (
                      <Image src={currentBusiness.logo} alt="" width={24} height={24} className="rounded" />
                    ) : (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {currentBusiness?.name || 'Loading...'}
                    </p>
                    <p className="text-xs text-gray-500">Switch business</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Business Switcher Dropdown - Mobile */}
                {businessSwitcherOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="py-1">
                      {userBusinesses.map((business) => (
                        <button
                          key={business.id}
                          onClick={() => {
                            router.push(`/business/${business.slug}/dashboard`);
                            setBusinessSwitcherOpen(false);
                            setSidebarOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {business.name}
                        </button>
                      ))}
                      <hr className="my-1" />
                      <button
                        onClick={() => router.push('/app/create-business')}
                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                      >
                        + Create New Business
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation - Mobile */}
            <nav className="flex-1 px-2 py-4 bg-white space-y-6">
              {sidebarItems.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {group.group}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const href = `/business/${resolvedParams.slug}/${item.href}`;
                      const isActive = isActivePath(item.href);
                      
                      return (
                        <Link
                          key={item.name}
                          href={href}
                          onClick={() => setSidebarOpen(false)}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            isActive
                              ? 'bg-blue-100 text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50'
                          }`}
                          scroll={false}
                        >
                          <span className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                            {item.icon}
                          </span>
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                  {groupIndex < sidebarItems.length - 1 && (
                    <hr className="mt-6 border-gray-200" />
                  )}
                </div>
              ))}
            </nav>

            {/* Back to App - Mobile */}
            <div className="flex-shrink-0 px-2 pb-4">
              <Link
                href="/app"
                onClick={() => setSidebarOpen(false)}
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to App
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Business Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Business Logo and Name */}
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mr-4">
                  {currentBusiness?.logo ? (
                    <Image 
                      src={currentBusiness.logo} 
                      alt={currentBusiness.name || ''} 
                      width={32}
                      height={32}
                      className="rounded-lg object-cover" 
                    />
                  ) : (
                    <svg className="w-6 h-6 text-teal-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {currentBusiness?.name || 'Loading...'}
                  </h1>
                  <p className="text-sm text-gray-500">Business Dashboard</p>
                </div>
              </div>
            </div>
            
            {/* Mobile menu button - only visible on mobile */}
            <button
              type="button"
              className="lg:hidden text-gray-500 hover:text-gray-900"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-gray-50">
          {children}
        </main>
        
        {/* Footer */}
        <Footer variant="simple" />
      </div>
    </div>
  );
}