CREATE TABLE IF NOT EXISTS public.visitor_telemetry (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  visitor_id text NOT NULL,
  session_id text NOT NULL,
  ip text,
  ip_type text DEFAULT 'IPv4',
  continent text,
  continent_code text,
  country text,
  country_code text,
  flag_emoji text DEFAULT '🌐',
  region text,
  city text,
  postal text,
  latitude double precision,
  longitude double precision,
  has_exact_gps boolean DEFAULT false,
  exact_latitude double precision,
  exact_longitude double precision,
  exact_accuracy double precision,
  exact_altitude double precision,
  qibla_bearing double precision,
  qibla_distance_km double precision,
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
  touch_support boolean DEFAULT false,
  referrer text,
  landing_page text,
  current_path text,
  visit_count integer DEFAULT 1,
  pageviews integer DEFAULT 1,
  session_duration_seconds integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  visitor_id text,
  session_id text,
  category text,
  action text,
  label text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_visitor_telemetry_created_at ON public.visitor_telemetry(created_at desc);
CREATE INDEX IF NOT EXISTS idx_visitor_telemetry_ip ON public.visitor_telemetry(ip);
CREATE INDEX IF NOT EXISTS idx_visitor_telemetry_country ON public.visitor_telemetry(country);
CREATE INDEX IF NOT EXISTS idx_visitor_telemetry_visitor_id ON public.visitor_telemetry(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_telemetry_session_id ON public.visitor_telemetry(session_id);

ALTER TABLE public.visitor_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public anonymous inserts" ON public.visitor_telemetry;
CREATE POLICY "Allow public anonymous inserts" ON public.visitor_telemetry FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public anonymous updates" ON public.visitor_telemetry;
CREATE POLICY "Allow public anonymous updates" ON public.visitor_telemetry FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read access to logs" ON public.visitor_telemetry;
CREATE POLICY "Allow read access to logs" ON public.visitor_telemetry FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow event inserts" ON public.analytics_events;
CREATE POLICY "Allow event inserts" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow event select" ON public.analytics_events;
CREATE POLICY "Allow event select" ON public.analytics_events FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.visitor_telemetry ADD COLUMN IF NOT EXISTS has_exact_gps boolean DEFAULT false;
ALTER TABLE public.visitor_telemetry ADD COLUMN IF NOT EXISTS exact_latitude double precision;
ALTER TABLE public.visitor_telemetry ADD COLUMN IF NOT EXISTS exact_longitude double precision;
ALTER TABLE public.visitor_telemetry ADD COLUMN IF NOT EXISTS exact_accuracy double precision;
ALTER TABLE public.visitor_telemetry ADD COLUMN IF NOT EXISTS exact_altitude double precision;
ALTER TABLE public.visitor_telemetry ADD COLUMN IF NOT EXISTS qibla_bearing double precision;
ALTER TABLE public.visitor_telemetry ADD COLUMN IF NOT EXISTS qibla_distance_km double precision;
ALTER TABLE public.visitor_telemetry ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
