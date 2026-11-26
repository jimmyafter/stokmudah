-- StokMudah initial schema.
-- NOT applied to any project yet. The app currently stores data on the device only.
-- Every table is protected by row-level security so a user only sees their own rows.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  language text not null default 'en' check (language in ('en', 'ms')),
  payday_day int not null default 25 check (payday_day between 1 and 31),
  plan text not null default 'free' check (plan in ('free', 'premium')),
  ai_quota_used int not null default 0,
  quota_reset_at timestamptz not null default (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz not null default now()
);

-- Shared product library: remembers what a barcode or photo turned out to be.
create table public.products (
  id uuid primary key default gen_random_uuid(),
  barcode text unique,
  name text not null,
  brand text,
  size text,
  category text check (category in ('fresh', 'pantry', 'household', 'toiletries')),
  source text not null default 'manual' check (source in ('barcode', 'ai', 'manual')),
  created_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references public.products (id),
  name text not null,
  barcode text,
  category text not null check (category in ('fresh', 'pantry', 'household', 'toiletries')),
  location text not null check (location in ('kitchen', 'bathroom', 'storeroom')),
  quantity numeric not null default 0 check (quantity >= 0),
  level numeric not null default 1 check (level between 0 and 1),
  min_stock numeric not null default 0.3,
  usual_qty int not null default 1,
  warn_days int not null default 3,
  last_price numeric(10, 2),
  last_store text,
  created_at timestamptz not null default now()
);
create index items_user_idx on public.items (user_id);

create table public.batches (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  quantity numeric not null check (quantity >= 0),
  purchase_date date not null default current_date,
  expiry_date date,
  price numeric(10, 2),
  store text
);
create index batches_item_idx on public.batches (item_id);

create table public.stock_counts (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  method text not null check (method in ('blind', 'level', 'number')),
  counted_units numeric not null,
  estimated_units numeric,
  counted_at timestamptz not null default now()
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  store text,
  total numeric(10, 2),
  parsed_json jsonb,
  scanned_at timestamptz not null default now()
);

create table public.recipients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  phone text not null
);

-- A household can save at most three WhatsApp contacts.
create function public.limit_recipients() returns trigger language plpgsql as $$
begin
  if (select count(*) from public.recipients where user_id = new.user_id) >= 3 then
    raise exception 'A maximum of 3 recipients is allowed';
  end if;
  return new;
end;
$$;
create trigger recipients_limit before insert on public.recipients
  for each row execute function public.limit_recipients();

create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_for_date date not null default current_date,
  source text not null default 'manual' check (source in ('salary_week', 'manual')),
  status text not null default 'open' check (status in ('open', 'sent', 'done'))
);

create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid references public.items (id) on delete set null,
  name text not null,
  qty int not null default 1,
  checked boolean not null default true
);

-- Row-level security: each user only touches their own rows.
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.batches enable row level security;
alter table public.stock_counts enable row level security;
alter table public.receipts enable row level security;
alter table public.recipients enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.products enable row level security;

create policy "own profile" on public.profiles for all
  using (id = auth.uid()) with check (id = auth.uid());
create policy "own items" on public.items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own batches" on public.batches for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own counts" on public.stock_counts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own receipts" on public.receipts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own recipients" on public.recipients for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own lists" on public.shopping_lists for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own list items" on public.shopping_list_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Products are a shared library: any signed-in user can read and add, none can edit others' rows.
create policy "read products" on public.products for select to authenticated using (true);
create policy "add products" on public.products for insert to authenticated with check (true);
