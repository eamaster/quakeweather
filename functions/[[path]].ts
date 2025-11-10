import { handle } from 'hono/cloudflare-pages';
import app from '../src/server/index';

export const onRequest: typeof handle = async (context) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  
  // Only handle API routes through Hono
  // API routes: /api/* or /quakeweather/api/*
  if (pathname.startsWith('/api') || pathname.startsWith('/quakeweather/api')) {
    // Strip /quakeweather prefix if present
    const apiPath = pathname.startsWith('/quakeweather') 
      ? pathname.replace('/quakeweather', '')
      : pathname;
    
    // Store original URL in a header so routes can access it for model loading
    const newUrl = new URL(apiPath + url.search, url.origin);
    const newHeaders = new Headers(context.request.headers);
    newHeaders.set('X-Original-Url', context.request.url);
    
    const newRequest = new Request(newUrl, {
      method: context.request.method,
      headers: newHeaders,
      body: context.request.body,
    });
    
    const newContext = {
      ...context,
      request: newRequest,
    } as any;
    
    return handle(app)(newContext);
  }
  
  // For all other routes (/, /quakeweather/, /assets/*, etc.)
  // Let Cloudflare Pages serve static files
  return context.next();
};

