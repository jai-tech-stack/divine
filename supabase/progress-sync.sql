begin;
alter table public.user_progress add column if not exists revision bigint not null default 0;
create or replace function public.save_user_progress(document jsonb, expected_revision bigint)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare owner_id uuid := auth.uid();
begin
  if owner_id is null then raise exception 'Authentication required'; end if;
  if jsonb_typeof(document) <> 'object' or octet_length(document::text) > 300000 then
    raise exception 'Invalid progress document';
  end if;
  update public.user_progress set progress = document, revision = revision + 1, updated_at = now()
    where user_id = owner_id and revision = expected_revision;
  if found then return true; end if;
  if expected_revision = 0 then
    insert into public.user_progress(user_id, progress, revision) values (owner_id, document, 1)
      on conflict (user_id) do nothing;
    return found;
  end if;
  return false;
end $$;
revoke all on function public.save_user_progress(jsonb, bigint) from public, anon;
grant execute on function public.save_user_progress(jsonb, bigint) to authenticated;
notify pgrst, 'reload schema';
commit;
