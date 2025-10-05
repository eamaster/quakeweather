// Backtest configuration for earthquake nowcasting model training
// This config uses SE Asia (Malaysia + Indonesia) as the primary region
// with global fallback capabilities

export interface BacktestConfig {
  // Region definition
  bbox: [number, number, number, number];  // [minLon, minLat, maxLon, maxLat]
  cellDeg: number;                         // Grid cell size in degrees

  // Label parameters
  M0_label: number;                        // Minimum magnitude for positive labels
  horizons: number[];                      // Prediction horizons in days

  // Training period
  train_start: string;                     // ISO date or "now"
  train_end: string;                       // ISO date or "now"
  holdout_days: number;                    // Days to hold out for final test

  // Completeness guard
  Mc_min: number;                          // Minimum completeness magnitude

  // Feature extraction
  rate_windows_days: number[];             // Windows for rate calculation
  rate_radius_km: number;                  // Radius around cell for rate features
  include_weather: boolean;                // Include weather anomaly features
  weather_window_hours: number;            // +/- window for weather anomalies

  // ETAS kernel parameters
  etas: {
    K: number;
    alpha: number;
    p: number;
    c: number;
    q: number;
    d: number;
    M0: number;
    timeWindowDays: number;
    radiusKm: number;
  };
}

// Default configuration: SE Asia (Malaysia + Indonesia)
export const DEFAULT_CONFIG: BacktestConfig = {
  // Region: Malaysia + Indonesia
  bbox: [95, -12, 141, 7],  // [minLon, minLat, maxLon, maxLat]
  cellDeg: 0.25,

  // Labels
  M0_label: 4.5,            // Use 3.5 for dense regional models (CA/JP)
  horizons: [1, 3, 7],      // Predict 1, 3, and 7 days ahead

  // Training time
  train_start: "2010-01-01",  // Use 2015-01-01 if M0_label=3.5 regionally
  train_end: "now",           // Will resolve to yesterday
  holdout_days: 90,

  // Completeness guard
  Mc_min: 4.0,              // Use 3.0 for dense regions (CA/JP)

  // Features
  rate_windows_days: [7, 30, 90],
  rate_radius_km: 100,
  include_weather: true,    // Optional; drop if no lift
  weather_window_hours: 24, // +/- window to compute anomalies

  // ETAS kernel (for feature + aftershock ring)
  etas: {
    K: 0.02,
    alpha: 1.1,
    p: 1.2,
    c: 0.01,
    q: 1.5,
    d: 10.0,
    M0: 3.0,
    timeWindowDays: 90,
    radiusKm: 300
  }
};

// Preset configurations for different use cases
export const PRESETS: Record<string, BacktestConfig> = {
  global: {
    ...DEFAULT_CONFIG,
    bbox: [-180, -90, 180, 90],
    cellDeg: 0.5,
    M0_label: 4.5,
    horizons: [7],
    train_start: "2010-01-01",
    Mc_min: 4.0,
    include_weather: false,  // Too expensive for global
  },

  southeast_asia: {
    ...DEFAULT_CONFIG,
    bbox: [95, -12, 141, 7],
    cellDeg: 0.25,
    M0_label: 4.5,
    horizons: [1, 3, 7],
    train_start: "2010-01-01",
    Mc_min: 4.0,
  },

  california: {
    ...DEFAULT_CONFIG,
    bbox: [-125, 32, -114, 42],
    cellDeg: 0.25,
    M0_label: 3.5,
    horizons: [1, 3, 7],
    train_start: "2015-01-01",
    Mc_min: 3.0,
  },

  japan: {
    ...DEFAULT_CONFIG,
    bbox: [128, 30, 146, 46],
    cellDeg: 0.25,
    M0_label: 3.5,
    horizons: [1, 3, 7],
    train_start: "2015-01-01",
    Mc_min: 3.0,
  },

  new_zealand: {
    ...DEFAULT_CONFIG,
    bbox: [165, -48, 180, -34],
    cellDeg: 0.25,
    M0_label: 3.5,
    horizons: [1, 3, 7],
    train_start: "2015-01-01",
    Mc_min: 3.0,
  },

  // Pacific Ring of Fire (extended)
  ring_of_fire: {
    ...DEFAULT_CONFIG,
    bbox: [120, -50, -60, 60],
    cellDeg: 0.5,
    M0_label: 4.5,
    horizons: [7],
    train_start: "2010-01-01",
    Mc_min: 4.0,
    include_weather: false,
  },
};

export default DEFAULT_CONFIG;

