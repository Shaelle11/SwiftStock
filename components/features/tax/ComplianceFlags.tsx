import Link from 'next/link';

interface ComplianceIssue {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  fixUrl?: string;
  count?: number;
}

interface ComplianceFlagsProps {
  issues: ComplianceIssue[];
}

export default function ComplianceFlags({ issues }: ComplianceFlagsProps) {
  if (issues.length === 0) return null;

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getIssueColors = (type: string) => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          subtext: 'text-red-700',
          button: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-900',
          subtext: 'text-yellow-700',
          button: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          subtext: 'text-blue-700',
          button: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-900',
          subtext: 'text-gray-700',
          button: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        };
    }
  };

  const criticalIssues = issues.filter(issue => issue.type === 'error');
  const warnings = issues.filter(issue => issue.type === 'warning');
  const infos = issues.filter(issue => issue.type === 'info');

  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Compliance Review
          </h3>
          <span className="text-sm text-gray-600">
            {issues.length} {issues.length === 1 ? 'item' : 'items'} need attention
          </span>
        </div>
        
        <div className="space-y-4">
          {/* Critical Issues First */}
          {criticalIssues.map((issue) => {
            const colors = getIssueColors(issue.type);
            
            return (
              <div
                key={issue.id}
                className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIssueIcon(issue.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium ${colors.text}`}>
                          {issue.title}
                          {issue.count && issue.count > 1 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-white rounded-full opacity-75">
                              {issue.count}
                            </span>
                          )}
                        </h4>
                        <p className={`mt-1 text-sm ${colors.subtext}`}>
                          {issue.description}
                        </p>
                      </div>
                      
                      {issue.fixUrl && (
                        <Link href={issue.fixUrl}>
                          <button className={`ml-4 px-3 py-1.5 text-sm font-medium rounded transition-colors ${colors.button}`}>
                            Fix Now
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Warnings */}
          {warnings.map((issue) => {
            const colors = getIssueColors(issue.type);
            
            return (
              <div
                key={issue.id}
                className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIssueIcon(issue.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium ${colors.text}`}>
                          {issue.title}
                          {issue.count && issue.count > 1 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-white rounded-full opacity-75">
                              {issue.count}
                            </span>
                          )}
                        </h4>
                        <p className={`mt-1 text-sm ${colors.subtext}`}>
                          {issue.description}
                        </p>
                      </div>
                      
                      {issue.fixUrl && (
                        <Link href={issue.fixUrl}>
                          <button className={`ml-4 px-3 py-1.5 text-sm font-medium rounded transition-colors ${colors.button}`}>
                            Review
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Info items */}
          {infos.map((issue) => {
            const colors = getIssueColors(issue.type);
            
            return (
              <div
                key={issue.id}
                className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIssueIcon(issue.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium ${colors.text}`}>
                          {issue.title}
                          {issue.count && issue.count > 1 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-white rounded-full opacity-75">
                              {issue.count}
                            </span>
                          )}
                        </h4>
                        <p className={`mt-1 text-sm ${colors.subtext}`}>
                          {issue.description}
                        </p>
                      </div>
                      
                      {issue.fixUrl && (
                        <Link href={issue.fixUrl}>
                          <button className={`ml-4 px-3 py-1.5 text-sm font-medium rounded transition-colors ${colors.button}`}>
                            Learn More
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            💡 <strong>Remember:</strong> We never shame the user - just guide towards compliance. 
            These flags help you stay audit-ready and avoid surprises.
          </p>
        </div>
      </div>
    </div>
  );
}