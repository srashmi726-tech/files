-- Rashmi Shree — seed data
-- Run AFTER schema.sql:
--   wrangler d1 execute rashmi-shree-db --file=seed.sql

-- ── Users ──────────────────────────────────────────────────────────────────
-- NOTE: firebase_uid values here are placeholders.
-- Real users are created automatically via POST /api/auth/sync on first login.
-- To promote a user to seller/admin, update their role after they have signed in:
--   wrangler d1 execute rashmi-shree-db \
--     --command="UPDATE users SET role='seller' WHERE email='your@email.com'"

INSERT OR IGNORE INTO users (id, firebase_uid, email, display_name, role) VALUES
  ('usr_seller_001', 'PLACEHOLDER_SELLER_FIREBASE_UID', 'seller@rashmi-shree.in',  'Rashmi Boutique', 'seller'),
  ('usr_admin_001',  'PLACEHOLDER_ADMIN_FIREBASE_UID',  'admin@rashmi-shree.in',   'Admin',           'admin');

-- ── Products ───────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO products (id, seller_id, title, description, price, category, image_url) VALUES
  ('prd_001', 'usr_seller_001',
   'Banarasi Silk Saree — Deep Red',
   'Handwoven pure silk saree with zari border from Varanasi. Pure silk, 6.3 metres with blouse piece.',
   7499, 'saree', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'),

  ('prd_002', 'usr_seller_001',
   'Chanderi Cotton Saree — Sage Green',
   'Lightweight Chanderi cotton with delicate block print. Perfect for daily wear and festive occasions.',
   2199, 'saree', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600'),

  ('prd_003', 'usr_seller_001',
   'Bridal Lehenga — Blush Pink',
   'Heavy embroidered bridal lehenga with dupatta and blouse. Fully lined, size customisable on order.',
   34999, 'lehenga', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600'),

  ('prd_004', 'usr_seller_001',
   'Designer Lehenga — Teal & Gold',
   'Contemporary lehenga with gota patti work, suitable for sangeet and festive wear.',
   14500, 'lehenga', 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600'),

  ('prd_005', 'usr_seller_001',
   'Anarkali Kurti — Indigo',
   'Floor-length Anarkali in pure cotton with block print. Comes with palazzo pants.',
   1899, 'kurti', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600'),

  ('prd_006', 'usr_seller_001',
   'Cotton A-Line Kurti — Terracotta',
   'Everyday comfort kurti with hand embroidery at neckline. Available in S–3XL.',
   899, 'kurti', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600'),

  ('prd_007', 'usr_seller_001',
   'Phulkari Dupatta — Mustard',
   'Hand-embroidered Phulkari dupatta from Punjab. Pure cotton, 2.5 metre length.',
   1299, 'dupatta', 'https://images.unsplash.com/photo-1606744888344-493238951221?w=600'),

  ('prd_008', 'usr_seller_001',
   'Silk Bandhani Dupatta — Magenta',
   'Vibrant tie-dye silk dupatta from Rajasthan with golden border.',
   1699, 'dupatta', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'),

  ('prd_009', 'usr_seller_001',
   'Kundan Choker Set',
   'Statement kundan choker with earrings. Gold-plated brass with polki stones.',
   3499, 'jewellery', 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600'),

  ('prd_010', 'usr_seller_001',
   'Silver Oxidised Jhumkas',
   'Traditional oxidised silver jhumka earrings with mirror work. Lightweight, daily-wear friendly.',
   549, 'jewellery', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600'),

  ('prd_011', 'usr_seller_001',
   'Fusion Crop Top & Palazzo — White',
   'Contemporary indo-western set. Embroidered cotton crop top with wide-leg palazzo. Perfect for brunch and events.',
   2799, 'fusion', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600'),

  ('prd_012', 'usr_seller_001',
   'Fusion Shirt Saree — Navy Blue',
   'Trendy shirt-saree hybrid. Pre-draped saree skirt with a tailored cotton shirt.',
   3299, 'fusion', 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600');
