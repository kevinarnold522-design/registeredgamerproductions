-- =====================================================================
-- Gamer.Productions — Supabase Storage Setup
-- Run this once in Supabase Dashboard > SQL Editor.
-- This creates the public media bucket used by all app uploads.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('gamerproductionsmedia', 'gamerproductionsmedia', true, 26214400)
on conflict (id) do update set
  public = true,
  file_size_limit = 26214400;

-- Storage object policies for the media bucket.
-- Public read is required so uploaded profile/listing images render in the app.
drop policy if exists "Gamer media public read" on storage.objects;
create policy "Gamer media public read"
  on storage.objects for select
  using (bucket_id = 'gamerproductionsmedia');

-- Logged-in users can upload media from the app.
drop policy if exists "Gamer media authenticated upload" on storage.objects;
create policy "Gamer media authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'gamerproductionsmedia' and auth.role() = 'authenticated');

-- Logged-in users can update/delete media they uploaded.
drop policy if exists "Gamer media owner update" on storage.objects;
create policy "Gamer media owner update"
  on storage.objects for update
  using (bucket_id = 'gamerproductionsmedia' and owner = auth.uid());

drop policy if exists "Gamer media owner delete" on storage.objects;
create policy "Gamer media owner delete"
  on storage.objects for delete
  using (bucket_id = 'gamerproductionsmedia' and owner = auth.uid());