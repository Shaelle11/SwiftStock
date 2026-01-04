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
  customerPhone?: string;
  customerAddress?: string;
  deliveryType?: 'WALK_IN' | 'DELIVERY' | 'PICKUP';
  items: OrderItem[];
}

interface Store {
  name: string;
  businessName?: string;
  address?: string;
  phone?: string;
  email?: string;
  primaryColor?: string;
  accentColor?: string;
}

interface BrandStyles {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

interface ReceiptViewProps {
  order: OrderDetails;
  store: Store;
  onClose: () => void;
  brandStyles: BrandStyles;
}

export default function ReceiptView({ order, store, onClose, brandStyles }: ReceiptViewProps) {
  const receiptNumber = `RCP-${order.id.slice(0, 8)}`;

  const printReceipt = () => {
    // Create a new window with just the receipt content
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Please allow popups to print receipts');
      return;
    }

    // Generate the complete receipt HTML with the same format as POS
    const receiptHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt - ${receiptNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #000;
            background: white;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
          }
          
          .receipt-header {
            text-center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #000;
            line-height: 1.4;
          }
          
          .store-name {
            font-size: 24px;
            font-weight: bold;
            color: ${brandStyles.primaryColor || '#000'};
            margin-bottom: 8px;
            line-height: 1.2;
          }
          
          .store-info {
            font-size: 12px;
            color: #000;
            line-height: 1.5;
            margin-bottom: 3px;
          }
          
          .receipt-details {
            margin-bottom: 25px;
            line-height: 1.5;
          }
          
          .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 15px;
          }
          
          .detail-item {
            display: flex;
            flex-direction: column;
            margin-bottom: 8px;
          }
          
