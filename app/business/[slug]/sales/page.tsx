'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';

export default function BusinessSales() {
  const { user, token } = useAuth();
  const params = useParams();
  const slug = params?.slug as string;
  
  const [stats, setStats] = useState({
    todaysSales: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    recentSales: []
  });
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const fetchBusinessAndStats = async () => {
    if (!token || !slug) {
      setLoading(false);
      return;
    }

    try {
      // First get the business by slug
      const businessResponse = await fetch('/api/stores?owner=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        const currentBusiness = businessData.stores?.find((store: any) => store.slug === slug);
        
        if (currentBusiness) {
          setBusiness(currentBusiness);
          
          // Now fetch sales data using business ID
          const salesResponse = await fetch(`/api/sales?businessId=${currentBusiness.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (salesResponse.ok) {
            const salesData = await salesResponse.json();
            const salesArray = salesData.data?.items || [];
            
            // Calculate today's sales
            const today = new Date().toDateString();
            const todaysSales = salesArray.filter((sale: any) => 
              new Date(sale.createdAt).toDateString() === today
            );
            const todaysRevenue = todaysSales.reduce((total: number, sale: any) => total + sale.total, 0);
            
            setStats({
              todaysSales: todaysRevenue,
              totalProducts: 0, // Will be fetched separately if needed
              lowStockProducts: 0, // Will be fetched separately if needed
              outOfStockProducts: 0,
              recentSales: salesArray.slice(0, 20)
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await fetchBusinessAndStats();
  };

  useEffect(() => {
    if (!token || !user || !slug) return;
    
    fetchBusinessAndStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBusinessAndStats, 30000);

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchBusinessAndStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, user, slug]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">Sales Overview</h1>
          <p className="text-gray-600 text-sm">Track your sales performance and history</p>
          {business && <p className="text-xs text-gray-500">{business.name}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            disabled={loading}
            className="btn btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-teal-50 rounded-lg">
              <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.recentSales.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : formatCurrency(stats.todaysSales)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : formatCurrency(stats.recentSales.reduce((total: number, sale: any) => total + sale.total, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-amber-50 rounded-lg">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Sale</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.recentSales.length > 0 ? formatCurrency(stats.recentSales.reduce((total: number, sale: any) => total + sale.total, 0) / stats.recentSales.length) : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="section-header">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-4">
            <Link 
              href={`/business/${slug}/pos`}
              className="btn btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H2m1 8h16m-7 4v8m0 0v-8m0 8h4m-4 0h-4" />
              </svg>
              Open POS
            </Link>
            
            <Link 
              href={`/business/${slug}/inventory`}
              className="btn btn-secondary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
              Manage Inventory
            </Link>
            
            <Link 
              href={`/business/${slug}/reports`}
              className="btn btn-accent flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="section-header">Recent Sales</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading sales...</p>
            </div>
          ) : stats.recentSales.length > 0 ? (
            <div className="space-y-3">
              {stats.recentSales.slice(0, 20).map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      Sale #{sale.id.slice(0, 8)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(sale.createdAt).toLocaleString()}
                    </div>
                    {sale.customer && (
                      <div className="text-xs text-gray-500">
                        Customer: {sale.customer.firstName} {sale.customer.lastName}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(sale.total)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {sale.paymentMethod || 'Cash'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="mb-4">No sales found. Start selling to see transaction history here.</p>
              <Link 
                href={`/business/${slug}/pos`}
                className="btn btn-primary"
              >
                Open POS System
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}