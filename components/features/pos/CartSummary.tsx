'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils/api';
import type { Product } from '@/lib/types';

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  subtotal: number;
}

interface CartSummaryProps {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProcessSale: (paymentMethod: string) => void;
  isProcessing: boolean;
  error: string | null;
  brandStyles?: {
    primaryColor: string;
    buttonStyle: { backgroundColor: string; borderColor: string; };
    linkStyle: { color: string; };
    headerStyle: { borderBottomColor: string; };
    badgeStyle: { backgroundColor: string; color: string; };
  };
}

export default function CartSummary({
  cart,
  subtotal,
  tax,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProcessSale,
  isProcessing,
  error,
  brandStyles
}: CartSummaryProps) {
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const handleProcessSale = () => {
    onProcessSale(paymentMethod);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Cart</h2>
        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto mb-6">
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Your cart is empty</p>
            <p className="text-sm mt-1">Add products to start a sale</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.productId} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {item.product.name}
                  </h4>
                  <button
                    onClick={() => onRemoveItem(item.productId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{formatCurrency(item.product.sellingPrice)} each</p>
                    <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Totals */}
      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">VAT (7.5%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment Method */}
        {cart.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="transfer">Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Process Sale Button */}
        <button
          onClick={handleProcessSale}
          disabled={cart.length === 0 || isProcessing}
          className="w-full text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={brandStyles?.buttonStyle || { backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
        >
          {isProcessing ? 'Processing...' : `Process Sale ${total > 0 ? formatCurrency(total) : ''}`}
        </button>
      </div>
    </div>
  );
}
