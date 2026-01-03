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
      <section className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Run your business.
            <span className="text-teal-700 block">We'll help you keep it organised.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Inventory, sales, and tax-ready records — all in one simple dashboard.
          </p>
          <p className="text-lg text-gray-500 mb-12">
            Built for small businesses that want clarity, not complexity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register"
              className="btn btn-primary text-lg px-8 py-3"
            >
              Get started for free
            </Link>
            <Link 
              href="/explore"
              className="btn btn-secondary text-lg px-8 py-3"
            >
              Explore stores
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">
              Built for how small businesses actually work
            </h2>
            <div className="max-w-3xl mx-auto text-gray-600 space-y-4 text-lg">
              <p>Running a business already takes enough energy.</p>
              <p>Tracking stock, recording sales, and preparing for tax shouldn't make it harder.</p>
              <p>We built this platform to help you stay organised from day one — so when it's time to review your numbers or file your taxes, everything is already in place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1: Inventory Management */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Know what you have. Always.
              </h3>
              <p className="text-gray-600 text-sm">
                Track stock levels, update products easily, and avoid running out or overstocking.
              </p>
            </div>
            
            {/* Feature 2: Sales & POS */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Every sale recorded, automatically.
              </h3>
              <p className="text-gray-600 text-sm">
                Whether it's in-store or online, every transaction is logged and ready for review.
              </p>
            </div>
            
            {/* Feature 3: Tax-Ready Reports */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Tax preparation, without the stress.
              </h3>
              <p className="text-gray-600 text-sm">
                Clean, organised reports you can download and share when it's time to file.
              </p>
            </div>
            
            {/* Feature 4: Public & Private Stores */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Sell your way.
              </h3>
              <p className="text-gray-600 text-sm">
                Make your store public, private, or share it only with customers you choose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">
            Designed to grow with your business
          </h2>
          <div className="text-xl text-gray-600 space-y-2">
            <p>Start simple.</p>
            <p>Add features when you need them.</p>
            <p>Your data stays clean from the beginning.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Need help or have questions?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            We're here to help you get set up and running smoothly.
          </p>
          <p className="text-gray-600 mb-8">
            Whether you're just exploring or already using the platform, feel free to reach out.
          </p>
          <Link 
            href="/contact"
            className="btn btn-primary text-lg px-8 py-3"
          >
            Contact support
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
