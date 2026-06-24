/**
 * Verifies a Firebase ID token using Google's public keys.
 * Cloudflare Workers have the WebCrypto API natively.
 */

const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let certCache = { certs: null, expiry: 0 };

async function getGoogleCerts() {
  if (certCache.certs && Date.now() < certCache.expiry) return certCache.certs;
  const res = await fetch(GOOGLE_CERTS_URL);
  const raw = await res.json();
  const cc  = res.headers.get('cache-control') ?? '';
  const maxAge = parseInt((cc.match(/max-age=(\d+)/) ?? [])[1] ?? '3600', 10);
  certCache = { certs: raw, expiry: Date.now() + maxAge * 1000 };
  return raw;
}

function base64urlToUint8Array(b64) {
  const b64std = b64.replace(/-/g, '+').replace(/_/g, '/');
  const binary  = atob(b64std);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function pemToCryptoKey(pem) {
  const body = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const der  = base64urlToUint8Array(body);
  return crypto.subtle.importKey(
    'spki', der.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['verify']
  );
}

async function verifyJwt(token, projectId) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed JWT');

  const [headerB64, payloadB64, sigB64] = parts;
  const header  = JSON.parse(atob(headerB64));
  const payload = JSON.parse(atob(payloadB64));

  // Basic claims
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now)              throw new Error('Token expired');
  if (payload.iat > now + 300)        throw new Error('Token issued in the future');
  if (payload.aud !== projectId)      throw new Error('Token audience mismatch');
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('Token issuer mismatch');

  // Signature
  const certs = await getGoogleCerts();
  const pem   = certs[header.kid];
  if (!pem) throw new Error('Unknown key ID');

  const key       = await pemToCryptoKey(pem);
  const sigInput  = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64urlToUint8Array(sigB64);
  const valid     = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, sigInput);
  if (!valid) throw new Error('Invalid signature');

  return payload;
}

/**
 * Hono middleware. Attaches `c.set('uid', uid)` and `c.set('email', email)`.
 * Returns 401 if the token is missing or invalid.
 */
export async function requireAuth(c, next) {
  const auth = c.req.header('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return c.json({ message: 'Unauthorised' }, 401);

  try {
    const projectId = c.env.FIREBASE_PROJECT_ID;
    const payload   = await verifyJwt(token, projectId);
    c.set('uid',   payload.sub);
    c.set('email', payload.email ?? payload.phone_number ?? '');
    await next();
  } catch (e) {
    return c.json({ message: `Unauthorised: ${e.message}` }, 401);
  }
}

/**
 * Middleware that requires a specific role.
 * Must be used AFTER requireAuth.
 */
export function requireRole(role) {
  return async (c, next) => {
    const uid = c.get('uid');
    const row = await c.env.DB.prepare(
      'SELECT role FROM users WHERE firebase_uid = ?'
    ).bind(uid).first();
    if (!row || (row.role !== role && row.role !== 'admin')) {
      return c.json({ message: 'Forbidden' }, 403);
    }
    c.set('role', row.role);
    await next();
  };
}
