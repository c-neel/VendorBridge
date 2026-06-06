import NodeCache from 'node-cache';

// Standard TTL is 5 minutes (300 seconds)
const stdTTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 300;

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL,
      checkperiod: stdTTL * 0.2, // Check for expired keys periodically
      useClones: false,
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    if (ttl) {
      return this.cache.set(key, value, ttl);
    }
    return this.cache.set(key, value);
  }

  del(keys: string | string[]): number {
    return this.cache.del(keys);
  }

  flush(): void {
    this.cache.flushAll();
  }
}

export const cache = new CacheService();
