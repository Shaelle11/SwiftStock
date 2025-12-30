'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user, token } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    primaryColor: '#3B82F6',
    logoUrl: ''
  });

  // Fetch store data
  useEffect(() => {
    const fetchStoreData = async () => {
      if (user && token) {
        try {
          const response = await fetch('/api/stores?owner=true', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.stores && data.stores.length > 0) {
              const storeData = data.stores[0];
              setStore(storeData);
              setFormData({
                name: storeData.name || '',
                description: storeData.description || '',
                address: storeData.address || '',
                phone: storeData.phone || '',
                email: storeData.email || '',
                primaryColor: storeData.primaryColor || '#3B82F6',
                logoUrl: storeData.logoUrl || ''
              });
            }
          }
        } catch (error) {
          console.error('Failed to fetch store data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStoreData();
  }, [user, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/setup-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Store settings updated successfully!');
        // Refresh store data
        const updatedStore = { ...store, ...formData };
        setStore(updatedStore);
      } else {
        setMessage(data.message || 'Failed to update store settings');
      }
    } catch (error) {
      setMessage('An error occurred while saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-600">Manage your store information and branding</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('successfully') 
            ? 'bg-green-50 border border-green-200 text-green-600' 
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="grid gap-6">
        {/* Store Information */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Store Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Tell customers about your business..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+234 800 000 0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="business@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Address *</label>
              <textarea
                name="address"
                rows={3}
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Your business location..."
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Branding & Design</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo URL</label>
              <input
                type="url"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                This image will appear on your dashboard, documents, and public store page
              </p>
              {formData.logoUrl && (
                <div className="mt-2">
                  <img 
                    src={formData.logoUrl} 
                    alt="Logo preview" 
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
                <div>
                  <span className="text-sm text-gray-900">{formData.primaryColor}</span>
                  <p className="text-xs text-gray-500">Used in navigation, documents, and branding</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
