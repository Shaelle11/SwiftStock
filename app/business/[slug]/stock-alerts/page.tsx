'use client';

import React from 'react';

export default function StockAlerts() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Stock Alerts</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <svg className="w-16 h-16 text-yellow-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Stock Alert Management</h3>
          <p className="text-gray-500 mb-4">Monitor and manage low stock alerts across your inventory.</p>
          <p className="text-sm text-gray-400">
            Set custom thresholds, receive notifications, and manage restock alerts for your products.
          </p>
        </div>
      </div>
    </div>
  );
}