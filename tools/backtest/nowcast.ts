#!/usr/bin/env node
/**
 * QuakeWeather Nowcasting Model Training
 * 
 * This script:
 * 1. Fetches historical USGS earthquake data
 * 2. Extracts features (rates, ETAS intensity, time-since-last, maxMag)
 * 3. Labels cells (y=1 if M≥M0 event within horizon T)
 * 4. Fits L2 logistic regression
 * 5. Calibrates probabilities (Platt scaling)
 * 6. Evaluates (AUC, Brier, reliability)
 * 7. Writes public/models/nowcast.json and nowcast_eval.json
 * 
 * Educational use only. NOT a certified forecasting system.
 */

import * as fs from 'fs';
import * as path from 'path';
import { DEFAULT_CONFIG, BacktestConfig } from './config';
import { QuakeEvent, etasIntensity, haversineKm, DEFAULT_ETAS_PARAMS } from '../../src/server/lib/etas';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG: BacktestConfig = DEFAULT_CONFIG;
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'models');

// ============================================================================
// Data Fetching
// ============================================================================

interface USGSQuery {
  starttime: string;
  endtime: string;
  minmagnitude: number;
  minlatitude?: number;
  maxlatitude?: number;
  minlongitude?: number;
  maxlongitude?: number;
}

