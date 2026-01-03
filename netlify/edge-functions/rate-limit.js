// netlify/edge-functions/rate-limit.js

let rateMap = new Map(); // simple in-memory store

export default async (request, context) => {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  const limit = 60;

  const entry = rateMap.get(ip) || { count: 0, time: now };

  // reset window if expired
  if (now - entry.time > windowMs) {
    entry.count = 0;
    entry.time = now;
  }

  entry.count += 1;
  rateMap.set(ip, entry);

  if (entry.count > limit) {
    return new Response("Too Many Requests", { status: 429 });
  }

  // continue to serve site
  return context.next();
};
