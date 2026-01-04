'use client';

import { formatCurrency } from '@/lib/utils/api';
import type { Product } from '@/lib/types';

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  subtotal: number;
}

interface POSCartProps {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  customerName: string;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onHoldSale: () => void;
  onCustomerNameChange: (name: string) => void;
  isProcessing: boolean;
  brandStyles: {
    primaryColor: string;
    accentColor: string;
    buttonStyle: React.CSSProperties;
  };
}

export default function POSCart({
  cart,
  subtotal,
  tax,
  total,
  customerName,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onHoldSale,
  onCustomerNameChange,
  isProcessing,
  brandStyles
}: POSCartProps) {

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(item);
    } else {
      onUpdateQuantity(item.productId, newQuantity);
    }
  };

  const handleRemoveItem = (item: CartItem) => {
    // Only ask for confirmation if more than 1 item in cart
    if (cart.length > 1) {
      if (confirm(`Remove ${item.product.name} from cart?`)) {
        onRemoveItem(item.productId);
      }
    } else {
      onRemoveItem(item.productId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Cart Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg lg:text-xl font-bold text-gray-900">Current Sale</h2>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Customer Section */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer (Optional)
        </label>
        <input
          type="text"
          placeholder="Guest Sale"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
        />
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 lg:p-6 text-gray-500">
            <svg className="w-12 h-12 lg:w-16 lg:h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m.4 2L7 13m0 0l-2.5 5.5M7 13h10m-10 0v6a1 1 0 001 1h1m-2 0h1" />
            </svg>
            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-1">Cart is empty</h3>
            <p className="text-center text-sm">Add products to start a sale</p>
          </div>
        ) : (
          <div className="space-y-3 lg:space-y-4 p-4 lg:p-6">
            {cart.map((item) => (
              <div key={item.productId} className="bg-gray-50 rounded-lg p-3 lg:p-4">
                <div className="flex justify-between items-start mb-2 lg:mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-medium text-gray-900 truncate text-sm lg:text-base">
                      {item.product.name}
                    </h4>
                    <p className="text-xs lg:text-sm text-gray-600">
                      {formatCurrency(item.product.sellingPrice)} each
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="text-red-600 hover:text-red-800 flex-shrink-0"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <button
                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <input
                      type="number"
                      min="1"
                      max={item.product.stockQuantity}
                      value={item.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value) || 1;
                        handleQuantityChange(item, newQuantity);
                      }}
                      className="w-12 lg:w-16 text-center font-medium py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    
                    <button
                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stockQuantity}
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                      </svg>
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="font-bold text-base lg:text-lg">
                      {formatCurrency(item.subtotal)}
                    </p>
                    <p className="text-xs text-gray-600">
                      Stock: {item.product.stockQuantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="border-t border-gray-200 p-4 lg:p-6">
          <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (VAT 7.5%):</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium">- {formatCurrency(0)}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-2 lg:pt-3">
              <div className="flex justify-between">
                <span className="text-base lg:text-lg font-bold text-gray-900">Total:</span>
                <span className="text-xl lg:text-2xl font-bold" style={{ color: brandStyles.primaryColor }}>
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 lg:space-y-3">
            <button
              onClick={onCheckout}
              disabled={isProcessing || cart.length === 0}
              className="w-full py-3 px-4 text-white font-bold text-base lg:text-lg rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={brandStyles.buttonStyle}
            >
              {isProcessing ? 'Processing...' : 'Complete Sale'}
            </button>
            
            <button
              onClick={onHoldSale}
              disabled={isProcessing || cart.length === 0}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              Hold Sale
            </button>
          </div>

          {/* Cart Info */}
          <div className="mt-3 lg:mt-4 text-center text-xs lg:text-sm text-gray-500">
            {cart.length} {cart.length === 1 ? 'item' : 'items'} • {cart.reduce((sum, item) => sum + item.quantity, 0)} units
          </div>
        </div>
      )}
    </div>
  );
}