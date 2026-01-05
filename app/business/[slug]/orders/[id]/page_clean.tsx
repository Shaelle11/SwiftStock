'use client';

import { useState, useContext, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, AuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/utils/api';
import { formatCurrency, formatDateTime } from '@/lib/utils/api';
import { ArrowLeft, Download, User } from 'lucide-react';

interface Sale {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  notes?: string;
  // Delivery fields
  customerName?: string;
  customerPhone?: string;
  deliveryType?: 'WALK_IN' | 'DELIVERY' | 'PICKUP' | 'walk-in' | 'delivery' | 'pickup';
  deliveryAddress?: string;
  deliveryPrice?: number;
  deliveryStatus?: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'OUT_FOR_DELIVERY' | 'pending' | 'in-transit' | 'delivered' | 'failed' | 'out_for_delivery';
  riderName?: string;
  riderPhone?: string;
  parcelNumber?: string;
  deliveryNotes?: string;
  deliveredAt?: string;
  deliveryDuration?: number;
  cashier: {
    firstName: string;
    lastName: string;
  };
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    id: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    product?: {
      name: string;
      sku: string;
    };
  }>;
  store: {
    name: string;
    businessName: string;
    address: string;
    phone: string;
    email: string;
  };
}

export default function OrderDetail() {
  const { token } = useAuth();
  const { store } = useContext(AuthContext)!;
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const businessSlug = params?.slug as string;

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  
  // Delivery update form state
  const [deliveryFormData, setDeliveryFormData] = useState({
    deliveryStatus: 'pending' as 'pending' | 'in-transit' | 'delivered' | 'failed' | 'out_for_delivery',
    riderName: '',
    riderPhone: '',
    parcelNumber: '',
    deliveryNotes: '',
    deliveredAt: '',
  });

  // Helper function to normalize delivery status
  const normalizeDeliveryStatus = (status: string | undefined | null): 'pending' | 'in-transit' | 'delivered' | 'failed' | 'out_for_delivery' => {
    if (!status) return 'pending';
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'pending';
      case 'in-transit':
      case 'in_transit':
        return 'in-transit';
      case 'delivered':
        return 'delivered';
      case 'failed':
        return 'failed';
      case 'out_for_delivery':
      case 'out-for-delivery':
        return 'out_for_delivery';
      default:
        return 'pending';
    }
  };

  const loadSale = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);

    try {
      // Pass businessId if we have store context
      const params: Record<string, string> = {};
      if (store?.id) {
        params.businessId = store.id;
      }
      
      // Add timestamp to prevent caching
      params.t = Date.now().toString();

      const response = await api.get(`/api/receipts/${orderId}`, params);
      
      if (response.success && response.data) {
        const saleData = response.data as Sale;
        console.log('Sale data loaded:', {
          deliveryType: saleData.deliveryType,
          deliveryStatus: saleData.deliveryStatus,
          customerName: saleData.customerName,
          customerPhone: saleData.customerPhone,
          deliveryAddress: saleData.deliveryAddress
        });
        setSale(saleData);
        
        // Update form data when sale data is refreshed
        setDeliveryFormData({
          deliveryStatus: normalizeDeliveryStatus(saleData.deliveryStatus),
          riderName: saleData.riderName || '',
          riderPhone: saleData.riderPhone || '',
          parcelNumber: saleData.parcelNumber || '',
          deliveryNotes: saleData.deliveryNotes || '',
          deliveredAt: saleData.deliveredAt || '',
        });
      } else {
        setError(response.message || 'Failed to load order details');
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [token, store?.id, orderId]);

  useEffect(() => {
    if (token && orderId) {
      loadSale();
    }
  }, [token, orderId, loadSale]);

  const handleBack = () => {
    router.push(`/business/${businessSlug}/orders`);
  };

  const handlePrintReceipt = () => {
    if (!sale) return;

    // Create a new window with just the receipt content
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Please allow popups to print receipts');
      return;
    }

    // Simple receipt HTML that avoids complex template literals
    const receiptNumber = sale.invoiceNumber;
    const storeName = sale.store?.businessName || sale.store?.name || 'Your Store';
    const storeAddress = sale.store?.address || '';
    const storePhone = sale.store?.phone || '';
    
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Receipt - ${receiptNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
    .store-name { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
    .receipt-info, .items, .totals { margin-bottom: 20px; }
    .item-row, .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .total-row.final { font-weight: bold; font-size: 16px; border-top: 1px solid #000; padding-top: 10px; }
    .footer { text-align: center; border-top: 1px solid #000; padding-top: 15px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="store-name">${storeName}</div>
    <div>${storeAddress}</div>
    <div>${storePhone}</div>
  </div>
  <div class="receipt-info">
    <p><strong>Receipt:</strong> ${receiptNumber}</p>
    <p><strong>Date:</strong> ${formatDateTime(sale.createdAt)}</p>
    <p><strong>Customer:</strong> ${sale.customerName || 'Guest Customer'}</p>
    <p><strong>Payment:</strong> ${sale.paymentMethod}</p>
  </div>
  <div class="items">
    <h3>Items:</h3>
    ${sale.items.map(item => 
      `<div class="item-row">
        <span>${item.productName} (${formatCurrency(item.unitPrice)} × ${item.quantity})</span>
        <span>${formatCurrency(item.subtotal)}</span>
      </div>`
    ).join('')}
  </div>
  <div class="totals">
    <div class="total-row"><span>Subtotal:</span><span>${formatCurrency(sale.subtotal)}</span></div>
    <div class="total-row"><span>Tax:</span><span>${formatCurrency(sale.tax)}</span></div>
    ${sale.discount > 0 ? `<div class="total-row"><span>Discount:</span><span>-${formatCurrency(sale.discount)}</span></div>` : ''}
    <div class="total-row final"><span>TOTAL:</span><span>${formatCurrency(sale.total)}</span></div>
  </div>
  <div class="footer">
    <p><strong>Thank you for your business!</strong></p>
    <p>Receipt generated on ${formatDateTime(sale.createdAt)}</p>
  </div>
</body>
</html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setTimeout(() => printWindow.close(), 100);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH': return 'Cash';
      case 'CARD': return 'Card';
      case 'TRANSFER': return 'Bank Transfer';
      case 'POS': return 'POS';
      default: return method;
    }
  };

  const getDeliveryStatusLabel = (status: string | undefined | null) => {
    const statuses = {
      pending: { label: 'Pending Pickup', className: 'bg-yellow-100 text-yellow-800' },
      'in-transit': { label: 'Parcel Given to Rider', className: 'bg-blue-100 text-blue-800' },
      'in_transit': { label: 'Parcel Given to Rider', className: 'bg-blue-100 text-blue-800' },
      'out-for-delivery': { label: 'Out for Delivery', className: 'bg-indigo-100 text-indigo-800' },
      'out_for_delivery': { label: 'Out for Delivery', className: 'bg-indigo-100 text-indigo-800' },
      delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
      failed: { label: 'Delivery Failed', className: 'bg-red-100 text-red-800' }
    };
    const normalizedStatus = status?.toLowerCase();
    return statuses[normalizedStatus as keyof typeof statuses] || { label: normalizedStatus || 'Unknown', className: 'bg-gray-100 text-gray-800' };
  };

  const isDeliveryOverdue = () => {
    const normalizedDeliveryType = sale?.deliveryType?.toLowerCase();
    const normalizedDeliveryStatus = sale?.deliveryStatus?.toLowerCase();
    
    if (!sale?.deliveryType || normalizedDeliveryType === 'walk-in' || normalizedDeliveryStatus === 'delivered') return false;
    
    const createdDate = new Date(sale.createdAt);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffInDays >= 5;
  };

  const handleUpdateDelivery = async () => {
    if (!token || !sale) {
      console.log('Missing token or sale:', { token: !!token, sale: !!sale });
      return;
    }

    try {
      const updateData = {
        ...deliveryFormData,
        deliveredAt: deliveryFormData.deliveryStatus === 'delivered' && !deliveryFormData.deliveredAt 
          ? new Date().toISOString() 
          : deliveryFormData.deliveredAt
      };

      console.log('Updating delivery with data:', updateData);
      console.log('Sale ID:', sale.id);
      console.log('Sale delivery type:', sale.deliveryType);

      // Check if endpoint exists by making a manual fetch first
      const apiUrl = `/api/sales/${sale.id}/delivery`;
      console.log('Making request to:', apiUrl);

      const response = await api.post(`/api/sales/${sale.id}/delivery`, updateData);
      
      console.log('Delivery update response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response));
      
      if (response && response.success) {
        // Update the local sale state immediately for better UX
        setSale(prevSale => prevSale ? {
          ...prevSale,
          deliveryStatus: updateData.deliveryStatus,
          riderName: updateData.riderName,
          riderPhone: updateData.riderPhone,
          parcelNumber: updateData.parcelNumber,
          deliveryNotes: updateData.deliveryNotes,
          deliveredAt: updateData.deliveredAt
        } : null);
        
        // Close modal first for better UX
        setShowDeliveryModal(false);
        
        // Then reload sale data to ensure consistency
        await loadSale();
        
        alert('Delivery information updated successfully!');
      } else {
        console.error('Update failed - Response details:', {
          response,
          success: response?.success,
          message: response?.message,
          error: response?.error
        });
        alert(response?.message || response?.error || 'Failed to update delivery information');
      }
    } catch (error) {
      console.error('Error updating delivery:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      alert('Failed to update delivery information');
    }
  };

  // Initialize form data when sale loads
  useEffect(() => {
    if (sale) {
      setDeliveryFormData({
        deliveryStatus: normalizeDeliveryStatus(sale.deliveryStatus),
        riderName: sale.riderName || '',
        riderPhone: sale.riderPhone || '',
        parcelNumber: sale.parcelNumber || '',
        deliveryNotes: sale.deliveryNotes || '',
        deliveredAt: sale.deliveredAt || '',
      });
    }
  }, [sale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
            <button
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto print:max-w-none">
        {/* Header - Hidden when printing */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handlePrintReceipt}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Print Receipt
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div id="receipt-content" className="bg-white rounded-lg shadow-lg print:shadow-none print:rounded-none">
          {/* Order Header */}
          <div className="p-6 border-b print:border-black print:p-4">
            <div className="text-center mb-6 print:mb-4">
              <h1 className="text-2xl font-bold text-gray-900 print:text-xl print:text-black">
                {sale.store?.businessName || sale.store?.name || 'Receipt'}
              </h1>
              {sale.store?.address && (
                <p className="text-gray-600 print:text-black print:text-sm">{sale.store.address}</p>
              )}
              {sale.store?.phone && (
                <p className="text-gray-600 print:text-black print:text-sm">{sale.store.phone}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-4">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4 print:bg-white print:rounded-none print:p-0">
                <h3 className="font-semibold text-gray-900 mb-2 print:text-black">Order Details</h3>
                <p className="text-sm text-gray-600 mb-1 print:text-black">Receipt #</p>
                <p className="font-medium print:text-sm">{sale.invoiceNumber}</p>
                <p className="text-sm text-gray-600 mb-1 mt-2 print:text-black">Date & Time</p>
                <p className="font-medium print:text-sm">{formatDateTime(sale.createdAt)}</p>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 rounded-lg p-4 print:bg-white print:rounded-none print:p-0">
                <h3 className="font-semibold text-gray-900 mb-2 print:text-black">Payment</h3>
                <p className="text-sm text-gray-600 mb-1 print:text-black">Method</p>
                <p className="font-medium print:text-sm">{getPaymentMethodLabel(sale.paymentMethod)}</p>
                <p className="text-sm text-gray-600 mb-1 mt-2 print:text-black">Total Amount</p>
                <p className="font-medium text-lg text-green-600 print:text-black print:text-sm">{formatCurrency(sale.total)}</p>
              </div>

              {/* Cashier Info */}
              <div className="bg-gray-50 rounded-lg p-4 print:bg-white print:rounded-none print:p-0">
                <h3 className="font-semibold text-gray-900 mb-2 print:text-black">Processed By</h3>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-400 print:hidden" />
                  <span className="font-medium print:text-sm">{sale.cashier.firstName} {sale.cashier.lastName}</span>
                </div>
                {sale.deliveryType && (
                  <>
                    <p className="text-sm text-gray-600 mb-1 print:text-black">Order Type</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full print:px-0 print:py-0 print:rounded-none print:text-sm ${
                      sale?.deliveryType?.toLowerCase() === 'delivery' ? 'bg-blue-100 text-blue-800 print:bg-white print:text-black' : 'bg-gray-100 text-gray-800 print:bg-white print:text-black'
                    }`}>
                      {sale?.deliveryType?.toLowerCase() === 'delivery' ? 'Delivery' : 'Walk-in'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Delivery Information Section */}
            {sale?.deliveryType?.toLowerCase() === 'delivery' && (
              <div className="mb-8 print:mb-4">
                <div className="bg-blue-50 rounded-lg p-6 print:bg-white print:rounded-none print:p-0 print:mb-4">
                  <div className="flex justify-between items-start mb-4 print:mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 print:text-base print:text-black">Delivery Information</h3>
                    <div className="flex gap-2 print:hidden">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDeliveryStatusLabel(sale.deliveryStatus).className}`}>
                        {getDeliveryStatusLabel(sale.deliveryStatus).label}
                      </span>
                      <button
                        onClick={() => setShowDeliveryModal(true)}
                        className="px-3 py-1 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                      >
                        Update
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                    {/* Customer Information */}
                    {(sale.customerName || sale.customer?.name) && (
                      <div>
                        <p className="text-sm text-gray-600 print:text-black">Customer Name</p>
                        <p className="font-medium print:text-sm">{sale.customerName || sale.customer?.name}</p>
                      </div>
                    )}

                    {(sale.customerPhone || sale.customer?.phone) && (
                      <div>
                        <p className="text-sm text-gray-600 print:text-black">Customer Phone</p>
                        <p className="font-medium print:text-sm">{sale.customerPhone || sale.customer?.phone}</p>
                      </div>
                    )}

                    {/* Delivery Address */}
                    <div>
                      <p className="text-sm text-gray-600 print:text-black">Delivery Address</p>
                      <p className="font-medium print:text-sm">{sale.deliveryAddress || 'Not specified'}</p>
                    </div>

                    {sale.deliveryPrice && (
                      <div>
                        <p className="text-sm text-gray-600 print:text-black">Delivery Fee</p>
                        <p className="font-medium print:text-sm">{formatCurrency(sale.deliveryPrice)}</p>
                      </div>
                    )}

                    {sale.riderName && (
                      <div>
                        <p className="text-sm text-gray-600 print:text-black">Rider</p>
                        <p className="font-medium print:text-sm">{sale.riderName}</p>
                        {sale.riderPhone && (
                          <p className="text-sm text-gray-500 print:text-black">{sale.riderPhone}</p>
                        )}
                      </div>
                    )}

                    {sale.parcelNumber && (
                      <div>
                        <p className="text-sm text-gray-600 print:text-black">Parcel Number</p>
                        <p className="font-medium font-mono print:text-sm">{sale.parcelNumber}</p>
                      </div>
                    )}

                    {sale.deliveredAt && (
                      <div>
                        <p className="text-sm text-gray-600 print:text-black">Delivered At</p>
                        <p className="font-medium print:text-sm">{formatDateTime(sale.deliveredAt)}</p>
                      </div>
                    )}

                    {sale.deliveryNotes && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 print:text-black">Delivery Notes</p>
                        <p className="text-sm print:text-sm">{sale.deliveryNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Print-only receipt details */}
            <div className="hidden print:block mb-6">
              <div className="border-b border-black mb-4 pb-2">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Receipt ID:</span>
                    <span>{sale.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{sale.customer?.name || sale.customerName || 'Walk-in Customer'}</span>
                  </div>
                  {(sale.customer?.phone || sale.customerPhone) && (
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span>{sale.customer?.phone || sale.customerPhone}</span>
                    </div>
                  )}
                  {sale?.deliveryType?.toLowerCase() === 'delivery' && (
                    <>
                      <div className="flex justify-between">
                        <span>Delivery:</span>
                        <span>{getDeliveryStatusLabel(sale.deliveryStatus).label}</span>
                      </div>
                      {sale.deliveryAddress && (
                        <div className="flex justify-between">
                          <span>Address:</span>
                          <span className="text-right max-w-[60%]">{sale.deliveryAddress}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span>{getPaymentMethodLabel(sale.paymentMethod)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>{sale.cashier.firstName} {sale.cashier.lastName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 print:text-base print:mb-2 print:border-b print:border-black print:pb-1 print:text-black">Items Purchased</h3>   

              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full border rounded-lg print:border-0 print:rounded-none">
                  <thead className="bg-gray-50 print:bg-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase print:px-0 print:py-1 print:text-black print:text-sm print:normal-case print:border-b print:border-black">Item</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase print:px-0 print:py-1 print:text-black print:text-sm print:normal-case print:border-b print:border-black">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase print:px-0 print:py-1 print:text-black print:text-sm print:normal-case print:border-b print:border-black">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase print:px-0 print:py-1 print:text-black print:text-sm print:normal-case print:border-b print:border-black">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 print:divide-y-0">
                    {sale.items.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50 print:hover:bg-white">
                        <td className="px-4 py-3 print:px-0 print:py-1">
                          <div>
                            <p className="font-medium text-gray-900 print:text-black print:text-sm">
                              {item.productName || item.product?.name}
                            </p>
                            {item.product?.sku && (
                              <p className="text-sm text-gray-500 print:hidden">SKU: {item.product.sku}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium print:px-0 print:py-1 print:text-sm">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right print:px-0 print:py-1 print:text-sm">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-medium print:px-0 print:py-1 print:text-sm">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Total */}
            <div className="flex justify-end print:justify-start print:mt-4">
              <div className="w-full max-w-sm print:max-w-none print:w-full">
                <div className="bg-gray-50 rounded-lg p-4 print:bg-white print:rounded-none print:p-0 print:border-t-2 print:border-black print:pt-2">
                  <div className="space-y-2 print:space-y-1">
                    <div className="flex justify-between print:text-sm">
                      <span className="text-gray-600 print:text-black">Subtotal:</span>
                      <span className="font-medium print:text-black">{formatCurrency(sale.subtotal)}</span>
                    </div>

                    {sale.deliveryPrice && sale.deliveryPrice > 0 && (
                      <div className="flex justify-between print:text-sm">
                        <span className="text-gray-600 print:text-black">Delivery Fee:</span>
                        <span className="font-medium print:text-black">{formatCurrency(sale.deliveryPrice)}</span>
                      </div>
                    )}

                    {sale.discount > 0 && (
                      <div className="flex justify-between text-red-600 print:text-black print:text-sm">
                        <span>Discount:</span>
                        <span>-{formatCurrency(sale.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between print:text-sm">
                      <span className="text-gray-600 print:text-black">Tax (VAT):</span>
                      <span className="font-medium print:text-black">{formatCurrency(sale.tax)}</span>
                    </div>

                    <div className="border-t pt-2 print:border-black print:pt-1">
                      <div className="flex justify-between text-lg font-bold print:text-base">
                        <span className="print:text-black">Total:</span>
                        <span className="text-green-600 print:text-black">{formatCurrency(sale.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {sale.notes && (
              <div className="mt-6 pt-6 border-t print:mt-3 print:pt-2 print:border-black">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 print:text-sm print:text-black print:mb-1">Notes</h3>
                <p className="text-gray-600 print:text-black print:text-sm">{sale.notes}</p>
              </div>
            )}

            {/* Print-only footer */}
            <div className="hidden print:block mt-4 pt-2 border-t border-black text-center">
              <p className="text-sm">Thank you for your business!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Update Modal */}
      {showDeliveryModal && sale?.deliveryType?.toLowerCase() === 'delivery' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Update Delivery Information</h2>
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Delivery Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Status
                  </label>
                  <select
                    value={deliveryFormData.deliveryStatus}
                    onChange={(e) => setDeliveryFormData(prev => ({
                      ...prev,
                      deliveryStatus: e.target.value as 'pending' | 'in-transit' | 'delivered' | 'failed' | 'out_for_delivery'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-transit">Parcel Given to Rider</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Rider Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rider Name
                    </label>
                    <input
                      type="text"
                      value={deliveryFormData.riderName}
                      onChange={(e) => setDeliveryFormData(prev => ({ ...prev, riderName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter rider name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rider Phone
                    </label>
                    <input
                      type="tel"
                      value={deliveryFormData.riderPhone}
                      onChange={(e) => setDeliveryFormData(prev => ({ ...prev, riderPhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter rider phone"
                    />
                  </div>
                </div>

                {/* Parcel Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parcel/Tracking Number
                  </label>
                  <input
                    type="text"
                    value={deliveryFormData.parcelNumber}
                    onChange={(e) => setDeliveryFormData(prev => ({ ...prev, parcelNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter parcel/tracking number"
                  />
                </div>

                {/* Delivery Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Notes
                  </label>
                  <textarea
                    value={deliveryFormData.deliveryNotes}
                    onChange={(e) => setDeliveryFormData(prev => ({ ...prev, deliveryNotes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter any delivery notes or updates"
                  />
                </div>

                {/* Delivered At (only show if status is delivered) */}
                {deliveryFormData.deliveryStatus === 'delivered' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={deliveryFormData.deliveredAt ? new Date(deliveryFormData.deliveredAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setDeliveryFormData(prev => ({
                        ...prev,
                        deliveredAt: e.target.value ? new Date(e.target.value).toISOString() : ''
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Current Order Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Customer:</p>
                      <p className="font-medium">{sale.customerName || 'Walk-in'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Order Date:</p>
                      <p className="font-medium">{formatDateTime(sale.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Delivery Address:</p>
                      <p className="font-medium">{sale.deliveryAddress}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Amount:</p>
                      <p className="font-medium">{formatCurrency(sale.total)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateDelivery}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Update Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything by default */
          body * {
            visibility: hidden;
          }

          /* Show only the receipt content */
          #receipt-content, #receipt-content * {
            visibility: visible;
          }

          /* Position the receipt content properly */
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            color: black !important;
            font-size: 12px;
            line-height: 1.4;
            page-break-inside: avoid;
          }

          /* Hide page URL and browser elements, force single page */
          @page {
            margin: 0.3in;
            size: auto;
          }

          /* Remove URL from header/footer */
          @page :first {
            margin-top: 0;
          }

          /* Ensure proper colors and spacing */
          * {
            background: transparent !important;
            color: black !important;
            box-shadow: none !important;
            text-shadow: none !important;
            page-break-inside: avoid;
          }

          /* Force content to fit on one page */
          html, body {
            height: auto !important;
            overflow: visible !important;
          }

          /* Hide navigation and UI elements */
          .print\\:hidden {
            display: none !important;
          }

          /* Show print-only elements */
          .print\\:block {
            display: block !important;
          }

          /* Prevent page breaks in tables */
          table {
            page-break-inside: avoid;
          }

          /* Hide URL from print preview */
          body::before {
            content: '' !important;
          }
        }

        /* Hide print dialog URL */
        @media print {
          .no-print, .no-print * {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}