'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to app
    if (user) {
      router.push('/app');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Run your business.
            <span className="text-teal-700 block">We'll handle the compliance.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-3 sm:mb-4 max-w-2xl mx-auto leading-relaxed">
            Inventory, sales, and tax-compliant records — all automated in one dashboard.
          </p>
          <p className="text-base sm:text-lg text-gray-500 mb-8 sm:mb-12">
            Built for Nigerian businesses. Tax-ready from day one.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link 
              href="/auth/register"
              className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto"
            >
              Start free trial
            </Link>
            <Link 
              href="/explore"
              className="btn btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto"
            >
              Explore stores
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Tax compliance made simple for Nigerian businesses
            </h2>
            <div className="max-w-3xl mx-auto text-gray-600 space-y-3 sm:space-y-4 text-base sm:text-lg">
              <p>Every transaction automatically captures the tax information you need.</p>
              <p>From VAT calculations to FIRS-ready reports, stay compliant without the paperwork.</p>
              <p>Built specifically for Nigerian tax requirements — so your business stays on the right side of the law, effortlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            {/* Feature 1: Inventory Management */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                Smart inventory tracking.
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Real-time stock levels with automatic cost tracking for accurate tax reporting.
              </p>
            </div>
            
            {/* Feature 2: Sales & POS */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                VAT-ready sales records.
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Every sale automatically calculates and records VAT for seamless FIRS compliance.
              </p>
            </div>
            
            {/* Feature 3: Tax Compliance */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                Instant FIRS-ready reports.
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Download formatted tax reports that meet all Nigerian regulatory requirements.
              </p>
            </div>
            
            {/* Feature 4: Business Growth */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                Scale with confidence.
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                From sole proprietorship to limited company — compliant at every stage of growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tax Compliance Highlight Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Nigerian tax compliance, automated
          </h2>
          <div className="text-base sm:text-xl text-gray-600 space-y-2 sm:space-y-3">
            <p>Automatic VAT calculations on every sale.</p>
            <p>FIRS-compliant reports generated instantly.</p>
            <p>CAC registration details captured and stored securely.</p>
          </div>
          <div className="mt-8 sm:mt-12">
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-50 border border-green-200 rounded-lg">
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="text-sm sm:text-base font-medium text-green-800">Always audit-ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 sm:py-16 bg-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to simplify your business operations?
          </h2>
          <p className="text-lg sm:text-xl text-teal-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join Nigerian businesses staying tax-compliant with automated record-keeping.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link 
              href="/auth/register"
              className="bg-white text-teal-600 hover:bg-gray-50 font-semibold px-6 sm:px-8 py-3 rounded-lg transition-colors text-base sm:text-lg w-full sm:w-auto"
            >
              Start your free trial
            </Link>
            <Link 
              href="/explore"
              className="border-2 border-white text-white hover:bg-white hover:text-teal-600 font-semibold px-6 sm:px-8 py-3 rounded-lg transition-colors text-base sm:text-lg w-full sm:w-auto"
            >
              View demo stores
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
