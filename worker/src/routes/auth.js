import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';
import { randomUUID } from '../lib/uuid.js';

const auth = new Hono();

/**
 * POST /api/auth/sync
 * Called by the frontend onAuthStateChanged.
 * Creates the user row on first login, then returns { id, email, role }.
 * Requires a valid Firebase ID token.
 */
auth.post('/sync', requireAuth, async (c) => {
  const uid   = c.get('uid');
  const body  = await c.req.json().catch(() => ({}));
  const email = body.email ?? c.get('email') ?? '';
  const name  = body.name  ?? null;
  const photo = body.photo ?? null;

  const db = c.env.DB;

  // Try to fetch existing user by Firebase UID
  let user = await db.prepare(
    'SELECT id, email, role FROM users WHERE firebase_uid = ?'
  ).bind(uid).first();

  if (!user) {
    // New user — insert with default buyer role
    const id = randomUUID();
    await db.prepare(
      `INSERT INTO users (id, firebase_uid, email, name, photo_url, role)
       VALUES (?, ?, ?, ?, ?, 'buyer')`
    ).bind(id, uid, email, name, photo).run();

    user = { id, email, role: 'buyer' };
  }

  return c.json(user);
});

export default auth;
