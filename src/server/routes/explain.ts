import { Hono } from 'hono';
import { Env } from '../lib/types';
import { CacheManager } from '../lib/cache';
import { RateLimiter } from '../lib/rateLimit';

const explainRoute = new Hono<{ Bindings: Env }>();

// Rate limiter: 30 requests per 10 minutes per IP
const rateLimiter = new RateLimiter(30, 600000);

/**
 * POST /api/explain
 * 
 * Generate natural language explanation of nowcast predictions using Cohere AI
 * 
 * Request body:
 * {
 *   topCells: Array<{lat, lon, probability}>,
 *   recentEvents: Array<{lat, lon, mag, time, place}>
 * }
 */
explainRoute.post('/', async (c) => {
  const clientIP = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
  
  // Rate limiting
  const rateLimit = await rateLimiter.checkLimit(clientIP);
  if (!rateLimit.allowed) {
    return c.json(
      {
        error: 'Rate limit exceeded',
        message: 'Maximum 30 requests per 10 minutes. Please wait before making more requests.',
      },
      429
    );
  }
  
  try {
    const cohereApiKey = c.env?.COHERE_API_KEY || 'REMOVED_COHERE_API_KEY';
    
    if (!cohereApiKey) {
      return c.json(
        {
          error: 'Cohere API not configured',
          message: 'COHERE_API_KEY environment variable is required for this feature',
        },
        501
      );
    }
    
    const body = await c.req.json();
    const { topCells, recentEvents } = body;
    
    if (!topCells || !Array.isArray(topCells) || topCells.length === 0) {
      return c.json(
        {
          error: 'Invalid request',
          message: 'topCells array is required',
        },
        400
      );
    }
    
    // Cache key based on top cells
    const cacheKey = `explain:${topCells.slice(0, 3).map((c: any) => `${c.lat.toFixed(2)},${c.lon.toFixed(2)}`).join(';')}`;
    const cache = new CacheManager();
    
    // Check cache (15 min TTL)
    const cached = await cache.get(cacheKey);
    if (cached && !cache.isStale(cacheKey, 900000)) {
      return c.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=900',
        },
      });
    }
    
    // Build prompt for Cohere
    const topCellsText = topCells.slice(0, 5).map((cell: any, i: number) => 
      `${i + 1}. Location: ${cell.lat.toFixed(2)}°, ${cell.lon.toFixed(2)}° - Probability: ${(cell.probability * 100).toFixed(1)}%`
    ).join('\n');
    
    const recentEventsText = (recentEvents || []).slice(0, 5).map((evt: any, i: number) => 
      `${i + 1}. M${evt.mag.toFixed(1)} ${evt.place || 'Unknown location'} - ${new Date(evt.time).toLocaleDateString()}`
    ).join('\n');
    
    const prompt = `You are explaining earthquake nowcast probabilities to a general audience. These are EXPERIMENTAL, educational probabilities based on seismic activity patterns, NOT deterministic predictions.

Context:
- We computed probabilistic forecasts for earthquake occurrence in the next 7 days
- The model uses historical seismicity patterns and ETAS (aftershock clustering) analysis
- Higher probabilities indicate areas with elevated seismic activity based on recent patterns

Top 5 High-Probability Areas:
${topCellsText}

Recent Significant Earthquakes:
${recentEventsText || 'No recent significant events'}

Write a brief (3-4 sentences) explanation for users that:
1. Identifies the regions with highest probability
2. Explains WHY (recent seismicity, aftershock patterns, or elevated background rates)
3. Emphasizes this is EXPERIMENTAL and for education only
4. Reminds users that earthquake prediction is not scientifically reliable

Keep it accessible, factual, and include the critical disclaimer about not using this for safety decisions.`;

    // Call Cohere v2 Chat API
    const cohereResponse = await fetch('https://api.cohere.com/v2/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cohereApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-a-03-2025',
        messages: [
          { role: 'system', content: 'You are a seismology narrator. Write concise, factual summaries. Summarize patterns in probabilities and recent quakes. Do NOT claim deterministic prediction; probabilities only. Educational tone. 1 short paragraph + 3 bullet points. Avoid safety advice.' },
          { role: 'user', content: prompt }
        ],
        stream: false
      }),
    });
    
    if (!cohereResponse.ok) {
      const errorText = await cohereResponse.text();
      console.error('Cohere API error:', cohereResponse.status, errorText);
      throw new Error(`Cohere API error: ${cohereResponse.status}`);
    }
    
    const cohereData = await cohereResponse.json() as any;
    // Extract text from v2 Chat response
    const explanation = cohereData?.message?.content?.map?.((p: any) => ('text' in p ? p.text : '')).join(' ').trim() ??
      cohereData?.text ??
      'Unable to generate explanation';
    
    const result = {
      explanation,
      generated: new Date().toISOString(),
      top_cells_analyzed: topCells.slice(0, 5),
      recent_events_analyzed: (recentEvents || []).slice(0, 5),
      disclaimer: 'EXPERIMENTAL AI-GENERATED EXPLANATION - Educational use only. Earthquake prediction is not scientifically reliable. Do not use for safety-critical decisions.',
    };
    
    // Cache result
    await cache.set(cacheKey, result, { ttl: 900000 });
    
    return c.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=900',
      },
    });
    
  } catch (error) {
    console.error('Error generating explanation:', error);
    return c.json(
      {
        error: 'Failed to generate explanation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default explainRoute;

