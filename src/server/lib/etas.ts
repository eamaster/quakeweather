// etas.ts — minimal ETAS-style kernel for QuakeWeather
// Educational use; NOT a certified forecasting system.

export type QuakeEvent = {
  t: number;      // event time in ms since epoch
  lat: number;    // degrees
  lon: number;    // degrees
  mag: number;    // moment magnitude (Mw)
};

export type EtasParams = {
  // Overall productivity; scale via backtests
  K: number;          // ~ 0.005–0.1
  // Magnitude productivity
  alpha: number;      // ~ 0.8–1.5
  // Temporal decay (Omori)
  p: number;          // ~ 1.0–1.3
  c: number;          // days, small positive (prevents singularity), ~ 0.001–0.1
  // Spatial decay
  q: number;          // ~ 1.2–2.0
  d: number;          // km, spatial core size ~ 5–20
  // Reference mag for productivity "anchor"
  M0: number;         // baseline, e.g., 3.0
  // Cutoffs to limit computation
  timeWindowDays: number;  // only include events within this many days
  radiusKm: number;        // only include events within this radius
};

export const DEFAULT_ETAS_PARAMS: EtasParams = {
  K: 0.02,
  alpha: 1.1,
  p: 1.2,
  c: 0.01,       // days
  q: 1.5,
  d: 10.0,       // km
  M0: 3.0,
  timeWindowDays: 90,
  radiusKm: 300
};

const R_EARTH_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const days = (ms: number) => ms / 86_400_000;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_EARTH_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * ETAS-style expected rate λ (events per day) at (lat0, lon0) at time t0,
 * summing contributions from past events within timeWindowDays and radiusKm.
 */
export function etasIntensity(
  events: QuakeEvent[],
  t0: number,
  lat0: number,
  lon0: number,
  params: Partial<EtasParams> = {}
): number {
  const P = { ...DEFAULT_ETAS_PARAMS, ...params };
  const t0d = days(t0);

  let lambda = 0;
  for (const e of events) {
    const dtDays = Math.max(t0d - days(e.t), 1e-9);
    if (dtDays > P.timeWindowDays) continue;

    const rKm = haversineKm(lat0, lon0, e.lat, e.lon);
    if (rKm > P.radiusKm) continue;

    // Temporal term (Omori): (t + c)^(-p)
    const timeTerm = Math.pow(dtDays + P.c, -P.p);

    // Magnitude productivity: exp(alpha * (M - M0))
    const magTerm = Math.exp(P.alpha * (e.mag - P.M0));

    // Spatial term: (r^2 + d^2)^(-q/2)
    const spaceTerm = Math.pow(rKm * rKm + P.d * P.d, -P.q / 2);

    lambda += P.K * magTerm * timeTerm * spaceTerm;
  }
  return lambda; // expected events per day near (lat0, lon0)
}

/** Convert daily rate to probability of ≥1 event in next T days under Poisson. */
export function probAtLeastOne(lambdaPerDay: number, horizonDays: number): number {
  const x = -lambdaPerDay * horizonDays;
  // guard against tiny negative due to FP
  return 1 - Math.exp(Math.max(-50, x));
}

/** Convenience: compute ETAS λ and P on a lat/lon grid for heatmaps */
export function etasGrid(
  bbox: [number, number, number, number],   // [minLon, minLat, maxLon, maxLat]
  cellDeg: number,
  events: QuakeEvent[],
  t0: number,
  horizonDays: number,
  params: Partial<EtasParams> = {}
) {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const rows = Math.max(1, Math.ceil((maxLat - minLat) / cellDeg));
  const cols = Math.max(1, Math.ceil((maxLon - minLon) / cellDeg));
  const out: { lat: number; lon: number; lambda: number; p: number }[] = [];

  for (let i = 0; i < rows; i++) {
    const lat = minLat + (i + 0.5) * cellDeg;
    for (let j = 0; j < cols; j++) {
      const lon = minLon + (j + 0.5) * cellDeg;
      const lambda = etasIntensity(events, t0, lat, lon, params);
      const p = probAtLeastOne(lambda, horizonDays);
      out.push({ lat, lon, lambda, p });
    }
  }
  return { cells: out, rows, cols, cellDeg, bbox, horizonDays };
}

/** Helper to parse USGS GeoJSON features into QuakeEvent[] */
export function parseUSGSGeoJSON(geojson: any): QuakeEvent[] {
  const feats = Array.isArray(geojson?.features) ? geojson.features : [];
  return feats
    .map((f: any) => {
      const props = f?.properties || {};
      const coords = f?.geometry?.coordinates || [];
      const lon = Number(coords[0]);
      const lat = Number(coords[1]);
      const mag = Number(props.mag);
      const t = Number(props.time);
      if (!isFinite(lat) || !isFinite(lon) || !isFinite(mag) || !isFinite(t)) return null;
      return { t, lat, lon, mag } as QuakeEvent;
    })
    .filter(Boolean) as QuakeEvent[];
}

