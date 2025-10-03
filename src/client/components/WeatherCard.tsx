import { useQuery } from '@tanstack/react-query';
import { WeatherResponse, QuakeFeature } from '../types';
import InsightCard from './InsightCard';

interface WeatherCardProps {
  lat: number;
  lon: number;
  time: number;
  quake: QuakeFeature;
}

export default function WeatherCard({ lat, lon, time, quake }: WeatherCardProps) {
  const { data: weather, isLoading, error } = useQuery<WeatherResponse>({
    queryKey: ['weather', lat, lon, time],
    queryFn: async () => {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}&t=${time}`);
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.');
        }
        throw new Error('Failed to fetch weather data');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading weather...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-700 dark:text-red-300">
          {error instanceof Error ? error.message : 'Failed to load weather data'}
        </p>
      </div>
    );
  }

  if (!weather) return null;

  const current = weather.current;
  const iconUrl = `https://openweathermap.org/img/wn/${current.weather[0]?.icon}@2x.png`;

  return (
    <div className="space-y-4">
      {/* Current conditions */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-primary-100 dark:border-primary-800">
        {weather.approximate && (
          <div className="mb-2 text-xs text-primary-700 dark:text-primary-300 font-medium">
            ℹ️ Showing current conditions (historical data not available in free tier)
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Current Conditions
            </h4>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {current.temp.toFixed(1)}°C
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Feels like {current.feels_like.toFixed(1)}°C
              </p>
              <p className="text-sm text-gray-900 dark:text-white capitalize">
                {current.weather[0]?.description || 'Unknown'}
              </p>
            </div>
          </div>
          {current.weather[0]?.icon && (
            <img src={iconUrl} alt="Weather icon" className="w-16 h-16" />
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Wind</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {current.wind_speed.toFixed(1)} m/s
              {current.wind_gust && ` (gusts ${current.wind_gust.toFixed(1)})`}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Humidity</p>
            <p className="text-gray-900 dark:text-white font-medium">{current.humidity}%</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Pressure</p>
            <p className="text-gray-900 dark:text-white font-medium">{current.pressure} hPa</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Visibility</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {(current.visibility / 1000).toFixed(1)} km
            </p>
          </div>
        </div>

        {weather.hourly && weather.hourly.length > 0 && weather.hourly[0].pop > 0 && (
          <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Precipitation probability: {(weather.hourly[0].pop * 100).toFixed(0)}%
            </p>
          </div>
        )}
      </div>

      {/* Alerts */}
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
            ⚠️ Weather Alert
          </h4>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            {weather.alerts[0].event}
          </p>
        </div>
      )}

      {/* AI Insight */}
      <InsightCard quake={quake} weather={weather} />
    </div>
  );
}

