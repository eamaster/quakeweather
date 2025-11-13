import { useState, useEffect } from 'react';
import Map from './components/Map';
import Controls from './components/Controls';
import PredictPanel from './components/PredictPanel';
import MetricsDrawer from './components/MetricsDrawer';
import { FeedType } from './types';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<FeedType>('all_day');
  const [magnitudeRange, setMagnitudeRange] = useState<[number, number]>([0, 10]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  // Recent quakes are now accessed from Map component data
  const [predictionData, setPredictionData] = useState<any>(null);
  const [aftershockData, setAftershockData] = useState<any>(null);
  const [viewportBBox, setViewportBBox] = useState<[number, number, number, number] | null>(null);

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm z-20">
        <div className="max-w-full px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-2">
                <svg
                  className="w-8 h-8 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  QuakeWeather
                </h1>
              </div>
              <span className="hidden sm:inline-block px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full">
                Educational Tool
              </span>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Controls sidebar */}
        <Controls
          selectedFeed={selectedFeed}
          onFeedChange={setSelectedFeed}
          magnitudeRange={magnitudeRange}
          onMagnitudeChange={setMagnitudeRange}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Map */}
        <div className="flex-1 relative">
          <Map 
            selectedFeed={selectedFeed} 
            magnitudeRange={magnitudeRange}
            predictionData={predictionData}
            aftershockData={aftershockData}
            onViewportChange={setViewportBBox}
          />
          
          {/* Predict Panel */}
          <PredictPanel 
            onShowHeatmap={(data) => {
              console.log('Heatmap data:', data);
              setPredictionData(data);
            }}
            onShowAftershock={(data) => {
              console.log('Aftershock data:', data);
              setAftershockData(data);
            }}
            onShowMetrics={() => setShowMetrics(true)}
            viewportBBox={viewportBBox}
          />
        </div>
      </div>
      
      {/* Metrics Drawer */}
      <MetricsDrawer 
        isOpen={showMetrics}
        onClose={() => setShowMetrics(false)}
      />

      {/* Footer disclaimer */}
      <footer className="bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800 z-10">
        <div className="max-w-full px-2 py-1 sm:px-4 sm:py-2 lg:px-8">
          <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center leading-tight">
            <span className="hidden sm:inline">⚠️ <strong>Educational Tool Only:</strong> Earthquake prediction is not scientifically
            reliable. Do not use this tool for safety-critical decisions. Weather and seismic
            activity are independent phenomena.</span>
            <span className="sm:hidden">⚠️ <strong>Educational Tool Only</strong> - Not for safety decisions</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

