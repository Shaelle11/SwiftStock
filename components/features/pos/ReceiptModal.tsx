'use client';

import { formatCurrency, formatDateTime } from '@/lib/utils/api';
import type { Product } from '@/lib/types';
interface Store {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

interface BrandStyles {
  primaryColor: string;
  accentColor: string;
  buttonStyle: React.CSSProperties;
}
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
  customerPhone?: string;
  deliveryType?: 'WALK_IN' | 'DELIVERY' | 'PICKUP';
  deliveryAddress?: string;
  deliveryPrice?: number;
  paymentMethod: string;
  createdAt: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleData | null;
  store: Store;
  onNewSale: () => void;
  brandStyles: BrandStyles;
  cashier?: {
    firstName?: string;
    lastName?: string;
    userType?: string;
  };
}

export default function ReceiptModal({
  isOpen,
  sale,
  store,
  onNewSale,
  brandStyles,
  cashier
}: ReceiptModalProps) {

  if (!isOpen || !sale) return null;

  const subtotal = sale.items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = sale.total - subtotal; // Assuming tax is the difference
  const receiptNumber = `RCP-${sale.id}`;

  const printReceipt = () => {
    // Create a new window with just the receipt content
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Please allow popups to print receipts');
      return;
    }

    // Generate the complete receipt HTML
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
            color: ${brandStyles.primaryColor};
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
              <div class="detail-value">${formatDateTime(sale.createdAt)}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Customer:</div>
              <div class="detail-value">${sale.customerName || 'Guest Customer'}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Order Type:</div>
              <div class="detail-value">${
                sale.deliveryType === 'WALK_IN' ? 'Walk-in' : 
                sale.deliveryType === 'DELIVERY' ? 'Delivery' : 
                sale.deliveryType === 'PICKUP' ? 'Pickup' : 'Walk-in'
              }</div>
            </div>
            ${sale.customerPhone ? `
              <div class="detail-item">
                <div class="detail-label">Phone:</div>
                <div class="detail-value">${sale.customerPhone}</div>
              </div>
            ` : ''}
            <div class="detail-item">
              <div class="detail-label">Payment Method:</div>
              <div class="detail-value">${sale.paymentMethod}</div>
            </div>
            ${cashier ? `
              <div class="detail-item">
                <div class="detail-label">Cashier:</div>
                <div class="detail-value">${
                  cashier && (cashier.firstName || cashier.lastName) 
                    ? `${cashier.firstName || ''} ${cashier.lastName || ''}`.trim()
                    : 'Staff'
                } ${cashier?.userType === 'business_owner' ? ' (Owner)' : ''}</div>
              </div>
            ` : ''}
          </div>
        </div>

        ${sale.deliveryType === 'DELIVERY' && sale.deliveryAddress ? `
          <div class="delivery-section" style="margin-bottom: 30px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
            <div class="section-title">Delivery Information</div>
            <div class="detail-item" style="margin-bottom: 10px;">
              <div class="detail-label">Delivery Address:</div>
              <div class="detail-value">${sale.deliveryAddress}</div>
            </div>
            ${sale.deliveryPrice ? `
              <div class="detail-item">
                <div class="detail-label">Delivery Fee:</div>
                <div class="detail-value">${formatCurrency(sale.deliveryPrice)}</div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div class="items-section">
          <div class="section-title">Items Purchased</div>
          ${sale.items.map(item => `
            <div class="item">
              <div class="item-info">
                <div class="item-name">${item.product.name}</div>
                <div class="item-details">
                  ${formatCurrency(item.product.sellingPrice)} × ${item.quantity}
                  ${item.product.sku ? ` • SKU: ${item.product.sku}` : ''}
                </div>
              </div>
              <div class="item-price">${formatCurrency(item.subtotal)}</div>
            </div>
          `).join('')}
        </div>

        <div class="totals-section">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-value">${formatCurrency(subtotal)}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Tax (VAT 7.5%):</span>
            <span class="total-value">${formatCurrency(tax)}</span>
          </div>
          ${sale.deliveryPrice && sale.deliveryPrice > 0 ? `
            <div class="total-row">
              <span class="total-label">Delivery Fee:</span>
              <span class="total-value">${formatCurrency(sale.deliveryPrice)}</span>
            </div>
          ` : ''}
          <div class="total-row final">
            <span class="total-label">TOTAL:</span>
            <span class="total-value">${formatCurrency(sale.total)}</span>
          </div>
        </div>

        <div class="footer">
          <div class="thank-you">Thank you for your business!</div>
          <div>Items sold are non-refundable • Please keep this receipt for your records</div>
          <div style="margin-top: 10px; font-size: 11px;">
            Receipt generated on ${formatDateTime(sale.createdAt)}
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

  const emailReceipt = () => {
    // Future feature: Email receipt functionality
    alert('Email receipt feature coming soon!');
  };

  const handleNewSale = () => {
    onNewSale();
  };

  return (
    <>
      <div className="fixed inset-0 bg-white z-50 flex flex-col print:static print:inset-auto print:z-auto">
      {/* Action Bar - Hidden when printing */}
      <div className="print:hidden bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onNewSale()}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to POS</span>
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900">Receipt</h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={emailReceipt}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Email Receipt</span>
          </button>
          
          <button
            onClick={printReceipt}
            className="flex items-center space-x-2 px-4 py-2 text-white rounded-md transition-colors"
            style={{ backgroundColor: brandStyles.primaryColor }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Success Message - Hidden when printing */}
      <div className="print:hidden bg-green-50 border-b border-green-200 p-4 text-center">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" 
               style={{ backgroundColor: brandStyles.accentColor || '#10B981' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-green-900">Sale Completed Successfully!</h2>
            <p className="text-sm text-green-700">Transaction processed and inventory updated</p>
          </div>
        </div>
      </div>

      {/* Receipt Content - This is what gets printed */}
      <div className="flex-1 overflow-y-auto bg-white print:overflow-visible">
        <div className="max-w-2xl mx-auto p-8 print:p-6 print:max-w-full" id="pos-receipt-content">
          {/* Store Header */}
          <div className="text-center mb-8 print:mb-6">
            <h3 className="text-2xl font-bold mb-4 print:text-xl print:mb-3" style={{ color: brandStyles.primaryColor }}>
              {store?.name || 'Your Store'}
            </h3>
            {store?.address && (
              <p className="text-sm text-gray-600 mb-2 print:text-black print:text-xs">{store.address}</p>
            )}
            {store?.phone && (
              <p className="text-sm text-gray-600 print:text-black print:text-xs">{store.phone}</p>
            )}
            <div className="w-24 h-px bg-gray-300 mx-auto mt-4 print:mt-3"></div>
          </div>

          {/* Receipt Details */}
          <div className="mb-8 print:mb-6">
            <div className="grid grid-cols-2 gap-6 text-sm print:gap-4 print:text-xs">
              <div>
                <p className="text-gray-600 print:text-black font-medium mb-1">Receipt #:</p>
                <p className="font-bold print:text-black">{receiptNumber}</p>
              </div>
              <div>
                <p className="text-gray-600 print:text-black font-medium mb-1">Date & Time:</p>
                <p className="font-bold print:text-black">{formatDateTime(sale.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600 print:text-black font-medium mb-1">Customer:</p>
                <p className="font-bold print:text-black">{sale.customerName || 'Guest Customer'}</p>
              </div>
              <div>
                <p className="text-gray-600 print:text-black font-medium mb-1">Order Type:</p>
                <p className="font-bold print:text-black capitalize">
                  {sale.deliveryType === 'WALK_IN' ? 'Walk-in' : 
                   sale.deliveryType === 'DELIVERY' ? 'Delivery' : 
                   sale.deliveryType === 'PICKUP' ? 'Pickup' : 'Walk-in'}
                </p>
              </div>
              {sale.customerPhone && (
                <div>
                  <p className="text-gray-600 print:text-black font-medium mb-1">Phone:</p>
                  <p className="font-bold print:text-black">{sale.customerPhone}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600 print:text-black font-medium mb-1">Payment Method:</p>
                <p className="font-bold print:text-black capitalize">{sale.paymentMethod}</p>
              </div>
              {cashier && (
                <div>
                  <p className="text-gray-600 print:text-black font-medium mb-1">Cashier:</p>
                  <p className="font-bold print:text-black">
                    {cashier && (cashier.firstName || cashier.lastName) 
                      ? `${cashier.firstName || ''} ${cashier.lastName || ''}`.trim()
                      : 'Staff'} 
                    {cashier?.userType === 'business_owner' ? ' (Owner)' : ''}
                  </p>
                </div>
              )}
            </div>
            <div className="w-full h-px bg-gray-300 my-6 print:my-4"></div>
          </div>

          {/* Delivery Information */}
          {sale.deliveryType === 'DELIVERY' && sale.deliveryAddress && (
            <div className="mb-8 print:mb-6 p-4 bg-blue-50 rounded-lg print:bg-white print:p-0">
              <h4 className="font-bold text-gray-900 mb-3 print:mb-2">Delivery Information</h4>
              <div className="text-sm print:text-xs">
                <p className="text-gray-600 print:text-black">Delivery Address:</p>
                <p className="font-medium print:text-black mb-2">{sale.deliveryAddress}</p>
                {sale.deliveryPrice && (
                  <>
                    <p className="text-gray-600 print:text-black">Delivery Fee:</p>
                    <p className="font-medium print:text-black">{formatCurrency(sale.deliveryPrice)}</p>
                  </>
                )}
              </div>
            </div>
          )}
          {/* Items Table */}
          <div className="mb-8 print:mb-6">
            <h4 className="font-bold text-gray-900 mb-4 print:mb-3 print:text-black text-lg print:text-base">
              Items Purchased
            </h4>
            <div className="border-t border-b border-gray-200 print:border-black">
              {sale.items.map((item, index) => (
                <div key={item.productId} className={`py-3 print:py-2 ${index < sale.items.length - 1 ? 'border-b border-gray-100 print:border-gray-300' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-medium text-gray-900 print:text-black print:text-sm">
                        {item.product.name}
                      </p>
                      <div className="flex items-center mt-1 text-sm text-gray-600 print:text-black print:text-xs">
                        <span>{formatCurrency(item.product.sellingPrice)} × {item.quantity}</span>
                        {item.product.sku && (
                          <span className="ml-2 text-gray-500 print:text-black">SKU: {item.product.sku}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 print:text-black print:text-sm">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 print:border-black pt-4 print:pt-3">
            <div className="space-y-2 print:space-y-1 text-sm print:text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 print:text-black">Subtotal:</span>
                <span className="font-medium print:text-black">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 print:text-black">Tax (VAT 7.5%):</span>
                <span className="font-medium print:text-black">{formatCurrency(tax)}</span>
              </div>
              {sale.deliveryPrice && sale.deliveryPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 print:text-black">Delivery Fee:</span>
                  <span className="font-medium print:text-black">{formatCurrency(sale.deliveryPrice)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 print:border-gray-400 pt-2 print:pt-1 mt-2 print:mt-1">
                <div className="flex justify-between text-lg font-bold print:text-base">
                  <span className="print:text-black">TOTAL:</span>
                  <span style={{ color: brandStyles.primaryColor }} className="print:!text-black">
                    {formatCurrency(sale.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 text-center text-sm text-gray-600 print:mt-6 print:pt-4 print:text-xs print:text-black border-t border-gray-200 print:border-gray-300">
            <p className="mb-2 font-medium">Thank you for your business!</p>
            <p className="text-xs text-gray-500 print:text-black">Items sold are non-refundable • Please keep this receipt for your records</p>
            <div className="mt-4 text-xs text-gray-400 print:text-black print:mt-3">
              Receipt generated on {formatDateTime(sale.createdAt)}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}