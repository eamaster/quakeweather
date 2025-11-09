import { handle } from 'hono/cloudflare-pages';
import app from '../src/server/index';

export const onRequest: typeof handle = async (context) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  
  // Handle API routes with base path
  if (pathname.startsWith('/quakeweather/api')) {
    // Store original URL in a header so routes can access it for model loading
    const originalUrl = context.request.url;
    const newPathname = pathname.replace('/quakeweather', '');
    const newUrl = new URL(newPathname + url.search, url.origin);
    
    // Create new headers with original URL
    const newHeaders = new Headers(context.request.headers);
    newHeaders.set('X-Original-Url', originalUrl);
    
    const newRequest = new Request(newUrl, {
      method: context.request.method,
      headers: newHeaders,
      body: context.request.body,
    });
    
    // Create a new context with the modified request
    const newContext = {
      ...context,
      request: newRequest,
    } as any;
    
    return handle(app)(newContext);
  }
  
  // Handle /quakeweather/ root - serve index.html with correct base path
  if (pathname === '/quakeweather' || pathname === '/quakeweather/') {
    try {
      // Try to fetch index.html from assets
      const indexUrl = new URL('/index.html', url.origin);
      const indexResponse = await (context.env as any).ASSETS?.fetch(indexUrl);
      
      if (indexResponse?.ok) {
        const html = await indexResponse.text();
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache',
          },
        });
      }
    } catch (e) {
      // Fall through to default handling
    }
  }
  
  // Handle static assets under /quakeweather/
  if (pathname.startsWith('/quakeweather/assets/') || pathname.startsWith('/quakeweather/models/')) {
    // Remove /quakeweather prefix to get actual asset path
    const assetPath = pathname.replace('/quakeweather', '');
    const assetUrl = new URL(assetPath, url.origin);
    
    try {
      const assetResponse = await (context.env as any).ASSETS?.fetch(assetUrl);
      if (assetResponse?.ok) {
        return assetResponse;
      }
    } catch (e) {
      // Fall through to default handling
    }
  }
  
  // For other routes, use standard Hono handling
  return handle(app)(context);
};

