import type { PagesFunction } from '@cloudflare/workers-types';

export const onRequest: PagesFunction = async (context) => {
  // Add security headers to all responses
  // Let _redirects file handle routing for /quakeweather/ paths
  const response = await context.next();
  
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
};

