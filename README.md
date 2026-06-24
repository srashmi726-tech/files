# Rashmi Shree Marketplace

Indian ethnic and fusion fashion marketplace — React + Cloudflare Workers + Firebase Auth + D1 + R2.

## Architecture

```
frontend/   React + Vite + Tailwind + React Router + Zustand
            → Cloudflare Pages
worker/     Hono on Cloudflare Workers
            → D1 (SQLite) for relational data
            → R2 for product images
            Auth: Firebase ID tokens verified with Web Crypto
```

## Prerequisites

- Node.js 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) — `npm install -g wrangler`
- A [Firebase project](https://console.firebase.google.com/) with Google sign-in and Phone sign-in enabled
- A Cloudflare account

---

## 1 — Firebase setup

1. Create a Firebase project at console.firebase.google.com
2. Enable **Authentication → Sign-in method → Google** and **Phone**
3. Go to **Project settings → General → Your apps → Web** — add a web app if you haven't already
4. Copy the config values (apiKey, authDomain, etc.)

---

## 2 — Worker setup

```bash
cd worker
npm install

# Create D1 database
wrangler d1 create rashmi-shree-db
# Copy the database_id printed and paste it into worker/wrangler.toml

# Create R2 bucket
wrangler r2 bucket create rashmi-shree-images

# Apply schema
wrangler d1 execute rashmi-shree-db --file=schema.sql

# Seed initial data
wrangler d1 execute rashmi-shree-db --file=seed.sql

# Set secrets (do not put these in wrangler.toml)
wrangler secret put FIREBASE_PROJECT_ID     # your Firebase project ID
wrangler secret put ALLOWED_ORIGINS         # e.g. https://rashmi-shree.pages.dev,http://localhost:3000

# Local development
npm run dev                                 # Worker runs on http://localhost:8787

# Deploy
npm run deploy
```

---

## 3 — Frontend setup

```bash
cd frontend
npm install

# Copy env template and fill in your values
cp .env.example .env
# Edit .env — add Firebase config and (optionally) the Worker URL
```

Your `.env` should look like:
```
VITE_FIREBASE_API_KEY=AIza…
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Leave blank for local dev (Vite proxies /api → localhost:8787)
VITE_API_BASE_URL=
```

```bash
# Local development (Worker must also be running)
npm run dev         # Frontend on http://localhost:3000

# Production build
npm run build
```

---

## 4 — Cloudflare Pages deployment

1. Push the repo to GitHub
2. In Cloudflare Pages, connect your repo
3. Set **Build command**: `cd frontend && npm run build`
4. Set **Build output directory**: `frontend/dist`
5. Add environment variables in the Pages dashboard (same as `.env` above)

After deploying, add the Pages URL to `ALLOWED_ORIGINS` in the Worker:
```bash
wrangler secret put ALLOWED_ORIGINS
# → https://rashmi-shree.pages.dev,http://localhost:3000
```

---

## 5 — Promoting a user to seller

After a user signs in at least once (creating their DB row):

```bash
wrangler d1 execute rashmi-shree-db \
  --command="UPDATE users SET role='seller' WHERE email='seller@example.com'"
```

---

## API reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/sync | Bearer | Upsert user, return profile |
| GET | /api/products | — | List products (filter, sort, paginate) |
| GET | /api/products/:id | — | Get single product |
| POST | /api/products/batch | — | Get products by IDs (wishlist) |
| GET | /api/cart | Bearer | Get cart |
| POST | /api/cart/sync | Bearer | Sync local cart to server |
| GET | /api/wishlist | Bearer | Get wishlist |
| POST | /api/wishlist/sync | Bearer | Sync wishlist to server |
| GET | /api/orders | Bearer | Buyer: list own orders |
| POST | /api/orders | Bearer | Buyer: place order |
| GET | /api/seller/stats | Bearer + seller | Dashboard stats |
| GET | /api/seller/products | Bearer + seller | List own products |
| POST | /api/seller/products | Bearer + seller | Create product |
| PUT | /api/seller/products/:id | Bearer + seller | Update product |
| DELETE | /api/seller/products/:id | Bearer + seller | Delete product |
| GET | /api/seller/orders | Bearer + seller | Orders for seller's products |
| PATCH | /api/seller/orders/:id | Bearer + seller | Update order status |

---

## R2 image uploads (next step)

The R2 bucket is bound but image upload is not yet wired to the frontend. To enable it:

1. Add a `POST /api/seller/images/upload` route that generates a presigned R2 URL
2. In the seller `ProductForm`, replace the image URL input with a file picker that uploads to R2 and stores the resulting URL

This keeps large binary files off the Worker body and routes them directly to R2.
