begin;
create table if not exists public.provider_daily_usage (
  day date not null default current_date,
  provider text not null,
  requests integer not null default 0 check(requests >= 0),
  primary key(day, provider)
);
alter table public.provider_daily_usage enable row level security;
revoke all on public.provider_daily_usage from public, anon, authenticated;
grant all on public.provider_daily_usage to service_role;
create or replace function public.reserve_provider_request(provider_name text, daily_limit integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare reserved integer;
begin
  if provider_name not in ('gemini','groq','openrouter') or daily_limit < 1 or daily_limit > 1000 then return false; end if;
  insert into public.provider_daily_usage(day, provider, requests) values(current_date, provider_name, 1)
  on conflict(day, provider) do update set requests = public.provider_daily_usage.requests + 1
    where public.provider_daily_usage.requests < daily_limit
  returning requests into reserved;
  return reserved is not null;
end $$;
revoke all on function public.reserve_provider_request(text, integer) from public, anon, authenticated;
grant execute on function public.reserve_provider_request(text, integer) to service_role;
notify pgrst, 'reload schema';
commit;
