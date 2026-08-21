const rateLimitMap = new Map();
const LIMIT = 20;
const WINDOW_MS = 60_000;
const PRUNE_INTERVAL_MS = 10 * WINDOW_MS;

let lastPrune = Date.now();

function pruneStale(now) {
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.start > WINDOW_MS) rateLimitMap.delete(ip);
  }
}

export function isRateLimited(ip) {
  const now = Date.now();
  pruneStale(now);
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) { entry.count = 0; entry.start = now; }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > LIMIT;
}
