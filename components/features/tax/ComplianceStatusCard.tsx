interface ComplianceStatus {
  status: 'ready' | 'warning' | 'error' | 'loading';
  message: string;
  issues?: number;
}

interface ComplianceStatusCardProps {
  status: ComplianceStatus;
  periodLabel: string;
  brandStyles: any;
}

export default function ComplianceStatusCard({ status, periodLabel, brandStyles }: ComplianceStatusCardProps) {
  const getStatusIcon = () => {
    switch (status.status) {
      case 'ready':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'loading':
        return (
          <div className="flex-shrink-0 w-8 h-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'ready': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getCTA = () => {
    switch (status.status) {
      case 'warning':
      case 'error':
        return (
          <button 
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Review {status.issues} {status.issues === 1 ? 'Issue' : 'Issues'}
          </button>
        );
      case 'ready':
        return (
          <div className="text-sm text-green-700 font-medium">
            ✓ Compliance ready for {periodLabel.toLowerCase()}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`w-full p-6 rounded-xl border-2 mb-8 ${getStatusColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Compliance Status: {status.status === 'ready' ? 'Ready' : status.status === 'warning' ? 'Needs Review' : status.status === 'error' ? 'Action Required' : 'Loading'}
            </h3>
            <p className="text-gray-700 mt-1">{status.message}</p>
            {status.status !== 'loading' && (
              <p className="text-sm text-gray-600 mt-2">
                Period: {periodLabel}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getCTA()}
        </div>
      </div>
    </div>
  );
}