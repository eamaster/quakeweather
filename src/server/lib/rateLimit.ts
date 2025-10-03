interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

export class RateLimiter {
  private buckets: Map<string, RateLimitEntry> = new Map();
  private maxTokens: number;
  private refillRate: number; // tokens per second
  // private refillInterval: number; // milliseconds

  constructor(maxTokens: number = 30, windowSeconds: number = 600) {
    this.maxTokens = maxTokens;
    this.refillRate = maxTokens / windowSeconds;
    // this.refillInterval = 1000; // Check every second
  }

  async checkLimit(identifier: string): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    let entry = this.buckets.get(identifier);

    if (!entry) {
      entry = { tokens: this.maxTokens - 1, lastRefill: now };
      this.buckets.set(identifier, entry);
      return { allowed: true, remaining: entry.tokens };
    }

    // Refill tokens based on time elapsed
    const timeSinceLastRefill = (now - entry.lastRefill) / 1000;
    const tokensToAdd = timeSinceLastRefill * this.refillRate;
    entry.tokens = Math.min(this.maxTokens, entry.tokens + tokensToAdd);
    entry.lastRefill = now;

    if (entry.tokens >= 1) {
      entry.tokens -= 1;
      return { allowed: true, remaining: Math.floor(entry.tokens) };
    }

    return { allowed: false, remaining: 0 };
  }

  cleanup() {
    // Clean up old entries (older than 1 hour)
    const now = Date.now();
    const oneHour = 3600000;
    for (const [key, entry] of this.buckets.entries()) {
      if (now - entry.lastRefill > oneHour) {
        this.buckets.delete(key);
      }
    }
  }
}

export const weatherRateLimiter = new RateLimiter(30, 600); // 30 requests per 10 minutes

