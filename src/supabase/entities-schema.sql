-- =====================================================================
-- GAMER.PRODUCTIONS — Supabase entities schema
-- Run ONCE in the Supabase SQL Editor.
--
-- Every app entity is one table with a common header + a `data jsonb`
-- column that holds all entity-specific fields. This is lossless (any
-- field the app stores is preserved) and keeps the frontend client
-- generic. The Supabase entities client flattens `data` back to the top
-- level so existing pages see the exact same record shape.
--
-- Security model (per the app's request — all access through Supabase):
--   * Public SELECT (listings, profiles, posts, etc. are public content).
--   * INSERT/UPDATE/DELETE allowed for authenticated users.
-- =====================================================================

create extension if not exists "pgcrypto";

-- Generic table creator -------------------------------------------------
do $$
declare
  t text;
  tables text[] := array[
    'Listing','UserProfile','ChannelPost','ChannelPostComment','CommunityPost',
    'PostComment','PostLike','PostRating','Order','GlobalTransactions','Transactions',
    'Tier1Subscription','Notification','Conversation','Message','Follow','Feedback',
    'Favorite','Cart','Review','GamingCommunity','CommunityMember','GroupChatMessage',
    'Tournament','SubcategoryRequest','SectionRequest','DailyReward','LoginHistory',
    'SiteSettings','SiteContent','SiteAnalytics','AdPlacement','ListingPageLayout',
    'ListingDeleteRequest','VideoPost'
  ];
begin
  foreach t in array tables loop
    execute format($f$
      create table if not exists public.%I (
        id uuid primary key default gen_random_uuid(),
        created_date timestamptz not null default now(),
        updated_date timestamptz not null default now(),
        created_by_id text,
        created_by text,
        data jsonb not null default '{}'::jsonb
      );
      alter table public.%I enable row level security;
    $f$, t, t);

    -- Public read
    execute format($f$
      drop policy if exists "%1$s_read" on public.%1$I;
      create policy "%1$s_read" on public.%1$I for select using (true);
    $f$, t);

    -- Authenticated write (insert / update / delete)
    execute format($f$
      drop policy if exists "%1$s_insert" on public.%1$I;
      create policy "%1$s_insert" on public.%1$I for insert to authenticated with check (true);
      drop policy if exists "%1$s_update" on public.%1$I;
      create policy "%1$s_update" on public.%1$I for update to authenticated using (true) with check (true);
      drop policy if exists "%1$s_delete" on public.%1$I;
      create policy "%1$s_delete" on public.%1$I for delete to authenticated using (true);
    $f$, t);

    -- Helpful indexes for the hottest filters
    execute format('create index if not exists %I on public.%I (created_date desc);', 'idx_'||lower(t)||'_created', t);
    execute format('create index if not exists %I on public.%I using gin (data jsonb_path_ops);', 'idx_'||lower(t)||'_data', t);
  end loop;
end $$;

-- Keep updated_date fresh on every UPDATE -------------------------------
create or replace function public.touch_updated_date()
returns trigger language plpgsql as $$
begin
  new.updated_date := now();
  return new;
end $$;

do $$
declare
  t text;
  tables text[] := array[
    'Listing','UserProfile','ChannelPost','ChannelPostComment','CommunityPost',
    'PostComment','PostLike','PostRating','Order','GlobalTransactions','Transactions',
    'Tier1Subscription','Notification','Conversation','Message','Follow','Feedback',
    'Favorite','Cart','Review','GamingCommunity','CommunityMember','GroupChatMessage',
    'Tournament','SubcategoryRequest','SectionRequest','DailyReward','LoginHistory',
    'SiteSettings','SiteContent','SiteAnalytics','AdPlacement','ListingPageLayout',
    'ListingDeleteRequest','VideoPost'
  ];
begin
  foreach t in array tables loop
    execute format('drop trigger if exists %I on public.%I;', 'trg_touch_'||lower(t), t);
    execute format('create trigger %I before update on public.%I for each row execute function public.touch_updated_date();', 'trg_touch_'||lower(t), t);
  end loop;
end $$;