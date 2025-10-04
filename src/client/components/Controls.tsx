import { FeedType } from '../types';

interface ControlsProps {
  selectedFeed: FeedType;
  onFeedChange: (feed: FeedType) => void;
  magnitudeRange: [number, number];
  onMagnitudeChange: (range: [number, number]) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const FEED_OPTIONS: { value: FeedType; label: string; description: string }[] = [
  { value: 'all_hour', label: 'Past Hour', description: 'All earthquakes in the last hour' },
  { value: 'all_day', label: 'Past Day', description: 'All earthquakes in the last 24 hours' },
  { value: '2.5_day', label: 'M2.5+ (Day)', description: 'Magnitude 2.5+ in the last day' },
  { value: '4.5_week', label: 'M4.5+ (Week)', description: 'Magnitude 4.5+ in the last week' },
  {
    value: 'significant_month',
    label: 'Significant (Month)',
    description: 'Significant earthquakes in the last month',
  },
];

export default function Controls({
  selectedFeed,
  onFeedChange,
  magnitudeRange,
  onMagnitudeChange,
  isOpen = false,
  onClose,
}: ControlsProps) {
  return (
    <aside className={`
      w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto custom-scrollbar
      lg:relative lg:translate-x-0 lg:z-auto
      fixed top-0 left-0 h-full z-40 transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-4 space-y-6">
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Feed selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Time Window
          </label>
          <div className="space-y-2">
            {FEED_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onFeedChange(option.value);
                  // Close sidebar on mobile after selection
                  if (onClose) {
                    onClose();
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedFeed === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Magnitude filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Magnitude Range: {magnitudeRange[0].toFixed(1)} - {magnitudeRange[1].toFixed(1)}
          </label>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Minimum
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={magnitudeRange[0]}
                onChange={(e) =>
                  onMagnitudeChange([parseFloat(e.target.value), magnitudeRange[1]])
                }
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Maximum
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={magnitudeRange[1]}
                onChange={(e) =>
                  onMagnitudeChange([magnitudeRange[0], parseFloat(e.target.value)])
                }
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Magnitude Legend
          </h3>
          <div className="space-y-2">
            {[
              { range: '< 3.0', color: 'bg-green-500', label: 'Minor' },
              { range: '3.0 - 4.0', color: 'bg-yellow-500', label: 'Light' },
              { range: '4.0 - 5.0', color: 'bg-orange-500', label: 'Moderate' },
              { range: '5.0 - 6.0', color: 'bg-red-500', label: 'Strong' },
              { range: '6.0+', color: 'bg-purple-600', label: 'Major' },
            ].map((item) => (
              <div key={item.range} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${item.color}`} />
                <div className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">{item.range}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data attribution */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Data Sources
          </h3>
          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <li>• Earthquake data: USGS</li>
            <li>• Weather data: OpenWeather</li>
            <li>• Maps: Mapbox</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

