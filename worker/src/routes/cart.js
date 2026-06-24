import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';

const cart = new Hono();
cart.use('*', requireAuth);

// GET /api/cart — return cart items for the authenticated user
cart.get('/', async (c) => {
  const uid  = c.get('uid');
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE firebase_uid = ?').bind(uid).first();
  if (!user) return c.json({ items: [] });

  const rows = await c.env.DB.prepare(
    `SELECT ci.product_id AS productId, ci.quantity,
            p.title, p.price, p.image_url AS image
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = ?`
  ).bind(user.id).all();

  return c.json({ items: rows.results ?? [] });
});

// POST /api/cart/sync — replace the server cart with the local cart
cart.post('/sync', async (c) => {
  const uid  = c.get('uid');
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE firebase_uid = ?').bind(uid).first();
  if (!user) return c.json({ ok: false }, 404);

  const { items } = await c.req.json().catch(() => ({ items: [] }));
  const db = c.env.DB;

  // Replace existing cart
  await db.prepare('DELETE FROM cart_items WHERE user_id = ?').bind(user.id).run();

  if (Array.isArray(items) && items.length) {
    const stmt = db.prepare(
      `INSERT INTO cart_items (id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)`
    );
    // D1 batch
    await db.batch(
      items.map((i) =>
        stmt.bind(crypto.randomUUID(), user.id, i.productId, i.quantity)
      )
    );
  }

  return c.json({ ok: true });
});

export default cart;
