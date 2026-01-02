'use client';

import { useContext } from 'react';
import { useAuth, AuthContext } from '@/contexts/AuthContext';
import { getStoreBrandStyles } from '@/lib/store-branding';

export default function CustomersPage() {
  const { user } = useAuth();
  const { store } = useContext(AuthContext)!;
  const brandStyles = getStoreBrandStyles(store);

  if (!user || user.userType !== 'business_owner') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="section-header mb-4">Access Denied</h1>
          <p className="text-gray-600">Only business owners can access the customers page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="page-title">Customers</h1>
        <p className="text-gray-600 text-sm">Manage your customer database</p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <div className="text-teal-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h3 className="section-header mb-2">Customers Management</h3>
          <p className="text-gray-500 mb-8">Customer management features coming soon.</p>
          <button 
            className="btn btn-primary"
          >
            Add Customer
          </button>
        </div>
      </div>
    </div>
  );
}
