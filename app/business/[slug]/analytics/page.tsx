'use client';

import React from 'react';

export default function Analytics() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
          <p className="text-gray-500 mb-4">Advanced analytics and reporting features coming soon.</p>
          <p className="text-sm text-gray-400">
            This will include sales trends, customer insights, product performance, and business intelligence reports.
          </p>
        </div>
      </div>
    </div>
  );
}