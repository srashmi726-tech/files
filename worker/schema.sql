-- Rashmi Shree — D1 (SQLite) schema
-- Run: wrangler d1 execute rashmi-shree-db --file=schema.sql

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,          -- UUID
  firebase_uid TEXT UNIQUE NOT NULL,      -- Firebase UID (sub claim)
  email        TEXT,
  display_name TEXT,
  photo_url    TEXT,
  role         TEXT NOT NULL DEFAULT 'buyer'  -- 'buyer' | 'seller' | 'admin'
               CHECK (role IN ('buyer','seller','admin')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users (firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_role         ON users (role);

-- ── Products ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  seller_id   TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  price       REAL NOT NULL CHECK (price > 0),
  category    TEXT,                       -- 'saree'|'lehenga'|'kurti'|'dupatta'|'jewellery'|'fusion'|'other'
  image_url   TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products (seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category  ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_created   ON products (created_at DESC);

-- ── Orders ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  total            REAL NOT NULL CHECK (total >= 0),
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  shipping_address TEXT,                  -- JSON blob
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created    ON orders (created_at DESC);

-- ── Order items ────────────────────────────────────────────────────────────
-- (was missing entirely from original schema)
CREATE TABLE IF NOT EXISTS order_items (
  id         TEXT PRIMARY KEY,
  order_id   TEXT NOT NULL REFERENCES orders   (id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  price      REAL    NOT NULL CHECK (price > 0)     -- snapshot of price at order time
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items (product_id);

-- ── Cart items ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users    (id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart_items (user_id);

-- ── Wishlist ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users    (id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist (user_id);

-- ── Reviews ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users    (id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body       TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (product_id, user_id)            -- one review per user per product
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews (product_id);

-- ── Notifications ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT,
  is_read    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON notifications (user_id, is_read);
