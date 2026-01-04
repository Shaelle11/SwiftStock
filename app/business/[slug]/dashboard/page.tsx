'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
}

interface Business {
  id: string;
  name: string;
  description: string | null;
  address: string;
  slug: string;
  isActive: boolean;
  primaryColor: string;
  logoUrl?: string;
  _count: {
    products: number;
    sales: number;
  };
}

interface DashboardMetrics {
  salesToday: number;
  ordersToday: number;
  lowStockItems: number;
  revenueThisMonth: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

interface InventoryAlert {
  id: string;
  name: string;
  currentStock: number;
  status: 'low' | 'out';
}

export default function BusinessDashboard() {
  const { user, token } = useAuth();
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    salesToday: 0,
    ordersToday: 0,
    lowStockItems: 0,
    revenueThisMonth: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);

  const isNewBusiness = business && business._count.products === 0;

  // Sales and revenue calculations
  const getMonthlyRevenue = useCallback((sales: SaleData[]): number => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    return sales
      .filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
      })
      .reduce((total, sale) => total + sale.total, 0);
  }, []);

  const getDailyMetrics = useCallback((sales: SaleData[]): { revenue: number; count: number } => {
    const today = new Date().toDateString();
    const todaysSales = sales.filter(sale => new Date(sale.createdAt).toDateString() === today);
    
    return {
      revenue: todaysSales.reduce((total, sale) => total + sale.total, 0),
      count: todaysSales.length
    };
  }, []);

  const fetchBusinessData = useCallback(async () => {
    if (!slug || !token) return;
    
    setLoading(true);
    try {
      // First, fetch business details from owned stores to get the business ID
      const businessResponse = await fetch('/api/stores?owner=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!businessResponse.ok) {
        throw new Error('Failed to fetch business data');
      }

      const businessData = await businessResponse.json();
      const currentBusiness = businessData.stores?.find((store: any) => store.slug === slug);
      
      if (!currentBusiness) {
        throw new Error(`Business not found with slug: ${slug}`);
      }

      setBusiness(currentBusiness);
      const businessId = currentBusiness.id;

      // Now fetch sales data using the business ID
      const salesResponse = await fetch(`/api/sales?businessId=${businessId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        console.log('Sales data structure:', salesData);
        
        // Extract the sales array from the API response structure
        const salesArray = salesData.data?.items || [];
        
        const dailyMetrics = getDailyMetrics(salesArray);
        const monthlyRevenue = getMonthlyRevenue(salesArray);
        
        setMetrics({
          salesToday: dailyMetrics.revenue,
          ordersToday: dailyMetrics.count,
          revenueThisMonth: monthlyRevenue,
          lowStockItems: 0 // Will be calculated from inventory
        });

        // Generate recent orders
        const orders: RecentOrder[] = salesArray.slice(0, 5).map((sale: SaleData, index: number) => ({
          id: sale.id,
          orderNumber: `ORD-${Date.now() + index}`,
          customerName: sale.customer?.firstName && sale.customer?.lastName 
            ? `${sale.customer.firstName} ${sale.customer.lastName}`
            : 'Walk-in Customer',
          total: sale.total,
          status: 'paid',
          createdAt: sale.createdAt
        }));
        setRecentOrders(orders);
      }

      // Fetch products for inventory alerts
      const productsResponse = await fetch(`/api/products?businessId=${businessId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log('Products data structure:', productsData);
        
        // Extract the products array from the API response structure
        const productsArray = productsData.data?.items || [];
        
        const alerts: InventoryAlert[] = productsArray
          .filter((product: ProductData) => 
            product.stockQuantity <= product.lowStockThreshold
          )
          .slice(0, 5)
          .map((product: ProductData) => ({
            id: product.id,
            name: product.name,
            currentStock: product.stockQuantity,
            status: product.stockQuantity === 0 ? 'out' as const : 'low' as const
          }));
        
        setInventoryAlerts(alerts);
        setMetrics(prev => ({ ...prev, lowStockItems: alerts.length }));
      }
    } catch (error) {
      console.error('Failed to load business data:', error);
    } finally {
      setLoading(false);
    }
  }, [slug, token, getMonthlyRevenue, getDailyMetrics]);

  useEffect(() => {
    if (user && token && slug) {
      fetchBusinessData();
    }
  }, [user, token, slug, fetchBusinessData]);



  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return 'Today';
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Business not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      {isNewBusiness ? (
        /* Empty State - First-Time Business */
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to your business dashboard 👋</h2>
            <p className="text-gray-600 mb-8">Let&apos;s get you set up:</p>
            
            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center text-left">
                <div className="bg-green-100 p-1 rounded-full mr-4">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Add your first product</span>
              </div>
              <div className="flex items-center text-left">
                <div className="bg-yellow-100 p-1 rounded-full mr-4">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-700">Set up your store</span>
              </div>
              <div className="flex items-center text-left">
                <div className="bg-blue-100 p-1 rounded-full mr-4">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-gray-700">Make your first sale</span>
              </div>
            </div>
          </div>
          
          <Link
            href={`/business/${slug}/inventory/new`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium inline-block transition-colors"
          >
            Start setup
          </Link>
        </div>
      ) : (
        /* Normal Dashboard */
        <div className="space-y-8">
          {/* Section A: Key Metrics */}
          <div>
            <h2 className="section-header">Key Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Link href={`/business/${slug}/sales`} className="card hover:border-gray-300 transition-colors min-w-0">
                <h3 className="text-sm font-medium text-gray-600 mb-2 truncate">Total Sales Today</h3>
                <p className="text-2xl sm:text-3xl font-semibold text-gray-900 break-words">{formatCurrency(metrics.salesToday)}</p>
              </Link>
              
              <Link href={`/business/${slug}/sales`} className="card hover:border-gray-300 transition-colors min-w-0">
                <h3 className="text-sm font-medium text-gray-600 mb-2 truncate">Orders Today</h3>
                <p className="text-2xl sm:text-3xl font-semibold text-gray-900 break-words">{metrics.ordersToday}</p>
              </Link>
              
              <Link href={`/business/${slug}/inventory`} className="card hover:border-red-300 transition-colors min-w-0">
                <h3 className="text-sm font-medium text-gray-600 mb-2 truncate">Low Stock Items</h3>
                <p className="text-2xl sm:text-3xl font-semibold text-red-600 break-words">{metrics.lowStockItems}</p>
              </Link>
              
              <div className="card min-w-0">
                <h3 className="text-sm font-medium text-gray-600 mb-2 truncate">Revenue (This Month)</h3>
                <p className="text-2xl sm:text-3xl font-semibold text-green-600 break-words">{formatCurrency(metrics.revenueThisMonth)}</p>
              </div>
            </div>
          </div>

          {/* Section B: Sales Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="card">
              <h3 className="section-header">Weekly Sales</h3>
              <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 text-sm">Chart placeholder</p>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-header">Recent Orders</h3>
                <Link href={`/business/${slug}/sales`} className="text-teal-700 hover:text-teal-800 text-sm font-medium shrink-0">
                  View all →
                </Link>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-start justify-between gap-4 min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600 truncate">{order.customerName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-gray-900 text-sm">{formatCurrency(order.total)}</p>
                      <div className="flex items-center justify-end text-sm gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-gray-500 text-xs hidden sm:inline">{formatTime(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section C: Inventory Alerts & Section D: Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-header">Inventory Alerts</h3>
                <Link href={`/business/${slug}/inventory`} className="text-teal-700 hover:text-teal-800 text-sm font-medium shrink-0">
                  Manage →
                </Link>
              </div>
              <div className="space-y-3">
                {inventoryAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{alert.name}</p>
                      <p className="text-sm text-gray-600">
                        {alert.status === 'out' ? 'Out of stock' : `${alert.currentStock} left`}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                      alert.status === 'out' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {alert.status === 'out' ? 'Out' : 'Low'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="section-header">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href={`/business/${slug}/inventory/new`}
                  className="flex items-center justify-center p-4 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors text-sm font-medium min-h-[4rem]"
                >
                  <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="truncate">Add product</span>
                </Link>
                
                <Link
                  href={`/business/${slug}/pos`}
                  className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm font-medium min-h-[4rem]"
                >
                  <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="truncate">Record sale</span>
                </Link>
                
                <Link
                  href={`/business/${slug}/pos`}
                  className="flex items-center justify-center p-4 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors text-sm font-medium min-h-[4rem]"
                >
                  <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">View POS</span>
                </Link>
                
                <Link
                  href={`/business/${slug}/reports`}
                  className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors text-sm font-medium min-h-[4rem]"
                >
                  <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="truncate">Generate report</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}