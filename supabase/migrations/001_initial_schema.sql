-- FreshSave Initial Schema
-- Run this in your Supabase SQL editor after creating your project

-- =============================================
-- USERS TABLE (extends auth.users)
-- =============================================
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  name text,
  zip_code text,
  lat numeric,
  lon numeric,
  daily_calorie_goal integer default 2000,
  weekly_budget numeric,
  preferred_stores text[] default array['Walmart', 'Target', 'Kroger', 'Aldi'],
  plan text default 'free' check (plan in ('free', 'premium')),
  created_at timestamptz default now()
);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name)
  values (
    new.id,
    new.raw_user_meta_data->>'name'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- =============================================
-- GROCERY TRIPS TABLE
-- =============================================
create table if not exists public.grocery_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  items jsonb not null default '[]',
  store_chosen text,
  total_spent numeric,
  savings_amount numeric default 0,
  optimized_cart jsonb,
  created_at timestamptz default now()
);

-- RLS
alter table public.grocery_trips enable row level security;

create policy "Users can view their own trips"
  on public.grocery_trips for select
  using (auth.uid() = user_id);

create policy "Users can insert their own trips"
  on public.grocery_trips for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own trips"
  on public.grocery_trips for update
  using (auth.uid() = user_id);

create policy "Users can delete their own trips"
  on public.grocery_trips for delete
  using (auth.uid() = user_id);

-- Index for fast dashboard queries
create index if not exists grocery_trips_user_date_idx
  on public.grocery_trips(user_id, date desc);

-- =============================================
-- CALORIE LOGS TABLE (Phase 2 — created now, used later)
-- =============================================
create table if not exists public.calorie_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  items jsonb not null default '[]',
  total_calories integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  log_method text check (log_method in ('search', 'barcode', 'photo', 'grocery_list')),
  created_at timestamptz default now()
);

alter table public.calorie_logs enable row level security;

create policy "Users can manage their own calorie logs"
  on public.calorie_logs for all
  using (auth.uid() = user_id);

-- =============================================
-- SAVED LISTS TABLE
-- =============================================
create table if not exists public.saved_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  items jsonb not null default '[]',
  created_at timestamptz default now()
);

alter table public.saved_lists enable row level security;

create policy "Users can manage their own saved lists"
  on public.saved_lists for all
  using (auth.uid() = user_id);

-- =============================================
-- AI ADVICE CACHE TABLE
-- =============================================
create table if not exists public.ai_advice_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  advice_type text check (advice_type in ('budget_weekly', 'nutrition_daily', 'combined')),
  content text not null,
  generated_at timestamptz default now(),
  expires_at timestamptz
);

alter table public.ai_advice_cache enable row level security;

create policy "Users can view their own AI advice"
  on public.ai_advice_cache for select
  using (auth.uid() = user_id);

create policy "Service role can insert AI advice"
  on public.ai_advice_cache for insert
  with check (auth.uid() = user_id);
