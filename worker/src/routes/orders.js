import { Hono } from 'hono';
import { requireAuth, requireRole } from '../middleware/auth.js';

const orders = new Hono();
orders.use('*', requireAuth);

// ── Buyer: list own orders ─────────────────────────────────────────────────
orders.get('/', async (c) => {
  const uid  = c.get('uid');
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE firebase_uid = ?').bind(uid).first();
  if (!user) return c.json({ orders: [] });

  const rows = await c.env.DB.prepare(
    `SELECT o.id, o.total, o.status, o.created_at,
            json_group_array(
              json_object(
                'productId', oi.product_id,
                'title',     p.title,
                'quantity',  oi.quantity,
                'price',     oi.price
              )
            ) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p     ON p.id = oi.product_id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`
  ).bind(user.id).all();

  const result = (rows.results ?? []).map((r) => ({
    ...r,
    items: JSON.parse(r.items ?? '[]'),
  }));

  return c.json({ orders: result });
});

// ── Buyer: place order ─────────────────────────────────────────────────────
orders.post('/', async (c) => {
  const uid  = c.get('uid');
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE firebase_uid = ?').bind(uid).first();
  if (!user) return c.json({ message: 'User not found' }, 404);

  const { items, total, shippingAddress } = await c.req.json().catch(() => ({}));
  if (!Array.isArray(items) || !items.length) {
    return c.json({ message: 'No items in order' }, 400);
  }

  const db      = c.env.DB;
  const orderId = crypto.randomUUID();

  await db.prepare(
    `INSERT INTO orders (id, user_id, total, status, shipping_address, created_at)
     VALUES (?, ?, ?, 'pending', ?, datetime('now'))`
  ).bind(orderId, user.id, total, JSON.stringify(shippingAddress ?? {})).run();

  const stmt = db.prepare(
    `INSERT INTO order_items (id, order_id, product_id, quantity, price)
     VALUES (?, ?, ?, ?, ?)`
  );
  await db.batch(
    items.map((i) =>
      stmt.bind(crypto.randomUUID(), orderId, i.productId, i.quantity, i.price)
    )
  );

  return c.json({ id: orderId, status: 'pending' }, 201);
});

// ── Seller: list orders for their products ─────────────────────────────────
orders.get('/seller', requireRole('seller'), async (c) => {
  const uid  = c.get('uid');
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE firebase_uid = ?').bind(uid).first();
  if (!user) return c.json({ orders: [] });

  const rows = await c.env.DB.prepare(
    `SELECT DISTINCT o.id, o.total, o.status, o.created_at,
            buyer.email AS buyer_email,
            json_group_array(
              json_object(
                'productId', oi.product_id,
                'title',     p.title,
                'quantity',  oi.quantity
              )
            ) AS items
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN products p     ON p.id = oi.product_id AND p.seller_id = ?
     JOIN users buyer    ON buyer.id = o.user_id
     GROUP BY o.id
     ORDER BY o.created_at DESC`
  ).bind(user.id).all();

  const result = (rows.results ?? []).map((r) => ({
    ...r,
    items: JSON.parse(r.items ?? '[]'),
  }));

  return c.json({ orders: result });
});

// ── Seller: update order status ────────────────────────────────────────────
orders.patch('/:id', requireRole('seller'), async (c) => {
  const VALID = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const { status } = await c.req.json().catch(() => ({}));
  if (!VALID.includes(status)) return c.json({ message: 'Invalid status' }, 400);

  await c.env.DB.prepare(
    `UPDATE orders SET status = ? WHERE id = ?`
  ).bind(status, c.req.param('id')).run();

  return c.json({ ok: true });
});

export default orders;
