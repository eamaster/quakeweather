import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PredictResponse, ExplainResponse } from '../types';

interface PredictPanelProps {
  onShowHeatmap: (data: PredictResponse | null) => void;
  onShowAftershock: (data: any) => void;
  onShowMetrics: () => void;
  viewportBBox?: [number, number, number, number] | null;
}

export default function PredictPanel({ onShowHeatmap, onShowAftershock: _onShowAftershock, onShowMetrics, viewportBBox }: PredictPanelProps) {
  // onShowAftershock will be used when aftershock ring functionality is implemented
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [horizon, setHorizon] = useState(7);
  const [M0, setM0] = useState(4.5);
  const [gridSize, setGridSize] = useState(1.0); // Start with safer default
  const [showExplanation, setShowExplanation] = useState(false);
  const [cohereNotConfigured, setCohereNotConfigured] = useState(false);
  
  // Fetch nowcast predictions with debouncing
  const { data: predictData, isLoading: predictLoading, error: predictError, refetch } = useQuery<PredictResponse>({
    queryKey: ['predict', horizon, M0, gridSize, viewportBBox ? viewportBBox.join(',') : 'model'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      const apiBase = window.location.hostname === 'hesam.me' 
        ? 'https://quakeweather-api.smah0085.workers.dev'
        : '';
      const params = new URLSearchParams({
        horizon: String(horizon),
        cellDeg: String(gridSize),
      });
      if (viewportBBox) {
        params.set('bbox', viewportBBox.join(','));
      }
      const response = await fetch(
        `${apiBase}/api/predict?${params.toString()}`,
        {
          headers: {
            'Cache-Control': 'max-age=900', // Cache for 15 minutes
          },
        }
      );
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.');
        }
        let message = 'Failed to fetch predictions';
        try {
          const errorBody: any = await response.json();
          const parts = [errorBody?.message || errorBody?.error, errorBody?.suggestion].filter(Boolean);
          if (parts.length) {
            message = parts.join(' — ');
          }
        } catch {
          // ignore JSON parse issues
        }
        throw new Error(message);
      }
      return response.json();
    },
    enabled: isEnabled,
    refetchInterval: 900000, // Refresh every 15 minutes
  });
  
  // Fetch AI explanation - manual trigger via refetch()
  const {
    data: explainData,
    isLoading: explainLoading,
    isError: explainError,
    error: explainErrorObject,
    refetch: fetchExplanation,
  } = useQuery<ExplainResponse, Error>({
    queryKey: ['explain', predictData?.generated || ''],
    enabled: false, // manual trigger via fetchExplanation()
    queryFn: async () => {
      if (!predictData) {
        throw new Error('No prediction data');
      }

      const apiBase = window.location.hostname === 'hesam.me'
        ? 'https://quakeweather-api.smah0085.workers.dev'
        : '';

      const topCells = (predictData as PredictResponse).cells
        ?.slice() // avoid mutating original array
        .sort((a: any, b: any) => b.probability - a.probability)
        .slice(0, 5) || [];

      // Get recent quakes from Map component's data attribute
      const mapElement = document.querySelector('[data-quake-data]');
      let rawQuakeData: any = [];
      if (mapElement) {
        const attr = mapElement.getAttribute('data-quake-data') || '[]';
        try {
          rawQuakeData = JSON.parse(attr);
        } catch (err) {
          console.warn('Failed to parse data-quake-data attribute for AI explanation:', err);
          rawQuakeData = [];
        }
      }

      // Allow either a FeatureCollection or a plain array of features
      const quakeFeatures = Array.isArray(rawQuakeData)
        ? rawQuakeData
        : Array.isArray(rawQuakeData?.features)
        ? rawQuakeData.features
        : [];

      const recentEventsData = quakeFeatures.slice(0, 5).map((q: any) => ({
        lat: q.geometry.coordinates[1],
        lon: q.geometry.coordinates[0],
        mag: q.properties.mag,
        time: q.properties.time,
        place: q.properties.place,
      }));

      console.log('Explain API request:', { topCells, recentEvents: recentEventsData });

      if (topCells.length === 0) {
        throw new Error('No prediction cells available for explanation');
      }

      const response = await fetch(`${apiBase}/api/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=900',
        },
        body: JSON.stringify({ topCells, recentEvents: recentEventsData }),
      });

      // Read error body carefully; handle Cohere-not-configured case
      if (!response.ok) {
        const responseText = await response.text();
        let errorData: any = null;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          // ignore - plain text
        }

        if (response.status === 501 && errorData?.error === 'Cohere API not configured') {
          setCohereNotConfigured(true);
          // Return a placeholder ExplainResponse to keep types happy
          return {
            explanation: '',
            generated: new Date().toISOString(),
            top_cells_analyzed: topCells,
            recent_events_analyzed: recentEventsData,
            disclaimer: 'AI explanation disabled (Cohere API key not configured).',
          };
        }

        const errorMessage =
          errorData?.message ||
          errorData?.error ||
          responseText ||
          `HTTP ${response.status}`;

        console.error('Explain API error:', response.status, errorMessage);
        throw new Error(errorMessage);
      }

      // If we reached here, Cohere is configured and responded
      setCohereNotConfigured(false);
      return response.json();
    },
  });
  
  // Reset cohereNotConfigured flag when explanation is toggled off
  useEffect(() => {
    if (!showExplanation) {
      setCohereNotConfigured(false);
    }
  }, [showExplanation]);
  
  // Toggle prediction mode
  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    
    if (newState) {
      refetch();
    } else {
      onShowHeatmap(null);  // Clear heatmap
    }
  };

  // Handle AI Explanation button click
  const handleExplainClick = () => {
    if (!predictData) {
      console.warn('AI explanation clicked but no prediction data is available yet');
      return;
    }

    const nextState = !showExplanation;
    setShowExplanation(nextState);

    console.log('AI Explanation button clicked', {
      nextState,
      hasPredictData: !!predictData,
    });

    // If we are turning the explanation ON, trigger a refetch
    if (nextState) {
      fetchExplanation();
    }
  };
  
  // Update heatmap when prediction data changes
  useEffect(() => {
    if (predictData && isEnabled) {
      onShowHeatmap(predictData as PredictResponse);
    }
  }, [predictData, isEnabled, onShowHeatmap]);
  
  
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all ${
          isEnabled
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white'
        }`}
      >
        {isEnabled ? '🔮 Predict: ON' : '🔮 Predict (Experimental)'}
      </button>
      
      {/* Control Panel */}
      {isOpen && (
        <div className="fixed bottom-32 right-4 w-80 max-h-[60vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-purple-500 dark:border-purple-400 z-50">
          {/* Header with warning */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-lg">⚠️ Experimental Predictions</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <p className="text-xs opacity-90">
              Educational probabilities only. NOT for safety decisions.
            </p>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  Enable Nowcast
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Show probability heatmap
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={handleToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {/* Configuration Controls */}
            <div className="space-y-3">
              {/* Horizon */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Time Horizon: {horizon} day{horizon !== 1 ? 's' : ''}
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  step="1"
                  value={horizon}
                  onChange={(e) => setHorizon(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  disabled={!isEnabled}
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1d</span>
                  <span>7d</span>
                </div>
              </div>
              
              {/* Magnitude Threshold */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Min Magnitude (M0): {M0.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="3.0"
                  max="5.5"
                  step="0.5"
                  value={M0}
                  onChange={(e) => setM0(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  disabled={!isEnabled}
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>M3.0</span>
                  <span>M5.5</span>
                </div>
              </div>
              
              {/* Grid Size */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Grid Resolution: {gridSize}° ({(gridSize * 111).toFixed(0)}km)
                </label>
                <select
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  disabled={!isEnabled}
                >
                  <option value="0.1">0.1° (Fine - ~11km)</option>
                  <option value="0.25">0.25° (Medium - ~28km)</option>
                  <option value="0.5">0.5° (Coarse - ~55km)</option>
                  <option value="1.0">1.0° (Very Coarse - ~111km)</option>
                </select>
              </div>
            </div>
            
            {/* Status */}
            {isEnabled && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                {predictLoading && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ⏳ Computing probabilities...
                  </p>
                )}
                {predictError && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    <p>❌ Error: {(predictError as Error).message}</p>
                    {(predictError as Error).message.includes('Grid too large') && (
                      <p className="text-xs mt-1 text-orange-600 dark:text-orange-400">
                        💡 Try a larger cell size (for the full region, 1° is safest), or zoom in to a smaller map area before using finer grids (0.5°, 0.25°, 0.1°).
                      </p>
                    )}
                  </div>
                )}
                {predictData && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      ✓ Nowcast Active
                    </p>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p>• Cells: {(predictData as PredictResponse).total_cells}</p>
                      <p>• Max Prob: {((predictData as PredictResponse).max_probability * 100).toFixed(2)}%</p>
                      <p>• Mean Prob: {((predictData as PredictResponse).mean_probability * 100).toFixed(3)}%</p>
                      <p>• Model: {new Date((predictData as PredictResponse).model_trained).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* AI Explanation */}
            {isEnabled && predictData && (
              <div>
                <button
                  onClick={handleExplainClick}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {showExplanation ? '🤖 Hide' : '🤖 AI Explanation'}
                </button>
                
                {showExplanation && (
                  <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    {explainLoading && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Generating explanation...
                      </p>
                    )}
                    {cohereNotConfigured && (
                      <div className="text-xs text-gray-700 dark:text-gray-300">
                        <p className="mb-2">
                          ℹ️ AI explanation is currently disabled (Cohere API key not configured).
                          Predictions still show the heatmap without narrative text.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 italic">
                          The heatmap visualization above remains fully functional.
                        </p>
                      </div>
                    )}
                    {!cohereNotConfigured && explainError && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        ❌ Failed to load AI explanation: {explainErrorObject?.message}
                      </p>
                    )}
                    {!cohereNotConfigured && !explainError && explainData && explainData.explanation && (
                      <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                        {explainData.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Metrics Button */}
            <button
              onClick={onShowMetrics}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
              disabled={!isEnabled}
            >
              📊 View Model Metrics
            </button>
            
            {/* Disclaimer */}
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-800 dark:text-red-200 font-semibold mb-1">
                ⚠️ Critical Disclaimer
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 leading-tight">
                These are experimental educational probabilities based on statistical patterns.
                Earthquake prediction is NOT scientifically reliable. Never use for safety decisions.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

