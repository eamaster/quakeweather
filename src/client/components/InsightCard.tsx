import { useQuery } from '@tanstack/react-query';
import { QuakeFeature, WeatherResponse, InsightResponse } from '../types';

interface InsightCardProps {
  quake: QuakeFeature;
  weather: WeatherResponse;
}

export default function InsightCard({ quake, weather }: InsightCardProps) {
  const { data: insight, isLoading, error } = useQuery<InsightResponse>({
    queryKey: ['insight', quake.id],
    queryFn: async () => {
      const response = await fetch(`/api/insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quake, weather }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch insight');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Generating analysis...</span>
        </div>
      </div>
    );
  }

  if (error || !insight) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800">
      <div className="flex items-start space-x-2 mb-3">
        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
            Analysis & Context
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {insight.text}
          </p>
        </div>
      </div>

      {insight.bullets.length > 0 && (
        <ul className="space-y-1 ml-7 mb-3">
          {insight.bullets.map((bullet, idx) => (
            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="ml-7 pt-3 border-t border-indigo-200 dark:border-indigo-800">
        <p className="text-xs text-indigo-700 dark:text-indigo-300 italic">
          {insight.disclaimer}
        </p>
      </div>
    </div>
  );
}

