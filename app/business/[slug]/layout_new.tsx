'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';

interface BusinessLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

interface CurrentBusiness {
  id: string;
  name: string;
  logo?: string;
}

interface UserBusiness {
  id: string;
  name: string;
  slug: string;
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v14l11-7z" />
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
    ],
  },
  {
    group: 'Inventory',
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
    ],
  },
  {
    group: 'Settings',
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

      try {
        // Fetch user businesses
        const businessesResponse = await fetch('/api/stores?owner=true', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (businessesResponse.ok) {
          const businessesData = await businessesResponse.json();
          setUserBusinesses(businessesData.stores || []);

          // Find the current business
          const currentBiz = businessesData.stores?.find(
            (store: any) => store.slug === resolvedParams.slug
          );

          if (currentBiz) {
            setCurrentBusiness({
              id: currentBiz.id,
              name: currentBiz.name,
              logo: currentBiz.logoUrl
            });
          }
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading business dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white shadow-lg">
            {/* Business Header */}
            <div className="flex items-center flex-shrink-0 px-4 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  {currentBusiness?.logo ? (
                    <Image src={currentBusiness.logo} alt="" width={24} height={24} className="rounded" />
                  ) : (
                    <svg className="w-4 h-4 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentBusiness?.name || 'Loading...'}
                  </p>
                  <p className="text-xs text-gray-500">Business Dashboard</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-y-auto">
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
                            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <span className={`mr-3 ${isActive ? 'text-emerald-700' : 'text-gray-400'}`}>
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
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform ${
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

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            {/* Same navigation content as desktop */}
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
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-600 shadow-sm'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <span className={`mr-3 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {item.icon}
                          </span>
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {currentBusiness?.name || 'Loading...'}
              </h1>
            </div>

            {/* Mobile menu button */}
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