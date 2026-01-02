'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { formatNaira, formatTaxDate, formatTaxPeriod, generateMonthlyTaxPeriod } from '@/lib/tax/utils';

interface TaxPeriod {
  id: string;
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CLOSED';
  totalSales?: number;
  vatableSales?: number;
  outputVat?: number;
  inputVat?: number;
  vatPayable?: number;
  closedAt?: string;
  _count: {
    sales: number;
    purchases: number;
  };
}

interface Store {
  id: string;
  name: string;
  tin?: string;
  cacNumber?: string;
  vatRegistered: boolean;
}

export default function TaxDashboard() {
  const { user, token } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [taxPeriods, setTaxPeriods] = useState<TaxPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // New period form state
  const [newPeriodYear, setNewPeriodYear] = useState(new Date().getFullYear());
  const [newPeriodMonth, setNewPeriodMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    if (user && token) {
      fetchStores();
    }
  }, [user, token]);

  useEffect(() => {
    if (selectedStore) {
      fetchTaxPeriods();
    }
  }, [selectedStore]);

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores?owner=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores || []);
        if (data.stores && data.stores.length > 0) {
          setSelectedStore(data.stores[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxPeriods = async () => {
    if (!selectedStore) return;
    
    try {
      const response = await fetch(`/api/tax/periods?storeId=${selectedStore.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTaxPeriods(data.periods || []);
      }
    } catch (error) {
      console.error('Error fetching tax periods:', error);
    }
  };

  const createTaxPeriod = async () => {
    if (!selectedStore) return;
    
    setCreating(true);
    setMessage(null);
    
    try {
      const { startDate, endDate } = generateMonthlyTaxPeriod(newPeriodYear, newPeriodMonth);
      
      const response = await fetch('/api/tax/periods', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: selectedStore.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });
      
      if (response.ok) {
        setMessage('Tax period created successfully!');
        fetchTaxPeriods();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to create tax period');
      }
    } catch (error) {
      setMessage('An error occurred while creating tax period');
    } finally {
      setCreating(false);
    }
  };

  const closeTaxPeriod = async (periodId: string) => {
    if (!confirm('Are you sure you want to close this tax period? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tax/periods/${periodId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setMessage('Tax period closed successfully!');
        fetchTaxPeriods();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to close tax period');
      }
    } catch (error) {
      setMessage('An error occurred while closing tax period');
    }
  };
    totalSales: number;
    totalVatCollected: number;
    totalRevenue: number;
    totalOrders: number;
  } | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatPercent = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const fetchTaxStats = useCallback(async () => {
    try {
      // Check if user has store access
      const storeId = user?.storeId || store?.id;
      if (!storeId) {
        console.error('No store ID available');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/tax/reports?action=dashboard-stats&storeId=${storeId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTaxStats(data);
    } catch (error) {
      console.error('Error fetching tax stats:', error);
      // Set default values on error
      setTaxStats({
        currentMonth: { revenue: 0, vatCollected: 0, transactions: 0 },
        currentYear: { revenue: 0, vatCollected: 0, transactions: 0 },
        vatEnabled: true,
        vatRate: 0.075,
      });
    } finally {
      setLoading(false);
    }
  }, [user, store, token]);

  const downloadCSV = async () => {
    if (!store) return;
    
    try {
      const storeId = user?.storeId || store.id;
      if (!storeId) {
        console.error('No store ID available');
        return;
      }
      
      const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const response = await fetch(
        `/api/tax/reports?action=records&storeId=${storeId}&startDate=${startDate}&endDate=${endDate}&format=json`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );
      
      if (!response.ok) throw new Error('Failed to download CSV');
      
      const data = await response.json();
      const headers = ['Date', 'Transaction ID', 'Revenue', 'VAT Collected', 'VAT Rate'];
      const csvData = data.records?.map((record: {
        transactionId: string;
        date: string;
        revenue: number;
        vatCollected: number;
        vatRate: number;
      }) => ({
        'Date': new Date(record.date).toLocaleDateString(),
        'Transaction ID': record.transactionId,
        'Revenue': formatCurrency(record.revenue),
        'VAT Collected': formatCurrency(record.vatCollected),
        'VAT Rate': formatPercent(record.vatRate)
      })) || [];
      
      const csvContent = generateBrandedCSV(store, csvData, headers, 'Tax Records Report');
      downloadBrandedFile(store, csvContent, 'csv', 'tax-records');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV. Please try again.');
    }
  };

  const generateMonthlySummary = async () => {
    if (!selectedPeriod) return;
    
    try {
      const [year, month] = selectedPeriod.split('-').map(Number);
      const storeId = user?.storeId || store?.id;
      
      if (!storeId) {
        console.error('No store ID available');
        return;
      }
      
      const response = await fetch('/api/tax/reports?action=generate-summary', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ storeId, year, month }),
      });
      
      if (!response.ok) throw new Error('Failed to generate summary');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    }
  };

  useEffect(() => {
    // Only fetch data when we have user information
    if (user) {
      fetchTaxStats();
    }
    
    // Set current period as default
    const now = new Date();
    setSelectedPeriod(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  }, [user, store, fetchTaxStats]);

  // Show loading or login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tax & Compliance</h1>
        <p className="text-gray-600">Manage your tax records and generate compliance reports</p>
      </div>

      {/* Tax Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">VAT Status</p>
              <p className="text-lg font-bold text-gray-900">
                {loading ? '...' : (taxStats.vatEnabled ? `Enabled (${formatPercent(taxStats.vatRate)})` : 'Disabled')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month VAT</p>
              <p className="text-lg font-bold text-gray-900">
                {loading ? '...' : formatCurrency(taxStats.currentMonth.vatCollected)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month Revenue</p>
              <p className="text-lg font-bold text-gray-900">
                {loading ? '...' : formatCurrency(taxStats.currentMonth.revenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m-2 0v4a2 2 0 002 2h2a2 2 0 002-2v-4m-2-4h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-2 0V3a2 2 0 012-2h2a2 2 0 002 2v2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month Transactions</p>
              <p className="text-lg font-bold text-gray-900">
                {loading ? '...' : taxStats.currentMonth.transactions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={downloadCSV}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV Report
            </button>

            <Link
              href="/dashboard/tax/settings"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Tax Settings
            </Link>

            <button
              onClick={() => window.print()}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Summary
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary Generator */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Generate Monthly Summary</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                Select Period
              </label>
              <input
                type="month"
                id="period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="pt-6">
              <button
                onClick={generateMonthlySummary}
                disabled={!selectedPeriod}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Summary
              </button>
            </div>
          </div>

          {summary && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Summary for {summary.period}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-lg font-bold">{formatCurrency(summary.totalSales)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">VAT Collected</p>
                  <p className="text-lg font-bold">{formatCurrency(summary.totalVatCollected)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-lg font-bold">{formatCurrency(summary.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-lg font-bold">{summary.totalOrders}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filing Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900">Tax Filing Made Easy</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">Your SwiftStock system is tax-ready! Here&apos;s how to file:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Download your monthly CSV report using the button above</li>
                <li>Upload the CSV to your tax filing platform or give it to your accountant</li>
                <li>Submit your VAT returns - all calculations are already done!</li>
              </ol>
              <p className="mt-2 font-medium">No manual calculations needed. Everything is captured at point-of-sale.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}