import React from 'react';
import Link from 'next/link';

interface FooterProps {
  variant?: 'full' | 'simple';
  className?: string;
}

export default function Footer({ variant = 'full', className = '' }: FooterProps) {
  if (variant === 'simple') {
    return (
      <footer className={`bg-gray-50 border-t border-gray-200 ${className}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-500">
              Powered by{' '}
              <span className="font-semibold text-gray-700">SwiftStock</span>
              {' '}• Modern Inventory Management System
            </p>
          </div>
        </div>
      </footer>
    );
  }
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">SwiftStock</div>
            </div>
            <p className="text-slate-300 leading-relaxed mb-6">
              Professional business management with automated tax compliance for Nigerian businesses.
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <p><strong className="text-slate-300">Contact:</strong> support@swiftstock.ng</p>
              <p><strong className="text-slate-300">Phone:</strong> +234 (0) 123 456 7890</p>
              <p><strong className="text-slate-300">Address:</strong> Lagos, Nigeria</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Platform</h4>
            <ul className="space-y-3 text-slate-300">
              <li><Link href="/explore" className="hover:text-emerald-400 transition-colors">Explore Stores</Link></li>
              <li><Link href="/auth/register" className="hover:text-emerald-400 transition-colors">Start Free Trial</Link></li>
              <li><Link href="/auth/login" className="hover:text-emerald-400 transition-colors">Sign In</Link></li>
              <li><Link href="#features" className="hover:text-emerald-400 transition-colors">Features</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">For Businesses</h4>
            <ul className="space-y-3 text-slate-300">
              <li><Link href="/auth/register" className="hover:text-emerald-400 transition-colors">Start Selling</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Business Dashboard</Link></li>
              <li><Link href="#tax-compliance" className="hover:text-emerald-400 transition-colors">Tax Compliance</Link></li>
              <li><Link href="#inventory" className="hover:text-emerald-400 transition-colors">Inventory Management</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Support & Legal</h4>
            <ul className="space-y-3 text-slate-300">
              <li><a href="mailto:support@swiftstock.ng" className="hover:text-emerald-400 transition-colors">Contact Support</a></li>
              <li><a href="#help" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
              <li><a href="#privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 mb-4 md:mb-0">
              <p>&copy; 2026 SwiftStock Technologies Ltd. All rights reserved.</p>
            </div>
            <div className="flex items-center space-x-6 text-slate-400">
              <span className="text-sm">Made with care for SMEs</span>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-xs">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
