'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface BusinessFormData {
  // Step 1: Business Identity
  name: string;
  businessType: string;
  description: string;

  // Step 2: Location & Legal Info
  country: string;
  state: string;
  city: string;
  address: string;
  registrationStatus: string;
  cacNumber?: string;
  tinNumber?: string;

  // Step 3: Inventory & Sales Setup
  inventoryType: string;
  trackQuantities: boolean;
  currency: string;
  enableLowStockAlerts: boolean;
  unitOfMeasurement?: string;

  // Step 4: Storefront Setup
  storeVisibility: string;
  slug: string;
  allowGuestCheckout: boolean;

  // Step 5: Tax & Compliance
  chargeVat: boolean;
  vatRate: number;
  autoCalculateTax: boolean;
  
  // Additional fields
  phone: string;
  email: string;
  primaryColor: string;
}

const businessTypes = [
  { value: 'retail', label: 'Retail' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
];

const inventoryTypes = [
  { value: 'physical', label: 'Physical goods' },
  { value: 'digital', label: 'Digital goods' },
  { value: 'mixed', label: 'Mixed' },
];

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

export default function CreateBusinessPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<BusinessFormData>({
    // Step 1
    name: '',
    businessType: '',
    description: '',
    // Step 2
    country: 'Nigeria',
    state: '',
    city: '',
    address: '',
    registrationStatus: '',
    // Step 3
    inventoryType: '',
    trackQuantities: true,
    currency: 'NGN',
    enableLowStockAlerts: true,
    // Step 4
    storeVisibility: 'private',
    slug: '',
    allowGuestCheckout: true,
    // Step 5
    chargeVat: false,
    vatRate: 7.5,
    autoCalculateTax: true,
    // Additional
    phone: '',
    email: '',
    primaryColor: '#3B82F6',
  });

  const steps = [
    'Entry',
    'Business Identity',
    'Location & Legal',
    'Inventory & Sales',
    'Storefront Setup',
    'Tax & Compliance',
    'Contact Information',
    'Review & Create'
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug from business name
      if (field === 'name' && value) {
        updated.slug = value.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      }
      
      return updated;
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Business Identity
        return !!(formData.name && formData.businessType);
      case 2: // Location & Legal
        return !!(formData.state && formData.city && formData.address && formData.registrationStatus);
      case 3: // Inventory & Sales
        return !!(formData.inventoryType);
      case 4: // Storefront Setup
        return !!(formData.storeVisibility && formData.slug);
      case 5: // Tax & Compliance
        return true; // All fields are optional or have defaults
      case 6: // Additional Info
        return !!(formData.phone && formData.email);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep === 0 || validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      setError(null);
    } else {
      setError('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/setup-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          primaryColor: formData.primaryColor,
          businessType: formData.businessType,
          slug: formData.slug,
          isPublic: formData.storeVisibility === 'public',
          // Add other relevant fields to your API
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to the main dashboard instead of business-specific route
        router.push('/dashboard');
      } else {
        setError(data.message || 'Failed to create business');
      }
    } catch (error) {
      setError('An error occurred while creating your business');
      console.error('Business creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Entry Screen
        return (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Create Your Business</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Set up inventory, sales, and your online store in a few simple steps. 
              We'll guide you through everything you need to get started.
            </p>
            <button
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        );

      case 1: // Business Identity
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Identity</h2>
              <p className="text-gray-600">Tell us about your business</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter your business name"
              />
              {formData.name && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Preview:</strong> {formData.name}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
              <select
                required
                value={formData.businessType}
                onChange={(e) => handleChange('businessType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="">Select business type</option>
                {businessTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-black"
                placeholder="Brief description of your business (optional)"
              />
              <p className="text-sm text-gray-500 mt-1">Keep it short and simple</p>
            </div>
          </div>
        );

      case 2: // Location & Legal Info
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Location & Legal Info</h2>
              <p className="text-gray-600">Required for compliance & tax reporting</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <select
                  required
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">Select state</option>
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Address *</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-black"
                placeholder="Full business address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Registration Status *</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="registered"
                    checked={formData.registrationStatus === 'registered'}
                    onChange={(e) => handleChange('registrationStatus', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Registered business</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="not_registered"
                    checked={formData.registrationStatus === 'not_registered'}
                    onChange={(e) => handleChange('registrationStatus', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Not registered yet</span>
                </label>
              </div>
            </div>

            {formData.registrationStatus === 'registered' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CAC Registration Number</label>
                  <input
                    type="text"
                    value={formData.cacNumber || ''}
                    onChange={(e) => handleChange('cacNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="RC number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TIN Number</label>
                  <input
                    type="text"
                    value={formData.tinNumber || ''}
                    onChange={(e) => handleChange('tinNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Tax identification number"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 3: // Inventory & Sales Setup
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory & Sales Setup</h2>
              <p className="text-gray-600">Customize your POS behavior</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inventory Type *</label>
              <div className="space-y-2">
                {inventoryTypes.map((type) => (
                  <label key={type.value} className="flex items-center">
                    <input
                      type="radio"
                      value={type.value}
                      checked={formData.inventoryType === type.value}
                      onChange={(e) => handleChange('inventoryType', e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium text-gray-900">{type.label}</span>
                      {type.value === 'physical' && <p className="text-sm text-gray-500">Tangible products with stock tracking</p>}
                      {type.value === 'digital' && <p className="text-sm text-gray-500">Digital products, downloads, subscriptions</p>}
                      {type.value === 'mixed' && <p className="text-sm text-gray-500">Both physical and digital products</p>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Track Stock Quantities?</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.trackQuantities === true}
                    onChange={() => handleChange('trackQuantities', true)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Yes - Track inventory levels</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.trackQuantities === false}
                    onChange={() => handleChange('trackQuantities', false)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">No - Don't track quantities</span>
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="NGN">₦ Nigerian Naira (NGN)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Units of Measurement</label>
                <input
                  type="text"
                  value={formData.unitOfMeasurement || ''}
                  onChange={(e) => handleChange('unitOfMeasurement', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="e.g., kg, packs, items, units"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.enableLowStockAlerts}
                  onChange={(e) => handleChange('enableLowStockAlerts', e.target.checked)}
                  className="mr-3"
                />
                <span className="text-sm font-medium text-gray-700">Enable low-stock alerts</span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-6">Get notified when products are running low</p>
            </div>
          </div>
        );

      case 4: // Storefront Setup
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Storefront Setup</h2>
              <p className="text-gray-600">Configure your public-facing store</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Visibility *</label>
              <div className="space-y-2">
                <label className="flex items-start">
                  <input
                    type="radio"
                    value="public"
                    checked={formData.storeVisibility === 'public'}
                    onChange={(e) => handleChange('storeVisibility', e.target.value)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Public</span>
                    <p className="text-sm text-gray-500">Listed on Explore page, discoverable by customers</p>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="radio"
                    value="private"
                    checked={formData.storeVisibility === 'private'}
                    onChange={(e) => handleChange('storeVisibility', e.target.value)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Private</span>
                    <p className="text-sm text-gray-500">Only accessible via direct link</p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store URL Slug *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  swiftstock.com/store/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="your-business-name"
                />
              </div>
              {formData.slug && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Preview:</strong> swiftstock.com/store/{formData.slug}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allowGuestCheckout}
                  onChange={(e) => handleChange('allowGuestCheckout', e.target.checked)}
                  className="mr-3"
                />
                <span className="text-sm font-medium text-gray-700">Allow guest checkout</span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-6">Customers can buy without creating an account</p>
            </div>
          </div>
        );

      case 5: // Tax & Compliance
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tax & Compliance</h2>
              <p className="text-gray-600">Prepare for tax filing and reporting</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> These settings help you generate tax-ready reports later.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Do you charge VAT?</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.chargeVat === true}
                    onChange={() => handleChange('chargeVat', true)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Yes - I charge VAT on my sales</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.chargeVat === false}
                    onChange={() => handleChange('chargeVat', false)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">No - I don't charge VAT</span>
                </label>
              </div>
            </div>

            {formData.chargeVat && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">VAT Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vatRate}
                    onChange={(e) => handleChange('vatRate', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  <p className="text-sm text-gray-500 mt-1">Default: 7.5% (Nigerian VAT rate)</p>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.autoCalculateTax}
                      onChange={(e) => handleChange('autoCalculateTax', e.target.checked)}
                      className="mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">Auto-calculate tax on sales</span>
                  </label>
                </div>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Export-ready reports enabled by default</span>
              </div>
              <p className="text-sm text-gray-500 mt-2 ml-7">Generate professional reports for tax filing and business analysis</p>
            </div>
          </div>
        );

      case 6: // Additional Information
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-gray-600">How customers can reach you</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="business@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
                <span className="text-sm text-gray-600">Choose your brand color</span>
              </div>
            </div>
          </div>
        );

      case 7: // Review & Create
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Create</h2>
              <p className="text-gray-600">Confirm your business details</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Details</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="text-sm text-gray-900">{formData.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Type</dt>
                      <dd className="text-sm text-gray-900">{businessTypes.find(t => t.value === formData.businessType)?.label}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="text-sm text-gray-900">{formData.city}, {formData.state}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Store Settings</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Visibility</dt>
                      <dd className="text-sm text-gray-900 capitalize">{formData.storeVisibility}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">URL</dt>
                      <dd className="text-sm text-gray-900">swiftstock.com/store/{formData.slug}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Inventory Type</dt>
                      <dd className="text-sm text-gray-900 capitalize">{formData.inventoryType}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tax Settings</h3>
                <div className="text-sm text-gray-600">
                  {formData.chargeVat ? (
                    <span>VAT enabled at {formData.vatRate}%</span>
                  ) : (
                    <span>VAT not applicable</span>
                  )}
                  {formData.autoCalculateTax && formData.chargeVat && (
                    <span> • Auto-calculation enabled</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={prevStep}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Edit Details
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Business...
                  </div>
                ) : (
                  'Create Business'
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user || !token) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Bar */}
          {currentStep > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step {currentStep} of {steps.length - 1}</span>
                <span>{Math.round((currentStep / (steps.length - 1)) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-700 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Container */}
          <div className="card">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {renderStepContent()}

            {/* Navigation Buttons */}
            {currentStep > 0 && currentStep < 6 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  className="btn btn-primary flex items-center"
                >
                  Continue
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Step 6 Navigation (Contact Information to Review) */}
            {currentStep === 6 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Review & Create
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Back to App */}
          {currentStep === 0 && (
            <div className="text-center mt-6">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                ← Back to App
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}