-- Corrige leitura da Bíblia: o app serve bible_verses via client sem sessão
-- (createUniversalClient, anon key sem JWT de usuário). A policy anterior
-- exigia is_approved()/is_admin(), que dependem de auth.uid() — sempre NULL
-- nesse client — bloqueando 100% das leituras. bible_verses é conteúdo
-- público (texto bíblico), sem necessidade de aprovação para leitura.

drop policy if exists "bible_read_approved" on public.bible_verses;

create policy "bible_read_public" on public.bible_verses
  for select using (true);
