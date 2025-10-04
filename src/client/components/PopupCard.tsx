import { QuakeFeature } from '../types';
import WeatherCard from './WeatherCard';
import { useState } from 'react';

interface PopupCardProps {
  quake: QuakeFeature;
  onClose: () => void;
}

export default function PopupCard({ quake, onClose }: PopupCardProps) {
  const [showWeather, setShowWeather] = useState(false);
  
  const mag = quake.properties.mag?.toFixed(1) || '0.0';
  const depth = quake.geometry.coordinates[2]?.toFixed(1) || '0.0';
  const time = new Date(quake.properties.time);
  const place = quake.properties.place || 'Unknown location';

  const getMagnitudeColor = (magnitude: number): string => {
    if (magnitude >= 6) return 'text-purple-600 dark:text-purple-400';
    if (magnitude >= 5) return 'text-red-600 dark:text-red-400';
    if (magnitude >= 4) return 'text-orange-600 dark:text-orange-400';
    if (magnitude >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="absolute top-4 right-4 w-96 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 fade-in">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-start justify-between z-10">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            M <span className={getMagnitudeColor(quake.properties.mag)}>{mag}</span> Earthquake
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{place}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="px-4 py-4 space-y-4">
        {/* Time */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
            Time
          </h4>
          <p className="text-sm text-gray-900 dark:text-white">
            {time.toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              timeZoneName: 'short',
            })}
          </p>
        </div>

        {/* Location details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Depth
            </h4>
            <p className="text-sm text-gray-900 dark:text-white">{depth} km</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Coordinates
            </h4>
            <p className="text-xs text-gray-900 dark:text-white">
              {quake.geometry.coordinates[1].toFixed(4)}°, {quake.geometry.coordinates[0].toFixed(4)}°
            </p>
          </div>
        </div>

        {/* Additional info */}
        {quake.properties.tsunami === 1 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              ⚠️ Tsunami Warning Active
            </p>
          </div>
        )}

        {/* Weather toggle button */}
        <button
          onClick={() => setShowWeather(!showWeather)}
          className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
          <span>{showWeather ? 'Hide Weather' : 'Show Weather & Insights'}</span>
        </button>

        {/* Weather card */}
        {showWeather && (
          <WeatherCard
            lat={quake.geometry.coordinates[1]}
            lon={quake.geometry.coordinates[0]}
            time={quake.properties.time}
            quake={quake}
          />
        )}

        {/* USGS link */}
        <a
          href={quake.properties.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          View on USGS Website →
        </a>
      </div>
    </div>
  );
}

