'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface CustomerInfo {
  name?: string;
  phone?: string;
  address?: string;
  deliveryType: 'WALK_IN' | 'DELIVERY' | 'PICKUP';
}

interface CustomerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerInfo: CustomerInfo) => void;
  initialData?: Partial<CustomerInfo>;
}

export default function CustomerInfoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = {} 
}: CustomerInfoModalProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: initialData.name || '',
    phone: initialData.phone || '',
    address: initialData.address || '',
    deliveryType: initialData.deliveryType || 'WALK_IN'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate delivery requirements
    if (customerInfo.deliveryType === 'DELIVERY') {
      if (!customerInfo.name?.trim()) {
        newErrors.name = 'Customer name is required for delivery';
      }
      if (!customerInfo.phone?.trim()) {
        newErrors.phone = 'Phone number is required for delivery';
      }
      if (!customerInfo.address?.trim()) {
        newErrors.address = 'Delivery address is required';
      }
    } else if (customerInfo.deliveryType === 'PICKUP') {
      if (!customerInfo.name?.trim()) {
        newErrors.name = 'Customer name is required for pickup';
      }
      if (!customerInfo.phone?.trim()) {
        newErrors.phone = 'Phone number is required for pickup';
      }
    }

    // Validate phone format if provided
    if (customerInfo.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(customerInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(customerInfo);
      onClose();
    }
  };

  const handleDeliveryTypeChange = (type: 'WALK_IN' | 'DELIVERY' | 'PICKUP') => {
    setCustomerInfo(prev => ({
      ...prev,
      deliveryType: type
    }));
    setErrors({});
  };

  const updateField = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Customer Information</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Customer Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Customer Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'WALK_IN', label: 'Walk-in', icon: '🚶' },
                { id: 'PICKUP', label: 'Pickup', icon: '📦' },
                { id: 'DELIVERY', label: 'Delivery', icon: '🚚' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleDeliveryTypeChange(type.id as any)}
                  className={`p-3 text-center border-2 rounded-lg transition-colors ${
                    customerInfo.deliveryType === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name
              {customerInfo.deliveryType !== 'WALK_IN' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter customer name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
              {customerInfo.deliveryType !== 'WALK_IN' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., +234 801 234 5678"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          {/* Delivery Address */}
          {customerInfo.deliveryType === 'DELIVERY' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={customerInfo.address}
                onChange={(e) => updateField('address', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full delivery address"
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>
          )}

          {/* Info Messages */}
          {customerInfo.deliveryType === 'PICKUP' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 Customer will be notified when order is ready for pickup
              </p>
            </div>
          )}

          {customerInfo.deliveryType === 'DELIVERY' && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700">
                🚚 Delivery charges may apply based on location
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}