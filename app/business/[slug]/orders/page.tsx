'use client';

import { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, AuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/utils/api';
import { getStoreBrandStyles } from '@/lib/store-branding';
import { formatCurrency, formatDateTime } from '@/lib/utils/api';

interface SaleStats {
  totalSales: number;
  completedSales: number;
  pendingSales: number;
  totalRevenue: number;
}

interface Sale {
  id: string;
  createdAt: string;
  total: number;
  paymentMethod: string;
  status?: string;
  customerName?: string;
  customerPhone?: string;
  invoiceNumber?: string;
  deliveryType?: 'WALK_IN' | 'DELIVERY' | 'PICKUP' | 'walk-in' | 'delivery' | 'pickup';
  deliveryStatus?: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'OUT_FOR_DELIVERY' | 'pending' | 'in-transit' | 'delivered' | 'failed' | 'out_for_delivery';
  deliveryAddress?: string;
  riderName?: string;
  riderPhone?: string;
  parcelNumber?: string;
  cashier?: {
    firstName: string;
    lastName: string;
  };
  items: any[];
}

export default function BusinessSales() {
  const { user, token } = useAuth();
  const { store } = useContext(AuthContext)!;
  const params = useParams();
  const router = useRouter();
  const businessSlug = params?.slug as string;
  const brandStyles = getStoreBrandStyles(store);
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SaleStats>({
    totalSales: 0,
    completedSales: 0,
    pendingSales: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Computed values
  const hasFilters = searchQuery || statusFilter || paymentMethodFilter || dateRangeFilter !== 'all';

  useEffect(() => {
    if (user && token) {
      loadSales();
    }
  }, [user, token, statusFilter, paymentMethodFilter, dateRangeFilter, sortBy, currentPage]);

  const calculateStats = (salesList: Sale[]): SaleStats => {
    const totalSales = salesList.length;
    const completedSales = salesList.filter(s => !s.status || s.status === 'completed' || s.status === 'paid').length;
    const pendingSales = salesList.filter(s => s.status === 'pending').length;
    const totalRevenue = salesList
      .filter(s => !s.status || s.status === 'completed' || s.status === 'paid')
      .reduce((sum, sale) => sum + sale.total, 0);

    return { totalSales, completedSales, pendingSales, totalRevenue };
  };

  const loadSales = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: '20'
      };

      if (store?.id) {
        params.businessId = store.id;
      }

      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (paymentMethodFilter) params.paymentMethod = paymentMethodFilter;
      if (dateRangeFilter !== 'all') params.dateRange = dateRangeFilter;
      if (sortBy) params.sort = sortBy;

      const response = await api.get('/api/sales', params);
      
      if (response.success && response.data) {
        const salesList = Array.isArray(response.data) ? response.data : (response.data as any)?.items || [];
        setSales(salesList);
        setStats(calculateStats(salesList));

        if ((response.data as any)?.pagination) {
          setTotalPages((response.data as any).pagination.pages);
        }
      } else {
        setError(response.message || 'Failed to load sales');
        setSales([]);
      }
    } catch (error) {
      console.error('Error loading sales:', error);
      setError('Failed to load sales');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadSales();
  };

  const handleStatClick = (filterType: string) => {
    setStatusFilter(filterType);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPaymentMethodFilter('');
    setDateRangeFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
    loadSales();
  };

  const handleViewReceipt = (saleId: string) => {
    const businessSlug = params?.slug as string;
    router.push(`/business/${businessSlug}/orders/${saleId}`);
  };

  const handleExport = () => {
    // Future feature: Export sales to CSV
    alert('Export functionality coming soon!');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      completed: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
      refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600' }
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getUnifiedStatusBadge = (sale: Sale) => {
    const normalizedDeliveryType = sale.deliveryType?.toLowerCase();
    
    // For walk-in orders, use the main status or default to completed
    if (normalizedDeliveryType !== 'delivery') {
      const status = sale.status || 'completed';
      const statusConfig: Record<string, { label: string; className: string }> = {
        completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
        paid: { label: 'Completed', className: 'bg-green-100 text-green-800' },
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
        refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-800' },
        cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600' }
      };
      
      const config = statusConfig[status] || { label: 'Completed', className: 'bg-green-100 text-green-800' };
      
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
          {config.label}
        </span>
      );
    }
    
    // For delivery orders, use delivery status
    const deliveryStatus = sale.deliveryStatus?.toLowerCase() || 'pending';
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      'in-transit': { label: 'With Rider', className: 'bg-blue-100 text-blue-800' },
      'in_transit': { label: 'With Rider', className: 'bg-blue-100 text-blue-800' },
      'out_for_delivery': { label: 'Out for Delivery', className: 'bg-blue-100 text-blue-800' },
      delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
      failed: { label: 'Failed', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[deliveryStatus] || { label: deliveryStatus, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getOrderTypeBadge = (deliveryType?: string) => {
    const normalizedType = deliveryType?.toLowerCase();
    if (normalizedType === 'delivery') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Delivery
        </span>
      );
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
        Walk-in
      </span>
    );
  };

  // Access control
  if (!user || !['business_owner', 'employee'].includes(user.userType)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need business privileges to access sales and receipts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales & Receipts</h1>
            <p className="text-gray-600">View and manage all POS transactions and receipts</p>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
            
            <button
              onClick={handleExport}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
              style={brandStyles.buttonStyle}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Sales Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div 
          className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatClick('')}
        >
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-100 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Sales</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-all">{stats.totalSales}</p>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatClick('completed')}
        >
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-100 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Completed Sales</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 break-all">{stats.completedSales}</p>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatClick('pending')}
        >
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-amber-100 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pending Sales</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600 break-all">{stats.pendingSales}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-purple-100 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Revenue</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold break-all leading-tight" style={{ color: brandStyles.primaryColor }}>
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Slide Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="completed">Paid</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => {
                  setPaymentMethodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRangeFilter}
                onChange={(e) => {
                  setDateRangeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Amount (High to Low)</option>
                <option value="amount-low">Amount (Low to High)</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by order ID, customer name, or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading sales...</p>
          </div>
        ) : sales.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto min-w-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Receipt ID
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Date & Time
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Customer
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Type
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Cashier
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Payment Method
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Total Amount
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 break-all max-w-[120px] block truncate">
                          {sale.invoiceNumber || `#${sale.id.slice(0, 8)}`}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {formatDateTime(sale.createdAt)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {sale.customerName || 'Guest'}
                          </div>
                          {sale.customerPhone && (
                            <div className="text-xs text-gray-500">
                              {sale.customerPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        {getOrderTypeBadge(sale.deliveryType)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        {getUnifiedStatusBadge(sale)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {sale.cashier ? `${sale.cashier.firstName} ${sale.cashier.lastName}` : 'System'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {sale.paymentMethod.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 break-all">
                          {formatCurrency(sale.total)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewReceipt(sale.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {sales.map((sale) => (
                <div key={sale.id} className="p-4 hover:bg-gray-50">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 break-all">
                          {sale.invoiceNumber || `#${sale.id.slice(0, 8)}`}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(sale.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {getOrderTypeBadge(sale.deliveryType)}
                        {getUnifiedStatusBadge(sale)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Customer:</span>
                        <div className="font-medium break-words">{sale.customerName || 'Guest'}</div>
                        {sale.customerPhone && (
                          <div className="text-xs text-gray-500 break-all">{sale.customerPhone}</div>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Cashier:</span>
                        <div className="font-medium break-words">
                          {sale.cashier ? `${sale.cashier.firstName} ${sale.cashier.lastName}` : 'System'}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <div>
                        <span className="text-xs text-gray-500">Payment: </span>
                        <span className="text-sm font-medium capitalize">{sale.paymentMethod.toLowerCase()}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 break-all">
                          {formatCurrency(sale.total)}
                        </div>
                        <button
                          onClick={() => handleViewReceipt(sale.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-1"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          // Empty State
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {hasFilters ? 'No sales match your filters' : "No sales recorded yet"}
              </h3>
              {!hasFilters ? (
                <div className="space-y-3">
                  <p className="text-gray-500">Start making sales to see transactions and receipts here.</p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => router.push(`/business/${businessSlug}/pos`)}
                      className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                      style={brandStyles.buttonStyle}
                    >
                      Go to POS
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                  <button
                    onClick={handleClearFilters}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}