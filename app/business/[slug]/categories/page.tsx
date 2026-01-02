'use client';

import React from 'react';

export default function Categories() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Categories</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Category Management</h3>
          <p className="text-gray-500 mb-4">Organize your products into categories for better management.</p>
          <p className="text-sm text-gray-400">
            Create, edit, and manage product categories to streamline your inventory organization.
          </p>
        </div>
      </div>
    </div>
  );
}