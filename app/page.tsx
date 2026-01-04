'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  CheckCircle2, 
  FileText, 
  BarChart3, 
  Shield, 
  Calculator,
  Clock,
  Users,
  TrendingUp,
  Receipt,
  Building
} from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-green-50 opacity-40"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.05) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Content */}
            <div className="max-w-xl">
              <div className="mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-800 text-sm font-medium rounded-full border border-emerald-200">
                  <Building className="w-4 h-4 mr-2" />
                  Simplified for all
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-6 leading-[1.1] tracking-tight">
                Tax compliance
                <span className="text-emerald-700 block">made simple.</span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Automated VAT tracking, FIRS-ready reports, and audit-proof records. 
                Everything your accountant needs, built into your daily operations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  href="/auth/register"
                  className="inline-flex justify-center items-center px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition-all duration-200 text-lg"
                >
                  Start Free Trial
                </Link>
                <Link 
                  href="#features"
                  className="inline-flex justify-center items-center px-8 py-4 text-slate-700 hover:text-emerald-700 font-semibold transition-colors text-lg"
                >
                  See How It Works
                </Link>
              </div>
            </div>
            
            {/* Right Column: Dashboard Preview */}
            <div className="lg:pl-8">
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="text-sm text-slate-600 font-medium">Tax Dashboard</div>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <div className="text-sm text-emerald-700 font-medium">VAT Collected</div>
                        <div className="text-2xl font-bold text-emerald-800">₦847,250</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-blue-700 font-medium">Net Position</div>
                        <div className="text-2xl font-bold text-blue-800">₦652,100</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-600">December 2025</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Compliant</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-600">November 2025</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Filed</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-600">October 2025</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Filed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-8 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-600">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">Designed for SMEs</span>
            </div>
            <div className="w-1 h-6 bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">Accountant-friendly</span>
            </div>
            <div className="w-1 h-6 bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">Tax-ready</span>
            </div>
            <div className="w-1 h-6 bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">FIRS-compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tax Compliance Made Simple Section */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Tax compliance made simple
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Every transaction automatically captures the tax information you need. 
              Stay compliant without the complexity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group">
              <div className="bg-white border border-slate-200 rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:border-emerald-200">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                  <Calculator className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold">Automatically</span> calculate VAT
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Every sale captures the exact VAT amount. No manual calculations, no missed transactions.
                </p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white border border-slate-200 rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">Instant</span> online stores
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Professional ecommerce setup in minutes. Every online sale flows into your tax records.
                </p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white border border-slate-200 rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:border-purple-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6 text-purple-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded font-bold">FIRS-ready</span> reports
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Download formatted reports that meet all Nigerian tax requirements. Your accountant will thank you.
                </p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white border border-slate-200 rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:border-orange-200">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-orange-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded font-bold">Audit-ready</span> records
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Complete transaction history with timestamps, receipts, and audit trails. Always ready for inspection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Breakdown Sections */}
      
      {/* Mini Ecommerce Store Setup */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Your products online with <br/>
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">instant</span> store setup
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  Create a professional online store in minutes. Every product you add 
                  to inventory automatically becomes available for online sales.
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Best part?</span> Every online sale 
                  flows directly into your tax records. No manual data entry, no compliance gaps.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                <span className="text-slate-700 font-medium">Professional storefront in minutes</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                <span className="text-slate-700 font-medium">Automatic inventory sync</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                <span className="text-slate-700 font-medium">Mobile-responsive design</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                <span className="text-slate-700 font-medium">Integrated payment processing</span>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-600">yourstore.swiftstock.ng</div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="font-bold text-lg text-slate-900">Fashion Store Nigeria</h3>
                    <p className="text-sm text-slate-600">Premium clothing & accessories</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="w-full h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded mb-2"></div>
                      <div className="text-xs font-medium text-slate-700">Designer Dress</div>
                      <div className="text-xs text-green-600 font-bold">₦45,000</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="w-full h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded mb-2"></div>
                      <div className="text-xs font-medium text-slate-700">Luxury Handbag</div>
                      <div className="text-xs text-green-600 font-bold">₦32,500</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-emerald-600 text-white text-xs py-2 rounded font-medium">
                      Add to Cart
                    </button>
                    <button className="px-3 py-2 border border-slate-300 rounded text-xs">
                      ♡
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Inventory Management Feature */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <div className="text-sm font-medium text-slate-600">Inventory Dashboard</div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">Product A</span>
                      <span className="text-green-700 font-bold">₦25,000 cost</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">Product B</span>
                      <span className="text-blue-700 font-bold">₦18,750 cost</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">Product C</span>
                      <span className="text-purple-700 font-bold">₦32,500 cost</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Smart inventory with <br/>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded">automatic</span> cost tracking
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  Every product tracks its purchase cost automatically. When you sell, 
                  we calculate the exact profit and tax obligations in real-time.
                </p>
                <p>
                  No more guessing at year-end. Your cost of goods sold is always accurate 
                  for <span className="font-semibold text-slate-900">precise tax reporting</span>.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span className="text-slate-700 font-medium">Real-time stock levels</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span className="text-slate-700 font-medium">Automatic cost calculations</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span className="text-slate-700 font-medium">Tax-ready profit tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* VAT Calculation Feature */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                VAT calculation that&apos;s <br/>
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">FIRS-ready</span> every time
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  Every sale automatically calculates the 7.5% VAT component and separates 
                  it for easy reporting. No manual calculations needed.
                </p>
                <p>
                  Input VAT from business purchases gets tracked separately, so you can 
                  <span className="font-semibold text-slate-900">offset what you owe</span> with what you&apos;ve already paid.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                <span className="text-slate-700 font-medium">Automatic 7.5% VAT calculation</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                <span className="text-slate-700 font-medium">Input VAT tracking</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                <span className="text-slate-700 font-medium">Net position reporting</span>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <div className="text-sm font-medium text-slate-600">VAT Summary - December 2025</div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Sales (excl. VAT)</span>
                    <span className="font-bold text-slate-900">₦1,240,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Output VAT (7.5%)</span>
                    <span className="font-bold text-green-600">₦93,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Input VAT paid</span>
                    <span className="font-bold text-blue-600">₦15,750</span>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">VAT payable</span>
                      <span className="font-bold text-lg text-emerald-700">₦77,250</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Reports Feature */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <div className="text-sm font-medium text-slate-600">Tax Reports</div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-700">VAT Return - Q4 2025</span>
                    </div>
                    <span className="text-green-600 text-sm font-medium">Ready</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-700">Sales Summary</span>
                    </div>
                    <span className="text-green-600 text-sm font-medium">Ready</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-700">Purchase Records</span>
                    </div>
                    <span className="text-green-600 text-sm font-medium">Ready</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Reports your accountant <br/>
                will <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">actually</span> want to see
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  Clean, professional reports formatted exactly how FIRS expects them. 
                  No reformatting, no missing data, no stress.
                </p>
                <p>
                  Export everything as PDF or Excel. Your accountant gets what they need, 
                  <span className="font-semibold text-slate-900">when they need it</span>.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
                <span className="text-slate-700 font-medium">FIRS-compliant formatting</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
                <span className="text-slate-700 font-medium">One-click PDF export</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
                <span className="text-slate-700 font-medium">Complete transaction history</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Nigerian Businesses Section */}
      <section className="py-20 bg-emerald-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8">
            Built for Nigerian businesses
          </h2>
          <div className="space-y-8 text-lg text-slate-600 leading-relaxed">
            <p>
              We understand the unique challenges of running a business in Nigeria. 
              From multiple tax jurisdictions to complex VAT calculations, we've built 
              every feature with your reality in mind.
            </p>
            <p>
              No more adapting foreign software to Nigerian requirements. 
              No more explaining local tax law to support teams overseas.
            </p>
            <p className="text-xl font-semibold text-slate-900">
              This is business software that gets Nigeria.
            </p>
          </div>
          <div className="mt-12 grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-700">7.5%</span>
              </div>
              <div className="font-medium text-slate-900">Current VAT rate</div>
              <div className="text-sm text-slate-600">Always up-to-date</div>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-blue-700" />
              </div>
              <div className="font-medium text-slate-900">FIRS compliant</div>
              <div className="text-sm text-slate-600">Report formatting</div>
            </div>
            <div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-purple-700">₦</span>
              </div>
              <div className="font-medium text-slate-900">Naira-first</div>
              <div className="text-sm text-slate-600">No currency conversion</div>
            </div>
          </div>
        </div>
      </section>

      {/* Always Audit-Ready Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Always audit-ready
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Complete, organized records from day one. When audit time comes, 
              you'll be prepared, not panicked.
            </p>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-8">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">VAT records</div>
                    <div className="text-sm text-slate-600">Every transaction tracked with timestamps</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Sales ledger</div>
                    <div className="text-sm text-slate-600">Complete customer and transaction history</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Purchase receipts</div>
                    <div className="text-sm text-slate-600">Input VAT tracking for recoverable amounts</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Document storage</div>
                    <div className="text-sm text-slate-600">Secure backup of all business records</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Audit trails</div>
                    <div className="text-sm text-slate-600">Who changed what, when, and why</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Compliance reports</div>
                    <div className="text-sm text-slate-600">Ready-to-submit FIRS documentation</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-200 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-slate-900">Bank-grade security</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-600">Cloud backup included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Ready to simplify your tax compliance?
          </h2>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join Nigerian businesses staying compliant without the complexity. 
            Start your free trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/auth/register"
              className="inline-flex justify-center items-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 text-lg"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/explore"
              className="inline-flex justify-center items-center px-8 py-4 border-2 border-slate-300 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 font-semibold rounded-xl transition-all duration-200 text-lg"
            >
              View Demo Stores
            </Link>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">14-day free trial</span>
            </div>
            <div className="w-1 h-4 bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="w-1 h-4 bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Setup assistance included</span>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
