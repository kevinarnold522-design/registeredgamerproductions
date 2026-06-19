-- =====================================================================
-- Gamer.Productions — Supabase (Postgres) User Data Schema
-- Mirrors the Cloudflare D1 `users` + `user_profiles` tables 1:1.
--
-- Run this in the Supabase SQL Editor (Database > SQL Editor > New query).
--
-- Notes:
--  • Supabase manages login/password/OAuth in the built-in `auth.users` table.
--  • `public.users` mirrors the app-level user record used across the app.
--  • `public.user_profiles` holds the extended profile (matches UserProfile entity).
-- =====================================================================

-- ---------- App-level users (mirror of D1 `users`) ----------
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  full_name     text,
  email         text unique,
  role          text default 'user',
  avatar_url    text,
  auth_provider text default 'email',          -- email | google | facebook | yahoo
  created_date  timestamptz default now(),
  updated_date  timestamptz default now(),
  created_by_id text
);
create index if not exists idx_users_email on public.users(email);

-- ---------- UserProfile (mirror of D1 `user_profiles`) ----------
create table if not exists public.user_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_email    text not null,
  username      text not null,
  account_type  text default 'regular',          -- regular | digital_creator | business
  display_name  text,
  bio           text,
  avatar_url    text,
  avatar_urls   jsonb default '[]'::jsonb,
  banner_url    text,
  profile_theme_color            text default '#8b5cf6',
  profile_theme_secondary        text default '#ec4899',
  profile_theme_background        text default '#050510',
  profile_theme_style             text default 'default',
  profile_theme_background_style  text default 'gradient',
  profile_theme_gradient_angle    real default 135,
  profile_theme_neon_intensity    real default 60,
  page_editor_enabled boolean default false,
  location      text,
  is_verified   boolean default false,
  verification_status text default 'none',
  verification_docs   jsonb default '[]'::jsonb,
  moderator_type text default 'none',
  no_ads        boolean default false,
  followers_count real default 0,
  following_count real default 0,
  total_sales   real default 0,
  total_revenue real default 0,
  payment_methods jsonb default '[]'::jsonb,
  payout_method text default 'paypal',
  payout_details jsonb default '{}'::jsonb,
  paypal_email  text,
  paypal_account_name text,
  paypal_account_type text,
  paypal_country text,
  paypal_merchant_id text,
  stripe_account_id text,
  stripe_publishable_key text,
  stripe_secret_key text,
  stripe_webhook_secret text,
  stripe_business_name text,
  stripe_country text,
  stripe_currency text default 'usd',
  stripe_connected boolean default false,
  business_name text,
  business_registration text,
  website_url   text,
  social_links  jsonb default '{}'::jsonb,
  youtube_url   text,
  youtube_channel_id text,
  youtube_subscribers real default 0,
  total_views   real default 0,
  total_watch_hours real default 0,
  is_monetized  boolean default false,
  gaming_checkmark boolean default false,
  total_earnings real default 0,
  joined_date   text,
  is_active     boolean default true,
  preferred_otp_method text default 'email',
  phone_number  text,
  saved_addresses jsonb default '[]'::jsonb,
  listing_sort_order text default 'newest',
  honor_badge   text,
  honor_badge_label text,
  gaming_accounts jsonb default '{}'::jsonb,
  kofi_url      text,
  buymeacoffee_url text,
  patreon_url   text,
  pending_delete_request boolean default false,
  favorite_sports_team text,
  favorite_game text,
  favorite_hobby text,
  is_managed_account boolean default false,
  managed_by_admin text,
  is_banned     boolean default false,
  banned_reason text,
  banned_date   text,
  created_date  timestamptz default now(),
  updated_date  timestamptz default now(),
  created_by_id text
);
create index if not exists idx_profiles_email on public.user_profiles(user_email);
create index if not exists idx_profiles_username on public.user_profiles(username);

-- ---------- Row Level Security ----------
alter table public.users enable row level security;
alter table public.user_profiles enable row level security;

-- Profiles are publicly readable (used for storefronts, channels, etc.)
drop policy if exists "Public profiles are viewable by everyone" on public.user_profiles;
create policy "Public profiles are viewable by everyone"
  on public.user_profiles for select using (true);

-- Authenticated users can insert/update their own profile row
drop policy if exists "Users can insert their own profile" on public.user_profiles;
create policy "Users can insert their own profile"
  on public.user_profiles for insert
  with check (auth.jwt() ->> 'email' = user_email);

drop policy if exists "Users can update their own profile" on public.user_profiles;
create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.jwt() ->> 'email' = user_email);

-- Users table: each user can read their own record
drop policy if exists "Users can view their own record" on public.users;
create policy "Users can view their own record"
  on public.users for select
  using (auth.jwt() ->> 'email' = email);