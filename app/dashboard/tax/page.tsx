'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const fetchStores = useCallback(async () => {
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
    } catch (_error) {
      console.error('Error fetching stores:', _error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchTaxPeriods = useCallback(async () => {
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
    } catch (_error) {
      console.error('Error fetching tax periods:', _error);
    }
  }, [selectedStore, token]);

  useEffect(() => {
    if (user && token) {
      fetchStores();
    }
  }, [user, token, fetchStores]);

  useEffect(() => {
    if (selectedStore) {
      fetchTaxPeriods();
    }
  }, [selectedStore, fetchTaxPeriods]);

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
    } catch {
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
    } catch {
      setMessage('An error occurred while closing tax period');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stores.length) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h2 className="page-title text-gray-700 mb-4">No Stores Found</h2>
            <p className="text-gray-600 mb-6">You need to create a store first to access tax features.</p>
            <Link href="/app/create-business" className="btn btn-primary">
              Create Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="page-title text-teal-800 mb-2">Tax Management</h1>
          <p className="text-gray-600">Manage VAT periods, track purchases, and generate compliance reports</p>
        </div>

        {/* Store Selection */}
        <div className="card mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Store
            </label>
            <select
              value={selectedStore?.id || ''}
              onChange={(e) => {
                const store = stores.find(s => s.id === e.target.value);
                setSelectedStore(store || null);
              }}
              className="input max-w-md"
            >
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name} {!store.vatRegistered && '(Not VAT Registered)'}
                </option>
              ))}
            </select>
          </div>
          
          {selectedStore && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">TIN:</span>
                  <span className="ml-2">{selectedStore.tin || 'Not Set'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">CAC Number:</span>
                  <span className="ml-2">{selectedStore.cacNumber || 'Not Set'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">VAT Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    selectedStore.vatRegistered 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedStore.vatRegistered ? 'VAT Registered' : 'Not Registered'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {selectedStore && (
          <>
            {/* Create New Tax Period */}
            <div className="card mb-6">
              <h2 className="section-header text-teal-800 mb-4">Create New Tax Period</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <select
                    value={newPeriodYear}
                    onChange={(e) => setNewPeriodYear(parseInt(e.target.value))}
                    className="input"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <option key={year} value={year}>{year}</option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    value={newPeriodMonth}
                    onChange={(e) => setNewPeriodMonth(parseInt(e.target.value))}
                    className="input"
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1;
                      const monthName = new Date(2000, i, 1).toLocaleString('en', { month: 'long' });
                      return (
                        <option key={month} value={month}>{monthName}</option>
                      );
                    })}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={createTaxPeriod}
                    disabled={creating}
                    className="btn btn-primary w-full"
                  >
                    {creating ? 'Creating...' : 'Create Period'}
                  </button>
                </div>
              </div>
            </div>

            {/* Tax Periods List */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-header text-teal-800">Tax Periods</h2>
                <Link href="/dashboard/tax/purchases" className="btn btn-secondary">
                  Manage Purchases
                </Link>
              </div>

              {taxPeriods.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No tax periods found. Create your first period to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sales / Purchases
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          VAT Payable
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {taxPeriods.map((period) => (
                        <tr key={period.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatTaxPeriod(new Date(period.startDate), new Date(period.endDate))}
                              </div>
                              {period.closedAt && (
                                <div className="text-xs text-gray-500">
                                  Closed {formatTaxDate(new Date(period.closedAt))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              period.status === 'OPEN' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {period.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {period._count.sales} sales • {period._count.purchases} purchases
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {period.vatPayable !== null && period.vatPayable !== undefined
                              ? formatNaira(period.vatPayable)
                              : 'Not calculated'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <Link
                              href={`/dashboard/tax/periods/${period.id}`}
                              className="text-teal-600 hover:text-teal-700 font-medium"
                            >
                              View Details
                            </Link>
                            {period.status === 'OPEN' && (
                              <button
                                onClick={() => closeTaxPeriod(period.id)}
                                className="text-red-600 hover:text-red-700 font-medium ml-2"
                              >
                                Close Period
                              </button>
                            )}
                            {period.status === 'CLOSED' && (
                              <Link
                                href={`/dashboard/tax/reports/${period.id}`}
                                className="text-blue-600 hover:text-blue-700 font-medium ml-2"
                              >
                                VAT Report
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}