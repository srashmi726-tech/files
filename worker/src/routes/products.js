import { Hono } from 'hono';

const products = new Hono();

// ── GET /api/products ──────────────────────────────────────────────────────
// Query params: category, q (search), sort, page, pageSize
products.get('/', async (c) => {
  const { category, q, sort = 'newest', page = '1', pageSize = '20' } = c.req.query();
  const db      = c.env.DB;
  const limit   = Math.min(Number(pageSize) || 20, 100);
  const offset  = (Math.max(Number(page) || 1, 1) - 1) * limit;

  const conditions = ['1=1'];
  const params     = [];

  if (category) {
    conditions.push('p.category = ?');
    params.push(category);
  }

  if (q) {
    conditions.push('(p.title LIKE ? OR p.description LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  const orderBy = {
    newest:     'p.created_at DESC',
    price_asc:  'p.price ASC',
    price_desc: 'p.price DESC',
  }[sort] ?? 'p.created_at DESC';

  const where = conditions.join(' AND ');

  const [rows, countRow] = await Promise.all([
    db.prepare(
      `SELECT p.id, p.title, p.description, p.price, p.image_url, p.category,
              u.name AS seller_name
       FROM products p
       LEFT JOIN users u ON u.id = p.seller_id
       WHERE ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`
    ).bind(...params, limit, offset).all(),

    db.prepare(
      `SELECT COUNT(*) AS total FROM products p WHERE ${where}`
    ).bind(...params).first(),
  ]);

  return c.json({
    products: rows.results ?? [],
    meta: {
      total:    countRow?.total ?? 0,
      page:     Number(page),
      pageSize: limit,
    },
  });
});

// ── GET /api/products/:id ──────────────────────────────────────────────────
products.get('/:id', async (c) => {
  const row = await c.env.DB.prepare(
    `SELECT p.*, u.name AS seller_name
     FROM products p
     LEFT JOIN users u ON u.id = p.seller_id
     WHERE p.id = ?`
  ).bind(c.req.param('id')).first();

  if (!row) return c.json({ message: 'Product not found' }, 404);
  return c.json(row);
});

// ── POST /api/products/batch ───────────────────────────────────────────────
// Accepts { ids: string[] } — used by the Wishlist page
products.post('/batch', async (c) => {
  const { ids } = await c.req.json().catch(() => ({ ids: [] }));
  if (!Array.isArray(ids) || ids.length === 0) return c.json({ products: [] });

  // D1 doesn't support array binding natively; build placeholders
  const placeholders = ids.map(() => '?').join(',');
  const rows = await c.env.DB.prepare(
    `SELECT id, title, price, image_url, category FROM products WHERE id IN (${placeholders})`
  ).bind(...ids).all();

  return c.json({ products: rows.results ?? [] });
});

export default products;
