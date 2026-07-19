-- Migration 002: profiles, helper functions, bible_verses, rate_limits

-- unaccent imutável (necessário para coluna gerada com FTS)
create or replace function public.immutable_unaccent(text)
returns text
language sql immutable parallel safe strict
as $$ select extensions.unaccent('extensions.unaccent', $1) $$;

-- ── PROFILES ──────────────────────────────────────────────
create table public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  email                  text not null,
  full_name              text not null,
  whatsapp               text,
  phone                  text,
  photo_url              text,
  church_name            text,
  city                   text,
  state                  char(2),
  gender                 public.user_gender,
  birth_date             date,
  instagram_handle       text,
  linkedin_url           text,
  is_legendario          boolean not null default false,
  is_legendario_spouse   boolean not null default false,
  legendario_number      integer,
  wants_to_be_legendario boolean not null default false,
  role                   public.user_role not null default 'user',
  status                 public.user_status not null default 'approved',
  permissions            text[] not null default '{}',
  ai_budget_brl          numeric(10,2),
  approved_by            uuid references public.profiles(id) on delete set null,
  approved_at            timestamptz,
  created_at             timestamptz not null default now(),
  last_seen_at           timestamptz
);

create index idx_profiles_status on public.profiles(status);
create index idx_profiles_role on public.profiles(role);
create index idx_profiles_last_seen on public.profiles(last_seen_at desc);

-- ── HELPERS ───────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_approved()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  );
$$;

-- Trigger: atualiza last_seen_at em login
create or replace function public.update_last_seen()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles set last_seen_at = now() where id = new.id;
  return new;
end; $$;

create trigger on_auth_sign_in
  after update on auth.users
  for each row when (old.last_sign_in_at is distinct from new.last_sign_in_at)
  execute function public.update_last_seen();

-- ── BIBLE VERSES (FTS) ────────────────────────────────────
create table public.bible_verses (
  id          bigserial primary key,
  version     public.bible_version not null default 'ARC',
  book        text not null,
  chapter     smallint not null,
  verse       smallint not null,
  text        text not null,
  text_search tsvector generated always as (
    to_tsvector('portuguese', public.immutable_unaccent(text))
  ) stored,
  unique(version, book, chapter, verse)
);

create index bible_verses_fts on public.bible_verses using gin(text_search);
create index bible_verses_loc on public.bible_verses(version, book, chapter, verse);
create index bible_verses_book_trgm on public.bible_verses using gin(book extensions.gin_trgm_ops);

-- Busca FTS com headline
create or replace function public.search_bible_verses(
  p_query   text,
  p_version text default 'ARC',
  p_limit   integer default 20
)
returns table (
  id       bigint,
  version  public.bible_version,
  book     text,
  chapter  smallint,
  verse    smallint,
  text     text,
  headline text
)
language sql stable
as $$
  select v.id, v.version, v.book, v.chapter, v.verse, v.text,
         ts_headline(
           'portuguese', v.text,
           websearch_to_tsquery('portuguese', public.immutable_unaccent(p_query)),
           'StartSel=<mark>,StopSel=</mark>,MaxFragments=1,MaxWords=40,MinWords=10'
         ) as headline
  from public.bible_verses v
  where v.version = p_version::public.bible_version
    and v.text_search @@ websearch_to_tsquery('portuguese', public.immutable_unaccent(p_query))
  order by ts_rank(v.text_search, websearch_to_tsquery('portuguese', public.immutable_unaccent(p_query))) desc
  limit coalesce(p_limit, 20);
$$;

-- ── RATE LIMITS ───────────────────────────────────────────
create table public.rate_limits (
  id         bigserial primary key,
  bucket     text not null,
  count      integer not null default 0,
  reset_at   timestamptz not null,
  created_at timestamptz not null default now(),
  unique(bucket, reset_at)
);

create index idx_rate_limits_bucket on public.rate_limits(bucket, reset_at desc);
