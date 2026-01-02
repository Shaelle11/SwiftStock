'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';

export default function BusinessCustomers() {
  const { user, token } = useAuth();
  const params = useParams();
  const slug = params?.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);

  const fetchBusinessAndCustomers = async () => {
    if (!token || !slug) {
      setLoading(false);
      return;
    }

    try {
      // First get the business by slug
      const businessResponse = await fetch('/api/stores?owner=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        const currentBusiness = businessData.stores?.find((store: any) => store.slug === slug);
        
        if (currentBusiness) {
          setBusiness(currentBusiness);
          
          // TODO: Fetch customers data when customer API is available
          // For now, we'll show a placeholder
          setCustomers([]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user || !slug) return;
    fetchBusinessAndCustomers();
  }, [token, user, slug]);

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access the customers page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600">Manage your customer database</p>
        {business && <p className="text-sm text-gray-500">{business.name}</p>}
      </div>

      {loading ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading customers...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Management</h3>
            <p className="text-gray-500 mb-8">Customer management features coming soon.</p>
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Customer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}