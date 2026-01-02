'use client';

import React from 'react';

export default function LoyaltyProgram() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Loyalty Program</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <svg className="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Loyalty Program</h3>
          <p className="text-gray-500 mb-4">Build customer loyalty with rewards and point systems.</p>
          <p className="text-sm text-gray-400">
            Create and manage loyalty programs to encourage repeat customers and increase retention.
          </p>
        </div>
      </div>
    </div>
  );
}