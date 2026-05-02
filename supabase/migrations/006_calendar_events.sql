-- ============================================================
-- SELAH — Agenda / Calendar Events
-- ============================================================
create table if not exists calendar_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  title       text not null,
  date        date not null,
  time        text not null default '09:00',
  description text,
  psalm_ref   text,
  psalm_text  text,
  notify      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Índice para busca por usuário e data
create index if not exists idx_calendar_events_user_date
  on calendar_events(user_id, date);

-- RLS: cada usuário vê apenas seus próprios eventos
alter table calendar_events enable row level security;

create policy "Usuário vê seus próprios eventos"
  on calendar_events for select
  using (auth.uid() = user_id);

create policy "Usuário cria seus próprios eventos"
  on calendar_events for insert
  with check (auth.uid() = user_id);

create policy "Usuário atualiza seus próprios eventos"
  on calendar_events for update
  using (auth.uid() = user_id);

create policy "Usuário deleta seus próprios eventos"
  on calendar_events for delete
  using (auth.uid() = user_id);
