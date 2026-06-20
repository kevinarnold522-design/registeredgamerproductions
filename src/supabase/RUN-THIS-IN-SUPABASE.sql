-- =====================================================================
-- GAMER.PRODUCTIONS — Supabase setup. RUN THIS ONCE.
--
-- 1. Open Supabase Dashboard → SQL Editor → New query
-- 2. Paste this ENTIRE file
-- 3. Click RUN
--
-- Safe to run more than once (uses "if not exists"). It creates every
-- table the app needs (UserProfile, Listing, posts, etc.), enables public
-- read + authenticated write, and keeps updated_date fresh.
-- After running, the app migrates all existing data automatically.
-- =====================================================================

create extension if not exists "pgcrypto";

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
    $f$, t);
    execute format('alter table public.%I enable row level security;', t);

    execute format('drop policy if exists %L on public.%I;', t||'_read', t);
    execute format('create policy %L on public.%I for select using (true);', t||'_read', t);

    execute format('drop policy if exists %L on public.%I;', t||'_insert', t);
    execute format('create policy %L on public.%I for insert to authenticated with check (true);', t||'_insert', t);

    execute format('drop policy if exists %L on public.%I;', t||'_update', t);
    execute format('create policy %L on public.%I for update to authenticated using (true) with check (true);', t||'_update', t);

    execute format('drop policy if exists %L on public.%I;', t||'_delete', t);
    execute format('create policy %L on public.%I for delete to authenticated using (true);', t||'_delete', t);

    execute format('create index if not exists %I on public.%I (created_date desc);', 'idx_'||lower(t)||'_created', t);
    execute format('create index if not exists %I on public.%I using gin (data jsonb_path_ops);', 'idx_'||lower(t)||'_data', t);
  end loop;
end $$;

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

-- Force PostgREST to reload its schema cache so writes to the new tables work
-- immediately (otherwise upserts fail with "could not find the table in the
-- schema cache" even though the table exists).
notify pgrst, 'reload schema';

-- Confirm all 36 tables now exist (should return 36 rows):
select tablename from pg_tables
where schemaname = 'public'
and tablename in (
  'Listing','UserProfile','ChannelPost','ChannelPostComment','CommunityPost',
  'PostComment','PostLike','PostRating','Order','GlobalTransactions','Transactions',
  'Tier1Subscription','Notification','Conversation','Message','Follow','Feedback',
  'Favorite','Cart','Review','GamingCommunity','CommunityMember','GroupChatMessage',
  'Tournament','SubcategoryRequest','SectionRequest','DailyReward','LoginHistory',
  'SiteSettings','SiteContent','SiteAnalytics','AdPlacement','ListingPageLayout',
  'ListingDeleteRequest','VideoPost'
)
order by tablename;