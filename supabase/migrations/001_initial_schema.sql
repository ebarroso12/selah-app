-- ============================================================
-- SELAH — Schema inicial
-- ============================================================

-- Tipos enumerados
create type user_gender as enum ('male', 'female');
create type user_status as enum ('pending', 'approved', 'rejected', 'banned');
create type testimony_type as enum ('irmao', 'legendario', 'esposa_legendario');
create type event_category as enum ('culto', 'retiro', 'rpm', 'top', 'celula', 'outro');
create type prayer_status as enum ('open', 'answered', 'closed');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  full_name       text not null,
  whatsapp        text,
  photo_url       text,
  church_name     text not null,
  city            text not null,
  state           char(2) not null,
  gender          user_gender not null,
  is_legendario   boolean not null default false,
  is_legendario_spouse boolean not null default false,
  status          user_status not null default 'pending',
  approved_by     text,
  approved_at     timestamptz,
  created_at      timestamptz not null default now(),
  last_seen_at    timestamptz
);

-- Trigger: atualiza last_seen_at a cada login
create or replace function update_last_seen()
returns trigger language plpgsql security definer as $$
begin
  update profiles set last_seen_at = now() where id = new.id;
  return new;
end;
$$;

create trigger on_auth_sign_in
  after update on auth.users
  for each row
  when (old.last_sign_in_at is distinct from new.last_sign_in_at)
  execute function update_last_seen();

-- ============================================================
-- USER METRICS
-- ============================================================
create table user_metrics (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references profiles(id) on delete cascade,
  date                      date not null default current_date,
  session_duration_seconds  integer not null default 0,
  sections_visited          jsonb not null default '{}',
  devocionais_read          integer not null default 0,
  verses_favorited          integer not null default 0,
  consecutive_days          integer not null default 0,
  unique(user_id, date)
);

-- ============================================================
-- DEVOTIONALS
-- ============================================================
create table devotionals (
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

-- ============================================================
-- PRAYER REQUESTS
-- ============================================================
create table prayer_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  text          text not null,
  is_public     boolean not null default true,
  via_whatsapp  boolean not null default false,
  status        prayer_status not null default 'open',
  created_at    timestamptz not null default now()
);

-- ============================================================
-- TESTIMONIES
-- ============================================================
create table testimonies (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  title       text not null,
  content     text not null,
  type        testimony_type not null default 'irmao',
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- EVENTS
-- ============================================================
create table events (
  id                      uuid primary key default gen_random_uuid(),
  title                   text not null,
  description             text,
  date_start              timestamptz not null,
  date_end                timestamptz,
  location                text,
  google_calendar_event_id text,
  category                event_category not null default 'outro',
  image_url               text,
  created_at              timestamptz not null default now()
);

-- ============================================================
-- FAVORITES
-- ============================================================
create table favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  book        text not null,
  chapter     smallint not null,
  verse       smallint not null,
  text        text not null,
  version     text not null default 'NVI',
  color       text not null default '#c9a227',
  note        text,
  created_at  timestamptz not null default now(),
  unique(user_id, book, chapter, verse, version)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references profiles(id) on delete cascade, -- null = broadcast
  title     text not null,
  body      text not null,
  url       text,
  sent_at   timestamptz not null default now(),
  read_at   timestamptz
);

-- ============================================================
-- PUSH SUBSCRIPTIONS (Web Push)
-- ============================================================
create table push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table user_metrics enable row level security;
alter table devotionals enable row level security;
alter table prayer_requests enable row level security;
alter table testimonies enable row level security;
alter table events enable row level security;
alter table favorites enable row level security;
alter table notifications enable row level security;
alter table push_subscriptions enable row level security;

-- Profiles: usuário vê o próprio perfil; admin vê todos
create policy "profiles_self" on profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id)
  with check (status = (select status from profiles where id = auth.uid()));

-- User metrics: somente o próprio usuário
create policy "metrics_own" on user_metrics
  for all using (auth.uid() = user_id);

-- Devotionals: leitura pública para aprovados
create policy "devotionals_read" on devotionals
  for select using (
    exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );

-- Prayer requests: públicos visíveis para todos aprovados; privados só ao dono
create policy "prayers_read_public" on prayer_requests
  for select using (
    is_public = true
    and exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );

create policy "prayers_read_own" on prayer_requests
  for select using (auth.uid() = user_id);

create policy "prayers_insert" on prayer_requests
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );

-- Testimonies: aprovados visíveis para todos aprovados
create policy "testimonies_read" on testimonies
  for select using (
    approved = true
    and exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );

create policy "testimonies_insert" on testimonies
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );

-- Events: leitura pública para aprovados
create policy "events_read" on events
  for select using (
    exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );

-- Favorites: somente o próprio usuário
create policy "favorites_own" on favorites
  for all using (auth.uid() = user_id);

-- Notifications: próprias + broadcast (user_id is null)
create policy "notifications_own" on notifications
  for select using (user_id = auth.uid() or user_id is null);

-- Push subscriptions: somente o próprio usuário
create policy "push_own" on push_subscriptions
  for all using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_profiles_status on profiles(status);
create index idx_devotionals_date on devotionals(date);
create index idx_prayer_requests_public on prayer_requests(is_public, status, created_at desc);
create index idx_testimonies_approved on testimonies(approved, type, created_at desc);
create index idx_events_date on events(date_start);
create index idx_favorites_user on favorites(user_id, created_at desc);
create index idx_notifications_user on notifications(user_id, sent_at desc);
create index idx_user_metrics_user_date on user_metrics(user_id, date desc);
