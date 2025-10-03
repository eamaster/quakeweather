import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './lib/types';
import quakesRoute from './routes/quakes';
import weatherRoute from './routes/weather';
import insightRoute from './routes/insight';

const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use('*', cors());

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.route('/api/quakes', quakesRoute);
app.route('/api/weather', weatherRoute);
app.route('/api/insight', insightRoute);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'QuakeWeather API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      quakes: '/api/quakes',
      weather: '/api/weather',
      insight: '/api/insight',
    },
  });
});

export default app;

