import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="text-xl font-bold text-blue-400">SwiftStock</div>
            </div>
            <p className="text-gray-400">
              The modern commerce platform connecting local businesses with customers everywhere.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/explore" className="hover:text-white transition-colors">Explore Stores</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Get Started</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">For Businesses</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Start Selling</Link></li>
              <li><Link href="/app" className="hover:text-white transition-colors">Business Dashboard</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#api" className="hover:text-white transition-colors">API Access</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 SwiftStock. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
