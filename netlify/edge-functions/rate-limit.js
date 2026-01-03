export default async (request, context) => {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const key = `rate:${ip}`;
  const limit = 60;       // max requests
  const windowSeconds = 60;

  // read current count from edge kv (or in-memory for demo)
  const count = (await context.geo?.get(key)) || 0;

  if (count >= limit) {
    return new Response("Too Many Requests", { status: 429 });
  }

  await context.geo?.set(key, count + 1, { ttl: windowSeconds });

  return context.next(); // continue to site
};
