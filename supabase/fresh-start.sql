-- One-time fresh start for project oojhfezpvpdfrjjdsjod.
-- Preserve the complete previous schema as a private, reversible backup.
begin;
do $$ begin
  if to_regnamespace('divine_backup_20261026') is not null then
    raise exception 'Backup already exists; refusing to repeat the reset';
  end if;
  if (select count(*) from pg_tables where schemaname = 'public') <> 37 then
    raise exception 'Old schema changed; inspect before proceeding';
  end if;
end $$;
alter extension pg_trgm set schema extensions;
alter extension vector set schema extensions;
alter schema public rename to divine_backup_20261026;
revoke all on schema divine_backup_20261026 from public, anon, authenticated;
revoke all on all tables in schema divine_backup_20261026 from public, anon, authenticated;
revoke all on all sequences in schema divine_backup_20261026 from public, anon, authenticated;
revoke all on all routines in schema divine_backup_20261026 from public, anon, authenticated;
create schema public authorization postgres;
grant usage on schema public to anon, authenticated, service_role;
grant all on schema public to service_role;

create table public.content_documents (
  kind text not null check (kind in ('book','mantra','gita','nayanmar','purana')),
  id text not null,
  title text not null,
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  published boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (kind, id)
);
alter table public.content_documents enable row level security;
grant select on public.content_documents to anon, authenticated;
grant all on public.content_documents to service_role;
create policy published_read on public.content_documents for select to anon, authenticated using (published);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
create policy own_profile on public.profiles to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create table public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_progress enable row level security;
grant select, insert, update, delete on public.user_progress to authenticated;
grant all on public.user_progress to service_role;
create policy own_progress on public.user_progress to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Replace the old trigger explicitly: it must not keep writing to the archive.
drop trigger if exists on_auth_user_created on auth.users;
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id) values (new.id) on conflict do nothing;
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
insert into public.profiles(id) select id from auth.users on conflict do nothing;
notify pgrst, 'reload schema';
commit;