          .detail-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 3px;
            line-height: 1.3;
          }
          
          .detail-value {
            font-weight: bold;
            font-size: 14px;
            color: #000;
            line-height: 1.4;
          }
          
          .separator {
            width: 100%;
            height: 1px;
            background: #ddd;
            margin: 15px 0;
          }
          
          .items-section {
            margin-bottom: 25px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
            color: #000;
            line-height: 1.3;
          }
          
          .item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            line-height: 1.4;
          }
          
          .item:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          
          .item-info {
            flex: 1;
            margin-right: 15px;
          }
          
          .item-name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 3px;
            line-height: 1.3;
          }
          
          .item-details {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
          }
          
          .item-price {
            font-weight: bold;
            font-size: 14px;
            text-align: right;
            line-height: 1.3;
          }
          
          .totals-section {
            border-top: 2px solid #000;
            padding-top: 12px;
            margin-bottom: 25px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            font-size: 14px;
            flex-wrap: wrap;
            gap: 8px;
            line-height: 1.4;
          }
          
          .total-row .total-label {
            flex: 1;
            min-width: 120px;
            line-height: 1.3;
          }
          
          .total-row .total-value {
            flex-shrink: 0;
            font-weight: bold;
            text-align: right;
            min-width: 80px;
            line-height: 1.3;
          }
          
          .total-row.final {
            font-size: 18px;
            font-weight: bold;
            border-top: 1px solid #ddd;
            padding-top: 8px;
            margin-top: 8px;
            margin-bottom: 0;
            line-height: 1.2;
          }
          
          .total-row.final .total-label {
            font-size: 18px;
            font-weight: bold;
            line-height: 1.2;
          }
          
          .total-row.final .total-value {
            font-size: 18px;
            font-weight: bold;
            line-height: 1.2;
          }
          
          .footer {
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 15px;
            font-size: 12px;
            color: #666;
            line-height: 1.6;
          }
          
          .footer .thank-you {
            font-size: 14px;
            font-weight: bold;
            color: #000;
            margin-bottom: 8px;
            line-height: 1.3;
          }
          
          .footer > div:not(.thank-you) {
            margin-bottom: 5px;
            line-height: 1.5;
          }
          
          .footer > div:last-child {
            margin-bottom: 0;
            margin-top: 8px;
            line-height: 1.4;
          }
          
          @media print {
            body {
              padding: 15px;
              font-size: 12px;
              line-height: 1.4;
            }
            
            .store-name {
              font-size: 20px;
              margin-bottom: 6px;
              line-height: 1.1;
            }
            
            .section-title {
              font-size: 14px;
              margin-bottom: 8px;
              line-height: 1.2;
            }
            
            .receipt-header {
              margin-bottom: 20px;
              padding-bottom: 12px;
            }
            
            .receipt-details, .items-section {
              margin-bottom: 20px;
            }
            
            .totals-section {
              margin-bottom: 20px;
              padding-top: 10px;
            }
            
            .item {
              padding: 6px 0;
            }
            
            .total-row {
              margin-bottom: 4px;
            }
            
            .total-row.final {
              margin-top: 6px;
              padding-top: 6px;
            }
            
            .footer {
              padding-top: 12px;
            }
            
            .detail-grid {
              gap: 8px;
              margin-bottom: 12px;
            }
            
            .detail-item {
              margin-bottom: 6px;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-header">
          <div class="store-name">${store?.name || 'Your Store'}</div>
          ${store?.address ? `<div class="store-info">${store.address}</div>` : ''}
          ${store?.phone ? `<div class="store-info">${store.phone}</div>` : ''}
        </div>

        <div class="receipt-details">
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">Receipt #:</div>
              <div class="detail-value">${receiptNumber}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Date & Time:</div>
              <div class="detail-value">${formatDateTime(order.createdAt)}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Customer:</div>
              <div class="detail-value">${order.customerName || 'Guest Customer'}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Order Type:</div>
              <div class="detail-value">${
                order.deliveryType === 'WALK_IN' ? 'Walk-in' : 
                order.deliveryType === 'DELIVERY' ? 'Delivery' : 
                order.deliveryType === 'PICKUP' ? 'Pickup' : 'Walk-in'
              }</div>
            </div>
            ${order.customerPhone ? `
              <div class="detail-item">
                <div class="detail-label">Phone:</div>
                <div class="detail-value">${order.customerPhone}</div>
              </div>
            ` : ''}
            <div class="detail-item">
              <div class="detail-label">Payment Method:</div>
              <div class="detail-value">${order.paymentMethod}</div>
            </div>
          </div>
        </div>

        ${order.deliveryType === 'DELIVERY' && order.customerAddress ? `
          <div class="delivery-section" style="margin-bottom: 25px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
            <div class="section-title">Delivery Information</div>
            <div class="detail-item">
              <div class="detail-label">Delivery Address:</div>
              <div class="detail-value">${order.customerAddress}</div>
            </div>
          </div>
        ` : ''}

        <div class="items-section">
          <div class="section-title">Items Purchased</div>
          ${order.items.map(item => `
            <div class="item">
              <div class="item-info">
                <div class="item-name">${item.productName}</div>
                <div class="item-details">
                  ${formatCurrency(item.price)} × ${item.quantity}
                </div>
              </div>
              <div class="item-price">${formatCurrency(item.subtotal)}</div>
            </div>
          `).join('')}
        </div>

        <div class="totals-section">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-value">${formatCurrency(order.subtotal)}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Tax (VAT 7.5%):</span>
            <span class="total-value">${formatCurrency(order.tax)}</span>
          </div>
          ${order.discount && order.discount > 0 ? `
            <div class="total-row">
              <span class="total-label">Discount:</span>
              <span class="total-value">-${formatCurrency(order.discount)}</span>
            </div>
          ` : ''}
          <div class="total-row final">
            <span class="total-label">TOTAL:</span>
            <span class="total-value">${formatCurrency(order.total)}</span>
          </div>
        </div>

        <div class="footer">
          <div class="thank-you">Thank you for your business!</div>
          <div>Items sold are non-refundable • Please keep this receipt for your records</div>
          <div style="margin-top: 8px; font-size: 11px;">
            Receipt generated on ${formatDateTime(order.createdAt)}
          </div>
        </div>
      </body>
      </html>
    `;

    // Write the HTML to the new window
    printWindow.document.open();
    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Close the window after printing (optional)
      setTimeout(() => {
        printWindow.close();
      }, 100);
    };
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 print:fixed print:inset-0 print:bg-white print:p-0 print:z-auto order-receipt-modal">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:max-w-full print:rounded-none print:overflow-visible">
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
        <div className="p-8 print:p-6" id="order-receipt-content">
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
            {/* Receipt Info Column */}
            <div className="space-y-2">
              <div>
                <p className="text-gray-600">Receipt Number:</p>
                <p className="font-medium text-gray-900">{receiptNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Customer:</p>
                <p className="font-medium text-gray-900">{order.customerName || 'Guest'}</p>
              </div>
              {order.customerPhone && (
                <div>
                  <p className="text-gray-600">Phone:</p>
                  <p className="font-medium text-gray-900">{order.customerPhone}</p>
                </div>
              )}
            </div>

            {/* Date & Type Column */}
            <div className="space-y-2">
              <div>
                <p className="text-gray-600">Date:</p>
                <p className="font-medium text-gray-900">{formatDateTime(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Type:</p>
                <p className="font-medium text-gray-900 capitalize">
                  {order.deliveryType === 'WALK_IN' ? 'Walk-in' : 
                   order.deliveryType === 'DELIVERY' ? 'Delivery' : 
                   order.deliveryType === 'PICKUP' ? 'Pickup' : 'Walk-in'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Payment Method:</p>
                <p className="font-medium text-gray-900 capitalize">{order.paymentMethod}</p>
              </div>
            </div>

            {/* Delivery Address (full width if applicable) */}
            {order.deliveryType === 'DELIVERY' && order.customerAddress && (
              <div className="col-span-2 mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-600 mb-1">Delivery Address:</p>
                <p className="font-medium text-gray-900 text-sm leading-relaxed">{order.customerAddress}</p>
              </div>
            )}
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
              onClick={printReceipt}
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

      {/* Simplified Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5in;
            size: A4;
          }
          
          /* Hide common UI elements during print */
          button, nav, header, footer, .fixed, .absolute, .sticky,
          .modal-backdrop, .modal-overlay, .print\\:hidden {
            display: none !important;
          }
          
          /* Show and style the order receipt */
          .order-receipt-modal {
            position: static !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            height: auto !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
            display: block !important;
            visibility: visible !important;
          }
          
          /* Style the receipt content for print */
          #order-receipt-content {
            position: static !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
            display: block !important;
            visibility: visible !important;
          }
          
          /* Ensure text is visible and properly styled */
          .order-receipt-modal *, #order-receipt-content * {
            color: #000 !important;
            background: transparent !important;
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            font-size: inherit !important;
          }
          
          /* Make borders visible in print */
          #order-receipt-content .border-b-2,
          #order-receipt-content .border-t-2,
          #order-receipt-content .border-gray-300 {
            border-color: #000 !important;
            border-width: 1px !important;
          }
          
          /* Ensure text colors are print-friendly */
          #order-receipt-content .text-gray-600,
          #order-receipt-content .text-gray-700 {
            color: #374151 !important;
          }
          
          #order-receipt-content .text-gray-900 {
            color: #000 !important;
          }
          
          /* Clean page setup */
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}