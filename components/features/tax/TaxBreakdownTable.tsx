import { formatCurrency, formatDateTime } from '@/lib/utils/api';

interface VATRecord {
  id: string;
  date: string;
  orderId: string;
  taxableAmount: number;
  vatRate: number;
  vatAmount: number;
  customerName?: string;
}

interface TaxBreakdownTableProps {
  records: VATRecord[];
  periodLabel: string;
  brandStyles: any;
}

export default function TaxBreakdownTable({ records, periodLabel, brandStyles }: TaxBreakdownTableProps) {
  const totalVAT = records.reduce((sum, record) => sum + record.vatAmount, 0);
  const totalTaxable = records.reduce((sum, record) => sum + record.taxableAmount, 0);

  if (records.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">VAT Breakdown</h3>
          <span className="text-sm text-gray-600">{periodLabel}</span>
        </div>
        
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tax Records Found</h3>
          <p className="text-gray-600">Once you record sales, VAT breakdown will appear here.</p>
          <button 
            className="mt-4 px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Go to POS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">VAT Breakdown</h3>
        <span className="text-sm text-gray-600">{periodLabel}</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Taxable Amount
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                VAT Rate
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                VAT Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDateTime(record.date).split(' ')[0]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{record.orderId}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.customerName || 'Guest'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(record.taxableAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {record.vatRate}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right" style={{ color: brandStyles.primaryColor }}>
                  {formatCurrency(record.vatAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border-t-2 border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <div className="space-y-1">
            <div className="flex justify-between w-64">
              <span className="text-gray-600">Total Taxable Sales:</span>
              <span className="font-medium text-gray-900">{formatCurrency(totalTaxable)}</span>
            </div>
            <div className="flex justify-between w-64">
              <span className="text-gray-600">Total VAT for {periodLabel.toLowerCase()}:</span>
              <span className="font-bold text-lg" style={{ color: brandStyles.primaryColor }}>
                {formatCurrency(totalVAT)}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">
              {records.length} transaction{records.length !== 1 ? 's' : ''} recorded
            </p>
            <p className="text-xs text-gray-500">
              Average VAT per transaction: {formatCurrency(totalVAT / records.length)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}