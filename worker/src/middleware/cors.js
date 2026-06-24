/**
 * CORS middleware for Hono.
 * Reads allowed origins from the ALLOWED_ORIGINS env var
 * (comma-separated, e.g. "https://rashmi-shree.pages.dev,http://localhost:3000").
 * Falls back to allowing any origin in development if the var is missing.
 */
export function cors(c, next) {
  const allowed = (c.env.ALLOWED_ORIGINS ?? '*')
    .split(',')
    .map((s) => s.trim());

  const origin = c.req.header('origin') ?? '';
  const allow  = allowed.includes('*') || allowed.includes(origin) ? origin || '*' : '';

  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin':  allow,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Max-Age':       '86400',
      },
    });
  }

  c.header('Access-Control-Allow-Origin',  allow);
  c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return next();
}
