interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  customDateRange: { start: string; end: string };
  onCustomDateChange: (range: { start: string; end: string }) => void;
}

export default function PeriodSelector({ 
  selectedPeriod, 
  onPeriodChange, 
  customDateRange, 
  onCustomDateChange
}: PeriodSelectorProps) {
  const periods = [
    { value: 'this-month', label: 'This Month' },
    { value: 'this-quarter', label: 'This Quarter' },
    { value: 'custom', label: 'Custom Period' }
  ];

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCustomDateChange({ ...customDateRange, start: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCustomDateChange({ ...customDateRange, end: e.target.value });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Period:</label>
        <select
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {periods.map(period => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
      </div>

      {selectedPeriod === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customDateRange.start}
            onChange={handleStartDateChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Start date"
          />
          <span className="text-gray-500 text-sm">to</span>
          <input
            type="date"
            value={customDateRange.end}
            onChange={handleEndDateChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="End date"
          />
        </div>
      )}
    </div>
  );
}