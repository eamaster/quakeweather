#!/usr/bin/env node
/**
 * Unit tests for ETAS calculations and prediction features
 * Run with: npx tsx tools/backtest/test-etas.ts
 */

import { QuakeEvent, etasIntensity, probAtLeastOne, haversineKm, etasGrid, DEFAULT_ETAS_PARAMS } from '../../src/server/lib/etas';

// Test utilities
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertClose(actual: number, expected: number, tolerance: number, message: string) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

// ============================================================================
// Test Suite
// ============================================================================

console.log('════════════════════════════════════════');
console.log('  QuakeWeather ETAS Unit Tests');
console.log('════════════════════════════════════════\n');

let testsRun = 0;
let testsPassed = 0;

function test(name: string, fn: () => void) {
  testsRun++;
  try {
    fn();
    testsPassed++;
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Test 1: Haversine distance
test('Haversine distance calculation', () => {
  // Distance from LA to SF (approx 559 km)
  const d1 = haversineKm(34.05, -118.25, 37.77, -122.42);
  assertClose(d1, 559, 10, 'LA to SF distance');
  
  // Same point
  const d2 = haversineKm(0, 0, 0, 0);
  assertClose(d2, 0, 0.001, 'Same point distance');
  
  // Antipodal points (half Earth circumference ~20000 km)
  const d3 = haversineKm(0, 0, 0, 180);
  assertClose(d3, 20015, 100, 'Antipodal distance');
});

// Test 2: Probability conversion
test('Probability at least one event (Poisson)', () => {
  // Lambda = 1 event/day, T = 1 day → P ≈ 0.632
  const p1 = probAtLeastOne(1.0, 1);
  assertClose(p1, 0.632, 0.01, 'P(≥1) for λ=1, T=1');
  
  // Lambda = 0, T = any → P = 0
  const p2 = probAtLeastOne(0, 10);
  assertClose(p2, 0, 0.001, 'P(≥1) for λ=0');
  
  // Lambda = 0.1 event/day, T = 7 days → P ≈ 0.503
  const p3 = probAtLeastOne(0.1, 7);
  assertClose(p3, 0.503, 0.01, 'P(≥1) for λ=0.1, T=7');
  
  // Very small lambda
  const p4 = probAtLeastOne(0.001, 1);
  assert(p4 < 0.002 && p4 > 0.0009, 'Small lambda gives small probability');
});

// Test 3: ETAS intensity - no events
test('ETAS intensity with no events', () => {
  const events: QuakeEvent[] = [];
  const lambda = etasIntensity(events, Date.now(), 0, 0);
  assertClose(lambda, 0, 0.001, 'Zero intensity with no events');
});

// Test 4: ETAS intensity - single event
test('ETAS intensity with single recent event', () => {
  const now = Date.now();
  const yesterday = now - 86400000;  // 1 day ago
  
  const events: QuakeEvent[] = [{
    t: yesterday,
    lat: 34.0,
    lon: -118.0,
    mag: 5.0,
  }];
  
  // At the event location
  const lambda1 = etasIntensity(events, now, 34.0, -118.0);
  assert(lambda1 > 0, 'Non-zero intensity at event location');
  
  // Far away (1000 km)
  const lambda2 = etasIntensity(events, now, 44.0, -118.0);
  assert(lambda2 < lambda1 * 0.01, 'Much lower intensity far away');
  
  // Same location but much later (90 days)
  const later = now + 90 * 86400000;
  const lambda3 = etasIntensity(events, later, 34.0, -118.0);
  assert(lambda3 < lambda1 * 0.1, 'Decayed intensity after 90 days');
});

// Test 5: ETAS intensity - magnitude scaling
test('ETAS intensity magnitude scaling', () => {
  const now = Date.now();
  const yesterday = now - 86400000;
  
  const event1: QuakeEvent = { t: yesterday, lat: 0, lon: 0, mag: 4.0 };
  const event2: QuakeEvent = { t: yesterday, lat: 0, lon: 0, mag: 5.0 };
  const event3: QuakeEvent = { t: yesterday, lat: 0, lon: 0, mag: 6.0 };
  
  const lambda1 = etasIntensity([event1], now, 0, 0);
  const lambda2 = etasIntensity([event2], now, 0, 0);
  const lambda3 = etasIntensity([event3], now, 0, 0);
  
  assert(lambda2 > lambda1, 'M5.0 produces higher intensity than M4.0');
  assert(lambda3 > lambda2, 'M6.0 produces higher intensity than M5.0');
  
  // Should scale approximately exp(alpha * dM)
  const ratio21 = lambda2 / lambda1;
  const expectedRatio = Math.exp(DEFAULT_ETAS_PARAMS.alpha * 1.0);
  assertClose(ratio21, expectedRatio, expectedRatio * 0.1, 'Magnitude scaling factor');
});

// Test 6: ETAS intensity - temporal decay
test('ETAS intensity temporal decay (Omori)', () => {
  const now = Date.now();
  const event: QuakeEvent = { t: now - 86400000, lat: 0, lon: 0, mag: 5.0 };
  
  const lambda1 = etasIntensity([event], now, 0, 0);  // 1 day after
  const lambda7 = etasIntensity([event], now + 6 * 86400000, 0, 0);  // 7 days after
  const lambda30 = etasIntensity([event], now + 29 * 86400000, 0, 0);  // 30 days after
  
  assert(lambda1 > lambda7, 'Intensity decays from 1 to 7 days');
  assert(lambda7 > lambda30, 'Intensity decays from 7 to 30 days');
});

// Test 7: ETAS intensity - spatial decay
test('ETAS intensity spatial decay', () => {
  const now = Date.now();
  const event: QuakeEvent = { t: now - 86400000, lat: 0, lon: 0, mag: 5.0 };
  
  const lambda0 = etasIntensity([event], now, 0, 0);        // At epicenter
  const lambda10 = etasIntensity([event], now, 0.09, 0);    // ~10 km away
  const lambda50 = etasIntensity([event], now, 0.45, 0);    // ~50 km away
  const lambda100 = etasIntensity([event], now, 0.9, 0);    // ~100 km away
  
  assert(lambda0 > lambda10, 'Intensity decays at 10km');
  assert(lambda10 > lambda50, 'Intensity decays at 50km');
  assert(lambda50 > lambda100, 'Intensity decays at 100km');
});

// Test 8: ETAS intensity - multiple events
test('ETAS intensity with multiple events', () => {
  const now = Date.now();
  const events: QuakeEvent[] = [
    { t: now - 86400000, lat: 0, lon: 0, mag: 5.0 },
    { t: now - 2 * 86400000, lat: 0.1, lon: 0, mag: 4.5 },
    { t: now - 7 * 86400000, lat: 0, lon: 0.1, mag: 4.8 },
  ];
  
  const lambda = etasIntensity(events, now, 0, 0);
  const lambda1 = etasIntensity([events[0]], now, 0, 0);
  
  assert(lambda > lambda1, 'Multiple events increase intensity');
  assert(lambda < lambda1 * 10, 'Intensity is not unreasonably large');
});

// Test 9: ETAS grid
test('ETAS grid computation', () => {
  const now = Date.now();
  const events: QuakeEvent[] = [
    { t: now - 86400000, lat: 0, lon: 0, mag: 5.0 },
  ];
  
  const bbox: [number, number, number, number] = [-1, -1, 1, 1];
  const cellDeg = 0.5;
  const horizon = 7;
  
  const grid = etasGrid(bbox, cellDeg, events, now, horizon);
  
  assert(grid.cells.length > 0, 'Grid has cells');
  assert(grid.rows > 0 && grid.cols > 0, 'Grid has rows and columns');
  assert(grid.cells.length === grid.rows * grid.cols, 'Cell count matches grid dimensions');
  
  // Check that center cell exists (within grid bounds)
  const centerCell = grid.cells.find(c => Math.abs(c.lat) < cellDeg && Math.abs(c.lon) < cellDeg);
  assert(centerCell !== undefined, 'Center cell exists');
  if (centerCell) {
    assert(centerCell.lambda >= 0, 'Center cell has non-negative intensity');
    assert(centerCell.p >= 0 && centerCell.p <= 1, 'Center cell probability in valid range');
  }
});

// Test 10: Edge cases
test('ETAS edge cases', () => {
  const now = Date.now();
  
  // Very old event (beyond time window)
  const oldEvent: QuakeEvent = { t: now - 200 * 86400000, lat: 0, lon: 0, mag: 7.0 };
  const lambda1 = etasIntensity([oldEvent], now, 0, 0, { timeWindowDays: 90 });
  assertClose(lambda1, 0, 0.001, 'Event beyond time window contributes zero');
  
  // Very distant event (beyond radius)
  const distantEvent: QuakeEvent = { t: now - 86400000, lat: 0, lon: 0, mag: 7.0 };
  const lambda2 = etasIntensity([distantEvent], now, 10, 10, { radiusKm: 100 });
  assertClose(lambda2, 0, 0.001, 'Event beyond radius contributes zero');
  
  // Very small magnitude
  const smallEvent: QuakeEvent = { t: now - 86400000, lat: 0, lon: 0, mag: 1.0 };
  const lambda3 = etasIntensity([smallEvent], now, 0, 0);
  assert(lambda3 > 0 && lambda3 < 0.01, 'Small magnitude gives small intensity');
});

// Test 11: Probability bounds
test('Probability bounds checking', () => {
  // Very high lambda should saturate near 1.0
  const p1 = probAtLeastOne(100, 1);
  assertClose(p1, 1.0, 0.001, 'High rate gives probability near 1.0');
  
  // Lambda = 0 gives P = 0
  const p2 = probAtLeastOne(0, 100);
  assertClose(p2, 0, 0.001, 'Zero rate gives zero probability');
  
  // All probabilities in [0, 1]
  for (let lambda = 0; lambda <= 10; lambda += 0.1) {
    for (let T = 1; T <= 30; T += 5) {
      const p = probAtLeastOne(lambda, T);
      assert(p >= 0 && p <= 1, `Probability in [0,1] for λ=${lambda}, T=${T}`);
    }
  }
});

// Test 12: Realistic scenario
test('Realistic aftershock scenario', () => {
  // Simulate M6.0 mainshock with aftershocks
  const now = Date.now();
  const mainshock: QuakeEvent = { t: now - 3600000, lat: 35.0, lon: -120.0, mag: 6.0 };
  const aftershocks: QuakeEvent[] = [
    { t: now - 3000000, lat: 35.05, lon: -120.05, mag: 4.2 },
    { t: now - 2400000, lat: 35.02, lon: -120.02, mag: 3.8 },
    { t: now - 1800000, lat: 35.08, lon: -120.08, mag: 4.5 },
  ];
  
  const events = [mainshock, ...aftershocks];
  
  // Compute intensity at mainshock location
  const lambda = etasIntensity(events, now, 35.0, -120.0, {
    radiusKm: 150,
    timeWindowDays: 30,
  });
  
  assert(lambda > 0.1, 'High intensity after M6.0 mainshock');
  
  // Compute 72-hour probability
  const p72h = probAtLeastOne(lambda, 3);
  assert(p72h >= 0 && p72h <= 1, '72h aftershock probability in valid range');
  assert(p72h > 0.01, '72h aftershock probability is non-trivial after M6.0');
  
  console.log(`    M6.0 aftershock scenario: λ=${lambda.toFixed(3)}/day, P(72h)=${(p72h*100).toFixed(1)}%`);
});

// Test 13: Grid computation performance
test('Grid computation performance', () => {
  const now = Date.now();
  const events: QuakeEvent[] = Array.from({ length: 100 }, (_, i) => ({
    t: now - i * 86400000,
    lat: Math.random() * 10 - 5,
    lon: Math.random() * 10 - 5,
    mag: 3.0 + Math.random() * 3,
  }));
  
  const bbox: [number, number, number, number] = [-5, -5, 5, 5];
  const cellDeg = 0.5;
  
  const startTime = Date.now();
  const grid = etasGrid(bbox, cellDeg, events, now, 7);
  const elapsed = Date.now() - startTime;
  
  assert(grid.cells.length > 0, 'Grid computed successfully');
  assert(elapsed < 5000, `Grid computation completed in reasonable time (${elapsed}ms)`);
  
  console.log(`    Computed ${grid.cells.length} cells with ${events.length} events in ${elapsed}ms`);
});

// Test 14: Feature extraction consistency
test('Feature values are non-negative', () => {
  const now = Date.now();
  const events: QuakeEvent[] = [
    { t: now - 5 * 86400000, lat: 0, lon: 0, mag: 4.5 },
    { t: now - 15 * 86400000, lat: 0.1, lon: 0, mag: 3.8 },
    { t: now - 50 * 86400000, lat: 0, lon: 0.1, mag: 4.2 },
  ];
  
  const lambda = etasIntensity(events, now, 0, 0);
  
  assert(lambda >= 0, 'ETAS intensity is non-negative');
  assert(isFinite(lambda), 'ETAS intensity is finite');
});

// Test 15: Parameter sensitivity
test('ETAS parameter sensitivity', () => {
  const now = Date.now();
  const event: QuakeEvent = { t: now - 86400000, lat: 0, lon: 0, mag: 5.0 };
  
  // Varying K (productivity)
  const lambdaK1 = etasIntensity([event], now, 0, 0, { K: 0.01 });
  const lambdaK2 = etasIntensity([event], now, 0, 0, { K: 0.02 });
  assert(lambdaK2 > lambdaK1, 'Higher K increases intensity');
  assertClose(lambdaK2 / lambdaK1, 2.0, 0.1, 'K scales intensity linearly');
  
  // Varying alpha (magnitude productivity)
  const lambdaA1 = etasIntensity([event], now, 0, 0, { alpha: 0.8 });
  const lambdaA2 = etasIntensity([event], now, 0, 0, { alpha: 1.5 });
  assert(lambdaA2 > lambdaA1, 'Higher alpha increases magnitude sensitivity');
});

// Summary
console.log('\n════════════════════════════════════════');
console.log(`  Tests: ${testsPassed} / ${testsRun} passed`);
console.log('════════════════════════════════════════\n');

if (testsPassed === testsRun) {
  console.log('✅ All tests passed!\n');
  process.exit(0);
} else {
  console.log(`❌ ${testsRun - testsPassed} test(s) failed\n`);
  process.exit(1);
}

