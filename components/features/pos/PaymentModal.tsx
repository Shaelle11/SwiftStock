'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onProcessPayment: (paymentMethod: string, amountReceived?: number) => Promise<boolean>;
  isProcessing: boolean;
  brandStyles: any;
}

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: '💵' },
  { id: 'transfer', name: 'Bank Transfer', icon: '🏦' },
  { id: 'card', name: 'Card Payment', icon: '💳' },
];

export default function PaymentModal({
  isOpen,
  onClose,
  total,
  onProcessPayment,
  isProcessing,
  brandStyles
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [error, setError] = useState('');

  const amountReceivedNumber = parseFloat(amountReceived) || 0;
  const change = amountReceivedNumber - total;
  const isValidPayment = selectedMethod === 'cash' ? amountReceivedNumber >= total : true;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('cash');
      setAmountReceived(total.toFixed(2));
      setError('');
    }
  }, [isOpen, total]);

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    setError('');
    
    // Auto-fill amount for non-cash payments
    if (method !== 'cash') {
      setAmountReceived(total.toFixed(2));
    }
  };

  const handleAmountChange = (value: string) => {
    setAmountReceived(value);
    setError('');
  };

  const handleConfirmPayment = async () => {
    if (!isValidPayment) {
      setError('Amount received must be at least the total amount');
      return;
    }

    const success = await onProcessPayment(
      selectedMethod, 
      selectedMethod === 'cash' ? amountReceivedNumber : total
    );

    // Modal will be closed by parent component on success
    if (!success) {
      setError('Payment failed. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const quickAmounts = [total, total + 10, total + 20, total + 50, total + 100];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Process Payment</h2>
            {!isProcessing && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Total Amount */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold" style={{ color: brandStyles.primaryColor }}>
              {formatCurrency(total)}
            </p>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Method</h3>
            <div className="grid grid-cols-1 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodChange(method.id)}
                  disabled={isProcessing}
                  className={`flex items-center p-4 border-2 rounded-lg transition-colors ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="text-2xl mr-3">{method.icon}</span>
                  <span className="font-medium text-gray-900">{method.name}</span>
                  {selectedMethod === method.id && (
                    <svg className="w-5 h-5 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Payment Details */}
          {selectedMethod === 'cash' && (
            <div className="mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Received *
                </label>
                <input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  step="0.01"
                  min="0"
                  disabled={isProcessing}
                  className={`w-full px-3 py-2 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  autoFocus
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Quick amounts:</p>
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountChange(amount.toFixed(2))}
                      disabled={isProcessing}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Display */}
              {amountReceivedNumber > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-800">Change:</span>
                    <span className={`text-lg font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.max(0, change))}
                    </span>
                  </div>
                  {change < 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      Still need: {formatCurrency(Math.abs(change))}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Non-Cash Payment Info */}
          {selectedMethod !== 'cash' && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                {selectedMethod === 'transfer' && 'Customer will transfer the exact amount to your account.'}
                {selectedMethod === 'card' && 'Process card payment using your card terminal.'}
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            
            <button
              onClick={handleConfirmPayment}
              disabled={isProcessing || !isValidPayment}
              className="flex-2 px-6 py-2 text-white font-bold rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={brandStyles.buttonStyle}
            >
              {isProcessing ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}