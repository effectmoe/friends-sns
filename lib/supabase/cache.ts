// Simple in-memory cache for user sessions
const sessionCache = new Map<string, { user: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedUser(email: string) {
  const cached = sessionCache.get(email);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }
  sessionCache.delete(email);
  return null;
}

export function setCachedUser(email: string, user: any) {
  sessionCache.set(email, {
    user,
    timestamp: Date.now(),
  });
}

export function clearUserCache(email: string) {
  sessionCache.delete(email);
}

export function clearAllCache() {
  sessionCache.clear();
}