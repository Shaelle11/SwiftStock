'use client';

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useAuth, AuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/utils/api';
import { formatCurrency, formatDateTime } from '@/lib/utils/api';
import { getStoreBrandStyles } from '@/lib/store-branding';
import { Eye, Search } from 'lucide-react';
import ReceiptModal from '@/components/features/pos/ReceiptModal';

interface SaleItem {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface Receipt {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  total: number;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  deliveryType?: 'WALK_IN' | 'DELIVERY' | 'PICKUP';
  cashier: {
    firstName: string;
    lastName: string;
  };
  customer?: {
    name: string;
  };
  items: SaleItem[];
}

export default function ReceiptsPage() {
  const { user, token } = useAuth();
  const { store } = useContext(AuthContext)!;
  const brandStyles = getStoreBrandStyles(store);
  
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadReceipts = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: '20'
      };

      if (searchQuery) params.search = searchQuery;
      if (paymentMethodFilter) params.paymentMethod = paymentMethodFilter;
      if (dateRangeFilter !== 'all') params.dateRange = dateRangeFilter;

      const response = await api.get('/api/receipts', params);
      
      if (response.success && response.data) {
        const receiptsData = response.data as {
          receipts: Receipt[];
          pagination: {
            totalPages: number;
          };
        };
        setReceipts(receiptsData.receipts || []);
        if (receiptsData.pagination) {
          setTotalPages(receiptsData.pagination.totalPages);
        }
      } else {
        setError(response.message || 'Failed to load receipts');
        setReceipts([]);
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
      setError('Failed to load receipts');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, searchQuery, paymentMethodFilter, dateRangeFilter]);

  useEffect(() => {
    if (user && token) {
      loadReceipts();
    }
  }, [user, token, loadReceipts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadReceipts();
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setPaymentMethodFilter('');
    setDateRangeFilter('all');
    setCurrentPage(1);
    loadReceipts();
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      CASH: 'Cash',
      CARD: 'Card',
      TRANSFER: 'Transfer',
      OTHER: 'Other'
    };
    return methods[method as keyof typeof methods] || method;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
          <p className="text-gray-600">View and manage all generated receipts</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Invoice number, customer..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Methods</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="TRANSFER">Transfer</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading receipts...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadReceipts}
              className="mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : receipts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No receipts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cashier
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {receipt.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatDateTime(receipt.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {receipt.customer?.name || 'Walk-in Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getPaymentMethodLabel(receipt.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {receipt.cashier.firstName} {receipt.cashier.lastName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(receipt.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewReceipt(receipt)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceipt && (
        <ReceiptModal
          sale={{
            ...selectedReceipt,
            items: selectedReceipt.items.map(item => ({
              productId: item.id,
              product: {
                id: item.id,
                name: item.productName,
                description: '',
                category: '',
                costPrice: 0,
                sellingPrice: item.unitPrice,
                stockQuantity: 0,
                lowStockThreshold: 0,
                barcode: '',
                imageUrl: '',
                isActive: true,
                storeId: '',
                createdAt: new Date(),
                updatedAt: new Date()
              },
              quantity: item.quantity,
              subtotal: item.subtotal
            }))
          }}
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedReceipt(null);
          }}
          store={store}
          onNewSale={() => {
            setShowReceiptModal(false);
            setSelectedReceipt(null);
          }}
          brandStyles={brandStyles}
        />
      )}
    </div>
  );
}