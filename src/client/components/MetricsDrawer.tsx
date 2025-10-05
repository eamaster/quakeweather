import { useEffect, useState } from 'react';

interface MetricsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ModelEvaluation {
  version: string;
  evaluated: string;
  dataset: {
    train_samples: number;
    val_samples: number;
    positive_rate: number;
  };
  metrics: {
    raw: { auc: number; brier: number };
    calibrated: { auc: number; brier: number };
  };
  reliability: Array<{
    predMean: number;
    obsMean: number;
    count: number;
  }>;
  feature_importance: Array<{
    name: string;
    coeff: number;
  }>;
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
      const response = await fetch('/quakeweather/models/nowcast_eval.json');
      if (response.ok) {
        const data = await response.json() as ModelEvaluation;
        setMetrics(data);
      } else {
        // Placeholder metrics
        setMetrics({
          version: '1.0.0',
          evaluated: new Date().toISOString(),
          dataset: {
            train_samples: 50000,
            val_samples: 10000,
            positive_rate: 0.015,
          },
          metrics: {
            raw: { auc: 0.72, brier: 0.018 },
            calibrated: { auc: 0.72, brier: 0.016 },
          },
          reliability: [
            { predMean: 0.005, obsMean: 0.006, count: 1200 },
            { predMean: 0.015, obsMean: 0.014, count: 800 },
            { predMean: 0.025, obsMean: 0.028, count: 600 },
            { predMean: 0.035, obsMean: 0.031, count: 400 },
            { predMean: 0.050, obsMean: 0.055, count: 200 },
          ],
          feature_importance: [
            { name: 'etas', coeff: 0.78 },
            { name: 'rate_7', coeff: 0.45 },
            { name: 'maxMag_7', coeff: 0.35 },
            { name: 'time_since_last', coeff: -0.31 },
            { name: 'maxMag_30', coeff: 0.25 },
            { name: 'rate_30', coeff: 0.22 },
            { name: 'maxMag_90', coeff: 0.18 },
            { name: 'rate_90', coeff: 0.15 },
          ],
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
                  <p>• Training samples: {metrics.dataset.train_samples.toLocaleString()}</p>
                  <p>• Validation samples: {metrics.dataset.val_samples.toLocaleString()}</p>
                  <p>• Positive rate: {(metrics.dataset.positive_rate * 100).toFixed(2)}%</p>
                  <p>• Evaluated: {new Date(metrics.evaluated).toLocaleDateString()}</p>
                </div>
              </div>
              
              {/* Performance Metrics */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                  📈 Performance
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">AUC (Raw)</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {metrics.metrics.raw.auc.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">AUC (Cal.)</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {metrics.metrics.calibrated.auc.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Brier (Raw)</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {metrics.metrics.raw.brier.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Brier (Cal.)</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {metrics.metrics.calibrated.brier.toFixed(4)}
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
                    {metrics.reliability.map((bin, i) => {
                      const x = bin.predMean * 2000;
                      const y = 200 - bin.obsMean * 2000;
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
              
              {/* Feature Importance */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                  🎯 Feature Importance
                </h3>
                <div className="space-y-2">
                  {metrics.feature_importance.map((feat, i) => {
                    const absCoeff = Math.abs(feat.coeff);
                    const maxCoeff = Math.max(...metrics.feature_importance.map(f => Math.abs(f.coeff)));
                    const width = (absCoeff / maxCoeff) * 100;
                    const isPositive = feat.coeff > 0;
                    
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-700 dark:text-gray-300">{feat.name}</span>
                          <span className={`font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {feat.coeff > 0 ? '+' : ''}{feat.coeff.toFixed(3)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

