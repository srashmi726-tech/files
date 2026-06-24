import { Hono } from 'hono';
import { requireAuth, requireRole } from '../middleware/auth.js';

const seller = new Hono();
seller.use('*', requireAuth);
seller.use('*', requireRole('seller'));

// Helper: resolve firebase_uid → DB user id
async function getSellerDbId(db, uid) {
  const row = await db
    .prepare('SELECT id FROM users WHERE firebase_uid = ?')
    .bind(uid)
    .first();
  return row?.id ?? null;
}

// ── GET /api/seller/stats ──────────────────────────────────────────────────
seller.get('/stats', async (c) => {
  const uid      = c.get('uid');
  const db       = c.env.DB;
  const sellerId = await getSellerDbId(db, uid);
  if (!sellerId) return c.json({ message: 'Seller not found' }, 404);

  const [productCount, orderStats, recentOrders] = await Promise.all([
    db.prepare('SELECT COUNT(*) AS cnt FROM products WHERE seller_id = ?')
      .bind(sellerId).first(),

    db.prepare(`
      SELECT COUNT(DISTINCT o.id) AS orderCount,
             COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue,
             SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS pendingOrders
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p     ON p.id = oi.product_id AND p.seller_id = ?
    `).bind(sellerId).first(),

    db.prepare(`
      SELECT DISTINCT o.id, o.total, o.status, o.created_at
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p     ON p.id = oi.product_id AND p.seller_id = ?
      ORDER BY o.created_at DESC LIMIT 5
    `).bind(sellerId).all(),
  ]);

  return c.json({
    productCount:  productCount?.cnt         ?? 0,
    orderCount:    orderStats?.orderCount    ?? 0,
    revenue:       orderStats?.revenue       ?? 0,
    pendingOrders: orderStats?.pendingOrders ?? 0,
    recentOrders:  recentOrders.results      ?? [],
  });
});

// ── GET /api/seller/products ───────────────────────────────────────────────
seller.get('/products', async (c) => {
  const uid      = c.get('uid');
  const sellerId = await getSellerDbId(c.env.DB, uid);
  if (!sellerId) return c.json({ products: [] });

  const rows = await c.env.DB.prepare(
    `SELECT id, title, description, price, image_url, category, created_at
     FROM products WHERE seller_id = ? ORDER BY created_at DESC`
  ).bind(sellerId).all();

  return c.json({ products: rows.results ?? [] });
});

// ── GET /api/seller/products/:id ──────────────────────────────────────────
seller.get('/products/:id', async (c) => {
  const uid      = c.get('uid');
  const sellerId = await getSellerDbId(c.env.DB, uid);
  if (!sellerId) return c.json({ message: 'Not found' }, 404);

  const row = await c.env.DB.prepare(
    'SELECT * FROM products WHERE id = ? AND seller_id = ?'
  ).bind(c.req.param('id'), sellerId).first();

  if (!row) return c.json({ message: 'Product not found' }, 404);
  return c.json(row);
});

// ── POST /api/seller/products ──────────────────────────────────────────────
seller.post('/products', async (c) => {
  const uid      = c.get('uid');
  const sellerId = await getSellerDbId(c.env.DB, uid);
  if (!sellerId) return c.json({ message: 'Seller not found' }, 404);

  const body = await c.req.json().catch(() => ({}));
  const { title, description, price, category, image_url } = body;

  if (!title?.trim())           return c.json({ message: 'Title is required' }, 400);
  if (!price || Number(price) <= 0) return c.json({ message: 'Valid price is required' }, 400);

  const id = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO products (id, seller_id, title, description, price, category, image_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(id, sellerId, title.trim(), description ?? null, Number(price), category ?? null, image_url ?? null).run();

  return c.json({ id, title, price: Number(price) }, 201);
});

// ── PUT /api/seller/products/:id ──────────────────────────────────────────
seller.put('/products/:id', async (c) => {
  const uid      = c.get('uid');
  const sellerId = await getSellerDbId(c.env.DB, uid);
  if (!sellerId) return c.json({ message: 'Seller not found' }, 404);

  const body = await c.req.json().catch(() => ({}));
  const { title, description, price, category, image_url } = body;

  if (!title?.trim())           return c.json({ message: 'Title is required' }, 400);
  if (!price || Number(price) <= 0) return c.json({ message: 'Valid price is required' }, 400);

  const result = await c.env.DB.prepare(`
    UPDATE products
    SET title = ?, description = ?, price = ?, category = ?, image_url = ?
    WHERE id = ? AND seller_id = ?
  `).bind(
    title.trim(), description ?? null, Number(price),
    category ?? null, image_url ?? null,
    c.req.param('id'), sellerId
  ).run();

  if (result.meta.changes === 0) return c.json({ message: 'Product not found' }, 404);
  return c.json({ ok: true });
});

// ── DELETE /api/seller/products/:id ───────────────────────────────────────
seller.delete('/products/:id', async (c) => {
  const uid      = c.get('uid');
  const sellerId = await getSellerDbId(c.env.DB, uid);
  if (!sellerId) return c.json({ message: 'Seller not found' }, 404);

  const result = await c.env.DB.prepare(
    'DELETE FROM products WHERE id = ? AND seller_id = ?'
  ).bind(c.req.param('id'), sellerId).run();

  if (result.meta.changes === 0) return c.json({ message: 'Product not found' }, 404);
  return c.json({ ok: true });
});

// ── GET /api/seller/orders ─────────────────────────────────────────────────
seller.get('/orders', async (c) => {
  const uid      = c.get('uid');
  const sellerId = await getSellerDbId(c.env.DB, uid);
  if (!sellerId) return c.json({ orders: [] });

  const rows = await c.env.DB.prepare(`
    SELECT DISTINCT o.id, o.total, o.status, o.created_at,
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
    ORDER BY o.created_at DESC
  `).bind(sellerId).all();

  const result = (rows.results ?? []).map((r) => ({
    ...r,
    items: JSON.parse(r.items ?? '[]'),
  }));

  return c.json({ orders: result });
});

// ── PATCH /api/seller/orders/:id ──────────────────────────────────────────
seller.patch('/orders/:id', async (c) => {
  const VALID = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const { status } = await c.req.json().catch(() => ({}));
  if (!VALID.includes(status)) return c.json({ message: 'Invalid status' }, 400);

  await c.env.DB.prepare(
    'UPDATE orders SET status = ? WHERE id = ?'
  ).bind(status, c.req.param('id')).run();

  return c.json({ ok: true });
});

export default seller;
