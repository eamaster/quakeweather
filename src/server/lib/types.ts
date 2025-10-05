export interface Env {
  OPENWEATHER_API_KEY: string;
  MAPBOX_TOKEN: string;
  COHERE_API_KEY?: string;
  CACHE_KV?: KVNamespace;
}

export interface QuakeFeature {
  type: 'Feature';
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    tz: number | null;
    url: string;
    detail: string;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: string | null;
    status: string;
    tsunami: number;
    sig: number;
    net: string;
    code: string;
    ids: string;
    sources: string;
    types: string;
    nst: number | null;
    dmin: number | null;
    rms: number;
    gap: number | null;
    magType: string;
    type: string;
    title: string;
    contextScore?: number;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number, number]; // [lon, lat, depth]
  };
  id: string;
}

export interface QuakeCollection {
  type: 'FeatureCollection';
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: QuakeFeature[];
}

export interface WeatherCurrent {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  pop?: number;
}

export interface WeatherHourly {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  wind_speed: number;
  wind_gust?: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  pop: number;
}

export interface WeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
}

export interface WeatherResponse {
  current: WeatherCurrent;
  hourly?: WeatherHourly[];
  daily?: any[];
  alerts?: WeatherAlert[];
  approximate?: boolean;
}

export interface InsightResponse {
  text: string;
  bullets: string[];
  disclaimer: string;
}

