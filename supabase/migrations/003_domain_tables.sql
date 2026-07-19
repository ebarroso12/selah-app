-- Migration 003: tabelas de domínio

create table public.devotionals (
  id                uuid primary key default gen_random_uuid(),
  date              date not null unique,
  bible_book        text not null,
  bible_chapter     smallint not null,
  bible_verse_start smallint not null,
  bible_verse_end   smallint,
  bible_passage     text not null,
  title             text not null,
  reflection_text   text not null,
  prayer_text       text,
  generated_by_ai   boolean not null default false,
  created_at        timestamptz not null default now()
);
create index idx_devotionals_date on public.devotionals(date desc);

create table public.prayer_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  text         text not null,
  is_public    boolean not null default true,
  via_whatsapp boolean not null default false,
  status       public.prayer_status not null default 'open',
  created_at   timestamptz not null default now()
);
create index idx_prayers_public on public.prayer_requests(is_public, status, created_at desc);
create index idx_prayers_user on public.prayer_requests(user_id, created_at desc);

create table public.testimonies (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  content     text not null,
  type        public.testimony_type not null default 'irmao',
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index idx_testimonies_approved on public.testimonies(approved, type, created_at desc);

create table public.events (
  id                       uuid primary key default gen_random_uuid(),
  title                    text not null,
  description              text,
  date_start               timestamptz not null,
  date_end                 timestamptz,
  location                 text,
  google_calendar_event_id text,
  category                 public.event_category not null default 'outro',
  image_url                text,
  created_at               timestamptz not null default now()
);
create index idx_events_date on public.events(date_start);

create table public.calendar_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  date        date not null,
  time        text not null default '09:00',
  description text,
  psalm_ref   text,
  psalm_text  text,
  notify      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index idx_calendar_user_date on public.calendar_events(user_id, date);

create table public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  verse_id   bigint not null references public.bible_verses(id) on delete cascade,
  color      text not null default '#c9a227',
  note       text,
  created_at timestamptz not null default now(),
  unique(user_id, verse_id)
);
create index idx_favorites_user on public.favorites(user_id, created_at desc);

create table public.notifications (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title   text not null,
  body    text not null,
  url     text,
  sent_at timestamptz not null default now(),
  read_at timestamptz
);
create index idx_notifications_user on public.notifications(user_id, sent_at desc);

create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

create table public.user_metrics (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles(id) on delete cascade,
  date                     date not null default current_date,
  session_duration_seconds integer not null default 0,
  sections_visited         jsonb not null default '{}',
  devocionais_read         integer not null default 0,
  verses_favorited         integer not null default 0,
  consecutive_days         integer not null default 0,
  kairo_interactions       integer not null default 0,
  biblia_interactions      integer not null default 0,
  estudo_interactions      integer not null default 0,
  teologia_interactions    integer not null default 0,
  exegese_interactions     integer not null default 0,
  oracao_interactions      integer not null default 0,
  devocional_interactions  integer not null default 0,
  unique(user_id, date)
);
create index idx_user_metrics_user_date on public.user_metrics(user_id, date desc);

create table public.ai_usage (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  provider          public.ai_provider not null,
  feature           public.ai_feature not null,
  model             text not null,
  prompt_tokens     integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens      integer not null default 0,
  duration_ms       integer,
  created_at        timestamptz not null default now()
);
create index idx_ai_usage_user on public.ai_usage(user_id, created_at desc);
create index idx_ai_usage_feature on public.ai_usage(feature, created_at desc);
create index idx_ai_usage_provider on public.ai_usage(provider, created_at desc);

create table public.admin_alerts (
  id         uuid primary key default gen_random_uuid(),
  type       text not null default 'new_user',
  title      text not null,
  body       text not null,
  user_id    uuid references public.profiles(id) on delete set null,
  data       jsonb,
  read_at    timestamptz,
  dismissed  boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_admin_alerts_dismissed on public.admin_alerts(dismissed, created_at desc);
create index idx_admin_alerts_created on public.admin_alerts(created_at desc);

create table public.homenagens (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles(id) on delete cascade,
  autor_nome               text not null,
  autor_instagram          text,
  autor_legendario_numero  integer,
  homenageado_nome         text not null,
  homenageado_parentesco   text not null,
  homenageado_instagram    text,
  homenageado_legendario   boolean not null default false,
  texto                    text not null check (length(texto) <= 2000),
  fotos                    text[] not null default '{}',
  foto_capa_index          smallint not null default 0,
  status                   public.homenagem_status not null default 'pending',
  approved_at              timestamptz,
  created_at               timestamptz not null default now()
);
create index idx_homenagens_status on public.homenagens(status, created_at desc);

create table public.healthcheck_logs (
  id                 uuid primary key default gen_random_uuid(),
  timestamp          timestamptz not null default now(),
  overall            text not null check (overall in ('healthy','degraded','critical')),
  fixes_applied      integer default 0,
  errors_found       integer default 0,
  duration_ms        integer default 0,
  checks             jsonb,
  ai_analysis        text,
  ai_recommendations jsonb,
  created_at         timestamptz default now()
);
create index idx_healthcheck_timestamp on public.healthcheck_logs(timestamp desc);

-- legado, ainda lido pela página de métricas do admin
create table public.token_usage (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  api_name          text not null,
  model             text not null,
  prompt_tokens     integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens      integer not null default 0,
  created_at        timestamptz not null default now()
);
create index idx_token_usage_user on public.token_usage(user_id, created_at desc);

create table public.invitations (
  id                  uuid primary key default gen_random_uuid(),
  token               text not null unique,
  created_by          uuid not null references public.profiles(id) on delete cascade,
  default_permissions text[] not null default '{}',
  expires_at          timestamptz not null default (now() + interval '7 days'),
  used_at             timestamptz,
  used_by             uuid references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now()
);
create index idx_invitations_token on public.invitations(token);

create table public.church_info (
  id            uuid primary key default gen_random_uuid(),
  name          text not null default '',
  address       text,
  city          text,
  state         text,
  phone         text,
  pastor        text,
  description   text,
  logo_url      text,
  photo_url     text,
  service_times text,
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create table public.app_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

create table public.ai_budgets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  period_start  timestamptz not null,
  period_end    timestamptz not null,
  tokens_used   bigint not null default 0,
  cost_brl      numeric(10,4) not null default 0,
  bonus_brl     numeric(10,4) not null default 0,
  updated_at    timestamptz not null default now(),
  unique(user_id, period_start)
);
create index idx_ai_budgets_user_period on public.ai_budgets(user_id, period_end);
