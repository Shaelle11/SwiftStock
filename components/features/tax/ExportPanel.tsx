interface ExportPanelProps {
  businessId: string;
  period: string;
  dateRange: { start: string; end: string };
  token: string | null;
  brandStyles: any;
}

export default function ExportPanel({ businessId, period, dateRange, token, brandStyles }: ExportPanelProps) {
  const handleExportVATReportCSV = async () => {
    try {
      // Future implementation: Call export API
      const filename = `vat-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      alert(`Exporting VAT Report (CSV) as ${filename}\n\nThis feature will be implemented with the backend API.`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleExportVATReportPDF = async () => {
    try {
      // Future implementation: Call export API
      const filename = `vat-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
      alert(`Exporting VAT Report (PDF) as ${filename}\n\nThis feature will be implemented with the backend API.`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleExportSalesSummary = async () => {
    try {
      // Future implementation: Call export API
      const filename = `sales-summary-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      alert(`Exporting Sales Summary as ${filename}\n\nThis feature will be implemented with the backend API.`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Export Reports</h3>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={handleExportVATReportCSV}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center justify-between"
        >
          <span>Download VAT Report (CSV)</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        
        <button
          onClick={handleExportVATReportPDF}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center justify-between"
        >
          <span>Download VAT Report (PDF)</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </button>
        
        <button
          onClick={handleExportSalesSummary}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center justify-between"
        >
          <span>Download Sales Summary</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          These files are formatted for tax filing and accountant review.
        </p>
      </div>
    </div>
  );
}