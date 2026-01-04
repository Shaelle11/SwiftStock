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
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-header text-teal-800">Shopping Cart</h2>
        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto mb-6">
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 text-teal-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H2m1 8h16" />
            </svg>
            <p className="text-gray-600 font-medium">Your cart is empty</p>
            <p className="text-sm mt-1 text-gray-500">Add products to start a sale</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.productId} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {item.product.name}
                  </h4>
                  <button
                    onClick={() => onRemoveItem(item.productId)}
                    className="text-red-500 hover:text-red-700 transition-colors"
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
                      className="w-6 h-6 rounded-full border border-teal-300 bg-white flex items-center justify-center hover:bg-teal-50 text-teal-700 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      className="w-6 h-6 rounded-full border border-teal-300 bg-white flex items-center justify-center hover:bg-teal-50 text-teal-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.subtotal)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatCurrency(item.product.sellingPrice)} each
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-teal-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="border-t border-gray-200 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="input mb-4"
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="transfer">Transfer</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Confirm Receipt Button */}
      <button
        onClick={handleProcessSale}
        disabled={cart.length === 0 || isProcessing}
        className="btn btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isProcessing ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Confirming...
          </div>
        ) : (
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Confirm Payment & Generate Receipt • {formatCurrency(total)}
          </div>
        )}
      </button>

      {/* Cart Totals */}
      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">VAT (7.5%)</span>
            <span className="text-gray-900">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatCurrency(total)}</span>
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
            >
              <option value="cash" className="text-gray-900">Cash</option>
              <option value="card" className="text-gray-900">Card</option>
              <option value="transfer" className="text-gray-900">Transfer</option>
              <option value="other" className="text-gray-900">Other</option>
            </select>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Confirm Receipt Button */}
        <button
          onClick={handleProcessSale}
          disabled={cart.length === 0 || isProcessing}
          className="w-full text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          style={brandStyles?.buttonStyle || { backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Confirming...
            </div>
          ) : (
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Confirm Payment & Generate Receipt • {formatCurrency(total)}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
