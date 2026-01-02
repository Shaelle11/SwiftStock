'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDateTime } from '@/lib/utils/api';
import { getStoreBrandStyles } from '@/lib/store-branding';

// Components
import ComplianceStatusCard from '@/components/features/tax/ComplianceStatusCard';
import TaxSummaryCards from '@/components/features/tax/TaxSummaryCards';
import TaxBreakdownTable from '@/components/features/tax/TaxBreakdownTable';
import ComplianceFlags from '@/components/features/tax/ComplianceFlags';
import ExportPanel from '@/components/features/tax/ExportPanel';
import PeriodSelector from '@/components/features/tax/PeriodSelector';

interface TaxSummary {
  totalSales: number;
  taxableSales: number;
  vatCollected: number;
  nonTaxableSales: number;
}

interface VATRecord {
  id: string;
  date: string;
  orderId: string;
  taxableAmount: number;
  vatRate: number;
  vatAmount: number;
  customerName?: string;
}

interface ComplianceIssue {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  fixUrl?: string;
  count?: number;
}

interface BusinessInfo {
  name: string;
  address?: string;
  tin?: string;
  cacNumber?: string;
  phone?: string;
  email?: string;
}

export default function TaxCompliancePage({ params }: { params: Promise<{ businessId: string }> }) {
  const { user, token, store } = useAuth();
  const router = useRouter();
  const resolvedParams = React.use(params);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  
  // Data states
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null);
  const [vatRecords, setVATRecords] = useState<VATRecord[]>([]);
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [historicalPeriods, setHistoricalPeriods] = useState<any[]>([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState('current');
  
  // Brand styles
  const brandStyles = getStoreBrandStyles(store);

  useEffect(() => {
    if (user && token) {
      loadTaxData();
      loadBusinessInfo();
      loadHistoricalData();
    }
  }, [user, token, selectedPeriod, customDateRange]);

  const loadTaxData = async () => {
    try {
      setIsLoading(true);
      
      // For now, use mock data since API endpoints aren't implemented yet
      const mockTaxSummary: TaxSummary = {
        totalSales: 1250000,
        taxableSales: 1200000,
        vatCollected: 90000,
        nonTaxableSales: 50000
      };

      const mockVATRecords: VATRecord[] = [
        {
          id: '1',
          date: '2026-01-01',
          orderId: 'POS-001',
          taxableAmount: 10000,
          vatRate: 7.5,
          vatAmount: 750,
          customerName: 'John Doe'
        },
        {
          id: '2',
          date: '2026-01-01',
          orderId: 'ORD-002',
          taxableAmount: 25000,
          vatRate: 7.5,
          vatAmount: 1875,
          customerName: 'Guest'
        }
      ];

      const mockComplianceIssues: ComplianceIssue[] = [
        {
          id: '1',
          type: 'warning',
          title: 'Missing TIN',
          description: 'Business TIN not provided for proper tax reporting',
          fixUrl: `/business/${resolvedParams.businessId}/settings`
        }
      ];

      setTaxSummary(mockTaxSummary);
      setVATRecords(mockVATRecords);
      setComplianceIssues(mockComplianceIssues);
      
    } catch (error) {
      console.error('Error loading tax data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBusinessInfo = async () => {
    try {
      // Use store data from auth context for now
      if (store) {
        setBusinessInfo({
          name: store.name || 'Your Business',
          address: store.address,
          tin: store.tin,
          cacNumber: store.cacNumber,
          phone: store.phone,
          email: store.email
        });
      }
    } catch (error) {
      console.error('Error loading business info:', error);
    }
  };

  const loadHistoricalData = async () => {
    try {
      const mockHistoricalPeriods = [
        {
          id: '1',
          label: 'December 2025',
          totalSales: 890000,
          vatCollected: 66750,
          exported: true
        },
        {
          id: '2',
          label: 'November 2025',
          totalSales: 750000,
          vatCollected: 56250,
          exported: true
        }
      ];
      
      setHistoricalPeriods(mockHistoricalPeriods);
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  };

  const getComplianceStatus = () => {
    if (!taxSummary) return { status: 'loading', message: 'Loading compliance status...' };
    
    const criticalIssues = complianceIssues.filter(issue => issue.type === 'error');
    const warnings = complianceIssues.filter(issue => issue.type === 'warning');
    
    if (criticalIssues.length > 0) {
      return {
        status: 'error',
        message: 'Incomplete records - action required',
        issues: criticalIssues.length
      };
    }
    
    if (warnings.length > 0) {
      return {
        status: 'warning',
        message: 'Missing tax details - review recommended',
        issues: warnings.length
      };
    }
    
    return {
      status: 'ready',
      message: 'All sales for this period are properly recorded',
      issues: 0
    };
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'this-month': return 'This Month';
      case 'this-quarter': return 'This Quarter';
      case 'custom': return 'Custom Period';
      default: return 'This Month';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tax & Compliance</h1>
          <p className="text-gray-600 mt-1">Track taxes, generate reports, and prepare for filing</p>
        </div>
        
        <div className="flex items-center gap-4">
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            customDateRange={customDateRange}
            onCustomDateChange={setCustomDateRange}
            brandStyles={brandStyles}
          />
          
          <ExportPanel
            businessId={resolvedParams.businessId}
            period={selectedPeriod}
            dateRange={customDateRange}
            token={token}
            brandStyles={brandStyles}
          />
        </div>
      </div>

      {/* Compliance Status */}
      <ComplianceStatusCard
        status={getComplianceStatus()}
        periodLabel={getPeriodLabel()}
        brandStyles={brandStyles}
      />

      {/* Tax Summary Cards */}
      <TaxSummaryCards
        summary={taxSummary}
        isLoading={!taxSummary}
        brandStyles={brandStyles}
      />

      {/* Compliance Issues */}
      {complianceIssues.length > 0 && (
        <ComplianceFlags
          issues={complianceIssues}
          brandStyles={brandStyles}
        />
      )}

      {/* Main Content Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'current'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Current Period
            </button>
            <button
              onClick={() => setActiveTab('historical')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'historical'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Historical View
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'business'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Business Information
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'current' && (
            <TaxBreakdownTable
              records={vatRecords}
              periodLabel={getPeriodLabel()}
              brandStyles={brandStyles}
            />
          )}

          {activeTab === 'historical' && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Previous Periods</h3>
              {historicalPeriods.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VAT Collected</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exported</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {historicalPeriods.map((period) => (
                        <tr key={period.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">{period.label}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(period.totalSales)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(period.vatCollected)}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              period.exported
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {period.exported ? 'Yes' : 'No'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Historical Data</h3>
                  <p className="text-gray-600">Historical periods will appear here once you have recorded sales.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'business' && businessInfo && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <label className="text-gray-600">Business Name:</label>
                    <p className="font-medium text-gray-900">{businessInfo.name}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Address:</label>
                    <p className="font-medium text-gray-900">{businessInfo.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">TIN:</label>
                    <p className="font-medium text-gray-900">{businessInfo.tin || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">CAC Number:</label>
                    <p className="font-medium text-gray-900">{businessInfo.cacNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Phone:</label>
                    <p className="font-medium text-gray-900">{businessInfo.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Email:</label>
                    <p className="font-medium text-gray-900">{businessInfo.email || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => router.push(`/business/${resolvedParams.businessId}/settings`)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Edit Business Details
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Transaction Coverage</h3>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <label className="text-gray-600">Total Orders Recorded:</label>
                    <p className="font-medium text-gray-900">{vatRecords.length}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">POS Orders:</label>
                    <p className="font-medium text-gray-900">{vatRecords.filter(r => r.orderId.startsWith('POS')).length}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Online Orders:</label>
                    <p className="font-medium text-gray-900">{vatRecords.filter(r => !r.orderId.startsWith('POS')).length}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Guest vs Registered:</label>
                    <p className="font-medium text-gray-900">
                      {vatRecords.filter(r => !r.customerName || r.customerName === 'Guest').length} guest, 
                      {' '}{vatRecords.filter(r => r.customerName && r.customerName !== 'Guest').length} registered
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}