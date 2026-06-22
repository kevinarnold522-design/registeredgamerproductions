# Gamer.Productions — Cloudflare Migration

Cloudflare is the **primary** backend; Base44 stays the **live backup**. Every write hits Cloudflare D1 first, then mirrors to Base44 automatically.

## What's in here

| File | Purpose |
|------|---------|
| `schema.sql` | D1 SQL schema — all entities mapped to tables (1:1 with Base44). Anything not given a typed table is mirrored in `entity_records` as JSON so nothing is lost. |
| `schema.drizzle.js` | Optional Drizzle ORM schema for type-safe queries. |
| `worker.js` | Worker entrypoint — generic entity REST (`/entities/<Entity>`) + functions router (`/functions/<name>`). |
| `db.js` | Data-access layer. **Cloudflare = primary, Base44 = backup** (dual-write). |
| `functions.js` | Ported backend functions (PayPal, notifications, moderation…). |
| `wrangler.toml` | Worker + D1 + R2 bindings and secrets list. |
| `.github/workflows/deploy.yml` | CI: applies the schema and deploys on push to `main`. |

## One-time setup

```bash
npm install -g wrangler
wrangler login

# 1. Create the D1 database, copy the printed database_id into wrangler.toml
wrangler d1 create gamer_productions

# 2. Apply the schema
cd cloudflare
wrangler d1 execute gamer_productions --remote --file=./schema.sql

# 3. Set secrets (values come from your existing Base44 secrets)
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_PUBLISHABLE_KEY
wrangler secret put PAYPAL_CLIENT_ID
wrangler secret put PAYPAL_CLIENT_SECRET
wrangler secret put BASE44_APP_ID
wrangler secret put BASE44_SERVICE_TOKEN          # enables the Base44 backup mirror
wrangler secret put CLOUDFLARE_R2_ACCESS_KEY_ID
wrangler secret put CLOUDFLARE_R2_SECRET_ACCESS_KEY

# 4. Deploy
wrangler deploy
```

## Data migration (one-time copy Base44 → D1)

Export each Base44 entity and `POST` the records to the Worker's entity endpoint, e.g.:

```bash
curl -X POST https://gamer-productions-api.<you>.workers.dev/entities/Listing \
  -H "Content-Type: application/json" -d @listing_record.json
```

Loop over all entities (Listing, UserProfile, Order, GamingCommunity, …) to backfill D1 once.

## How the backup works

`db.js` writes to D1 first (source of truth), then calls Base44's REST API to mirror the same create/update/delete. If the Base44 call fails it's logged but never blocks the primary write — so the site keeps running on Cloudflare while Base44 stays a current backup.

## Remaining functions

`functions.js` includes the high-traffic functions. To port the rest, lift each `functions/<name>.js` body from Base44 and add a `case` in `handleFunction` — replace `base44.asServiceRole.entities.X` calls with the `createRecord` / `updateRecord` / `listRecords` helpers.