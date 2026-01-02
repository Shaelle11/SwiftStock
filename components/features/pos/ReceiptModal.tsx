'use client';

import { formatCurrency, formatDateTime } from '@/lib/utils/api';
import type { Product } from '@/lib/types';

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  subtotal: number;
}

interface SaleData {
  id: string;
  total: number;
  items: CartItem[];
  customerName?: string;
  paymentMethod: string;
  createdAt: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleData | null;
  store: any;
  onNewSale: () => void;
  brandStyles: any;
}

export default function ReceiptModal({
  isOpen,
  onClose,
  sale,
  store,
  onNewSale,
  brandStyles
}: ReceiptModalProps) {

  if (!isOpen || !sale) return null;

  const subtotal = sale.items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = sale.total - subtotal; // Assuming tax is the difference
  const receiptNumber = `RCP-${sale.id}`;

  const printReceipt = () => {
    window.print();
  };

  const emailReceipt = () => {
    // Future feature: Email receipt functionality
    alert('Email receipt feature coming soon!');
  };

  const handleNewSale = () => {
    onNewSale();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Success Header */}
        <div className="p-6 border-b border-gray-200 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" 
               style={{ backgroundColor: brandStyles.accentColor || '#10B981' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sale Completed Successfully!</h2>
          <p className="text-gray-600">Transaction processed and inventory updated</p>
        </div>

        {/* Receipt Content */}
        <div className="p-6" id="receipt-content">
          {/* Store Header */}
          <div className="text-center mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-lg font-bold" style={{ color: brandStyles.primaryColor }}>
              {store?.name || 'Your Store'}
            </h3>
            {store?.address && (
              <p className="text-sm text-gray-600">{store.address}</p>
            )}
            {store?.phone && (
              <p className="text-sm text-gray-600">{store.phone}</p>
            )}
          </div>

          {/* Receipt Details */}
          <div className="mb-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Receipt #:</span>
              <span className="font-medium">{receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDateTime(sale.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{sale.customerName || 'Guest'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium capitalize">{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Items */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Items Purchased
            </h4>
            <div className="space-y-3">
              {sale.items.map((item) => (
                <div key={item.productId} className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(item.product.sellingPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium ml-2">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (VAT 7.5%):</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span style={{ color: brandStyles.primaryColor }}>
                {formatCurrency(sale.total)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>Thank you for your business!</p>
            <p>Items sold are non-refundable</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="grid grid-cols-1 gap-3">
            {/* Print Receipt */}
            <button
              onClick={printReceipt}
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Receipt
            </button>

            {/* Email Receipt */}
            <button
              onClick={emailReceipt}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Receipt
            </button>

            {/* New Sale */}
            <button
              onClick={handleNewSale}
              className="px-4 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-colors"
              style={brandStyles.buttonStyle}
            >
              Start New Sale
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}