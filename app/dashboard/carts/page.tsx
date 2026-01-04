'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/utils/api';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    sellingPrice: number;
    imageUrl?: string;
    store: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

interface AbandonedCart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  total: number;
  itemCount: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: CartItem[];
}

interface CartSummary {
  totalCarts: number;
  totalValue: number;
  totalItems: number;
}

interface AbandonedCartsResponse {
  abandonedCarts: AbandonedCart[];
  summary: CartSummary;
}

export default function AbandonedCartsPage() {
  const { user } = useAuth();
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [summary, setSummary] = useState<CartSummary>({ totalCarts: 0, totalValue: 0, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string>('');

  const fetchAbandonedCarts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedStore) {
        params.append('businessId', selectedStore);
      }
      
      const response = await api.get<AbandonedCartsResponse>(`/api/analytics/abandoned-carts?${params}`);
      
      if (response.success && response.data) {
        setAbandonedCarts(response.data.abandonedCarts);
        setSummary(response.data.summary);
      } else {
        setError(response.message || 'Failed to load abandoned carts');
      }
    } catch (err: any) {
      console.error('Error fetching abandoned carts:', err);
      setError(err?.response?.data?.message || 'Failed to load abandoned carts');
    } finally {
      setLoading(false);
    }
  }, [selectedStore]);

  useEffect(() => {
    if (user && (user.userType === 'business_owner' || user.userType === 'employee')) {
      fetchAbandonedCarts();
    }
  }, [user, fetchAbandonedCarts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  if (!user || (user.userType !== 'business_owner' && user.userType !== 'employee')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abandoned Carts</h1>
          <p className="text-gray-600 mt-1">Monitor customer carts that haven&apos;t been completed</p>
        </div>
        <button
          onClick={fetchAbandonedCarts}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19M7 13v6a2 2 0 002 2h8.5M17 13v6a2 2 0 01-2 2H9.5" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Abandoned Carts</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.totalCarts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.totalItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Abandoned Carts List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Abandoned Carts</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading abandoned carts...</span>
          </div>
        ) : abandonedCarts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19M7 13v6a2 2 0 002 2h8.5M17 13v6a2 2 0 01-2 2H9.5" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No abandoned carts found</h3>
            <p className="mt-2 text-gray-600">All customers have either completed their purchases or their carts are still active.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {abandonedCarts.map((cart) => (
              <div key={cart.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {cart.user.firstName} {cart.user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{cart.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(cart.total)}</p>
                    <p className="text-sm text-gray-500">{cart.itemCount} items</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Last updated</p>
                    <p className="text-sm text-gray-900">{formatDate(cart.updatedAt)}</p>
                    <p className="text-xs text-orange-600">{getTimeAgo(cart.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Created</p>
                    <p className="text-sm text-gray-900">{formatDate(cart.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Items in cart</p>
                  <div className="space-y-2">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900">{item.product.name}</span>
                          <span className="text-gray-500">×{item.quantity}</span>
                          <span className="text-xs text-gray-400">({item.product.store.name})</span>
                        </div>
                        <span className="text-gray-900 font-medium">
                          {formatCurrency(item.product.sellingPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}