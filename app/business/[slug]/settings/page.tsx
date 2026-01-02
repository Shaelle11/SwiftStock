'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';
import type { Product } from '@/lib/types';

export default function BusinessSettings() {
  const { user, token } = useAuth();
  const params = useParams();
  const slug = params?.slug as string;
  
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  // Deployment state
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [deploymentType, setDeploymentType] = useState<'public' | 'private'>('public');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentMessage, setDeploymentMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    primaryColor: '#3B82F6',
    logoUrl: ''
  });

  const fetchStoreData = async () => {
    if (!user || !token || !slug) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/stores?owner=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const storeData = data.stores?.find((store: any) => store.slug === slug);
        
        if (storeData) {
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
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!user || !token) return;
    
    try {
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data?.items || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchStoreData();
    fetchProducts();
  }, [user, token, slug]);

  const handleDeployStore = async () => {
    if (!store?.id || selectedProducts.size === 0) {
      setDeploymentMessage('Please select at least one product to deploy.');
      return;
    }
    
    setIsDeploying(true);
    setDeploymentMessage(null);
    
    try {
      const response = await fetch(`/api/stores/${store.id}/deploy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          isPublic: deploymentType === 'public'
        }),
      });
      
      if (response.ok) {
        setDeploymentMessage(`Store successfully deployed as ${deploymentType} with ${selectedProducts.size} products!`);
        await fetchStoreData();
      } else {
        const errorData = await response.json();
        setDeploymentMessage(errorData.message || 'Failed to deploy store. Please try again.');
      }
    } catch (error) {
      setDeploymentMessage('An error occurred during deployment. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const handleSelectAllProducts = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch(`/api/stores/${store.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setMessage('Settings updated successfully!');
        await fetchStoreData();
      } else {
        setMessage('Failed to update settings. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="page-title">Store Settings</h1>
        <p className="text-gray-600 text-sm">Manage your store information and preferences</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm ${
          message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Store Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
              Brand Color
            </label>
            <input
              type="color"
              id="primaryColor"
              name="primaryColor"
              value={formData.primaryColor}
              onChange={handleChange}
              className="w-full h-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            placeholder="Describe your store..."
          />
        </div>
        
        <div>
          <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Logo URL
          </label>
          <input
            type="url"
            id="logoUrl"
            name="logoUrl"
            value={formData.logoUrl}
            onChange={handleChange}
            className="input"
            placeholder="https://example.com/logo.png"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
      
      {/* Store Deployment Section */}
      <div className="card mt-8">
        <div className="mb-6">
          <h2 className="section-header text-teal-800">Store Deployment</h2>
          <p className="text-gray-600 text-sm">Deploy your store with selected products to make it available to customers</p>
        </div>

        {deploymentMessage && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            deploymentMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {deploymentMessage}
          </div>
        )}

        {/* Deployment Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Deployment Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="public"
                checked={deploymentType === 'public'}
                onChange={(e) => setDeploymentType(e.target.value as 'public' | 'private')}
                className="mr-2 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm">
                <span className="font-medium text-gray-900">Public Store</span>
                <span className="block text-gray-500">Visible to all customers on the platform</span>
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="private"
                checked={deploymentType === 'private'}
                onChange={(e) => setDeploymentType(e.target.value as 'public' | 'private')}
                className="mr-2 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm">
                <span className="font-medium text-gray-900">Private Store</span>
                <span className="block text-gray-500">Only accessible via direct link</span>
              </span>
            </label>
          </div>
        </div>

        {/* Product Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Products ({selectedProducts.size} of {products.length} selected)
            </label>
            <button
              onClick={handleSelectAllProducts}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              {selectedProducts.size === products.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          {products.length === 0 ? (
            <div className="empty-state">
              <p className="text-gray-600">No products found. Add products to your inventory first.</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {products.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={() => handleProductSelection(product.id)}
                    className="mr-3 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                    <div className="text-xs text-gray-500">
                      Category: {product.category} • Stock: {product.stockQuantity} units
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${product.sellingPrice.toFixed(2)}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Current Store Status */}
        {store && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Current Status</p>
                <p className="text-xs text-gray-600">
                  Store is {store.isPublic ? 'Public' : 'Private'} • {store.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  store.isPublic 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {store.isPublic ? 'Public' : 'Private'}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  store.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {store.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Deploy Button */}
        <div className="flex justify-end">
          <button
            onClick={handleDeployStore}
            disabled={isDeploying || selectedProducts.size === 0 || !store}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeploying ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deploying...
              </div>
            ) : (
              `Deploy ${deploymentType.charAt(0).toUpperCase() + deploymentType.slice(1)} Store`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}