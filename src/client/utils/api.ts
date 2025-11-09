/**
 * Get the base URL for API calls
 * Respects the Vite base path configuration
 */
export function getApiBaseUrl(): string {
  // In production with base path, use relative paths
  // This ensures API calls work from any deployment path
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // If base URL ends with /, remove it to avoid double slashes
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Return base URL (e.g., '/quakeweather' or '')
  return normalizedBase;
}

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - API endpoint (e.g., '/api/weather' or 'api/weather')
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Combine base URL with endpoint
  // If baseUrl is empty (root), just return the endpoint
  // Otherwise, return baseUrl + endpoint
  return baseUrl ? `${baseUrl}${normalizedEndpoint}` : normalizedEndpoint;
}

