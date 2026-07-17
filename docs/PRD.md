# PRD — SELAH App

> Documento de requisitos de produto e referência arquitetural única.
> **Versão**: 2.0 (refator) · **Última atualização**: 2026-05-04
> **Stack alvo**: Next.js 16 (App Router) + React 19 + TypeScript + Supabase + shadcn/ui + Tailwind v4

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stakeholders e Personas](#2-stakeholders-e-personas)
3. [Princípios e Regras de Negócio](#3-princípios-e-regras-de-negócio)
4. [Arquitetura](#4-arquitetura)
5. [Estrutura de Pastas](#5-estrutura-de-pastas)
6. [Design System](#6-design-system)
7. [Banco de Dados](#7-banco-de-dados)
8. [Features](#8-features)
9. [Integrações Externas](#9-integrações-externas)
10. [Segurança e Auth](#10-segurança-e-auth)
11. [Padrões de Código](#11-padrões-de-código)
12. [Estratégia de Testes](#12-estratégia-de-testes)
13. [Decisões Técnicas (ADR)](#13-decisões-técnicas-adr)
14. [Apêndices](#14-apêndices)

---

## 1. Visão Geral

**SELAH** é o aplicativo devocional oficial da **Casa de Oração de Franca/SP** e do **Ministério Legendários Brasil**. O nome vem do hebraico — uma pausa intencional usada nos Salmos para reflexão.

**Tagline**: *Pause · Ore · Cresça.*

### Propósito

Oferecer um espaço digital pastoral para crescimento espiritual contínuo da comunidade, integrando:

- **Conteúdo devocional diário** gerado e curado pastoralmente.
- **Assistente de IA pastoral (Kairo)** — acolhimento, ensino bíblico, orientação anti-medo.
- **Estudo bíblico aprofundado** (leitor + busca + estudo guiado + teologia + exegese).
- **Comunidade de oração** — pedidos, intercessão, testemunhos.
- **Conexão com a vida da Casa de Oração** — eventos, cultos, RPM Legendários.
- **Painel administrativo** para o admin master gerenciar usuários, conteúdo e métricas.

### Escopo desta versão (refator 2.0)

**Refatorar** o app existente para uma arquitetura limpa, modular e testável. **Não** adicionar features novas. Tudo o que existe na v1.0.1 deve continuar funcionando, agora com:

- Feature-based architecture com camadas bem definidas (Component → Hook → Service).
- shadcn/ui no lugar de CSS custom (preservando tokens de cor e tipografia).
- Banco de dados redesenhado do zero (clean slate).
- Bíblia migrada de JSON local para Supabase com Full-Text Search.
- Admin gating real (server-side, baseado em `profiles.role`).
- Service-role keys removidas do código.
- Testes Vitest (unit/integration) + Playwright (E2E) + checklist manual por sprint.

### Fora de escopo nesta versão

- Notificações push em produção (estrutura existe; ativação fica para sprint pós-refator).
- Gamificação / ranking de Legendários.
- App nativo (React Native).
- OpenClaw (removido do app).

---

## 2. Stakeholders e Personas

### Admin Master — Dr. Edson Barroso
Médico especialista em saúde mental, fundador. Aprova cadastros, edita conteúdo, modera, vê métricas.
- Email: `edson.barroso@gmail.com`
- Acesso: rota `/admin/**`, todas as rotas API admin, `service_role` no banco.
- Identificado por `profiles.role = 'admin'`.

### Legendário
Homem do Movimento Legendários Brasil. Pode ter número Legendário registrado.
- Marker: `profiles.is_legendario = true`.
- Pode publicar testemunhos/homenagens com identificação especial.

### Esposa de Legendário
- Marker: `profiles.is_legendario_spouse = true`.

### Irmão / Irmã da Casa de Oração
Membro comum aprovado.
- Marker: `profiles.status = 'approved'`.

### Visitante (pendente)
Cadastro recém-criado, aguardando aprovação manual do admin.
- Marker: `profiles.status = 'pending'`.
- **Sem acesso** a conteúdo público até aprovação.
- Vê apenas a tela `/pending-approval`.

---

## 3. Princípios e Regras de Negócio

### 3.1 Princípios

1. **Pause · Ore · Cresça** — toda decisão visual e funcional deve incentivar a pausa devocional, não a rolagem infinita.
2. **Conteúdo pastoral seguro** — IA recusa ocultismo, satanismo, suicídio detalhado, debates teológicos agressivos. Encaminha crises a profissionais.
3. **Comunidade fechada** — só usuários `approved` veem conteúdo da comunidade.
4. **Transparência de IA** — todo conteúdo gerado por IA tem `generated_by_ai = true` e badge visual.
5. **Modularidade** — cada feature é independente, com seus próprios services, hooks e componentes.
6. **Clean Code** — código sem comentários óbvios, nomes que se explicam, funções pequenas e focadas.

### 3.2 Regras de Negócio

| Regra | Detalhes |
|---|---|
| Cadastro entra como `pending` | Admin aprova manualmente (`approved` / `rejected` / `banned`). |
| Conteúdo público só para `approved` | RLS bloqueia leitura para outros status. |
| Devocional do dia | Único por data (UNIQUE constraint), gerado por IA via cron diário. |
| Pedido de oração | Pode ser público ou privado (`is_public`). Marca `via_whatsapp` quando origem é WhatsApp. |
| Testemunho | Precisa ser aprovado pelo admin antes de aparecer no feed (`approved = true`). |
| Homenagem | Precisa de aprovação. Texto >2.000 caracteres é reescrito por IA preservando sentido. |
| Evento expirado | Não some — vira histórico no banco. |
| Métricas de sessão | Heartbeat a cada 2min + `sendBeacon` em `visibilitychange:hidden`. Sessões <5s ignoradas. |
| Admin gating | `profiles.role = 'admin'` validado **server-side** em layouts e APIs. |
| AI rate limit | Por usuário e por endpoint, persistido em DB ou KV (não Map em memória). |

### 3.3 Constraints

- Idioma único: **pt-BR**.
- Bíblia inicial: **ARC** (Almeida Revista e Corrigida). Schema permite múltiplas versões (NVI, ARA, KJV).
- Timezone padrão: `America/Sao_Paulo`.
- Domínio de produção: definido no deploy (não hardcoded).

---

## 4. Arquitetura

### 4.1 Visão geral

**Feature-based architecture** com 3 camadas dentro de cada feature, mais 2 camadas globais (`shared/`, `config/`).

```
┌──────────────────────────────────────────────────────────┐
│                    app/ (Next.js routing)                │
│   layouts, page.tsx, route.ts (apenas roteamento)        │
└─────────────────────────────┬────────────────────────────┘
                              │ usa
                              ▼
┌──────────────────────────────────────────────────────────┐
│                  features/<dominio>/                     │
│   ┌──────────────┐                                       │
│   │ components/  │  UI presentational (shadcn-based)     │
│   └───────┬──────┘                                       │
│           │ chama                                        │
│   ┌───────▼──────┐                                       │
│   │   hooks/     │  estado + lógica (chama services)     │
│   └───────┬──────┘                                       │
│           │ chama                                        │
│   ┌───────▼──────┐                                       │
│   │  services/   │  acesso a dados (Supabase / IA / API) │
│   └───────┬──────┘                                       │
└───────────┼──────────────────────────────────────────────┘
            │ usa
            ▼
┌──────────────────────────────────────────────────────────┐
│                       shared/                            │
│  components/ui (shadcn) · hooks · services base · lib    │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Responsabilidade de cada camada

| Camada | Responsabilidade | Não pode |
|---|---|---|
| **Component** | Renderizar UI a partir de props. Disparar handlers. | Fazer fetch direto. Conter lógica de negócio. |
| **Hook** | Orquestrar estado e efeitos. Chamar services. Retornar `{ data, loading, error, actions }`. | Renderizar UI. Acessar Supabase direto. |
| **Service** | Acesso a dados (Supabase/IA/API). Funções puras async. Retornar dados ou jogar erro tipado. | Conter estado React. Manipular DOM. |
| **Shared** | Reuso entre features. UI primitives, hooks utilitários, services base. | Conter regras de negócio específicas de uma feature. |
| **Config** | Constantes, env vars validadas, design tokens, mapas de rota. | Lógica. |

### 4.3 Regras de import

✅ **Permitido**:
- `components/*` → `hooks/*` (mesma feature)
- `hooks/*` → `services/*` (mesma feature)
- `services/*` → outro `services/*` (mesma feature)
- Qualquer um → `shared/*`
- Qualquer um → `config/*`
- `app/*` → `features/*`

❌ **Proibido**:
- `components/*` → `services/*` (sempre via hook)
- `feature_a/*` → `feature_b/*` (use `shared/`)
- `services/*` → React (`useState`, `useEffect`, etc.)
- `shared/*` → `features/*`

### 4.4 Server Components vs Client Components vs Route Handlers

| Tipo | Quando usar |
|---|---|
| **Server Component** | Página com leitura inicial pura (ex: `/home` lê devocional + eventos + orações). |
| **Client Component** | Página interativa (chat Kairo, agenda, formulários, admin). |
| **Server Action** | Mutações disparadas direto do client component sem precisar de endpoint exposto. |
| **Route Handler (`/api/*`)** | Webhooks externos (WhatsApp), crons (devocional, healthcheck), upload, fluxos OAuth. |

### 4.5 Fluxo de dados típico

**Exemplo: usuário envia pedido de oração**

```
PrayerForm (component)
  └─ usePrayer (hook) — gerencia estado do form, loading
       └─ prayerService.create() (service)
            └─ supabase.from('prayer_requests').insert(...)
```

O componente só sabe que existe um hook que devolve `{ submit, loading, error }`. O hook só sabe que existe um service que faz o trabalho. O service é a única camada que conhece Supabase.

---

## 5. Estrutura de Pastas

### 5.1 Visão de alto nível

```
selah-app/
├─ src/
│  ├─ app/         ← Next.js App Router (apenas roteamento + layouts)
│  ├─ features/    ← núcleo da aplicação, uma pasta por domínio
│  ├─ shared/      ← UI primitives, hooks e services reutilizáveis
│  ├─ config/      ← env, design tokens, rotas, constants
│  └─ middleware.ts
├─ supabase/
│  └─ migrations/  ← espelho dos applies via MCP (forward-only)
├─ tests/
│  ├─ unit/        ← Vitest
│  ├─ integration/ ← Vitest + banco de teste
│  ├─ e2e/         ← Playwright
│  └─ fixtures/
├─ public/         ← assets estáticos (sem bíblia — migrada para o DB)
├─ scripts/        ← seed-bible, bootstrap-admin, ...
├─ docs/           ← PRD.md, SPRINTS.md
└─ <root configs>  ← next.config, tsconfig, tailwind, vitest, playwright, vercel.json
```

### 5.2 `app/` — roteamento

```
app/
├─ (app)/          ← rotas autenticadas: home, devocional, biblia, dr-edson,
│                    oracao, comunidade, eventos, agenda, estudo, teologia,
│                    exegese, legendarios, igreja, homenagens (+nova), perfil
├─ (auth)/         ← login, register, forgot-password, reset-password,
│                    pending-approval
├─ admin/          ← dashboard, aprovacoes, usuarios, metricas, conteudo,
│                    eventos, oracoes, comunidade, homenagens, healthcheck
├─ auth/callback/  ← OAuth Google callback
├─ api/            ← route handlers
│  ├─ ai/          ← kairo, devocional/{generate,interativo}, biblia/{busca,
│  │                 referencias}, estudo, teologia, exegese, homenagens/reescrever
│  ├─ biblia/texto, homenagens, metrics/session, notify/new-user, whatsapp
│  └─ admin/       ← healthcheck, stats, users
├─ layout.tsx · page.tsx · globals.css
```

### 5.3 `features/<dominio>/` — padrão único

Toda feature segue exatamente esta estrutura:

```
features/<feature>/
├─ components/        ← UI presentational (shadcn-based)
├─ hooks/             ← estado + lógica (chama services)
├─ services/          ← acesso a dados (Supabase, IA, APIs externas)
├─ schemas/           ← zod schemas (opcional)
├─ data/              ← constantes de domínio (opcional, ex: lista de livros)
├─ prompts/           ← prompts de IA (apenas em features que usam IA)
├─ types.ts
└─ index.ts           ← barrel export do que é público
```

**Exemplo concreto — `features/auth/`**:

```
features/auth/
├─ components/
│  ├─ LoginForm.tsx · RegisterForm.tsx · ForgotPasswordForm.tsx
│  ├─ ResetPasswordForm.tsx · PendingApprovalCard.tsx
│  └─ index.ts
├─ hooks/
│  ├─ useAuth.ts · useSignIn.ts · useSignUp.ts · useSignOut.ts
│  ├─ useRequireApproval.ts
│  └─ index.ts
├─ services/
│  ├─ auth.service.ts · profile.service.ts
│  └─ index.ts
├─ schemas/auth.schema.ts
├─ types.ts
└─ index.ts
```

**Features do projeto** (todas no padrão acima): `auth`, `home`, `devocional`, `kairo`, `biblia`, `estudo`, `teologia`, `exegese`, `oracao`, `comunidade`, `eventos`, `agenda`, `legendarios`, `igreja`, `homenagens`, `perfil`, `admin/{users,approvals,stats,content,moderation,healthcheck}`.

### 5.4 `shared/` — reuso entre features

```
shared/
├─ components/
│  ├─ ui/                ← shadcn/ui instalado aqui
│  ├─ layout/            ← Sidebar, BottomNav, MenuModal, AppShell
│  ├─ feedback/          ← Toaster, ErrorBoundary, Skeleton
│  └─ theme/ThemeToggle.tsx
├─ hooks/                ← useDebounce, useMediaQuery, useTheme,
│                          useLocalStorage, useSessionTracker
├─ services/
│  ├─ supabase/          ← supabase.{client,server}.ts + database.types.ts
│  ├─ ai/                ← ai.service + openai.provider + anthropic.provider + tracking
│  ├─ email/             ← email.service + templates/
│  ├─ whatsapp/          ← whatsapp.service + bot/
│  ├─ calendar/calendar.service.ts
│  ├─ push/push.service.ts
│  └─ rate-limit/rate-limit.service.ts
├─ lib/                  ← utils, logger, errors (AppError hierarchy)
└─ types/                ← tipos globais
```

### 5.5 `config/`

```
config/
├─ env.ts                ← validação zod das env vars
├─ constants.ts          ← MAX_PRAYER_LENGTH, ADMIN_ROLE, FEATURE_FLAGS
├─ design-tokens.ts      ← tokens em TS espelhando CSS vars do globals.css
└─ routes.ts             ← mapa central de rotas
```

---

## 6. Design System

### 6.1 Princípios visuais

- **Pausa devocional**: espaços generosos, tipografia legível, animações sutis.
- **Identidade pastoral**: paleta dourada (glória), vinho (autoridade), verde cura (esperança).
- **Hierarquia clara**: Cinzel para títulos/labels (presença), Inter para corpo (leitura), Lora para citações bíblicas (reverência).
- **Modo escuro como padrão**, claro disponível.

### 6.2 Tokens de cor (preservados da v1)

Tokens são **CSS variables** + cópia em `config/design-tokens.ts` para uso em TypeScript.

#### Modo escuro (padrão)
| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#060A14` | fundo principal |
| `--bg-2` | `#0C1221` | fundo secundário |
| `--bg-card` | `#111827` | cards |
| `--bg-input` | `#0C1221` | inputs |
| `--bg-sidebar` | `#060A14` | sidebar |
| `--border` | `rgba(201,168,76,0.2)` | bordas |
| `--text` | `#F5F2EB` | texto principal |
| `--text-muted` | `#A09880` | texto secundário |
| `--text-subtle` | `#5C5647` | texto sutil |
| `--gold` | `#C9A84C` | dourado divino — primário |
| `--gold-light` | `#E2C464` | dourado claro |
| `--gold-dark` | `#A07830` | dourado escuro |
| `--wine` | `#7B1F3A` | vinho apostólico — Kairo, Dr. Edson |
| `--wine-light` | `#A02850` | vinho claro |
| `--wine-dark` | `#560F28` | vinho escuro |
| `--heal` | `#2A7A4B` | verde cura |
| `--heal-light` | `#38A363` | verde cura claro |
| `--heal-dark` | `#1A5C36` | verde cura escuro |
| `--danger` | `#F87171` | erro |
| `--success` | `#34D399` | sucesso |

#### Modo claro
Tokens equivalentes definidos em `.light` (ver `globals.css`).

#### Cores específicas de feature
- **Legendários**: `#E85D04` (laranja oficial)
- **Homenagens**: `#8B5CF6` (roxo) / `#c4b5fd` (claro)

Estas viram tokens nomeados (`--legendarios`, `--homenagens`) em vez de hardcoded.

### 6.3 Tipografia

| Família | Token | Uso |
|---|---|---|
| Cinzel | `--font-cinzel` | títulos, labels, badges, marca SELAH |
| Inter | `--font-inter` | corpo, UI |
| Lora | `--font-lora` | citações bíblicas (`scripture`), oração |

Carregadas via `next/font/google` com `display: swap` no root layout.

### 6.4 Componentes shadcn/ui

Migração de CSS custom para shadcn. Cada componente shadcn é instalado em `src/shared/components/ui/`, com tokens reescritos para usar as CSS vars existentes.

#### Mapeamento legado → shadcn

| CSS legado (`globals.css`) | Componente shadcn | Variantes/personalização |
|---|---|---|
| `.btn-primary` | `Button` | `variant="default"` com gradient gold |
| `.btn-wine` | `Button` | nova variant `wine` |
| `.btn-heal` | `Button` | nova variant `heal` |
| `.btn-outline` | `Button` | `variant="outline"` em gold |
| `.btn-ghost` | `Button` | `variant="ghost"` |
| `.input-field` | `Input` | tokens aplicados |
| `.label` | `Label` | font Cinzel + tracking |
| `.card` | `Card` | composição padrão |
| `.card-wine` | `Card` | + classe `card-wine` |
| `.card-heal` | `Card` | + classe `card-heal` |
| `.badge`, `.badge-*` | `Badge` | variantes `gold`, `wine`, `heal`, `pending`, `success`, `danger` |
| `.scripture` | classe utility preservada | Lora italic |
| `.kairo-bubble-user/ai` | componente custom `KairoBubble` | usa Card variant |

Componentes shadcn que serão instalados:
- `button`, `input`, `label`, `textarea`, `select`, `checkbox`, `switch`
- `card`, `dialog`, `dropdown-menu`, `tabs`, `separator`, `scroll-area`
- `avatar`, `badge`, `toast` (sonner), `skeleton`, `tooltip`
- `form` (react-hook-form integration)

### 6.5 Componentes de layout

- **`AppShell`**: wrapper de `(app)/layout.tsx`. Compõe `Sidebar` (desktop) + `BottomNav` (mobile) + `<main>` + `SessionTracker`.
- **`Sidebar`**: navegação desktop com seções (Início, Casa de Oração, Admin).
- **`BottomNav`**: 3 tabs principais + Admin (condicional) + botão Menu (abre `MenuModal`).
- **`MenuModal`**: bottom-sheet com grid de todas as features.
- **`MobileNav`**: **removido** (legado, não usado).

### 6.6 Estados

- **Loading**: `Skeleton` shadcn (não spinners customizados).
- **Empty**: card centralizado com versículo + CTA.
- **Error**: toast Sonner + `ErrorBoundary` em rotas críticas.
- **Sucesso**: toast Sonner.

---

## 7. Banco de Dados

### 7.1 Visão geral

**Postgres 17** (Supabase, projeto `anqrocbgfhexugoinufm`, região `sa-east-1`).

### 7.2 Extensões necessárias

| Extensão | Para quê |
|---|---|
| `pgcrypto` | UUIDs (`gen_random_uuid`) — já instalada |
| `uuid-ossp` | já instalada |
| `unaccent` | busca insensível a acentos na Bíblia |
| `pg_trgm` | similaridade de strings (busca) |
| `vector` | (opcional, futuro) embeddings |

### 7.3 Enums

```sql
create type user_role        as enum ('user', 'admin');
create type user_gender      as enum ('male', 'female');
create type user_status      as enum ('pending', 'approved', 'rejected', 'banned');
create type testimony_type   as enum ('irmao', 'legendario', 'esposa_legendario');
create type event_category   as enum ('culto', 'retiro', 'rpm', 'top', 'celula', 'outro');
create type prayer_status    as enum ('open', 'answered', 'closed');
create type homenagem_status as enum ('pending', 'approved', 'rejected');
create type ai_provider      as enum ('openai', 'anthropic');
create type ai_feature       as enum (
  'kairo','devocional_cron','devocional_interativo',
  'biblia_busca','biblia_referencias',
  'estudo','teologia','exegese',
  'homenagens_reescrever','whatsapp_parse','healthcheck'
);
create type bible_version    as enum ('ARC','NVI','ARA','KJV');
```

### 7.4 Helper functions

```sql
-- Verifica se o usuário atual é admin
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Verifica se o usuário atual está aprovado
create or replace function public.is_approved()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  );
$$;
```

### 7.5 Schema completo

#### `profiles`
Estende `auth.users`. Único trigger atualiza `last_seen_at` em login.

```sql
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
  gender                 user_gender,
  birth_date             date,
  instagram_handle       text,
  linkedin_url           text,
  is_legendario          boolean not null default false,
  is_legendario_spouse   boolean not null default false,
  legendario_number      integer,
  wants_to_be_legendario boolean not null default false,
  role                   user_role not null default 'user',
  status                 user_status not null default 'pending',
  approved_by            uuid references public.profiles(id) on delete set null,
  approved_at            timestamptz,
  created_at             timestamptz not null default now(),
  last_seen_at           timestamptz
);

create index idx_profiles_status on profiles(status);
create index idx_profiles_role on profiles(role);
create index idx_profiles_last_seen on profiles(last_seen_at desc);

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
```

#### `bible_verses` (NOVO)
Substitui o JSON local. Versão única (ARC) no seed inicial; novas versões em sprints futuras.

```sql
create table public.bible_verses (
  id          bigserial primary key,
  version     bible_version not null default 'ARC',
  book        text not null,
  chapter     smallint not null,
  verse       smallint not null,
  text        text not null,
  text_search tsvector generated always as (
    to_tsvector('portuguese', unaccent(text))
  ) stored,
  unique(version, book, chapter, verse)
);

create index bible_verses_fts on bible_verses using gin(text_search);
create index bible_verses_loc on bible_verses(version, book, chapter, verse);
create index bible_verses_book_trgm on bible_verses using gin(book gin_trgm_ops);
```

RLS: leitura pública para `is_approved()` ou `is_admin()`.

#### `devotionals`

```sql
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

create index idx_devotionals_date on devotionals(date desc);
```

#### `prayer_requests`

```sql
create table public.prayer_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  text         text not null,
  is_public    boolean not null default true,
  via_whatsapp boolean not null default false,
  status       prayer_status not null default 'open',
  created_at   timestamptz not null default now()
);

create index idx_prayers_public on prayer_requests(is_public, status, created_at desc);
create index idx_prayers_user on prayer_requests(user_id, created_at desc);
```

#### `testimonies`

```sql
create table public.testimonies (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  content     text not null,
  type        testimony_type not null default 'irmao',
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_testimonies_approved on testimonies(approved, type, created_at desc);
```

#### `events`

```sql
create table public.events (
  id                       uuid primary key default gen_random_uuid(),
  title                    text not null,
  description              text,
  date_start               timestamptz not null,
  date_end                 timestamptz,
  location                 text,
  google_calendar_event_id text,
  category                 event_category not null default 'outro',
  image_url                text,
  created_at               timestamptz not null default now()
);

create index idx_events_date on events(date_start);
```

#### `calendar_events` (agenda pessoal)

```sql
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

create index idx_calendar_user_date on calendar_events(user_id, date);
```

#### `favorites`

```sql
create table public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  verse_id   bigint not null references public.bible_verses(id) on delete cascade,
  color      text not null default '#c9a227',
  note       text,
  created_at timestamptz not null default now(),
  unique(user_id, verse_id)
);

create index idx_favorites_user on favorites(user_id, created_at desc);
```

> Mudança vs v1: `favorites` agora referencia `bible_verses.id` em vez de strings soltas (`book`, `chapter`, `verse`, `version`). JOIN nativo, integridade referencial.

#### `notifications`

```sql
create table public.notifications (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,  -- null = broadcast
  title   text not null,
  body    text not null,
  url     text,
  sent_at timestamptz not null default now(),
  read_at timestamptz
);

create index idx_notifications_user on notifications(user_id, sent_at desc);
```

#### `push_subscriptions`

```sql
create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);
```

#### `user_metrics`

```sql
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

create index idx_user_metrics_user_date on user_metrics(user_id, date desc);
```

#### `ai_usage` (renomeado de `token_usage`, schema híbrido)

```sql
create table public.ai_usage (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  provider          ai_provider not null,
  feature           ai_feature not null,
  model             text not null,
  prompt_tokens     integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens      integer not null default 0,
  duration_ms       integer,
  created_at        timestamptz not null default now()
);

create index idx_ai_usage_user on ai_usage(user_id, created_at desc);
create index idx_ai_usage_feature on ai_usage(feature, created_at desc);
create index idx_ai_usage_provider on ai_usage(provider, created_at desc);
```

#### `admin_alerts`

```sql
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

create index idx_admin_alerts_dismissed on admin_alerts(dismissed, created_at desc);
```

#### `homenagens`

```sql
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
  status                   homenagem_status not null default 'pending',
  created_at               timestamptz not null default now()
);

create index idx_homenagens_status on homenagens(status, created_at desc);
```

#### `healthcheck_logs`

```sql
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

create index idx_healthcheck_timestamp on healthcheck_logs(timestamp desc);
```

#### `rate_limits` (NOVO)
Substitui o Map em memória dos route handlers. Persiste contadores de rate-limit.

```sql
create table public.rate_limits (
  id         bigserial primary key,
  bucket     text not null,                   -- ex: "kairo:127.0.0.1" ou "notify:userId"
  count      integer not null default 0,
  reset_at   timestamptz not null,
  created_at timestamptz not null default now(),
  unique(bucket, reset_at)
);

create index idx_rate_limits_bucket on rate_limits(bucket, reset_at desc);
```

### 7.6 Estratégia de RLS

Padrão por tabela:

```sql
alter table public.<table> enable row level security;

-- usuário autenticado e aprovado lê
create policy "<table>_read_approved" on public.<table>
  for select using (public.is_approved());

-- usuário lê o próprio
create policy "<table>_read_own" on public.<table>
  for select using (user_id = auth.uid());

-- usuário cria o próprio
create policy "<table>_insert_own" on public.<table>
  for insert with check (user_id = auth.uid() and public.is_approved());

-- admin lê e modifica tudo
create policy "<table>_admin_all" on public.<table>
  for all using (public.is_admin());
```

Ajustes por tabela:
- `profiles`: usuário lê/atualiza o próprio (sem mudar `status` ou `role`); admin lê/altera todos.
- `bible_verses`: leitura para `is_approved()`; escrita só admin.
- `devotionals`: leitura para `is_approved()`; escrita só service_role (cron).
- `prayer_requests`: leitura pública se `is_public AND status='open' AND requester is_approved`; criação `auth.uid()=user_id AND is_approved`.
- `testimonies`: leitura se `approved=true AND viewer is_approved`; criação `auth.uid()=user_id`.
- `homenagens`: leitura pública (todos veem aprovadas); criação autenticado; admin altera status.
- `healthcheck_logs`: só `service_role`.
- `rate_limits`: só `service_role`.
- `admin_alerts`: só admin / service_role.

### 7.7 Storage

Bucket `public-assets`:
- `avatars/{userId}/{file}` — leitura pública, write próprio.
- `homenagens/{userId}/{file}` — leitura pública, write próprio.
- `events/{file}` — leitura pública, write admin.

---

## 8. Features

Cada feature documentada com **Descrição · Comportamento · Regras**. Detalhes técnicos (rotas API, services, modelos de IA, schemas) ficam no código (`features/<feature>/`); padrões em §11; integrações em §9; tabelas em §7.

### 8.1 Auth
**Descrição**: cadastro, login (email/senha + Google OAuth), recuperação de senha, fluxo `pending → approved`.
**Comportamento**: usuário cria conta → perfil `pending` → admin recebe email → admin aprova → user recebe email → user faz login.
**Regras**: senha mín. 8 chars. Email confirmation desativado (criação via Admin API). Status nunca alterável pelo próprio usuário (RLS). Recuperação via magic link.

### 8.2 Home
**Descrição**: dashboard com 4 cards (Kairo · Legendários · Devocional · Homenagens) + devocional do dia + 3 eventos próximos + 3 orações públicas.
**Comportamento**: Server Component, leitura paralela.
**Regras**: só `approved`.

### 8.3 Devocional
**Descrição**: lista de devocionais + geração interativa (por tema ou "tema do dia").
**Comportamento**: cron diário (05h UTC, Anthropic) cria 1 devocional por dia, persistido. Geração interativa (OpenAI) sob demanda, **não** persistida.
**Regras**: 1 devocional por data (UNIQUE). Cron com `Bearer CRON_SECRET`. Prompt restrito (sem clichês, máx 450 palavras, JSON estrito).

### 8.4 Kairo
**Descrição**: chat de IA pastoral. Personagem "Kairo — o assistente que enfrenta tudo".
**Comportamento**: chat com histórico em hook. Server limita histórico em 20 msgs e aplica rate-limit (20 msg/min/user). Tracking automático em `ai_usage` + `user_metrics.kairo_interactions`.
**Regras**: system prompt em `prompts/kairo.system.ts` (ver Apêndice F para fonte). IA recusa ocultismo, encaminha crises a profissionais. CTA Dr. Edson após >5 interações com dor recorrente detectada.

### 8.5 Bíblia
**Descrição**: leitor + busca FTS + cross-references por IA.
**Comportamento**: leitor lê de `bible_verses`. Busca via `websearch_to_tsquery('portuguese', q)` com ranking; complementa com IA quando <5 resultados. Cross-refs via IA validadas no banco. Speech synthesis nativa (`window.speechSynthesis`).
**Regras**: busca local primeiro, IA enriquece. Versão padrão ARC.

### 8.6 Estudo Bíblico
**Descrição**: guia de estudo didático (contexto histórico, estrutura, temas, perguntas reflexivas, versículos relacionados, conclusão).
**Comportamento**: passagem → JSON estruturado.
**Regras**: response_format JSON estrito.

### 8.7 Teologia
**Descrição**: análise teológica acadêmica (cristologia, pneumatologia, soteriologia, escatologia, hermenêutica, perspectivas históricas).

### 8.8 Exegese
**Descrição**: exegese bíblica acadêmica (análise linguística com hebraico/grego, contextos histórico/literário, análise versicular).

### 8.9 Oração
**Descrição**: mural de pedidos públicos + form de novo pedido.
**Comportamento**: lista pedidos `open` mais recentes. Pedidos via WhatsApp recebem badge.
**Regras**: usuário vê os públicos (RLS) ou os próprios. Admin pode marcar como `answered` ou `closed`.

### 8.10 Comunidade
**Descrição**: feed de testemunhos aprovados, filtrável por tipo.
**Comportamento**: lista `approved=true`, filtro por query string.
**Regras**: submissão fica `approved=false` (admin aprova). Tipo deve combinar com flags do perfil.

### 8.11 Eventos
**Descrição**: lista de eventos da Casa + integração Google Calendar.
**Comportamento**: combina eventos do banco (`date_start >= now()`) com Google Calendar compartilhado. Cada evento tem botão "Adicionar à minha agenda" (Google Calendar template URL).

### 8.12 Agenda
**Descrição**: agenda pessoal com Salmo aleatório anexado a cada compromisso.
**Comportamento**: CRUD em `calendar_events`. Ao criar, sistema escolhe Salmo aleatório de uma lista de 10. Notificação opcional próxima ao evento.

### 8.13 Legendários
**Descrição**: página estática institucional. Hero com logo oficial laranja, manifesto, links externos.

### 8.14 Igreja
**Descrição**: página estática da Casa de Oração de Franca/SP — pastores, endereço, Instagram.

### 8.15 Homenagens
**Descrição**: feed + form de homenagens às famílias dos Legendários.
**Comportamento**: form com dados do autor e do homenageado, texto, até 2 fotos (Storage `public-assets/homenagens/`). Se texto >2000 chars, IA reescreve preservando sentido. Admin aprova antes de aparecer.
**Regras**: texto máx 2000 chars (CHECK). Primeira homenagem (Lisley Barroso) é seed inicial — texto-fonte no Apêndice F.

### 8.16 Perfil
**Descrição**: stats agregadas (dias consecutivos, devocionais lidos, versículos favoritos) + form de edição.
**Comportamento**: lê `user_metrics` dos últimos 30 dias.

### 8.17 Admin
Sub-features (todas com gate `is_admin()` server-side):

| Sub-feature | Função |
|---|---|
| `admin/users` | Lista de usuários com filtros (status, role), busca, ações (aprovar, banir, deletar). |
| `admin/approvals` | Fila de aprovação (`status='pending'`). |
| `admin/stats` | Dashboard de KPIs (online agora, ativos hoje, minutos, devocionais, etc). |
| `admin/content` | CRUD de devocionais e eventos. |
| `admin/moderation` | Aprovação/rejeição de testemunhos e homenagens. |
| `admin/healthcheck` | UI do sistema de auto-reparo. |

---

## 9. Integrações Externas

### 9.1 Supabase
- Projeto: `anqrocbgfhexugoinufm` (region `sa-east-1`).
- Auth (email/senha + Google OAuth).
- Postgres com RLS.
- Storage (`public-assets`).
- Real-time não usado nesta versão (pode entrar em sprint futura).

### 9.2 OpenAI
- Modelo: `gpt-4o-mini`.
- Uso: Kairo (chat), Bíblia (busca, cross-refs), Estudo, Teologia, Exegese, Devocional Interativo, Homenagens (reescrita).
- Endpoint: `https://api.openai.com/v1/chat/completions`.
- Tracking via `ai_usage`.

### 9.3 Anthropic
- Modelos: `claude-sonnet-4-5` (devocional cron), `claude-haiku-4-5-20251001` (healthcheck, parse WhatsApp).
- SDK: `@anthropic-ai/sdk`.
- Tracking via `ai_usage`.

### 9.4 Resend (Email)
- Templates HTML inline em `shared/services/email/templates/`.
- Emails: novo cadastro (admin), aprovação, rejeição, recuperação de senha.
- `RESEND_FROM_EMAIL` configurável.

### 9.5 Meta WhatsApp Business API v21
- Webhook: `api/whatsapp/route.ts`.
- Bot: `shared/services/whatsapp/bot.ts`.
- Intents: VERSICULO, DEVOCIONAL, EVENTOS, ORACAO, AGENDAR, AJUDA.
- AGENDAR usa Anthropic Haiku para extrair título/data ISO.

### 9.6 Google Calendar API
- OAuth refresh token global para o calendário compartilhado da Casa.
- Endpoint para listar eventos próximos + criar evento.
- Cliente em `shared/services/calendar/calendar.service.ts`.

### 9.7 Web Push (VAPID)
- Subscribe via `push.service.ts`.
- Send via `web-push` lib.
- Endpoint a ser ativado em sprint pós-refator.

### 9.8 Vercel
- Deploy do app.
- Crons em `vercel.json` (devocional 05h UTC, healthcheck a cada 6h).
- Headers de segurança (`X-Frame-Options`, `Referrer-Policy`, etc).

---

## 10. Segurança e Auth

### 10.1 Identificação do admin

Determinada por `profiles.role = 'admin'`. **Não** por email hardcoded.

Bootstrap:
1. Após primeiro deploy, admin é definido via SQL: `update profiles set role='admin' where email = $1`.
2. Constante `INITIAL_ADMIN_EMAIL` em `config/constants.ts` apenas para fins de seed/documentação.

### 10.2 Gate de admin

- **Server-side**: middleware + layout `app/admin/layout.tsx` chama `requireAdmin()` no server.
- **API**: cada `route.ts` admin chama `requireAdmin(request)` antes de processar.
- **Client**: hook `useIsAdmin()` apenas para mostrar/ocultar UI, **nunca** como gate de segurança.

### 10.3 Fluxo de status

```
register → status='pending' → admin aprova → status='approved'
                            ↘ admin rejeita → status='rejected' (sem acesso, com mensagem)
                            ↘ admin bane    → status='banned'   (sem acesso, hostil)
```

`pending` e `approved` é o caminho feliz. RLS bloqueia conteúdo para qualquer status ≠ `approved`.

### 10.4 RLS — invariantes

- Todo `select` em tabelas de conteúdo passa por `is_approved()` ou `is_admin()`.
- Todo `insert/update/delete` próprio do usuário tem `auth.uid() = user_id`.
- `service_role` é usado **apenas** em route handlers de cron, webhook, ou admin (depois do gate).

### 10.5 Secrets management

- **Nada** de secrets hardcoded no código.
- `.env.local` para dev (no `.gitignore`).
- Vercel para produção (Settings > Environment Variables).
- `vercel.json` **sem** secrets — apenas crons e headers.
- `config/env.ts` valida com zod (lança erro no boot se faltar).

### 10.6 Rate limiting

- Persistido em tabela `rate_limits` (não em Map em memória).
- Buckets típicos: `kairo:{userId}`, `notify:{ip}`, `homenagens:{userId}`.
- Janela e limite configuráveis por endpoint.

### 10.7 Headers de segurança

Mantidos do `vercel.json` atual:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 10.8 Auth helpers (server-side)

```ts
// shared/services/auth/server.ts
export async function getServerUser(): Promise<User | null>
export async function getServerProfile(): Promise<Profile | null>
export async function requireAuth(): Promise<{ user: User; profile: Profile }>
export async function requireApproved(): Promise<{ user: User; profile: Profile }>
export async function requireAdmin(): Promise<{ user: User; profile: Profile }>
```

Cada função retorna ou redireciona/lança `NextResponse.json({error}, {status})` apropriado.

---

## 11. Padrões de Código

### 11.1 Princípios de Clean Code

1. **Nomes que se explicam**. Função `getRecentPrayerRequests` é melhor que `gprp`.
2. **Funções pequenas e focadas**. Uma função faz uma coisa bem.
3. **Sem comentários óbvios**. Comente apenas o *porquê*, nunca o *o quê*.
4. **Early returns** em vez de blocos `else` aninhados.
5. **Tipos explícitos** nas interfaces públicas (params + return).
6. **Tratamento de erro com tipos próprios** (`AppError`, `AuthError`, `NotFoundError`).
7. **Imutabilidade** quando possível (`const`, `readonly`, `as const`).
8. **Sem `any`** salvo em adapters de libs externas (ainda assim, isolados).

### 11.2 Naming conventions

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componente | PascalCase | `LoginForm.tsx`, `KairoChat.tsx` |
| Hook | camelCase, prefixo `use` | `useAuth.ts`, `useKairoChat.ts` |
| Service | camelCase + `.service.ts` | `auth.service.ts`, `bible.service.ts` |
| Schema (zod) | camelCase + `.schema.ts` | `auth.schema.ts` |
| Tipos | PascalCase | `Profile`, `Devotional`, `KairoMessage` |
| Constantes | SCREAMING_SNAKE_CASE | `ADMIN_ROLE`, `MAX_PRAYER_LENGTH` |
| Booleanos | prefixo `is`/`has`/`should` | `isAdmin`, `hasApproval`, `shouldRedirect` |

### 11.3 Estrutura padrão de uma feature

```
features/<feature>/
├─ components/
│  ├─ <Component>.tsx
│  └─ index.ts                 ← re-export
├─ hooks/
│  ├─ use<Hook>.ts
│  └─ index.ts
├─ services/
│  ├─ <feature>.service.ts
│  └─ index.ts
├─ schemas/                    ← opcional (apenas se houver validação)
│  └─ <feature>.schema.ts
├─ types.ts
└─ index.ts                    ← barrel: re-export de components, hooks, types
```

### 11.4 Tratamento de erros

Hierarquia em `shared/lib/errors.ts`:

```ts
export class AppError extends Error { code: string; status: number; }
export class AuthError extends AppError { } // 401
export class ForbiddenError extends AppError { } // 403
export class NotFoundError extends AppError { } // 404
export class ValidationError extends AppError { } // 400
export class RateLimitError extends AppError { } // 429
export class IntegrationError extends AppError { } // 502
```

Services jogam erros tipados. Hooks capturam e expõem como `error: AppError | null`.

### 11.5 Validação

- Toda entrada externa (form, request body, search params) é validada com **zod**.
- Schemas ficam em `features/<feature>/schemas/` ou `shared/lib/schemas/`.

### 11.6 Padrão de hook

```ts
// features/oracao/hooks/usePrayer.ts
export function usePrayer() {
  const [data, setData] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await prayerService.listPublic();
      setData(result);
    } catch (e) {
      setError(e instanceof AppError ? e : new AppError('Erro inesperado'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { data, loading, error, refresh } as const;
}
```

### 11.7 Padrão de service

```ts
// features/oracao/services/prayer.service.ts
import { supabase } from '@/shared/services/supabase/supabase.client';
import { NotFoundError, IntegrationError } from '@/shared/lib/errors';
import type { PrayerRequest, NewPrayerRequest } from '../types';

export const prayerService = {
  async listPublic(limit = 25): Promise<PrayerRequest[]> {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*, profile:profiles(full_name, church_name, city)')
      .eq('is_public', true)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new IntegrationError(error.message);
    return data ?? [];
  },

  async create(input: NewPrayerRequest): Promise<PrayerRequest> {
    const { data, error } = await supabase.from('prayer_requests').insert(input).select().single();
    if (error) throw new IntegrationError(error.message);
    if (!data) throw new NotFoundError('Failed to create prayer');
    return data;
  },
};
```

### 11.8 Padrão de componente

```tsx
// features/oracao/components/PrayerCard.tsx
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { formatDate } from '@/shared/lib/utils';
import type { PrayerRequest } from '../types';

interface PrayerCardProps {
  prayer: PrayerRequest;
}

export function PrayerCard({ prayer }: PrayerCardProps) {
  return (
    <Card className="p-5">
      <p className="text-sm leading-relaxed">{prayer.text}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {prayer.profile?.full_name} · {prayer.profile?.church_name}
        </span>
        <span className="text-xs">{formatDate(prayer.created_at)}</span>
      </div>
      {prayer.via_whatsapp && <Badge variant="gold" className="mt-2">Via WhatsApp</Badge>}
    </Card>
  );
}
```

### 11.9 Barrel exports

Cada `index.ts` re-exporta o que é público da pasta:

```ts
// features/oracao/index.ts
export { PrayerForm, PrayerCard } from './components';
export { usePrayer } from './hooks';
export { prayerService } from './services';
export type { PrayerRequest, NewPrayerRequest } from './types';
```

Imports externos sempre via barrel:

```ts
import { usePrayer, PrayerCard } from '@/features/oracao';
```

---

## 12. Estratégia de Testes

### 12.1 Pirâmide

- **Unit (Vitest)** — services, hooks (com `@testing-library/react`), utils, validações zod.
- **Integration (Vitest + DB de teste)** — services contra um Supabase local ou banco de teste.
- **E2E (Playwright)** — fluxos críticos do usuário fim-a-fim.
- **Manual** — checklist por sprint para validar UX e visual.

### 12.2 Cobertura por camada

| Camada | Cobertura mínima | Como |
|---|---|---|
| Services | 90% | unit + integration |
| Hooks | 80% | unit (com renderHook) |
| Utils | 100% | unit |
| Componentes | 60% | snapshot + interação chave |
| E2E | fluxos críticos | Playwright |

### 12.3 Fluxos E2E obrigatórios

1. **Auth**: cadastro → pending → admin aprova → login → home.
2. **Devocional**: home → devocional do dia → ler completo.
3. **Kairo**: chat → enviar mensagem → receber resposta.
4. **Bíblia**: selecionar livro/capítulo → buscar → favoritar versículo.
5. **Oração**: criar pedido → aparecer no mural.
6. **Admin**: login admin → aprovar usuário → ver métricas.

### 12.4 Setup

- **Vitest config** em `vitest.config.ts` com path alias e ambiente jsdom para hooks.
- **Playwright config** em `playwright.config.ts` com 3 projetos: chromium, mobile-chrome, mobile-safari.
- **Banco de teste**: branch separado no Supabase (criado via MCP `create_branch`).
- **Seed de teste**: usuário admin + usuário aprovado + dados mock.

### 12.5 Convenção de nome

```
src/features/oracao/services/prayer.service.ts
src/features/oracao/services/prayer.service.test.ts        ← unit
src/features/oracao/services/prayer.service.int.test.ts    ← integration
tests/e2e/oracao.spec.ts                                   ← e2e
```

### 12.6 Critério de avanço por task

Cada task em `SPRINTS.md` tem:
1. **Definição de Pronto (DoD)** — código + tipos + lint.
2. **Testes** — unit/integration que garantem comportamento.
3. **Checklist manual** — passos manuais do que conferir no browser.

**Não se avança para a próxima task** até a anterior passar nos 3.

---

## 13. Decisões Técnicas (ADR)

Registro das decisões travadas com o stakeholder.

### ADR-001 — Banco de dados do zero
**Decisão**: redesenhar o schema completo no projeto novo (`anqrocbgfhexugoinufm`).
**Razão**: o banco antigo tinha conflitos entre migrations (token_usage divergente), schemas legados e dados de teste.
**Consequência**: migrations 001+ ficam consistentes; sem migração de dados (clean slate).

### ADR-002 — `ai_usage` com schema híbrido
**Decisão**: substituir `token_usage` por `ai_usage` com todos os campos relevantes.
**Razão**: as migrations 003 e 004 antigas conflitavam.
**Consequência**: tabela única, tracking unificado.

### ADR-003 — Admin via `profiles.role`
**Decisão**: gate de admin é por `role = 'admin'`, não por email hardcoded.
**Razão**: prepara para múltiplos admins, evita acoplamento ao email.
**Consequência**: bootstrap exige update SQL no primeiro deploy.

### ADR-004 — Cadastro com fluxo `pending → approved`
**Decisão**: admin aprova manualmente cada cadastro.
**Razão**: comunidade fechada (Casa de Oração + Legendários), evita spam.
**Consequência**: emails de notificação ao admin + página `/pending-approval` para o usuário.

### ADR-005 — Refator sem features novas
**Decisão**: a v2.0 só refatora; features novas (push em produção, gamificação) ficam para v2.1+.
**Razão**: evitar acoplar refator com features (escopo controlado).
**Consequência**: sprints focados em arquitetura, não em produto.

### ADR-006 — shadcn/ui preservando tokens
**Decisão**: migrar componentes CSS custom para shadcn/ui mantendo tokens de cor e tipografia atuais.
**Razão**: shadcn é padrão da comunidade Next.js, mais sustentável; tokens mantêm identidade visual.
**Consequência**: refator visual gradual, componente a componente.

### ADR-007 — Vitest + Playwright + checklist manual
**Decisão**: triplo de testes — automatizado em duas camadas + manual.
**Razão**: cobertura de regras (unit) + integração com Supabase (integration) + UX real (E2E e manual).
**Consequência**: cada task da sprint precisa passar nos 3.

### ADR-008 — Bíblia no Supabase com FTS
**Decisão**: migrar JSON local para tabela `bible_verses` com `tsvector` em pt-BR + `unaccent`.
**Razão**: busca melhor (ranking, FTS), JOIN com favorites, prepara múltiplas versões.
**Consequência**: sprint dedicada ao seed (importar JSON existente).

### ADR-009 — Manter OpenAI + Anthropic atrás de service layer
**Decisão**: seguir usando os dois providers, mas centralizar em `shared/services/ai/`.
**Razão**: cada provider tem sua força (Anthropic para conteúdo longo, OpenAI para volume).
**Consequência**: interface comum no service permite trocar provider de feature por feature.

### ADR-010 — OpenClaw fora do escopo
**Decisão**: remover rota `/openclaw`, links na sidebar e referências no admin.
**Razão**: dependência externa de fluxo n8n não-mantido pelo projeto.
**Consequência**: 1 página + alguns links a remover.

### ADR-011 — Rate limiting persistido
**Decisão**: substituir `Map` em memória por tabela `rate_limits`.
**Razão**: ambiente serverless distribui requests entre instâncias; Map em memória é inútil.
**Consequência**: leve overhead de DB, mas comportamento correto.

---

## 14. Apêndices

### A. Variáveis de Ambiente

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# OpenAI
OPENAI_API_KEY=
OPENAI_API_BASE=                  # opcional (default: https://api.openai.com/v1)

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# WhatsApp Business
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=

# Google Calendar
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=

# App
NEXT_PUBLIC_APP_URL=
INITIAL_ADMIN_EMAIL=              # apenas seed/documentação
CRON_SECRET=
```

Validação em `config/env.ts` via zod com mensagens de erro claras.

### B. Mapa de rotas (público)

| Rota | Tipo | Auth | Aprovação |
|---|---|---|---|
| `/` | redirect | — | — |
| `/login`, `/register` | auth | público | — |
| `/forgot-password`, `/reset-password` | auth | público | — |
| `/pending-approval` | auth | autenticado | `pending` |
| `/home` | app | autenticado | `approved` |
| `/devocional`, `/biblia`, `/dr-edson`, `/oracao`, `/comunidade`, `/eventos`, `/agenda`, `/estudo`, `/teologia`, `/exegese`, `/legendarios`, `/igreja`, `/homenagens`, `/perfil` | app | autenticado | `approved` |
| `/admin/**` | admin | autenticado | `approved` + `role='admin'` |
| `/auth/callback` | OAuth | — | — |
| `/api/**` | API | varia | varia |

### C. Cron jobs (Vercel)

| Path | Schedule | Função |
|---|---|---|
| `/api/ai/devocional/generate` | `0 5 * * *` | Gera devocional do dia (Anthropic) |
| `/api/admin/healthcheck` | `0 */6 * * *` | Auto-reparo + análise IA |

### D. Glossário

- **Kairo**: assistente de IA pastoral. Nome do grego "kairós" (tempo certo de Deus).
- **Legendário**: membro do Movimento Legendários Brasil.
- **RPM**: Reunião Permanente de Mestres (encontro Legendários).
- **TOP**: Treinamento de Oração Profunda.
- **Casa de Oração**: a igreja em Franca/SP onde o ministério funciona.
- **SELAH**: pausa intencional dos Salmos hebraicos.

### E. Referências

- Casa de Oração: https://casadeoracao.com.br
- Dr. Edson Barroso: https://www.dredsonbarroso.com.br

### F. Conteúdo a preservar do código atual (legacy)

Algumas peças de conteúdo escrito da v1.0.1 devem ser portadas **verbatim** para a nova arquitetura. Não reescrever — copiar do arquivo-fonte.

| Conteúdo | Arquivo-fonte (v1) | Destino na nova arquitetura |
|---|---|---|
| Prompt sistêmico do Kairo (~120 linhas) | `src/app/api/kairo/route.ts` linhas 5–120 (constante `KAIRO_SYSTEM_PROMPT`) | `src/features/kairo/prompts/kairo.system.ts` |
| Prompt do devocional cron (Anthropic) | `src/lib/ai/devotional-prompt.ts` (`buildDevotionalPrompt`) | `src/features/devocional/prompts/devotional.system.ts` |
| Plano de leitura do devocional cron (7 passagens) | `src/app/api/devocional/generate/route.ts` (`BIBLE_PLAN`) | `src/features/devocional/data/plan.ts` |
| Prompt de reescrita pastoral de homenagens | `src/app/api/homenagens/reescrever/route.ts` | `src/features/homenagens/prompts/rewrite.system.ts` |
| Prompts de Estudo / Teologia / Exegese | `src/app/api/{estudo,teologia,exegese}/route.ts` (`role: 'system'` content) | `src/features/{estudo,teologia,exegese}/prompts/*.system.ts` |
| Lista de 10 Salmos da Agenda pessoal | `src/app/(app)/agenda/page.tsx` (`PSALMS_FOR_EVENTS`) | `src/features/agenda/data/psalms.ts` |
| Lista de 20 temas de devocional interativo | `src/app/api/devocional/interativo/route.ts` (`TEMAS_DO_DIA`) | `src/features/devocional/data/temas.ts` |
| Texto da homenagem da Lisley Barroso (seed inicial) | `src/app/(app)/homenagens/page.tsx` linhas 22–49 (constante `homenagens[0]`) | Seed SQL em `supabase/seed/homenagens-seed.sql` (uma row inicial em `homenagens` com `status='approved'`, autor "Dr. Edson Barroso", número Legendário 203460) |
| Conteúdo institucional de `/legendarios` | `src/app/(app)/legendarios/page.tsx` | Idem (preservar na migração da feature) |
| Conteúdo institucional de `/igreja` | `src/app/(app)/igreja/page.tsx` + `casa_oracao_info.md` | Idem |
| Templates HTML de email | `src/lib/email/client.ts` (3 funções) | `src/shared/services/email/templates/*.ts` |

> **Regra**: durante a sprint que migra a feature, copiar o texto literal dessas fontes. Se houver pequenas correções (typos, formatação), fazer em commit separado **após** a migração.

---

**Fim do PRD.**
Próximo documento: `SPRINTS.md` — quebra deste PRD em sprints e tasks com critérios de validação.
