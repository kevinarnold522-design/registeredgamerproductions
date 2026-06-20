# Move the database to Supabase (permanent)

The app now reads and writes **all entity data directly to Supabase Postgres**.
Two one-time steps activate it:

## Step 1 — Create the tables (once)
1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/entities-schema.sql`.
3. Click **Run**.

This creates one table per entity (Listing, UserProfile, CommunityPost, …)
with public read + authenticated write security, and keeps `updated_date` fresh.

## Step 2 — Copy existing data (once)
After the tables exist, trigger the `migrateToSupabase` backend function once.
It copies every existing record from the old database into Supabase (idempotent —
safe to run again). When the summary shows your records migrated, you're done.

From then on, every listing, post, profile, avatar, and cover photo lives
permanently in Supabase and reloads on every session.