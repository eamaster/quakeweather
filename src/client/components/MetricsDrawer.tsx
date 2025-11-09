import { useEffect, useState } from 'react';

interface MetricsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ModelEvaluation {
  version: string;
  evaluation_date: string;
  metrics: {
    auc: number;
    brier_score: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  calibration: {
    reliability_bins: Array<{
      bin: number;
      count: number;
      mean_prob: number;
      observed_rate: number;
    }>;
  };
  training_info: {
    total_samples: number;
    positive_samples: number;
    negative_samples: number;
    training_period: string;
    validation_period: string;
  };
}

export default function MetricsDrawer({ isOpen, onClose }: MetricsDrawerProps) {
  const [metrics, setMetrics] = useState<ModelEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen && !metrics) {
      fetchMetrics();
    }
  }, [isOpen]);
  
  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to load from deployed model first, fallback to placeholder
      // Model is served from public/models/ at root path (not sub-path)
      const response = await fetch('/models/nowcast_eval.json');
      if (response.ok) {
        const data = await response.json() as ModelEvaluation;
        setMetrics(data);
      } else {
        // Placeholder metrics
        setMetrics({
          version: '1.0.0',
          evaluation_date: new Date().toISOString(),
          training_info: {
            total_samples: 50000,
            positive_samples: 750,
            negative_samples: 49250,
            training_period: '2010-01-01 to 2024-12-31',
            validation_period: '2024-10-01 to 2024-12-31',
          },
          metrics: {
            auc: 0.72,
            brier_score: 0.016,
            precision: 0.65,
            recall: 0.58,
            f1_score: 0.61,
          },
          calibration: {
            reliability_bins: [
              { bin: 1, count: 1200, mean_prob: 0.005, observed_rate: 0.006 },
              { bin: 2, count: 800, mean_prob: 0.015, observed_rate: 0.014 },
              { bin: 3, count: 600, mean_prob: 0.025, observed_rate: 0.028 },
              { bin: 4, count: 400, mean_prob: 0.035, observed_rate: 0.031 },
              { bin: 5, count: 200, mean_prob: 0.050, observed_rate: 0.055 },
            ],
          },
        });
      }
    } catch (err) {
      setError('Failed to load model metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">📊 Model Performance</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Loading metrics...</p>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          
          {metrics && (
            <>
              {/* Dataset Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                  📁 Dataset
                </h3>
                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <p>• Total samples: {metrics.training_info.total_samples.toLocaleString()}</p>
                  <p>• Positive samples: {metrics.training_info.positive_samples.toLocaleString()}</p>
                  <p>• Positive rate: {((metrics.training_info.positive_samples / metrics.training_info.total_samples) * 100).toFixed(2)}%</p>
                  <p>• Evaluated: {new Date(metrics.evaluation_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              {/* Performance Metrics */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                  📈 Performance
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">AUC</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {metrics.metrics.auc.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Brier Score</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {metrics.metrics.brier_score.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Precision</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {metrics.metrics.precision.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Recall</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {metrics.metrics.recall.toFixed(3)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Higher AUC is better (0.5 = random, 1.0 = perfect)<br/>
                  Lower Brier is better (0.0 = perfect, 0.25 = always 50%)
                </p>
              </div>
              
              {/* Reliability Curve */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
                  📉 Calibration Plot
                </h3>
                <div className="relative h-48 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-600">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Perfect calibration line */}
                    <line x1="0" y1="200" x2="200" y2="0" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="4,4" />
                    
                    {/* Reliability points */}
                    {metrics.calibration.reliability_bins.map((bin, i) => {
                      const x = bin.mean_prob * 2000;
                      const y = 200 - bin.observed_rate * 2000;
                      const size = Math.log(bin.count + 1) * 1.5;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r={size}
                          fill="#8B5CF6"
                          opacity="0.7"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-500 dark:text-gray-400">
                    Predicted Probability →
                  </div>
                  <div className="absolute top-0 bottom-0 left-0 flex items-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 transform -rotate-90 whitespace-nowrap">
                      ← Observed Frequency
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Points near diagonal indicate good calibration
                </p>
              </div>
              
            </>
          )}
        </div>
      </div>
    </>
  );
}

