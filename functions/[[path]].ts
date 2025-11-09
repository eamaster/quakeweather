import { handle } from 'hono/cloudflare-pages';
import app from '../src/server/index';

export const onRequest: typeof handle = async (context) => {
  // Strip base path if app is deployed at a sub-path (e.g., /quakeweather)
  // This allows API routes to work regardless of deployment path
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  
  // Check if path starts with /quakeweather/api and strip it for API routes
  // This allows the app to work at both root and sub-path deployments
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
  
  // For non-API routes or root deployment, use standard handling
  return handle(app)(context);
};

