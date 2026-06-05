/**
 * Admin client-side cache with localStorage + stale-while-revalidate.
 *
 * - Show cached data instantly (0ms)
 * - Refresh in background (network)
 * - Auto-expire after N seconds
 */

const CACHE_PREFIX = "bx_cache_";

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  maxAgeSeconds = 300 // 5 min default
): Promise<T> {
  const cacheKey = CACHE_PREFIX + key;

  // Try read from localStorage
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts < maxAgeSeconds * 1000) {
          // Background refresh — fire and forget
          fetcher()
            .then((fresh) =>
              localStorage.setItem(
                cacheKey,
                JSON.stringify({ data: fresh, ts: Date.now() })
              )
            )
            .catch(() => {});
          return data as T;
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  // No cache hit, fetch fresh
  const data = await fetcher();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ data, ts: Date.now() })
      );
    } catch {
      // localStorage full — silently ignore
    }
  }
  return data;
}

export function clearCache() {
  if (typeof window === "undefined") return;
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith(CACHE_PREFIX)
  );
  keys.forEach((k) => localStorage.removeItem(k));
}
