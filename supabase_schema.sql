-- ==============================================================================
-- MIRATH (ميراث) — SUPABASE VISITOR INTELLIGENCE & TELEMETRY SCHEMA
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- to create the visitor tracking table with public insertion policies (RLS).

-- 1. Create the visitor_telemetry table
create table if not exists public.visitor_telemetry (
  id bigint generated always as identity primary key,
  visitor_id text not null,
  session_id text not null,
  ip text,
  ip_type text default 'IPv4',
  continent text,
  continent_code text,
  country text,
  country_code text,
  flag_emoji text default '🌐',
  region text,
  city text,
  postal text,
  latitude double precision,
  longitude double precision,
  isp text,
  org text,
  asn text,
  timezone_geo text,
  browser text,
  browser_version text,
  os text,
  device_type text,
  screen_resolution text,
  viewport text,
  language text,
  languages text,
  cpu_cores text,
  device_memory text,
  connection_type text,
  touch_support boolean default false,
  referrer text,
  landing_page text,
  current_path text,
  visit_count integer default 1,
  pageviews integer default 1,
  session_duration_seconds integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create the analytics_events table for tracking specific user actions
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  visitor_id text,
  session_id text,
  category text,
  action text,
  label text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create indexes for fast querying & analytics reporting
create index if not exists idx_visitor_telemetry_created_at on public.visitor_telemetry(created_at desc);
create index if not exists idx_visitor_telemetry_ip on public.visitor_telemetry(ip);
create index if not exists idx_visitor_telemetry_country on public.visitor_telemetry(country);
create index if not exists idx_visitor_telemetry_visitor_id on public.visitor_telemetry(visitor_id);
create index if not exists idx_visitor_telemetry_session_id on public.visitor_telemetry(session_id);

-- 4. Enable Row Level Security (RLS)
alter table public.visitor_telemetry enable row level security;
alter table public.analytics_events enable row level security;

-- 5. Create RLS Policies
-- Allow anyone (public/anonymous visitors) to insert their own session data
drop policy if exists "Allow public anonymous inserts" on public.visitor_telemetry;
create policy "Allow public anonymous inserts"
  on public.visitor_telemetry
  for insert
  to anon, authenticated
  with check (true);

-- Allow updates for heartbeat duration on same session
drop policy if exists "Allow public anonymous updates" on public.visitor_telemetry;
create policy "Allow public anonymous updates"
  on public.visitor_telemetry
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- Allow reading logs (for curator dashboard)
drop policy if exists "Allow read access to logs" on public.visitor_telemetry;
create policy "Allow read access to logs"
  on public.visitor_telemetry
  for select
  to anon, authenticated
  using (true);

-- Policies for analytics_events
drop policy if exists "Allow event inserts" on public.analytics_events;
create policy "Allow event inserts"
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow event select" on public.analytics_events;
create policy "Allow event select"
  on public.analytics_events
  for select
  to anon, authenticated
  using (true);
