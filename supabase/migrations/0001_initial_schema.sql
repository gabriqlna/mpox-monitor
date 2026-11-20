create table if not exists sources (
  id text primary key,
  name text not null,
  kind text not null check (kind in ('official', 'news', 'fixture')),
  url text not null,
  status text not null default 'active',
  last_success_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists observations (
  id text primary key,
  source_id text not null references sources(id),
  location_code text not null,
  location_name text not null,
  state_code text not null,
  location_level text not null check (location_level in ('state', 'municipality')),
  reference_date date not null,
  metric text not null,
  case_status text not null,
  value integer not null check (value >= 0),
  source_published_at timestamptz,
  collected_at timestamptz not null,
  raw_hash text,
  unique (source_id, location_code, reference_date, metric, case_status)
);

create table if not exists news_items (
  id text primary key,
  source_id text not null references sources(id),
  title text not null,
  publisher text not null,
  url text not null,
  summary text not null,
  published_at timestamptz,
  collected_at timestamptz not null,
  verification_status text not null default 'unconfirmed',
  content_hash text unique
);

create table if not exists ingestion_runs (
  id bigint generated always as identity primary key,
  source_id text references sources(id),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null,
  records_seen integer not null default 0,
  records_inserted integer not null default 0,
  error_message text
);

alter table sources enable row level security;
alter table observations enable row level security;
alter table news_items enable row level security;
alter table ingestion_runs enable row level security;
