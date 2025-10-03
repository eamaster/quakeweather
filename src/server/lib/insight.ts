import { QuakeFeature, WeatherResponse, InsightResponse } from './types';

export function generateInsight(
  quake: QuakeFeature,
  weather: WeatherResponse
): InsightResponse {
  const mag = quake.properties.mag || 0;
  const depth = quake.geometry.coordinates[2] || 0;
  const place = quake.properties.place || 'Unknown location';
  const time = new Date(quake.properties.time);
  
  const temp = weather.current.temp;
  const windSpeed = weather.current.wind_speed;
  const windGust = weather.current.wind_gust;
  const humidity = weather.current.humidity;
  const pressure = weather.current.pressure;
  const precipProb = weather.hourly?.[0]?.pop || 0;
  const weatherDesc = weather.current.weather[0]?.description || 'clear';

  // Magnitude classification
  let magClass = 'minor';
  if (mag >= 7) magClass = 'major';
  else if (mag >= 6) magClass = 'strong';
  else if (mag >= 5) magClass = 'moderate';
  else if (mag >= 4) magClass = 'light';

  // Generate main text
  const localTimeStr = time.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const text = `A magnitude ${mag.toFixed(1)} (${magClass}) earthquake occurred at ${depth.toFixed(
    1
  )} km depth ${place} on ${localTimeStr}. ${
    weather.approximate
      ? 'Current weather conditions (approximate)'
      : 'Weather conditions at the time'
  }: ${temp.toFixed(1)}°C, ${weatherDesc}, with winds at ${windSpeed.toFixed(1)} m/s${
    windGust ? ` (gusts to ${windGust.toFixed(1)} m/s)` : ''
  }.`;

  // Generate bullets
  const bullets: string[] = [];

  if (windSpeed > 10) {
    bullets.push(`Notable winds: ${windSpeed.toFixed(1)} m/s may affect response operations`);
  }

  if (precipProb > 0.6) {
    bullets.push(
      `High precipitation probability (${(precipProb * 100).toFixed(0)}%) in the forecast`
    );
  }

  if (pressure < 1000) {
    bullets.push(`Low atmospheric pressure: ${pressure.toFixed(0)} hPa`);
  }

  if (mag >= 5.0) {
    bullets.push(
      'Earthquake of this magnitude may be felt over a wide area and could cause damage near the epicenter'
    );
  }

  if (depth < 10) {
    bullets.push('Shallow depth may result in more intense surface shaking');
  }

  if (weather.alerts && weather.alerts.length > 0) {
    bullets.push(`Active weather alert: ${weather.alerts[0].event}`);
  }

  // Fallback bullet if none generated
  if (bullets.length === 0) {
    bullets.push(`Humidity: ${humidity}%, Pressure: ${pressure.toFixed(0)} hPa`);
  }

  const disclaimer =
    'This tool is for education and exploration only. Earthquake prediction is not scientifically reliable; outputs must not be used for safety-critical decisions. Weather and seismic activity are independent phenomena.';

  return {
    text,
    bullets: bullets.slice(0, 3), // Max 3 bullets
    disclaimer,
  };
}

