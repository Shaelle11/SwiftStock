'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/utils/api';
import { getStoreBrandStyles } from '@/lib/store-branding';
import type { Product } from '@/lib/types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: () => void;
  store?: any;
}

interface AdjustmentFormData {
  type: 'increase' | 'decrease';
  quantity: string;
  reason: string;
  notes: string;
}

const initialFormData: AdjustmentFormData = {
  type: 'increase',
  quantity: '',
  reason: '',
  notes: ''
};

const adjustmentReasons = {
  increase: [
    'Restock',
    'Purchase',
    'Return from customer',
    'Inventory count correction',
    'Transfer in',
    'Manual correction',
    'Other'
  ],
  decrease: [
    'Sale',
    'Damaged goods',
    'Expired product',
    'Loss/Theft',
    'Transfer out',
    'Manual correction',
    'Other'
  ]
};

export default function StockAdjustmentModal({ 
  isOpen, 
  onClose, 
  product, 
  onSave,
  store 
}: StockAdjustmentModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<AdjustmentFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<AdjustmentFormData>>({});

  const brandStyles = getStoreBrandStyles(store);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof AdjustmentFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AdjustmentFormData> = {};

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (!formData.reason) {
      newErrors.reason = 'Reason is required';
    }

    // Check if decrease would result in negative stock
    if (product && formData.type === 'decrease') {
      const adjustmentQty = parseInt(formData.quantity);
      if (adjustmentQty > product.stockQuantity) {
        newErrors.quantity = `Cannot decrease by more than current stock (${product.stockQuantity})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateNewStock = (): number => {
    if (!product || !formData.quantity) return 0;
    
    const adjustmentQty = parseInt(formData.quantity);
    
    return formData.type === 'increase' 
      ? product.stockQuantity + adjustmentQty
      : Math.max(0, product.stockQuantity - adjustmentQty);
  };

  const handleSave = async () => {
    if (!product || !validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const adjustmentData = {
        productId: product.id,
        type: formData.type,
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        notes: formData.notes.trim() || null,
        previousQuantity: product.stockQuantity,
        newQuantity: calculateNewStock()
      };

      const response = await api.post('/api/products/adjust-stock', adjustmentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.success) {
        onSave();
        handleClose();
      } else {
        alert(response.message || 'Failed to adjust stock');
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('An error occurred while adjusting stock');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  if (!isOpen || !product) return null;

  const newStock = calculateNewStock();
  const stockStatus = newStock === 0 ? 'Out of Stock' : 
                     newStock <= product.lowStockThreshold ? 'Low Stock' : 'In Stock';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Adjust Stock</h2>
          <p className="text-gray-600">Update inventory levels for this product</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600">SKU: {product.sku || 'N/A'}</p>
            <p className="text-sm text-gray-600">
              Current Stock: <span className="font-medium">{product.stockQuantity}</span>
            </p>
            <p className="text-sm text-gray-600">
              Low Stock Threshold: {product.lowStockThreshold}
            </p>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="increase"
                  checked={formData.type === 'increase'}
                  onChange={handleInputChange}
                  className="mr-2 text-green-600 focus:ring-green-500"
                />
                <span className="text-green-600 font-medium">Increase Stock</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="decrease"
                  checked={formData.type === 'decrease'}
                  onChange={handleInputChange}
                  className="mr-2 text-red-600 focus:ring-red-500"
                />
                <span className="text-red-600 font-medium">Decrease Stock</span>
              </label>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter quantity"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a reason</option>
              {adjustmentReasons[formData.type].map(reason => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes about this adjustment"
            />
          </div>

          {/* Preview */}
          {formData.quantity && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Preview</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Current Stock:</span>
                  <span className="font-medium text-blue-900">{product.stockQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">
                    {formData.type === 'increase' ? 'Adding:' : 'Removing:'}
                  </span>
                  <span className={`font-medium ${formData.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.type === 'increase' ? '+' : '-'}{formData.quantity}
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-300 pt-1">
                  <span className="text-blue-700">New Stock:</span>
                  <span className="font-bold text-blue-900">{newStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Status:</span>
                  <span className={`font-medium ${
                    stockStatus === 'Out of Stock' ? 'text-red-600' :
                    stockStatus === 'Low Stock' ? 'text-amber-600' :
                    'text-green-600'
                  }`}>
                    {stockStatus}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving || !formData.quantity}
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              style={brandStyles.buttonStyle}
            >
              {saving ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}