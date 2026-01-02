'use client';

import { formatCurrency, formatDateTime } from '@/lib/utils/api';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderDetails {
  id: string;
  createdAt: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  status: string;
  customerName?: string;
  items: OrderItem[];
}

interface ReceiptViewProps {
  order: OrderDetails;
  store: any;
  onClose: () => void;
  brandStyles: any;
}

export default function ReceiptView({ order, store, onClose, brandStyles }: ReceiptViewProps) {
  const receiptNumber = `RCP-${order.id.slice(0, 8)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Future feature: Generate PDF
    alert('PDF download feature coming soon!');
  };

  const handleEmailReceipt = () => {
    // Future feature: Email receipt
    alert('Email receipt feature coming soon!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:max-w-full">
        {/* Header Actions (Hidden in print) */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between print:hidden">
          <h2 className="text-lg font-bold text-gray-900">Receipt Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-8 print:p-12" id="receipt-content">
          {/* Store Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <h1 className="text-2xl font-bold mb-2" style={{ color: brandStyles.primaryColor }}>
              {store?.name || 'Your Store'}
            </h1>
            {store?.address && (
              <p className="text-sm text-gray-700">{store.address}</p>
            )}
            <div className="flex justify-center gap-4 text-sm text-gray-700 mt-2">
              {store?.phone && <p>Phone: {store.phone}</p>}
              {store?.email && <p>Email: {store.email}</p>}
            </div>
          </div>

          {/* Receipt Type */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 uppercase">Sales Receipt</h2>
          </div>

          {/* Receipt Details */}
          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Receipt Number:</p>
              <p className="font-medium text-gray-900">{receiptNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Date:</p>
              <p className="font-medium text-gray-900">{formatDateTime(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-600">Customer:</p>
              <p className="font-medium text-gray-900">{order.customerName || 'Guest'}</p>
            </div>
            <div>
              <p className="text-gray-600">Payment Method:</p>
              <p className="font-medium text-gray-900 capitalize">{order.paymentMethod}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="py-2 text-left text-sm font-bold text-gray-900">Item</th>
                  <th className="py-2 text-center text-sm font-bold text-gray-900">Qty</th>
                  <th className="py-2 text-right text-sm font-bold text-gray-900">Price</th>
                  <th className="py-2 text-right text-sm font-bold text-gray-900">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 text-sm text-gray-900">{item.productName}</td>
                    <td className="py-2 text-center text-sm text-gray-900">{item.quantity}</td>
                    <td className="py-2 text-right text-sm text-gray-900">{formatCurrency(item.price)}</td>
                    <td className="py-2 text-right text-sm font-medium text-gray-900">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-gray-300 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Tax (VAT 7.5%):</span>
              <span className="font-medium text-gray-900">{formatCurrency(order.tax)}</span>
            </div>
            
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Discount:</span>
                <span className="font-medium text-red-600">- {formatCurrency(order.discount)}</span>
              </div>
            )}
            
            <div className="border-t-2 border-gray-300 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">TOTAL:</span>
                <span style={{ color: brandStyles.primaryColor }}>
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Payment Method:</span>
              <span className="font-medium text-gray-900 capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-700">Status:</span>
              <span className="font-medium text-green-600">PAID</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center">
            <p className="text-sm font-medium text-gray-900 mb-2">Thank you for your business!</p>
            <p className="text-xs text-gray-600">Items sold are non-refundable</p>
            <p className="text-xs text-gray-600 mt-1">For inquiries, please contact us at {store?.phone || store?.email || 'our store'}</p>
          </div>

          {/* Barcode/QR Code Placeholder */}
          <div className="mt-6 text-center">
            <div className="inline-block px-4 py-2 bg-gray-100 border border-gray-300 rounded">
              <p className="text-xs font-mono text-gray-700">{receiptNumber}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden in print) */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>

            <button
              onClick={handleEmailReceipt}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            margin: 0.5in;
            size: A4;
          }
          
          body * {
            visibility: hidden;
          }
          
          #receipt-content,
          #receipt-content * {
            visibility: visible;
          }
          
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}