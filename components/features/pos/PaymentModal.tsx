'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils/api';

interface BrandStyles {
  primaryColor: string;
  accentColor: string;
  buttonStyle: React.CSSProperties;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onProcessPayment: (
    paymentMethod: string, 
    deliveryInfo: {
      customerName?: string;
      customerPhone?: string;
      deliveryType: 'WALK_IN' | 'DELIVERY';
      deliveryAddress?: string;
      deliveryPrice: number;
    },
    amountReceived?: number
  ) => Promise<boolean>;
  isProcessing: boolean;
  brandStyles: BrandStyles;
}

const paymentMethods = [
  { 
    id: 'cash', 
    name: 'Cash', 
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
    )
  },
  { 
    id: 'transfer', 
    name: 'Bank Transfer', 
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.5 3L12 2l1.5 1H20v6H4V3h6.5z" />
      </svg>
    )
  },
  { 
    id: 'card', 
    name: 'Card Payment', 
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H5a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )
  },
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
  
  // Customer and delivery information
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'WALK_IN' | 'DELIVERY'>('WALK_IN');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState('0');

  const amountReceivedNumber = parseFloat(amountReceived) || 0;
  const deliveryPriceNumber = parseFloat(deliveryPrice) || 0;
  const finalTotal = total + deliveryPriceNumber;
  const change = amountReceivedNumber - finalTotal;
  const isValidPayment = selectedMethod === 'cash' ? amountReceivedNumber >= finalTotal : true;

  // Reset form when modal opens
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isOpen) {
      timeoutId = setTimeout(() => {
        setSelectedMethod('cash');
        setAmountReceived(total.toFixed(2));
        setError('');
        
        // Reset customer and delivery information
        setCustomerName('');
        setCustomerPhone('');
        setDeliveryType('WALK_IN');
        setDeliveryAddress('');
        setDeliveryPrice('0');
      }, 0);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen, total]);

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    setError('');
    
    // Auto-fill amount for non-cash payments
    if (method !== 'cash') {
      setAmountReceived(finalTotal.toFixed(2));
    }
  };

  const handleDeliveryTypeChange = (newDeliveryType: 'WALK_IN' | 'DELIVERY') => {
    setDeliveryType(newDeliveryType);
    setError('');
    
    // Reset delivery-specific fields when switching to walk-in
    if (newDeliveryType === 'WALK_IN') {
      setDeliveryAddress('');
      setDeliveryPrice('0');
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

    if (deliveryType === 'DELIVERY' && !deliveryAddress.trim()) {
      setError('Delivery address is required for delivery orders');
      return;
    }

    const deliveryInfo = {
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      deliveryType,
      deliveryAddress: deliveryType === 'DELIVERY' ? deliveryAddress.trim() : undefined,
      deliveryPrice: deliveryPriceNumber
    };

    const success = await onProcessPayment(
      selectedMethod, 
      deliveryInfo,
      selectedMethod === 'cash' ? amountReceivedNumber : finalTotal
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

  const quickAmounts = [finalTotal, finalTotal + 10, finalTotal + 20, finalTotal + 50, finalTotal + 100];

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
            <p className="text-sm text-gray-600 mb-1">
              {deliveryType === 'DELIVERY' && deliveryPriceNumber > 0 ? 'Subtotal' : 'Total Amount'}
            </p>
            <p className="text-3xl font-bold" style={{ color: brandStyles.primaryColor }}>
              {formatCurrency(total)}
            </p>
            {deliveryType === 'DELIVERY' && deliveryPriceNumber > 0 && (
              <>
                <p className="text-sm text-gray-600 mt-2">Delivery Fee: {formatCurrency(deliveryPriceNumber)}</p>
                <p className="text-lg font-bold mt-1" style={{ color: brandStyles.primaryColor }}>
                  Total: {formatCurrency(finalTotal)}
                </p>
              </>
            )}
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information (Optional)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Order Type</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDeliveryTypeChange('WALK_IN')}
                disabled={isProcessing}
                className={`flex items-center p-4 border-2 rounded-lg transition-colors ${
                  deliveryType === 'WALK_IN'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="font-medium text-gray-900">Walk-in</span>
              </button>
              
              <button
                onClick={() => handleDeliveryTypeChange('DELIVERY')}
                disabled={isProcessing}
                className={`flex items-center p-4 border-2 rounded-lg transition-colors ${
                  deliveryType === 'DELIVERY'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414A1 1 0 0016 11v5a1 1 0 01-1 1z" />
                </svg>
                <span className="font-medium text-gray-900">Delivery</span>
              </button>
            </div>

            {/* Delivery Details */}
            {deliveryType === 'DELIVERY' && (
              <div className="mt-4 space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    disabled={isProcessing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter delivery address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Fee
                  </label>
                  <input
                    type="number"
                    value={deliveryPrice}
                    onChange={(e) => setDeliveryPrice(e.target.value)}
                    disabled={isProcessing}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}
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
                  <div className="flex items-center justify-center w-10 h-10 mr-3 bg-gray-50 rounded-lg">
                    {method.icon}
                  </div>
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

          {/* Receipt Info */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-blue-800">
                A receipt will be generated after payment confirmation
              </p>
            </div>
          </div>
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
              className="flex-2 px-6 py-2 text-white font-bold rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              style={brandStyles.buttonStyle}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Confirm & Generate Receipt
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}