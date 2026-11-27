-- Applied to project fywgvppbvisvchwbyffz as "ai_scan_usage".
create table public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  scans integer not null default 0,
  primary key (user_id, month)
);
alter table public.ai_usage enable row level security;
create policy "read own usage" on public.ai_usage for select to authenticated using (user_id = (select auth.uid()));

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','premium')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "read own profile" on public.profiles for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.consume_scan(p_user uuid, p_month text, p_limit integer)
returns integer language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  insert into public.ai_usage(user_id, month, scans) values (p_user, p_month, 0)
  on conflict (user_id, month) do nothing;
  update public.ai_usage set scans = scans + 1
  where user_id = p_user and month = p_month and scans < p_limit
  returning scans into n;
  return coalesce(n, -1);
end $$;
revoke all on function public.consume_scan(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.consume_scan(uuid, text, integer) to service_role;

create or replace function public.refund_scan(p_user uuid, p_month text)
returns void language sql security definer set search_path = '' as $$
  update public.ai_usage set scans = greatest(scans - 1, 0) where user_id = p_user and month = p_month;
$$;
revoke all on function public.refund_scan(uuid, text) from public, anon, authenticated;
grant execute on function public.refund_scan(uuid, text) to service_role;
