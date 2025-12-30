'use client';

import { useState, useEffect } from 'react';

export default function TaxSettingsPage() {
  const [settings, setSettings] = useState({
    vatEnabled: true,
    vatRate: 0.075,
    taxIdNumber: '',
    businessRegNumber: '',
    businessType: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const businessTypes = [
    'Limited Company',
    'Partnership',
    'Sole Proprietorship',
    'NGO/Non-Profit',
    'Other',
  ];

  const fetchSettings = async () => {
    try {
      const storeId = 'dummy-store-id'; // Replace with actual store ID
      const response = await fetch(`/api/tax/reports?action=settings&storeId=${storeId}`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const storeId = 'dummy-store-id'; // Replace with actual store ID
      const response = await fetch('/api/tax/reports?action=update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, ...settings }),
      });
      
      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tax Settings</h1>
        <p className="text-gray-600">Configure your tax preferences and business details</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">VAT Configuration</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* VAT Enable/Disable */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="vatEnabled"
                checked={settings.vatEnabled}
                onChange={(e) => setSettings({ ...settings, vatEnabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="vatEnabled" className="ml-2 block text-sm font-medium text-gray-900">
                Enable VAT Collection
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              When enabled, VAT will be automatically calculated and added to all sales
            </p>
          </div>

          {/* VAT Rate */}
          <div>
            <label htmlFor="vatRate" className="block text-sm font-medium text-gray-700 mb-2">
              VAT Rate
            </label>
            <div className="relative">
              <input
                type="number"
                id="vatRate"
                step="0.001"
                min="0"
                max="1"
                value={settings.vatRate}
                onChange={(e) => setSettings({ ...settings, vatRate: parseFloat(e.target.value) || 0 })}
                disabled={!settings.vatEnabled}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">%</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Current Nigerian VAT rate is 7.5% (0.075). Display shows as {(settings.vatRate * 100).toFixed(1)}%
            </p>
          </div>

          {/* Business Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="taxIdNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Identification Number (TIN)
                </label>
                <input
                  type="text"
                  id="taxIdNumber"
                  value={settings.taxIdNumber}
                  onChange={(e) => setSettings({ ...settings, taxIdNumber: e.target.value })}
                  placeholder="Enter your TIN"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Required for VAT registration and filing
                </p>
              </div>

              <div>
                <label htmlFor="businessRegNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Registration Number
                </label>
                <input
                  type="text"
                  id="businessRegNumber"
                  value={settings.businessRegNumber}
                  onChange={(e) => setSettings({ ...settings, businessRegNumber: e.target.value })}
                  placeholder="RC123456 or CAC number"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Corporate Affairs Commission registration number
                </p>
              </div>

              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  id="businessType"
                  value={settings.businessType}
                  onChange={(e) => setSettings({ ...settings, businessType: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select business type</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Legal structure of your business
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-end">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-yellow-900">Important Tax Information</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="space-y-1">
                <li>• These settings affect all future transactions. Past transactions remain unchanged.</li>
                <li>• VAT rate changes should be made at the beginning of a tax period.</li>
                <li>• Consult your accountant before making changes to tax settings.</li>
                <li>• All tax calculations are recorded at point-of-sale for audit compliance.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}