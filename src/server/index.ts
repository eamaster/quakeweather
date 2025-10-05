import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './lib/types';
import quakesRoute from './routes/quakes';
import weatherRoute from './routes/weather';
import insightRoute from './routes/insight';
import predictRoute from './routes/predict';
import aftershockRoute from './routes/aftershock';
import explainRoute from './routes/explain';

const app = new Hono<{ Bindings: Env }>();

// Enable CORS with specific origins
app.use('*', cors({
  origin: ['https://hesam.me', 'https://quakeweather.smah0085.workers.dev', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: ['quakes', 'weather', 'insights', 'predict', 'aftershock', 'explain'],
  });
});

// API routes
app.route('/api/quakes', quakesRoute);
app.route('/api/weather', weatherRoute);
app.route('/api/insight', insightRoute);
app.route('/api/predict', predictRoute);
app.route('/api/aftershock', aftershockRoute);
app.route('/api/explain', explainRoute);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'QuakeWeather API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      quakes: '/api/quakes',
      weather: '/api/weather',
      insight: '/api/insight',
      predict: '/api/predict (EXPERIMENTAL)',
      aftershock: '/api/aftershock (EXPERIMENTAL)',
      explain: '/api/explain (EXPERIMENTAL)',
    },
    disclaimer: 'Experimental prediction features are for educational use only. NOT for safety-critical decisions.',
  });
});

export default app;

