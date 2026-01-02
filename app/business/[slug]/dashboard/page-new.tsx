'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface SaleData {
  id: string;
  total: number;
  createdAt: string;
  customer?: {
    firstName?: string;
    lastName?: string;
  };
}

interface ProductData {
  id: string;
  name: string;
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
  const router = useRouter();
  const params = useParams();
  const businessId = params?.businessId as string;

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
  const [userBusinesses, setUserBusinesses] = useState<Business[]>([]);
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);

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
    if (!businessId || !token) return;
    
    setLoading(true);
    try {
      // Fetch business details
      const businessResponse = await fetch(`/api/stores/${businessId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        setBusiness(businessData);
      }

      // Fetch sales data
      const salesResponse = await fetch(`/api/sales?businessId=${businessId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        const dailyMetrics = getDailyMetrics(salesData);
        const monthlyRevenue = getMonthlyRevenue(salesData);
        
        setMetrics({
          salesToday: dailyMetrics.revenue,
          ordersToday: dailyMetrics.count,
          revenueThisMonth: monthlyRevenue,
          lowStockItems: 0 // Will be calculated from inventory
        });

        // Generate recent orders
        const orders: RecentOrder[] = salesData.slice(0, 5).map((sale: SaleData, index: number) => ({
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
        const alerts: InventoryAlert[] = productsData
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
  }, [businessId, token, getMonthlyRevenue, getDailyMetrics]);

  const fetchUserBusinesses = useCallback(async () => {
    try {
      const response = await fetch('/api/stores?owner=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserBusinesses(data.stores || []);
      }
    } catch (error) {
      console.error('Failed to load businesses:', error);
    }
  }, [token]);

  useEffect(() => {
    if (user && token && businessId) {
      fetchBusinessData();
      fetchUserBusinesses();
    }
  }, [user, token, businessId, fetchBusinessData, fetchUserBusinesses]);

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
    <div className="p-8 space-y-8">
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
            href={`/business/${businessId}/inventory/new`}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href={`/business/${businessId}/sales`} className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sales Today</h3>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.salesToday)}</p>
              </Link>
              
              <Link href={`/business/${businessId}/sales`} className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Orders Today</h3>
                <p className="text-3xl font-bold text-gray-900">{metrics.ordersToday}</p>
              </Link>
              
              <Link href={`/business/${businessId}/inventory`} className="bg-white p-6 rounded-lg border border-gray-200 hover:border-red-300 transition-colors">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Low Stock Items</h3>
                <p className="text-3xl font-bold text-red-600">{metrics.lowStockItems}</p>
              </Link>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Revenue (This Month)</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(metrics.revenueThisMonth)}</p>
              </div>
            </div>
          </div>

          {/* Section B: Sales Snapshot */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Sales</h3>
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart placeholder</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <Link href={`/business/${businessId}/sales`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all orders →
                </Link>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
                      <div className="flex items-center text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                        <span className="ml-2 text-gray-500">{formatTime(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section C: Inventory Alerts & Section D: Quick Actions */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
                <Link href={`/business/${businessId}/inventory`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Manage inventory →
                </Link>
              </div>
              <div className="space-y-3">
                {inventoryAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{alert.name}</p>
                      <p className="text-sm text-gray-500">
                        {alert.status === 'out' ? 'Out of stock' : `${alert.currentStock} left`}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      alert.status === 'out' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.status === 'out' ? 'Out' : 'Low'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href={`/business/${businessId}/inventory/new`}
                  className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add product
                </Link>
                
                <Link
                  href={`/business/${businessId}/pos`}
                  className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Record sale
                </Link>
                
                <Link
                  href={`/business/${businessId}/pos`}
                  className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  View POS
                </Link>
                
                <Link
                  href={`/business/${businessId}/reports`}
                  className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Generate report
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}