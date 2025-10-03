// import { createCacheKey } from './utils';

export interface CacheOptions {
  ttl: number; // seconds
  staleWhileRevalidate?: number; // seconds
}

export class CacheManager {
  private memoryCache: Map<string, { data: any; timestamp: number; etag?: string }> = new Map();

  constructor(private cacheApi?: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const cached = this.memoryCache.get(key);
    if (cached) {
      return cached.data as T;
    }

    // Try Cache API
    if (this.cacheApi) {
      const response = await this.cacheApi.match(key);
      if (response) {
        const data = await response.json();
        return data as T;
      }
    }

    return null;
  }

  async set<T>(key: string, data: T, options: CacheOptions, etag?: string): Promise<void> {
    // Store in memory cache
    this.memoryCache.set(key, { data, timestamp: Date.now(), etag });

    // Store in Cache API
    if (this.cacheApi) {
      const response = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${options.ttl}${
            options.staleWhileRevalidate ? `, stale-while-revalidate=${options.staleWhileRevalidate}` : ''
          }`,
          ...(etag ? { ETag: etag } : {}),
        },
      });
      await this.cacheApi.put(key, response);
    }

    // Clean old entries from memory cache (keep last 100)
    if (this.memoryCache.size > 100) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }
  }

  async getEtag(key: string): Promise<string | null> {
    const cached = this.memoryCache.get(key);
    return cached?.etag || null;
  }

  isStale(key: string, maxAge: number): boolean {
    const cached = this.memoryCache.get(key);
    if (!cached) return true;
    return Date.now() - cached.timestamp > maxAge * 1000;
  }
}

export const cacheOptions = {
  quakes: { ttl: 90, staleWhileRevalidate: 60 },
  weather: { ttl: 600 }, // 10 minutes
  insight: { ttl: 300 }, // 5 minutes
};