async function fetchUSGSData(query: USGSQuery): Promise<QuakeEvent[]> {
  const baseUrl = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
  const params = new URLSearchParams({
    format: 'geojson',
    orderby: 'time-asc',
    ...Object.fromEntries(
      Object.entries(query).map(([k, v]) => [k, String(v)])
    ),
  });

  console.log(`Fetching USGS data: ${query.starttime} to ${query.endtime}`);
  const response = await fetch(`${baseUrl}?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`USGS API error: ${response.status} ${response.statusText}`);
  }

  const geojson = await response.json();
  const features = geojson.features || [];
  
  const events: QuakeEvent[] = features
    .map((f: any) => {
      const coords = f.geometry?.coordinates || [];
      return {
        t: f.properties.time,
        lat: coords[1],
        lon: coords[0],
        mag: f.properties.mag,
      };
    })
    .filter((e: QuakeEvent) => 
      isFinite(e.t) && isFinite(e.lat) && isFinite(e.lon) && isFinite(e.mag)
    );

  console.log(`  → Fetched ${events.length} events`);
  return events;
}

// ============================================================================
// Feature Extraction
// ============================================================================

interface CellFeatures {
  lat: number;
  lon: number;
  time: number;
  
  // Seismicity rates
  rate_7: number;   // events/day in last 7 days within radius
  rate_30: number;  // events/day in last 30 days
  rate_90: number;  // events/day in last 90 days
  
  // Magnitude features
  maxMag_7: number;   // max magnitude in last 7 days
  maxMag_30: number;  // max magnitude in last 30 days
  maxMag_90: number;  // max magnitude in last 90 days
  
  // Temporal features
  time_since_last: number;  // days since last M≥M0 event within radius
  
  // ETAS intensity
  etas: number;  // λ from ETAS kernel
  
  // Label (target)
  label: number;  // 1 if M≥M0 event within horizon, 0 otherwise
}

function extractFeatures(
  lat: number,
  lon: number,
  time: number,
  allEvents: QuakeEvent[],
  config: BacktestConfig,
  horizon: number
): CellFeatures {
  const radiusKm = config.rate_radius_km;
  const timeMs = time;
  
  // Filter events before this time
  const pastEvents = allEvents.filter(e => e.t < timeMs);
  
  // Filter events within radius
  const nearbyEvents = pastEvents.filter(e => 
    haversineKm(lat, lon, e.lat, e.lon) <= radiusKm
  );
  
  // Calculate rates for different windows
  const rate7 = nearbyEvents.filter(e => timeMs - e.t <= 7 * 86400000).length / 7;
  const rate30 = nearbyEvents.filter(e => timeMs - e.t <= 30 * 86400000).length / 30;
  const rate90 = nearbyEvents.filter(e => timeMs - e.t <= 90 * 86400000).length / 90;
  
  // Calculate max magnitudes
  const events7 = nearbyEvents.filter(e => timeMs - e.t <= 7 * 86400000);
  const events30 = nearbyEvents.filter(e => timeMs - e.t <= 30 * 86400000);
  const events90 = nearbyEvents.filter(e => timeMs - e.t <= 90 * 86400000);
  
  const maxMag7 = events7.length > 0 ? Math.max(...events7.map(e => e.mag)) : 0;
  const maxMag30 = events30.length > 0 ? Math.max(...events30.map(e => e.mag)) : 0;
  const maxMag90 = events90.length > 0 ? Math.max(...events90.map(e => e.mag)) : 0;
  
  // Time since last significant event
  const significantEvents = nearbyEvents.filter(e => e.mag >= config.M0_label);
  const timeSinceLast = significantEvents.length > 0
    ? (timeMs - Math.max(...significantEvents.map(e => e.t))) / 86400000
    : 999;  // Large value if no recent events
  
  // ETAS intensity
  const etas = etasIntensity(pastEvents, timeMs, lat, lon, config.etas);
  
  // Label: check if any M≥M0 event occurs within horizon
  const futureEvents = allEvents.filter(e => 
    e.t >= timeMs && 
    e.t < timeMs + horizon * 86400000 &&
    e.mag >= config.M0_label &&
    haversineKm(lat, lon, e.lat, e.lon) <= radiusKm
  );
  const label = futureEvents.length > 0 ? 1 : 0;
  
  return {
    lat,
    lon,
    time,
    rate_7: rate7,
    rate_30: rate30,
    rate_90: rate90,
    maxMag_7: maxMag7,
    maxMag_30: maxMag30,
    maxMag_90: maxMag90,
    time_since_last: Math.min(timeSinceLast, 999),
    etas,
    label,
  };
}

// ============================================================================
// Logistic Regression (L2 regularized)
// ============================================================================

interface LogisticModel {
  intercept: number;
  coeffs: Record<string, number>;
  featureNames: string[];
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-Math.max(-50, Math.min(50, z))));
}

function predict(features: Record<string, number>, model: LogisticModel): number {
  let z = model.intercept;
  for (const name of model.featureNames) {
    z += (features[name] || 0) * (model.coeffs[name] || 0);
  }
  return sigmoid(z);
}

function trainLogisticRegression(
  samples: CellFeatures[],
  lambda: number = 0.01,  // L2 regularization
  learningRate: number = 0.01,
  maxIter: number = 1000
): LogisticModel {
  const featureNames = ['rate_7', 'rate_30', 'rate_90', 'maxMag_7', 'maxMag_30', 'maxMag_90', 'time_since_last', 'etas'];
  
  // Initialize weights
  let intercept = 0;
  const coeffs: Record<string, number> = {};
  featureNames.forEach(name => coeffs[name] = 0);
  
  // Normalize features
  const means: Record<string, number> = {};
  const stds: Record<string, number> = {};
  
  for (const name of featureNames) {
    const values = samples.map(s => (s as any)[name] || 0);
    means[name] = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - means[name]) ** 2, 0) / values.length;
    stds[name] = Math.sqrt(variance) || 1;
  }
  
  // Gradient descent with class weighting
  const positives = samples.filter(s => s.label === 1).length;
  const negatives = samples.length - positives;
  const posWeight = negatives / positives;  // Balance classes
  
  console.log(`Training logistic regression: ${samples.length} samples (${positives} positive, ${negatives} negative)`);
  console.log(`Positive weight: ${posWeight.toFixed(2)}`);
  
  for (let iter = 0; iter < maxIter; iter++) {
    let totalLoss = 0;
    let dIntercept = 0;
    const dCoeffs: Record<string, number> = {};
    featureNames.forEach(name => dCoeffs[name] = 0);
    
    // Compute gradients
    for (const sample of samples) {
      const normalized: Record<string, number> = {};
      for (const name of featureNames) {
        normalized[name] = ((sample as any)[name] - means[name]) / stds[name];
      }
      
      const pred = predict(normalized, { intercept, coeffs, featureNames });
      const weight = sample.label === 1 ? posWeight : 1;
      const error = (pred - sample.label) * weight;
      
      dIntercept += error;
      for (const name of featureNames) {
        dCoeffs[name] += error * normalized[name];
      }
      
      // Log loss
      const y = sample.label;
      totalLoss += -weight * (y * Math.log(pred + 1e-10) + (1 - y) * Math.log(1 - pred + 1e-10));
    }
    
    // Update weights with L2 regularization
    intercept -= learningRate * dIntercept / samples.length;
    for (const name of featureNames) {
      coeffs[name] -= learningRate * (dCoeffs[name] / samples.length + lambda * coeffs[name]);
    }
    
    if (iter % 100 === 0) {
      console.log(`  Iter ${iter}: Loss = ${(totalLoss / samples.length).toFixed(4)}`);
    }
  }
  
  // Store normalized coefficients
  const finalCoeffs: Record<string, number> = {};
  for (const name of featureNames) {
    finalCoeffs[name] = coeffs[name] / stds[name];
  }
  const finalIntercept = intercept - featureNames.reduce((sum, name) => 
    sum + coeffs[name] * means[name] / stds[name], 0
  );
  
  return {
    intercept: finalIntercept,
    coeffs: finalCoeffs,
    featureNames,
  };
}

// ============================================================================
// Calibration (Platt Scaling)
// ============================================================================

interface CalibrationParams {
  A: number;
  B: number;
}

function plattScaling(predictions: number[], labels: number[]): CalibrationParams {
  // Fit P_calibrated = sigmoid(A * logit(P_raw) + B)
  // Simplified: use linear fit in logit space
  
  let A = 1.0;
  let B = 0.0;
  
  // Simple Newton's method for 100 iterations
  for (let iter = 0; iter < 100; iter++) {
    let gradA = 0, gradB = 0;
    let hessAA = 0, hessAB = 0, hessBB = 0;
    
    for (let i = 0; i < predictions.length; i++) {
      const p = Math.max(1e-10, Math.min(1 - 1e-10, predictions[i]));
      const logitP = Math.log(p / (1 - p));
      const z = A * logitP + B;
      const pCal = sigmoid(z);
      const y = labels[i];
      
      const diff = pCal - y;
      const weight = pCal * (1 - pCal);
      
      gradA += diff * logitP;
      gradB += diff;
      
      hessAA += weight * logitP * logitP;
      hessAB += weight * logitP;
      hessBB += weight;
    }
    
    // Newton step
    const det = hessAA * hessBB - hessAB * hessAB;
    if (Math.abs(det) < 1e-10) break;
    
    const dA = -(hessBB * gradA - hessAB * gradB) / det;
    const dB = -(-hessAB * gradA + hessAA * gradB) / det;
    
    A += dA * 0.1;  // Learning rate
    B += dB * 0.1;
    
    if (Math.abs(dA) < 1e-6 && Math.abs(dB) < 1e-6) break;
  }
  
  return { A, B };
}

function applyCalibration(p: number, cal: CalibrationParams): number {
  const pSafe = Math.max(1e-10, Math.min(1 - 1e-10, p));
  const logitP = Math.log(pSafe / (1 - pSafe));
  return sigmoid(cal.A * logitP + cal.B);
}

// ============================================================================
// Evaluation Metrics
// ============================================================================

function computeAUC(predictions: number[], labels: number[]): number {
  // Sort by prediction descending
  const pairs = predictions.map((p, i) => ({ p, y: labels[i] }))
    .sort((a, b) => b.p - a.p);
  
  let auc = 0;
  let positives = 0;
  let negatives = 0;
  
  for (const pair of pairs) {
    if (pair.y === 1) {
      positives++;
    } else {
      auc += positives;
      negatives++;
    }
  }
  
  return positives === 0 || negatives === 0 ? 0.5 : auc / (positives * negatives);
}

function computeBrier(predictions: number[], labels: number[]): number {
  let sum = 0;
  for (let i = 0; i < predictions.length; i++) {
    sum += (predictions[i] - labels[i]) ** 2;
  }
  return sum / predictions.length;
}

function computeReliability(predictions: number[], labels: number[], nBins: number = 10): any[] {
  const bins: { predMean: number; obsMean: number; count: number }[] = [];
  
  for (let b = 0; b < nBins; b++) {
    const low = b / nBins;
    const high = (b + 1) / nBins;
    
    const inBin = predictions
      .map((p, i) => ({ p, y: labels[i] }))
      .filter(pair => pair.p >= low && pair.p < high);
    
    if (inBin.length > 0) {
      const predMean = inBin.reduce((sum, x) => sum + x.p, 0) / inBin.length;
      const obsMean = inBin.reduce((sum, x) => sum + x.y, 0) / inBin.length;
      bins.push({ predMean, obsMean, count: inBin.length });
    }
  }
  
  return bins;
}

// ============================================================================
// Grid Generation
// ============================================================================

function generateGrid(config: BacktestConfig): { lat: number; lon: number }[] {
  const [minLon, minLat, maxLon, maxLat] = config.bbox;
  const cells: { lat: number; lon: number }[] = [];
  
  const rows = Math.ceil((maxLat - minLat) / config.cellDeg);
  const cols = Math.ceil((maxLon - minLon) / config.cellDeg);
  
  for (let i = 0; i < rows; i++) {
    const lat = minLat + (i + 0.5) * config.cellDeg;
    for (let j = 0; j < cols; j++) {
      const lon = minLon + (j + 0.5) * config.cellDeg;
      cells.push({ lat, lon });
    }
  }
  
  return cells;
}

// ============================================================================
// Main Training Pipeline
// ============================================================================

async function main() {
  console.log('════════════════════════════════════════');
  console.log('  QuakeWeather Nowcast Model Training');
  console.log('════════════════════════════════════════\n');
  
  // 1. Fetch training data
  console.log('Step 1: Fetching historical earthquake data...\n');
  
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - CONFIG.holdout_days);
  const startDate = CONFIG.train_start === 'now' 
    ? new Date(endDate.getTime() - 365 * 86400000)
    : new Date(CONFIG.train_start);
  
  const allEvents = await fetchUSGSData({
    starttime: startDate.toISOString().split('T')[0],
    endtime: endDate.toISOString().split('T')[0],
    minmagnitude: Math.max(CONFIG.Mc_min - 1, 2.5),  // Fetch slightly below threshold
    minlatitude: CONFIG.bbox[1],
    maxlatitude: CONFIG.bbox[3],
    minlongitude: CONFIG.bbox[0],
    maxlongitude: CONFIG.bbox[2],
  });
  
  console.log(`\n✓ Loaded ${allEvents.length} events from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`);
  
  // 2. Generate grid
  console.log('Step 2: Generating spatial grid...\n');
  const gridCells = generateGrid(CONFIG);
  console.log(`✓ Generated ${gridCells.length} grid cells (${CONFIG.cellDeg}° resolution)\n`);
  
  // 3. Extract features for each horizon
  console.log('Step 3: Extracting features and labels...\n');
  
  const horizon = CONFIG.horizons[0];  // Use primary horizon for training
  console.log(`Using horizon: ${horizon} days\n`);
  
  // Sample time points for training (every 7 days to reduce computation)
  const timePoints: number[] = [];
  const trainStart = startDate.getTime() + 90 * 86400000;  // Skip first 90 days (need history)
  const trainEnd = endDate.getTime() - horizon * 86400000;   // Leave room for labels
  
  for (let t = trainStart; t < trainEnd; t += 7 * 86400000) {
    timePoints.push(t);
  }
  
  console.log(`Sampling ${timePoints.length} time points...\n`);
  
  const samples: CellFeatures[] = [];
  let sampleCount = 0;
  const totalSamples = timePoints.length * gridCells.length;
  
  for (const t of timePoints) {
    for (const cell of gridCells) {
      const features = extractFeatures(cell.lat, cell.lon, t, allEvents, CONFIG, horizon);
      samples.push(features);
      
      sampleCount++;
      if (sampleCount % 10000 === 0) {
        console.log(`  Extracted ${sampleCount} / ${totalSamples} samples (${(sampleCount/totalSamples*100).toFixed(1)}%)`);
      }
    }
  }
  
  const positives = samples.filter(s => s.label === 1).length;
  console.log(`\n✓ Extracted ${samples.length} samples (${positives} positive, ${samples.length - positives} negative)\n`);
  console.log(`  Positive rate: ${(positives / samples.length * 100).toFixed(2)}%\n`);
  
  // 4. Train-validation split (temporal)
  console.log('Step 4: Splitting data (temporal validation)...\n');
  
  const splitTime = trainEnd - 180 * 86400000;  // Last 6 months for validation
  const trainSamples = samples.filter(s => s.time < splitTime);
  const valSamples = samples.filter(s => s.time >= splitTime);
  
  console.log(`✓ Train: ${trainSamples.length} samples, Validation: ${valSamples.length} samples\n`);
  
  // 5. Train model
  console.log('Step 5: Training logistic regression model...\n');
  
  const model = trainLogisticRegression(trainSamples, 0.01, 0.01, 1000);
  
  console.log('\n✓ Model trained!\n');
  console.log('Coefficients:');
  console.log(`  Intercept: ${model.intercept.toFixed(4)}`);
  for (const name of model.featureNames) {
    console.log(`  ${name}: ${model.coeffs[name].toFixed(4)}`);
  }
  console.log();
  
  // 6. Evaluate on validation set
  console.log('Step 6: Evaluating model on validation set...\n');
  
  const valPreds = valSamples.map(s => predict(s as any, model));
  const valLabels = valSamples.map(s => s.label);
  
  const aucRaw = computeAUC(valPreds, valLabels);
  const brierRaw = computeBrier(valPreds, valLabels);
  
  console.log(`✓ Raw model performance:`);
  console.log(`  AUC: ${aucRaw.toFixed(4)}`);
  console.log(`  Brier Score: ${brierRaw.toFixed(4)}\n`);
  
  // 7. Calibrate probabilities
  console.log('Step 7: Calibrating probabilities (Platt scaling)...\n');
  
  const calibration = plattScaling(valPreds, valLabels);
  console.log(`✓ Calibration parameters: A=${calibration.A.toFixed(4)}, B=${calibration.B.toFixed(4)}\n`);
  
  const valPredsCal = valPreds.map(p => applyCalibration(p, calibration));
  const aucCal = computeAUC(valPredsCal, valLabels);
  const brierCal = computeBrier(valPredsCal, valLabels);
  
  console.log(`✓ Calibrated model performance:`);
  console.log(`  AUC: ${aucCal.toFixed(4)}`);
  console.log(`  Brier Score: ${brierCal.toFixed(4)}\n`);
  
  // 8. Compute reliability curve
  console.log('Step 8: Computing reliability curve...\n');
  
  const reliability = computeReliability(valPredsCal, valLabels, 10);
  console.log(`✓ Reliability curve computed (${reliability.length} bins)\n`);
  
  // 9. Save model and evaluation
  console.log('Step 9: Saving model and evaluation results...\n');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Save model
  const modelOutput = {
    version: '1.0.0',
    trained: new Date().toISOString(),
    config: {
      bbox: CONFIG.bbox,
      cellDeg: CONFIG.cellDeg,
      M0_label: CONFIG.M0_label,
      horizon: horizon,
      Mc_min: CONFIG.Mc_min,
    },
    model: {
      intercept: model.intercept,
      coeffs: model.coeffs,
      featureNames: model.featureNames,
    },
    calibration: {
      A: calibration.A,
      B: calibration.B,
    },
    etas_params: CONFIG.etas,
  };
  
  const modelPath = path.join(OUTPUT_DIR, 'nowcast.json');
  fs.writeFileSync(modelPath, JSON.stringify(modelOutput, null, 2));
  console.log(`✓ Model saved to: ${modelPath}\n`);
  
  // Save evaluation
  const evalOutput = {
    version: '1.0.0',
    evaluated: new Date().toISOString(),
    dataset: {
      train_samples: trainSamples.length,
      val_samples: valSamples.length,
      positive_rate: positives / samples.length,
    },
    metrics: {
      raw: {
        auc: aucRaw,
        brier: brierRaw,
      },
      calibrated: {
        auc: aucCal,
        brier: brierCal,
      },
    },
    reliability: reliability,
    feature_importance: model.featureNames.map(name => ({
      name,
      coeff: model.coeffs[name],
    })).sort((a, b) => Math.abs(b.coeff) - Math.abs(a.coeff)),
  };
  
  const evalPath = path.join(OUTPUT_DIR, 'nowcast_eval.json');
  fs.writeFileSync(evalPath, JSON.stringify(evalOutput, null, 2));
  console.log(`✓ Evaluation saved to: ${evalPath}\n`);
  
  console.log('════════════════════════════════════════');
  console.log('  Training Complete! 🎉');
  console.log('════════════════════════════════════════\n');
  console.log('Summary:');
  console.log(`  • Model: ${modelPath}`);
  console.log(`  • Evaluation: ${evalPath}`);
  console.log(`  • AUC (calibrated): ${aucCal.toFixed(4)}`);
  console.log(`  • Brier (calibrated): ${brierCal.toFixed(4)}`);
  console.log('\nNext steps:');
  console.log('  1. Review evaluation metrics');
  console.log('  2. Deploy model to production (already in public/models/)');
  console.log('  3. Test /api/predict endpoint');
  console.log('\n⚠️  EDUCATIONAL USE ONLY - Not for safety-critical decisions!\n');
}

// ============================================================================
// Run
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Error during training:', error);
    process.exit(1);
  });
}

export { extractFeatures, trainLogisticRegression, plattScaling, computeAUC, computeBrier };

