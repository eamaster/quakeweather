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
        {weather.approximate ? (
          <div className="mb-2 text-xs text-orange-700 dark:text-orange-300 font-medium">
            ⚠️ Showing current conditions (historical data not available)
          </div>
        ) : (
          <div className="mb-2 text-xs text-green-700 dark:text-green-300 font-medium">
            ✅ Showing weather conditions at earthquake time
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              {weather.approximate ? 'Current Conditions' : 'Weather at Earthquake Time'}
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

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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

      {/* Hourly Forecast (One Call API 3.0 feature) */}
      {weather.hourly && weather.hourly.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            📈 8-Hour Forecast
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {weather.hourly.slice(0, 8).map((hour, index) => (
              <div key={index} className="text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {new Date(hour.dt * 1000).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    hour12: true 
                  })}
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {hour.temp.toFixed(0)}°C
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {hour.weather[0]?.description || 'Clear'}
                </p>
                {hour.pop > 0 && (
                  <p className="text-blue-600 dark:text-blue-400">
                    {(hour.pop * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Forecast (One Call API 3.0 feature) */}
      {weather.daily && weather.daily.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            📅 3-Day Forecast
          </h4>
          <div className="space-y-2">
            {weather.daily.slice(0, 3).map((day, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {index === 0 ? 'Today' : 
                     index === 1 ? 'Tomorrow' : 
                     new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-xs">
                    {day.weather[0]?.description || 'Clear'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {day.temp.max.toFixed(0)}° / {day.temp.min.toFixed(0)}°C
                  </p>
                  {day.pop > 0 && (
                    <p className="text-blue-600 dark:text-blue-400 text-xs">
                      {(day.pop * 100).toFixed(0)}% rain
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
            ⚠️ Weather Alert
          </h4>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            {weather.alerts[0].event}
          </p>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            {weather.alerts[0].description}
          </p>
        </div>
      )}

      {/* AI Insight */}
      <InsightCard quake={quake} weather={weather} />
    </div>
  );
}

