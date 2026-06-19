-- =====================================================================
-- Gamer.Productions — Cloudflare D1 Schema
-- Mirrors the Base44 entity schemas 1:1 (Cloudflare = primary, Base44 = backup)
--
-- Every table includes the Base44 built-in columns so records replicate cleanly:
--   id, created_date, updated_date, created_by_id
--
-- Apply with:  wrangler d1 execute gp --file=./cloudflare/schema.sql
-- =====================================================================

PRAGMA foreign_keys = OFF;

-- ---------- Users (native Cloudflare auth) ----------
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  full_name     TEXT,
  email         TEXT UNIQUE,
  role          TEXT DEFAULT 'user',
  avatar_url    TEXT,
  auth_provider TEXT DEFAULT 'email',          -- email | google | facebook | yahoo
  password_hash TEXT,                           -- SHA-256, only for email sign-ups
  created_date  TEXT DEFAULT (datetime('now')),
  updated_date  TEXT DEFAULT (datetime('now')),
  created_by_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ---------- Sessions (native Cloudflare auth) ----------
CREATE TABLE IF NOT EXISTS sessions (
  token         TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  created_date  TEXT DEFAULT (datetime('now')),
  expires_date  TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ---------- UserProfile ----------
CREATE TABLE IF NOT EXISTS user_profiles (
  id            TEXT PRIMARY KEY,
  user_email    TEXT NOT NULL,
  username      TEXT NOT NULL,
  account_type  TEXT DEFAULT 'regular',          -- regular | digital_creator | business
  display_name  TEXT,
  bio           TEXT,
  avatar_url    TEXT,
  avatar_urls   TEXT,                              -- JSON array
  banner_url    TEXT,
  profile_theme_color            TEXT DEFAULT '#8b5cf6',
  profile_theme_secondary        TEXT DEFAULT '#ec4899',
  profile_theme_background        TEXT DEFAULT '#050510',
  profile_theme_style             TEXT DEFAULT 'default',
  profile_theme_background_style  TEXT DEFAULT 'gradient',
  profile_theme_gradient_angle    REAL DEFAULT 135,
  profile_theme_neon_intensity    REAL DEFAULT 60,
  page_editor_enabled INTEGER DEFAULT 0,
  location      TEXT,
  is_verified   INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'none',
  verification_docs   TEXT,                        -- JSON array
  moderator_type TEXT DEFAULT 'none',
  no_ads        INTEGER DEFAULT 0,
  followers_count REAL DEFAULT 0,
  following_count REAL DEFAULT 0,
  total_sales   REAL DEFAULT 0,
  total_revenue REAL DEFAULT 0,
  payment_methods TEXT,                            -- JSON array
  payout_method TEXT DEFAULT 'paypal',
  payout_details TEXT,                             -- JSON object
  paypal_email  TEXT,
  paypal_account_name TEXT,
  paypal_account_type TEXT,
  paypal_country TEXT,
  paypal_merchant_id TEXT,
  stripe_account_id TEXT,
  stripe_publishable_key TEXT,
  stripe_secret_key TEXT,
  stripe_webhook_secret TEXT,
  stripe_business_name TEXT,
  stripe_country TEXT,
  stripe_currency TEXT DEFAULT 'usd',
  stripe_connected INTEGER DEFAULT 0,
  business_name TEXT,
  business_registration TEXT,
  website_url   TEXT,
  social_links  TEXT,                              -- JSON object
  youtube_url   TEXT,
  youtube_channel_id TEXT,
  youtube_subscribers REAL DEFAULT 0,
  total_views   REAL DEFAULT 0,
  total_watch_hours REAL DEFAULT 0,
  is_monetized  INTEGER DEFAULT 0,
  gaming_checkmark INTEGER DEFAULT 0,
  total_earnings REAL DEFAULT 0,
  joined_date   TEXT,
  is_active     INTEGER DEFAULT 1,
  preferred_otp_method TEXT DEFAULT 'email',
  phone_number  TEXT,
  saved_addresses TEXT,                            -- JSON array
  listing_sort_order TEXT DEFAULT 'newest',
  honor_badge   TEXT,
  honor_badge_label TEXT,
  gaming_accounts TEXT,                            -- JSON object
  kofi_url      TEXT,
  buymeacoffee_url TEXT,
  patreon_url   TEXT,
  pending_delete_request INTEGER DEFAULT 0,
  favorite_sports_team TEXT,
  favorite_game TEXT,
  favorite_hobby TEXT,
  is_managed_account INTEGER DEFAULT 0,
  managed_by_admin TEXT,
  created_date  TEXT DEFAULT (datetime('now')),
  updated_date  TEXT DEFAULT (datetime('now')),
  created_by_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON user_profiles(user_email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON user_profiles(username);

-- ---------- Listing ----------
CREATE TABLE IF NOT EXISTS listings (
  id            TEXT PRIMARY KEY,
  seller_email  TEXT NOT NULL,
  seller_username TEXT,
  title         TEXT NOT NULL,
  description   TEXT,
  price         REAL NOT NULL,
  currency      TEXT DEFAULT 'PHP',
  product_type  TEXT NOT NULL,                     -- digital | physical
  category      TEXT NOT NULL,
  subcategories TEXT,                              -- JSON array
  digital_subcategory TEXT,
  physical_subcategory TEXT,
  images        TEXT,                              -- JSON array
  tags          TEXT,                              -- JSON array
  keywords      TEXT,                              -- JSON array
  platforms     TEXT,                              -- JSON array
  store_platforms TEXT,                            -- JSON array
  store_platform_links TEXT,                       -- JSON object
  ign_rating    REAL,
  tool_target_game TEXT,
  preview_video_url TEXT,
  game_name     TEXT,
  game_platform TEXT,
  condition     TEXT DEFAULT 'digital',
  status        TEXT DEFAULT 'active',
  is_premium    INTEGER DEFAULT 0,
  is_free       INTEGER DEFAULT 0,
  location      TEXT,
  views         REAL DEFAULT 0,
  downloads     REAL DEFAULT 0,
  likes         REAL DEFAULT 0,
  shares        REAL DEFAULT 0,
  stock         REAL DEFAULT 1,
  quantity      REAL DEFAULT 1,
  download_url  TEXT,
  download_host TEXT,
  external_link TEXT,
  is_approved   INTEGER DEFAULT 1,
  youtube_url   TEXT,
  youtube_video_id TEXT,
  video_url     TEXT,
  seller_paypal_email TEXT,
  card_animation TEXT DEFAULT 'fade',
  card_glow_style TEXT DEFAULT 'radiant',
  card_glow_color TEXT DEFAULT 'purple',
  card_glow_hex TEXT DEFAULT '#a855f7',
  card_glow_speed TEXT DEFAULT 'slow',
  listing_theme_color TEXT DEFAULT '#030712',
  kofi_url      TEXT,
  buymeacoffee_url TEXT,
  patreon_url   TEXT,
  community_franchise_id TEXT,
  modding_subcategory TEXT,
  created_date  TEXT DEFAULT (datetime('now')),
  updated_date  TEXT DEFAULT (datetime('now')),
  created_by_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_email);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

-- ---------- Order ----------
CREATE TABLE IF NOT EXISTS orders (
  id            TEXT PRIMARY KEY,
  buyer_email   TEXT NOT NULL,
  seller_email  TEXT NOT NULL,
  listing_id    TEXT NOT NULL,
  listing_title TEXT,
  amount        REAL NOT NULL,
  commission    REAL,
  seller_payout REAL,
  currency      TEXT DEFAULT 'PHP',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  order_status  TEXT DEFAULT 'processing',
  transaction_id TEXT,
  receipt_url   TEXT,
  notes         TEXT,
  created_date  TEXT DEFAULT (datetime('now')),
  updated_date  TEXT DEFAULT (datetime('now')),
  created_by_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_email);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_email);

-- ---------- GamingCommunity ----------
CREATE TABLE IF NOT EXISTS gaming_communities (
  id            TEXT PRIMARY KEY,
  franchise_id  TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  logo_url      TEXT,
  logo_urls     TEXT,                              -- JSON array
  cover_url     TEXT,
  cover_urls    TEXT,                              -- JSON array
  genre         TEXT,
  tags          TEXT,                              -- JSON array
  member_count  REAL DEFAULT 0,
  post_count    REAL DEFAULT 0,
  is_featured   INTEGER DEFAULT 0,
  display_order REAL DEFAULT 0,
  color_primary TEXT DEFAULT '#7c3aed',
  color_secondary TEXT DEFAULT '#ec4899',
  moderator_emails TEXT,                           -- JSON array
  sections      TEXT,                              -- JSON array
  created_date  TEXT DEFAULT (datetime('now')),
  updated_date  TEXT DEFAULT (datetime('now')),
  created_by_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_communities_franchise ON gaming_communities(franchise_id);

-- ---------- CommunityMember ----------
CREATE TABLE IF NOT EXISTS community_members (
  id            TEXT PRIMARY KEY,
  community_id  TEXT NOT NULL,
  franchise_id  TEXT,
  user_email    TEXT NOT NULL,
  username      TEXT,
  avatar_url    TEXT,
  is_moderator  INTEGER DEFAULT 0,
  created_date  TEXT DEFAULT (datetime('now')),
  updated_date  TEXT DEFAULT (datetime('now')),
  created_by_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON community_members(user_email);

-- ---------- ChannelPost ----------
CREATE TABLE IF NOT EXISTS channel_posts (
  id            TEXT PRIMARY KEY,
  creator_email TEXT NOT NULL,
  creator_username TEXT,
  creator_avatar TEXT,
  content_type  TEXT DEFAULT 'image',
  image_urls    TEXT,                              -- JSON array
  caption       TEXT,
  tags          TEXT,                              -- JSON array
  likes         REAL DEFAULT 0,
  comments_count REAL DEFAULT 0,
  shares_count  REAL DEFAULT 0,
  is_approved   INTEGER DEFAULT 1,
  status        TEXT DEFAULT 'active',
  description   TEXT,
  created_date  TEXT DEFAULT (datetime('now')),
  updated_date  TEXT DEFAULT (datetime('now')),
  created_by_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_channel_posts_creator ON channel_posts(creator_email);

-- ---------- Notification ----------
CREATE TABLE IF NOT EXISTS notifications (
  id            TEXT PRIMARY KEY,
  user_email    TEXT NOT NULL,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  is_read       INTEGER DEFAULT 0,
  link          TEXT,
  related_id    TEXT,
  created_date  TEXT DEFAULT (datetime('now')),
  updated_date  TEXT DEFAULT (datetime('now')),
  created_by_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_notifications_email ON notifications(user_email);

-- ---------- Transactions ----------
CREATE TABLE IF NOT EXISTS transactions (
  id            TEXT PRIMARY KEY,
  customer_email TEXT NOT NULL,
  item_name     TEXT NOT NULL,
  amount        REAL NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  paypal_order_id TEXT,
  created_date  TEXT DEFAULT (datetime('now')),
  updated_date  TEXT DEFAULT (datetime('now')),
  created_by_id TEXT
);

-- ---------- GlobalTransactions ----------
CREATE TABLE IF NOT EXISTS global_transactions (
  id            TEXT PRIMARY KEY,
  order_id      TEXT NOT NULL,
  buyer_email   TEXT NOT NULL,
  seller_email  TEXT NOT NULL,
  seller_paypal_id TEXT,
  total_amount  REAL NOT NULL,
  admin_fee     REAL,
  seller_payout REAL,
  paypal_order_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  split_status  TEXT DEFAULT 'pending',
  transaction_date TEXT,
  created_date  TEXT DEFAULT (datetime('now')),
  updated_date  TEXT DEFAULT (datetime('now')),
  created_by_id TEXT
);

-- ---------- Follow ----------
CREATE TABLE IF NOT EXISTS follows (
  id            TEXT PRIMARY KEY,
  follower_email TEXT NOT NULL,
  following_email TEXT NOT NULL,
  follower_username TEXT,
  following_username TEXT,
  source        TEXT DEFAULT 'manual',
  created_date  TEXT DEFAULT (datetime('now')),
  updated_date  TEXT DEFAULT (datetime('now')),
  created_by_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_email);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_email);

-- ---------- Generic JSON mirror for remaining entities ----------
-- Entities without a dedicated table above are mirrored here as JSON rows so
-- nothing is lost during migration. Promote any of these to a typed table later.
--   Covers: SiteSettings, SiteContent, SiteAnalytics, Review, Cart, Favorite,
--   CommunityPost, GroupChatMessage, PostComment, PostLike, PostRating,
--   Tournament, SubcategoryRequest, SectionRequest, ChannelPostComment,
--   Message, VideoPost, Conversation, DailyReward, Feedback, LoginHistory,
--   AdPlacement, ListingPageLayout, ListingDeleteRequest, Tier1Subscription
CREATE TABLE IF NOT EXISTS entity_records (
  id            TEXT PRIMARY KEY,
  entity_name   TEXT NOT NULL,
  data          TEXT NOT NULL,                     -- full JSON record
  created_date  TEXT DEFAULT (datetime('now')),
  updated_date  TEXT DEFAULT (datetime('now')),
  created_by_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_entity_records_name ON entity_records(entity_name);

PRAGMA foreign_keys = ON;