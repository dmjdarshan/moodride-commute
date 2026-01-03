// netlify/edge-functions/rate-limit.js

// Simple in-memory store for demo
let rateMap = new Map();

// Configuration
const WINDOW_MS = 60_000; // 1 minute
const LIMIT = 60;          // max requests per IP per window

export default async (request, context) => {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  // Get existing record
  let entry = rateMap.get(ip);

  if (!entry) {
    // first request from this IP
    entry = { count: 1, start: now };
    rateMap.set(ip, entry);
  } else {
    if (now - entry.start > WINDOW_MS) {
      // window expired, reset
      entry.count = 1;
      entry.start = now;
    } else {
      // still inside window
      entry.count += 1;
    }
    rateMap.set(ip, entry);
  }

  // enforce limit
  if (entry.count > LIMIT) {
    return new Response("Too Many Requests", { status: 429 });
  }

  // Optional: clean up old IPs to prevent memory growth
  for (let [key, val] of rateMap) {
    if (now - val.start > 2 * WINDOW_MS) {
      rateMap.delete(key);
    }
  }

  // continue to serve your site
  return context.next();
};
