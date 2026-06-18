// =====================================================================
// Drizzle ORM schema (type-safe parity with Base44 entities).
// Optional but recommended — gives you typed queries against D1.
//   npm i drizzle-orm
//   import { drizzle } from "drizzle-orm/d1";
//   const db = drizzle(env.DB, { schema });
// =====================================================================
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

const base = {
  id: text("id").primaryKey(),
  created_date: text("created_date"),
  updated_date: text("updated_date"),
  created_by_id: text("created_by_id"),
};

export const users = sqliteTable("users", {
  ...base,
  full_name: text("full_name"),
  email: text("email"),
  role: text("role").default("user"),
});

export const userProfiles = sqliteTable("user_profiles", {
  ...base,
  user_email: text("user_email").notNull(),
  username: text("username").notNull(),
  account_type: text("account_type").default("regular"),
  display_name: text("display_name"),
  bio: text("bio"),
  avatar_url: text("avatar_url"),
  avatar_urls: text("avatar_urls"),                 // JSON
  is_verified: integer("is_verified").default(0),
  followers_count: real("followers_count").default(0),
  following_count: real("following_count").default(0),
  total_earnings: real("total_earnings").default(0),
  stripe_connected: integer("stripe_connected").default(0),
  is_active: integer("is_active").default(1),
  // ...extend with the remaining columns from schema.sql as needed
});

export const listings = sqliteTable("listings", {
  ...base,
  seller_email: text("seller_email").notNull(),
  seller_username: text("seller_username"),
  title: text("title").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  currency: text("currency").default("PHP"),
  product_type: text("product_type").notNull(),
  category: text("category").notNull(),
  images: text("images"),                           // JSON
  status: text("status").default("active"),
  is_premium: integer("is_premium").default(0),
  is_free: integer("is_free").default(0),
  views: real("views").default(0),
  downloads: real("downloads").default(0),
  likes: real("likes").default(0),
  // ...extend with the remaining columns from schema.sql as needed
});

export const orders = sqliteTable("orders", {
  ...base,
  buyer_email: text("buyer_email").notNull(),
  seller_email: text("seller_email").notNull(),
  listing_id: text("listing_id").notNull(),
  listing_title: text("listing_title"),
  amount: real("amount").notNull(),
  commission: real("commission"),
  seller_payout: real("seller_payout"),
  currency: text("currency").default("PHP"),
  payment_status: text("payment_status").default("pending"),
  order_status: text("order_status").default("processing"),
});

export const notifications = sqliteTable("notifications", {
  ...base,
  user_email: text("user_email").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  is_read: integer("is_read").default(0),
  link: text("link"),
  related_id: text("related_id"),
});

// entity_records: generic JSON mirror for entities without a typed table
export const entityRecords = sqliteTable("entity_records", {
  ...base,
  entity_name: text("entity_name").notNull(),
  data: text("data").notNull(),
});