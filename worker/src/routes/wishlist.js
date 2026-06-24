import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';

const wishlist = new Hono();
wishlist.use('*', requireAuth);

wishlist.get('/', async (c) => {
  const uid  = c.get('uid');
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE firebase_uid = ?').bind(uid).first();
  if (!user) return c.json({ productIds: [] });

  const rows = await c.env.DB.prepare(
    'SELECT product_id FROM wishlist WHERE user_id = ?'
  ).bind(user.id).all();

  return c.json({ productIds: (rows.results ?? []).map((r) => r.product_id) });
});

wishlist.post('/sync', async (c) => {
  const uid  = c.get('uid');
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE firebase_uid = ?').bind(uid).first();
  if (!user) return c.json({ ok: false }, 404);

  const { productIds } = await c.req.json().catch(() => ({ productIds: [] }));
  const db = c.env.DB;

  await db.prepare('DELETE FROM wishlist WHERE user_id = ?').bind(user.id).run();

  if (Array.isArray(productIds) && productIds.length) {
    const stmt = db.prepare(
      'INSERT INTO wishlist (id, user_id, product_id) VALUES (?, ?, ?)'
    );
    await db.batch(
      productIds.map((pid) => stmt.bind(crypto.randomUUID(), user.id, pid))
    );
  }

  return c.json({ ok: true });
});

export default wishlist;
