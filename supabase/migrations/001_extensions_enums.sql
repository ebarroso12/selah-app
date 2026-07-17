-- Migration 001: Extensions + Enums
-- Habilita extensões e cria todos os enums do domínio.
-- NOTA: is_admin() e is_approved() ficam na 002 pois dependem de profiles.

-- Extensões
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm  with schema extensions;

-- Enums
create type public.user_role        as enum ('user', 'admin');
create type public.user_gender      as enum ('male', 'female');
create type public.user_status      as enum ('pending', 'approved', 'rejected', 'banned');
create type public.testimony_type   as enum ('irmao', 'legendario', 'esposa_legendario');
create type public.event_category   as enum ('culto', 'retiro', 'rpm', 'top', 'celula', 'outro');
create type public.prayer_status    as enum ('open', 'answered', 'closed');
create type public.homenagem_status as enum ('pending', 'approved', 'rejected');
create type public.ai_provider      as enum ('openai', 'anthropic');
create type public.ai_feature       as enum (
  'kairo','devocional_cron','devocional_interativo',
  'biblia_busca','biblia_referencias',
  'estudo','teologia','exegese',
  'homenagens_reescrever','whatsapp_parse','healthcheck'
);
create type public.bible_version    as enum ('ARC','NVI','ARA','KJV');
