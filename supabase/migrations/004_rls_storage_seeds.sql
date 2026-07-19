-- Migration 004: RLS, storage e seeds

-- Habilitar RLS em todas as tabelas
alter table public.profiles           enable row level security;
alter table public.bible_verses       enable row level security;
alter table public.rate_limits        enable row level security;
alter table public.devotionals        enable row level security;
alter table public.prayer_requests    enable row level security;
alter table public.testimonies        enable row level security;
alter table public.events             enable row level security;
alter table public.calendar_events    enable row level security;
alter table public.favorites          enable row level security;
alter table public.notifications      enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.user_metrics       enable row level security;
alter table public.ai_usage           enable row level security;
alter table public.admin_alerts       enable row level security;
alter table public.homenagens         enable row level security;
alter table public.healthcheck_logs   enable row level security;
alter table public.token_usage        enable row level security;
alter table public.invitations        enable row level security;
alter table public.church_info        enable row level security;
alter table public.app_settings       enable row level security;
alter table public.ai_budgets         enable row level security;

-- ── PROFILES ──────────────────────────────────────────────
create policy "profiles_read_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_read_approved" on public.profiles
  for select using (public.is_approved());
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin());
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (
    status = (select p.status from public.profiles p where p.id = auth.uid())
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- ── BIBLE VERSES: leitura para aprovados; escrita só admin/service ──
create policy "bible_read_approved" on public.bible_verses
  for select using (public.is_approved() or public.is_admin());
create policy "bible_admin_write" on public.bible_verses
  for all using (public.is_admin());

-- ── RATE LIMITS: só service_role (nenhuma policy) ──

-- ── DEVOTIONALS: leitura aprovados; escrita service/admin ──
create policy "devotionals_read" on public.devotionals
  for select using (public.is_approved() or public.is_admin());
create policy "devotionals_admin_all" on public.devotionals
  for all using (public.is_admin());

-- ── PRAYER REQUESTS ──
create policy "prayers_read_public" on public.prayer_requests
  for select using (is_public = true and public.is_approved());
create policy "prayers_read_own" on public.prayer_requests
  for select using (auth.uid() = user_id);
create policy "prayers_insert_own" on public.prayer_requests
  for insert with check (auth.uid() = user_id and public.is_approved());
create policy "prayers_update_own" on public.prayer_requests
  for update using (auth.uid() = user_id);
create policy "prayers_admin_all" on public.prayer_requests
  for all using (public.is_admin());

-- ── TESTIMONIES ──
create policy "testimonies_read" on public.testimonies
  for select using ((approved = true and public.is_approved()) or auth.uid() = user_id);
create policy "testimonies_insert_own" on public.testimonies
  for insert with check (auth.uid() = user_id and public.is_approved());
create policy "testimonies_admin_all" on public.testimonies
  for all using (public.is_admin());

-- ── EVENTS ──
create policy "events_read" on public.events
  for select using (public.is_approved() or public.is_admin());
create policy "events_admin_all" on public.events
  for all using (public.is_admin());

-- ── CALENDAR EVENTS (agenda pessoal) ──
create policy "calendar_own" on public.calendar_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── FAVORITES ──
create policy "favorites_own" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── NOTIFICATIONS ──
create policy "notifications_read_own" on public.notifications
  for select using (user_id = auth.uid() or user_id is null);
create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid());
create policy "notifications_admin_all" on public.notifications
  for all using (public.is_admin());

-- ── PUSH SUBSCRIPTIONS ──
create policy "push_own" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── USER METRICS ──
create policy "metrics_own" on public.user_metrics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "metrics_admin_read" on public.user_metrics
  for select using (public.is_admin());

-- ── AI USAGE ──
create policy "ai_usage_read_own" on public.ai_usage
  for select using (auth.uid() = user_id);
create policy "ai_usage_admin_all" on public.ai_usage
  for all using (public.is_admin());

-- ── ADMIN ALERTS ──
create policy "admin_alerts_admin_all" on public.admin_alerts
  for all using (public.is_admin());

-- ── HOMENAGENS: aprovadas são públicas ──
create policy "homenagens_read_approved" on public.homenagens
  for select using (status = 'approved');
create policy "homenagens_read_own" on public.homenagens
  for select using (auth.uid() = user_id);
create policy "homenagens_insert_auth" on public.homenagens
  for insert with check (auth.uid() = user_id);
create policy "homenagens_admin_all" on public.homenagens
  for all using (public.is_admin());

-- ── HEALTHCHECK LOGS: só service_role (nenhuma policy) ──

-- ── TOKEN USAGE ──
create policy "token_usage_read_own" on public.token_usage
  for select using (auth.uid() = user_id);
create policy "token_usage_admin_read" on public.token_usage
  for select using (public.is_admin());

-- ── INVITATIONS: só admin/service ──
create policy "invitations_admin_all" on public.invitations
  for all using (public.is_admin());

-- ── CHURCH INFO ──
create policy "church_read" on public.church_info
  for select using (public.is_approved() or public.is_admin());
create policy "church_admin_all" on public.church_info
  for all using (public.is_admin());

-- ── APP SETTINGS: só service_role (nenhuma policy) ──

-- ── AI BUDGETS ──
create policy "ai_budgets_read_own" on public.ai_budgets
  for select using (user_id = auth.uid());
create policy "ai_budgets_admin_read" on public.ai_budgets
  for select using (public.is_admin());

-- ── STORAGE: bucket public-assets ──
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

create policy "public_assets_read" on storage.objects
  for select using (bucket_id = 'public-assets');
create policy "public_assets_insert_auth" on storage.objects
  for insert with check (bucket_id = 'public-assets' and auth.role() = 'authenticated');
create policy "public_assets_update_own" on storage.objects
  for update using (bucket_id = 'public-assets' and (owner = auth.uid() or public.is_admin()));
create policy "public_assets_delete_own" on storage.objects
  for delete using (bucket_id = 'public-assets' and (owner = auth.uid() or public.is_admin()));

-- ── SEEDS: app_settings ──
insert into public.app_settings (key, value) values (
  'kairo_system_prompt',
  'Aja como um assistente cristão evangélico da Casa de Oração, com postura pastoral, motivacional, acolhedora e bíblica.'
) on conflict (key) do nothing;

insert into public.app_settings (key, value) values
  ('ai_default_budget_brl', '5.00'),
  ('ai_reset_period', 'monthly'),
  ('ai_usd_to_brl', '5.20'),
  ('ai_pricing_usd', '{"gpt-4o-mini":{"input":0.15,"output":0.60}}')
on conflict (key) do nothing;
