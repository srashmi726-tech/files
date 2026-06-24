import { Hono } from 'hono';
import { cors }     from './middleware/cors.js';
import auth         from './routes/auth.js';
import products     from './routes/products.js';
import cart         from './routes/cart.js';
import wishlist     from './routes/wishlist.js';
import orders       from './routes/orders.js';
import seller       from './routes/seller.js';

const app = new Hono();

// ── Global middleware ──────────────────────────────────────────────────────
app.use('*', cors);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (c) =>
  c.json({ ok: true, name: c.env.APP_NAME ?? 'Rashmi Shree API' })
);

// ── Route groups ───────────────────────────────────────────────────────────
app.route('/api/auth',     auth);
app.route('/api/products', products);
app.route('/api/cart',     cart);
app.route('/api/wishlist', wishlist);
app.route('/api/orders',   orders);
app.route('/api/seller',   seller);

// ── 404 fallback ───────────────────────────────────────────────────────────
app.notFound((c) => c.json({ message: 'Not found' }, 404));

// ── Error handler ──────────────────────────────────────────────────────────
app.onError((err, c) => {
  console.error(`[Worker Error] ${err.message}`, err.stack);
  return c.json({ message: 'Internal server error' }, 500);
});

export default app;
