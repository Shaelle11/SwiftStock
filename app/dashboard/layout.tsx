'use client';

import { useAuth, AuthContext } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useContext } from 'react';
import Footer from '@/components/layout/Footer';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
      </svg>
    ), 
    userTypes: ['business_owner', 'employee'] 
  },
  { 
    name: 'Inventory', 
    href: '/dashboard/inventory', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10m0-10l8-4" />
      </svg>
    ), 
    userTypes: ['business_owner', 'employee'] 
  },
  { 
    name: 'POS', 
    href: '/dashboard/pos', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H2m1 8h16m-7 4v8m0 0v-8m0 8h4m-4 0h-4" />
      </svg>
    ), 
    userTypes: ['business_owner', 'employee'] 
  },
  { 
    name: 'Sales', 
    href: '/dashboard/sales', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ), 
    userTypes: ['business_owner', 'employee'] 
  },
  { 
    name: 'Receipts', 
    href: '/dashboard/receipts', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ), 
    userTypes: ['business_owner', 'employee'] 
  },
  { 
    name: 'Customers', 
    href: '/dashboard/customers', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ), 
    userTypes: ['business_owner'] 
  },
  { 
    name: 'Abandoned Carts', 
    href: '/dashboard/carts', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19M7 13v6a2 2 0 002 2h8.5M17 13v6a2 2 0 01-2 2H9.5M16 19a1 1 0 100-2 1 1 0 000 2zM7 19a1 1 0 100-2 1 1 0 000 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9V7m0 0V5m0 2h2m-2 0H10" />
      </svg>
    ), 
    userTypes: ['business_owner', 'employee'] 
  },
  { 
    name: 'Tax & Compliance', 
    href: '/dashboard/tax', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ), 
    userTypes: ['business_owner'] 
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ), 
    userTypes: ['business_owner'] 
  },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { store } = useContext(AuthContext)!;
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);



  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Redirect customers to main page
  useEffect(() => {
    if (user && user.userType === 'customer') {
      router.push('/');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Show loading while redirecting customers
  if (user.userType === 'customer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Filter navigation based on user type
  const allowedNavigation = navigation.filter(item => 
    item.userTypes.includes(user.userType)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Store Logo & Name */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          {!isSidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              {store?.logoUrl ? (
                <Image 
                  src={store.logoUrl} 
                  alt={store.name}
                  width={32}
                  height={32}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: store?.primaryColor || '#3B82F6' }}
                >
                  {store?.name?.charAt(0) || 'S'}
                </div>
              )}
              <div>
                <h1 className="text-sm font-semibold text-gray-900 truncate">
                  {store?.name || 'Loading...'}
                </h1>
                <p className="text-xs text-gray-500">Business Dashboard</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              {store?.logoUrl ? (
                <Image 
                  src={store.logoUrl} 
                  alt={store.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: store?.primaryColor || '#3B82F6' }}
                >
                  {store?.name?.charAt(0) || 'S'}
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg 
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                isSidebarCollapsed ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7" 
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          <div className="space-y-1 px-3">
            {allowedNavigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group relative ${
                    isActive
                      ? 'text-white border-r-2'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: isActive ? (store?.primaryColor || '#3B82F6') : 'transparent',
                    borderRightColor: isActive ? (store?.primaryColor || '#3B82F6') : 'transparent'
                  }}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <span className={`flex-shrink-0 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`}>
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && (
                    <span>{item.name}</span>
                  )}
                  {/* Tooltip for collapsed state */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Back to Personal Account Button */}
        <div className="absolute bottom-20 left-0 right-0 px-3">
          <Link
            href="/app"
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-gray-50 text-gray-600 hover:text-gray-900 group relative"
            title={isSidebarCollapsed ? "Back to Personal Account" : undefined}
          >
            <span className={`flex-shrink-0 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            {!isSidebarCollapsed && (
              <span>Personal Account</span>
            )}
            {/* Tooltip for collapsed state */}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Back to Personal Account
              </div>
            )}
          </Link>
        </div>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            {!isSidebarCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.userType.replace('_', ' ')}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`text-gray-400 hover:text-gray-600 transition-colors group relative ${
                isSidebarCollapsed ? '' : 'ml-3'
              }`}
              title="Logout"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {/* Tooltip for collapsed state */}
              {isSidebarCollapsed && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 flex flex-col min-h-screen ${
        isSidebarCollapsed ? 'pl-16' : 'pl-64'
      }`}>
        <main className="flex-1">
          {children}
        </main>
        <Footer variant="simple" />
      </div>
    </div>
  );
}
