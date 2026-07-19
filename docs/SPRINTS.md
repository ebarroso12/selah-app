# SPRINTS — SELAH Refator v2.0

> Plano de execução do refator. Cada sprint tem um objetivo claro e tasks
> pequenas, verificáveis. **Não se avança para a próxima task** sem passar nos
> 3 critérios de validação (DoD + testes + checklist manual).
>
> Referência arquitetural: [`PRD.md`](./PRD.md)

---

## Sumário

- [Visão Geral](#visão-geral)
- [Comandos](#comandos)
- [Convenções da Sprint](#convenções-da-sprint)
- [Cronograma de Dependências](#cronograma-de-dependências)
- [Sprint 1 — Fundação do Projeto](#sprint-1--fundação-do-projeto)
- [Sprint 2 — Banco de Dados](#sprint-2--banco-de-dados)
- [Sprint 3 — Services Compartilhados](#sprint-3--services-compartilhados)
- [Sprint 4 — Feature Auth](#sprint-4--feature-auth)
- [Sprint 5 — Devocional + Kairo](#sprint-5--devocional--kairo)
- [Sprint 6 — Bíblia + Estudo + Teologia + Exegese](#sprint-6--bíblia--estudo--teologia--exegese)
- [Sprint 7 — Oração + Comunidade + Homenagens + Eventos + Agenda](#sprint-7--oração--comunidade--homenagens--eventos--agenda)
- [Sprint 8 — Admin + Aprovações + Métricas + Healthcheck](#sprint-8--admin--aprovações--métricas--healthcheck)
- [Sprint 9 — Integrações Externas](#sprint-9--integrações-externas)
- [Sprint 10 — Hardening + Deploy](#sprint-10--hardening--deploy)
- [Critérios de "Sprint Concluída"](#critérios-de-sprint-concluída)

---

## Visão Geral

**10 sprints**, cada uma com 3–5 tasks. Cada task é unitária e testável.

| # | Sprint | Tasks | Tema |
|---|---|---|---|
| 1 | Fundação do Projeto | 5 | shadcn, estrutura de pastas, env, middleware, testes |
| 2 | Banco de Dados | 5 | migrations, RLS, seed da Bíblia, bootstrap admin |
| 3 | Services Compartilhados | 4 | supabase, ai layer, email, rate-limit |
| 4 | Feature Auth | 5 | login, register, OAuth, pending→approved, helpers |
| 5 | Devocional + Kairo | 4 | cron, chat, tracking |
| 6 | Bíblia + Estudo/Teologia/Exegese | 5 | FTS, leitor, geradores IA, favoritos |
| 7 | Oração + Comunidade + Homenagens + Eventos + Agenda | 5 | feeds, forms, integrações |
| 8 | Admin + Aprovações + Métricas + Healthcheck | 5 | dashboard, gate, moderação |
| 9 | Integrações Externas | 4 | WhatsApp, Calendar, Email, Push |
| 10 | Hardening + Deploy | 5 | secrets, advisors, Lighthouse, E2E final, limpeza legado |

---

## Comandos

Lista única de comandos usados pelas sprints. Toda task deve referenciar daqui em vez de reinventar.

### Dev / Build / Lint

```bash
npm install                       # instalar deps
npm run dev                       # dev server (next dev)
npm run build                     # build produção (next build)
npm run lint                      # eslint
```

### Testes

```bash
npm test                          # vitest unit (one-shot)
npm run test:watch                # vitest watch mode
npm run test:int                  # vitest integration (com banco real)
npm run test:e2e                  # playwright contra dev server
npm run test:e2e:ci               # playwright headless contra preview
npm run test:coverage             # cobertura (istanbul/v8)
```

### Banco / Seeds

```bash
npm run seed:bible                # popula bible_verses a partir de public/bible/*.json
npm run seed:admin                # bootstrap do admin (INITIAL_ADMIN_EMAIL)
npm run db:types                  # gera src/shared/services/supabase/database.types.ts
```

### Migrations e admin do Supabase (via MCP)

Sempre via MCP (`mcp__supabase-*`), não via CLI direto. Ferramentas usadas:

| Ferramenta MCP | Quando usar |
|---|---|
| `apply_migration` | Aplicar uma nova migration. Espelhar o SQL em `supabase/migrations/`. |
| `list_tables` | Conferir o schema antes de mexer. |
| `list_migrations` | Conferir o que já foi aplicado. |
| `execute_sql` | Querys ad-hoc (debug, conferência de dados). **Nunca** para schema changes. |
| `get_advisors` (`security` e `performance`) | Após cada migration ou no fim de cada sprint. |
| `list_extensions` | Conferir extensões habilitadas. |
| `generate_typescript_types` | Regerar `database.types.ts` após mudança de schema. |

### Vercel / Deploy

```bash
vercel pull                       # baixa env do projeto
vercel link                       # vincula repo a projeto
vercel deploy                     # preview deploy
vercel --prod                     # deploy de produção (após smoke verde)
```

### Greps de auditoria (usar no DoD de tasks de limpeza)

```bash
grep -r "eyJhbGc"     src/ supabase/ scripts/ vercel.json
grep -r "from '@/lib/" src/
grep -ri "openclaw"   src/
grep -ri "MobileNav"  src/
grep -r  "readFileSync" src/
```

---

## Convenções da Sprint

Cada **Task** é estruturada em 6 blocos fixos:

- **Objetivo** — uma frase: o que essa task entrega.
- **Escopo** — bullets do que precisa ser feito.
- **Arquivos** — lista de arquivos a criar/editar.
- **DoD (Definição de Pronto)** — código, tipos, lint, build passam.
- **Testes** — unit/integration/E2E que devem passar (com nome do arquivo).
- **Checklist manual** — conferências no browser.

**Regras universais**:

1. Toda task termina com `npm run lint && npm run build` passando.
2. Todo arquivo novo segue regras de import do PRD §4.3.
3. Toda mudança de schema é uma migration (`apply_migration` via MCP) e é espelhada em `supabase/migrations/*.sql`.
4. Toda credencial vem de `config/env.ts` (validada com zod). Zero literal hardcoded.
5. Sem comentários óbvios; commits descritivos.
6. **Cobertura mínima de testes** (rodar `npm run test:coverage`):
   - `services/*` ≥ 90% line coverage.
   - `hooks/*` ≥ 80%.
   - `shared/lib/utils.ts` 100%.
   - Componentes ≥ 60% (interação chave + snapshot).
7. Migrations são forward-only — sem rollback automático. Erro = nova migration de correção.

---

## Cronograma de Dependências

```
Sprint 1 ──► Sprint 2 ──► Sprint 3 ──► Sprint 4 ──► Sprint 5 ──► Sprint 6
                                          │
                                          └──► Sprint 7 ──► Sprint 8
                                                              │
                                                              └──► Sprint 9 ──► Sprint 10
```

Sprint 4 (Auth) é gargalo: tudo depois precisa de auth funcional.
Sprints 5/6/7/8 podem ser **reordenadas** entre si sem quebrar dependência.

---

## ✅ Sprint 1 — Fundação do Projeto

**Objetivo**: deixar o projeto pronto para receber código novo — estrutura de pastas, shadcn/ui, env validada, middleware real, testes configurados.

### ✅ Task 1.1 — Estrutura de pastas

**Objetivo**: criar a estrutura `features/`, `shared/`, `config/` e migrar imports do código existente sem quebrar.

**Escopo**:
- Criar `src/features/`, `src/shared/`, `src/config/`.
- Mover `src/lib/utils.ts` → `src/shared/lib/utils.ts`.
- Mover `src/components/ui/{Sidebar,BottomNav,MenuModal,SessionTracker,ThemeToggle}.tsx` → `src/shared/components/layout|theme/`.
- Mover `src/lib/supabase/*.ts` → `src/shared/services/supabase/`.
- Atualizar `tsconfig.json` paths se necessário (já há `@/* → src/*`).
- Atualizar imports em todo o projeto.
- **Não migrar ainda** o conteúdo de `lib/{ai,email,calendar,whatsapp,metrics}/` — fica para Sprint 3.

**Arquivos**:
- Criar: `src/features/.gitkeep`, `src/shared/{components,hooks,services,lib,types}/.gitkeep`, `src/config/.gitkeep`
- Mover: vários
- Editar: imports nos arquivos afetados

**DoD**:
- Build verde (`npm run build`).
- Lint verde.
- App roda local sem regressão visual.

**Testes**:
- `npm run build` sucede.
- `npm run dev` carrega `/home` sem erro de import.

**Checklist manual**:
- [ ] Todas as páginas existentes carregam (smoke).
- [ ] Sidebar/BottomNav aparecem corretamente.
- [ ] Nenhum import quebrado no console.

---

### ✅ Task 1.2 — Env vars validadas com zod

**Objetivo**: substituir leitura direta de `process.env.*` por uma fonte única validada.

**Escopo**:
- Criar `src/config/env.ts` com schema zod das env vars do PRD §14.A.
- Distinguir env client (`NEXT_PUBLIC_*`) de server (resto).
- Lançar erro descritivo no boot se faltar var obrigatória.
- Atualizar `.env.local.example` (já existe — sincronizar com schema).

**Arquivos**:
- Criar: `src/config/env.ts`
- Editar: `.env.local.example`

**DoD**:
- `import { env } from '@/config/env'` retorna objeto tipado.
- Boot falha com mensagem clara se var crítica faltar (Supabase, ANTHROPIC, OPENAI).
- Vars opcionais (Resend, WhatsApp, Calendar, Push) **não** falham — viram `undefined` e serviços os checam antes de usar.

**Testes** (`tests/unit/config/env.test.ts`):
- Valida schema com env válida → retorna parsed.
- Falta `NEXT_PUBLIC_SUPABASE_URL` → joga erro.
- Vars opcionais ausentes → não lançam erro.

**Checklist manual**:
- [ ] Remover uma var crítica do `.env.local` → app falha no boot com mensagem clara.
- [ ] Restaurar a var → app sobe.

---

### ✅ Task 1.3 — Middleware de auth real

**Objetivo**: substituir `proxy.ts` (no-op) por middleware que protege rotas.

**Escopo**:
- Criar `src/middleware.ts` que:
  - Para `/admin/**`: chama Supabase, valida sessão e `is_admin()` via RPC ou query, redireciona se não.
  - Para `/(app)/**`: valida sessão; se `pending`, redireciona para `/pending-approval`; se `rejected/banned`, faz logout + `/login?error=...`.
  - Para `(auth)/**`: se já logado e `approved`, redireciona para `/home`.
- Configurar `matcher` para excluir assets estáticos.
- Remover `src/proxy.ts`.

**Arquivos**:
- Criar: `src/middleware.ts`
- Deletar: `src/proxy.ts`

**DoD**:
- Acesso anônimo a `/home` redireciona para `/login`.
- Acesso anônimo a `/admin` redireciona para `/login`.
- Usuário aprovado em `/login` redireciona para `/home`.

**Testes** (`tests/e2e/middleware.spec.ts`):
- Visita `/home` sem cookie → redireciona `/login`.
- Visita `/admin` com user aprovado mas não-admin → redireciona `/home`.

**Checklist manual**:
- [ ] Logout, tentar `/home` → vai pra `/login`.
- [ ] Login como user comum, tentar `/admin` → vai pra `/home`.

---

### ✅ Task 1.4 — Setup shadcn/ui com tokens preservados

**Objetivo**: instalar shadcn e configurar `components.json` para usar tokens existentes.

**Escopo**:
- Rodar `npx shadcn init` apontando alias para `@/shared/components/ui`.
- Editar `components.json` para `tailwind.cssVariables: true` e usar nomes dos nossos tokens.
- Mapear tokens shadcn (`--primary`, `--background`, etc.) para nossos (`--gold`, `--bg`, etc.) em `globals.css`.
- Instalar componentes base: `button`, `input`, `label`, `textarea`, `card`, `badge`, `dialog`, `dropdown-menu`, `tabs`, `separator`, `scroll-area`, `avatar`, `toast` (sonner), `skeleton`, `tooltip`, `form`.
- Adicionar variantes custom no `Button`: `wine`, `heal`, `gold` (substituem `.btn-wine`, `.btn-heal`, `.btn-primary`).
- Criar `src/config/design-tokens.ts` com cópia TS dos tokens.

**Arquivos**:
- Criar: `components.json`, `src/shared/components/ui/*.tsx` (vários, gerados), `src/config/design-tokens.ts`
- Editar: `src/app/globals.css` (mapeamento de tokens shadcn)

**DoD**:
- `<Button variant="wine">` renderiza com gradient vinho.
- Tokens originais (gold/wine/heal) ainda funcionam em CSS legado existente.
- Build verde.

**Testes** (`tests/unit/components/Button.test.tsx`):
- Renderiza variantes default, wine, heal, gold.
- Estado disabled aplica opacidade.

**Checklist manual**:
- [ ] Página teste em `app/home` mostra um Button de cada variante (temporariamente).
- [ ] Modo claro/escuro: variantes mantêm contraste.

---

### ✅ Task 1.5 — Setup Vitest + Playwright

**Objetivo**: configurar suíte de testes.

**Escopo**:
- Instalar `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.
- Instalar `@playwright/test` + browsers.
- Criar `vitest.config.ts` com path alias e setup.
- Criar `playwright.config.ts` com 3 projetos (chromium, mobile-chrome, mobile-safari).
- Criar `tests/setup.ts` (jest-dom matchers).
- Criar pasta `tests/{unit,integration,e2e,fixtures}` com `.gitkeep`.
- Adicionar scripts: `test`, `test:watch`, `test:e2e`, `test:int` em `package.json`.
- Criar 1 teste smoke unit (`tests/unit/smoke.test.ts`) e 1 E2E (`tests/e2e/smoke.spec.ts`).

**Arquivos**:
- Criar: `vitest.config.ts`, `playwright.config.ts`, `tests/setup.ts`, smoke tests, scripts
- Editar: `package.json`, `.gitignore` (adicionar `playwright-report`, `test-results`)

**DoD**:
- `npm test` roda 1 unit test e passa.
- `npm run test:e2e` roda smoke E2E (ex: visita `/login` e checa título).

**Testes** (próprios desta task):
- O smoke é o teste.

**Checklist manual**:
- [ ] `npm test` → verde.
- [ ] `npm run test:e2e` → verde.

---

## ✅ Sprint 2 — Banco de Dados

**Objetivo**: criar o schema novo do zero no projeto Supabase `anqrocbgfhexugoinufm`, com RLS, helper functions e seed da Bíblia.

> **Todas as migrations são aplicadas via MCP** (`apply_migration`).
> Após cada migration, rodar `get_advisors` para checar segurança/performance.

### ✅ Task 2.1 — Migration 001 (extensions + enums)

**Objetivo**: ativar extensões e criar tipos enumerados.

**Escopo**:
- Habilitar extensões: `unaccent`, `pg_trgm`.
- Criar todos os enums do PRD §7.3.
- **Não** criar helper functions ainda — `is_admin()` e `is_approved()` dependem de `profiles` existir, então vão na 2.2.

**Arquivos**:
- Criar: `supabase/migrations/001_extensions_enums.sql` (espelho do que foi aplicado via MCP)

**DoD**:
- Migration aplicada com sucesso.
- `select typname from pg_type where typname like '%user_role%'` retorna o enum.

**Testes** (`tests/integration/db/001.test.ts`):
- Conecta com service_role, lista enums, valida nomes.

**Checklist manual**:
- [ ] Dashboard Supabase → Database → Extensions: `unaccent`, `pg_trgm` ativos.
- [ ] Database → Types: 10 enums listados.

---

### ✅ Task 2.2 — Migration 002 (profiles + helpers + bible_verses + rate_limits)

**Objetivo**: criar tabelas de base com RLS e as helper functions que dependem de `profiles`.

**Escopo**:
- Criar `profiles` (PRD §7.5) com trigger `update_last_seen`.
- Criar helper functions `is_admin()` e `is_approved()` (PRD §7.4) — agora que `profiles` existe.
- Criar `bible_verses` com tsvector e índices (FTS + trigram).
- Criar `rate_limits`.
- Aplicar RLS em todas: `profiles_*`, `bible_verses_read`, `rate_limits_service`.

**Arquivos**:
- Criar: `supabase/migrations/002_profiles_helpers_bible_ratelimits.sql`

**DoD**:
- Migration aplicada.
- `select public.is_admin();` retorna `false` para anon.
- `get_advisors(security)` não retorna erro crítico.

**Testes** (`tests/integration/db/002.test.ts`):
- Insert profile com `auth.uid()` mockado funciona.
- Select profile alheio → bloqueado por RLS.
- Insert bible_verses com service_role funciona; leitura como anon → bloqueada.

**Checklist manual**:
- [ ] Dashboard Supabase → Tables: vê as 3 tabelas com RLS habilitado.
- [ ] Run advisor → sem erros de segurança.

---

### ✅ Task 2.3 — Migration 003 (tabelas de domínio)

**Objetivo**: criar todas as outras tabelas do produto.

**Escopo**:
- `devotionals`, `prayer_requests`, `testimonies`, `events`, `calendar_events`, `favorites`, `notifications`, `push_subscriptions`, `user_metrics`, `ai_usage`, `admin_alerts`, `homenagens`, `healthcheck_logs`.
- RLS em todas conforme PRD §7.6.
- Storage bucket `public-assets` com policies (avatars, homenagens, events).

**Arquivos**:
- Criar: `supabase/migrations/003_domain_tables.sql`

**DoD**:
- Todas as 13 tabelas criadas com RLS.
- Storage bucket criado.
- `get_advisors(security)` sem erros críticos.
- `get_advisors(performance)` sem warnings de índices faltando.

**Testes** (`tests/integration/db/003.test.ts`):
- Para cada tabela: insert/select com user aprovado funciona; com user pending → falha.
- Admin via `service_role` consegue tudo.
- Devocional UNIQUE(date) impede duplicata.
- Homenagem com `texto` >2000 chars → check constraint falha.

**Checklist manual**:
- [ ] Dashboard mostra 13 tabelas na public schema.
- [ ] Storage → bucket `public-assets` existe.

---

### ✅ Task 2.4 — Seed da Bíblia (ARC) no banco

**Objetivo**: importar versículos do `public/bible/*.json` para `bible_verses`.

**Escopo**:
- Criar `scripts/seed-bible.ts` que lê `public/bible/books/*.json`, transforma e insere em batch via service_role.
- Cada arquivo de livro tem formato `{ "1": { "1": "texto", "2": "texto", ... }, ... }`.
- Mapear nome do arquivo (`gênesis.json`) para nome do livro (`Gênesis`).
- Garantir idempotência: usar `on conflict (version, book, chapter, verse) do nothing`.
- Rodar via `tsx scripts/seed-bible.ts`.

**Arquivos**:
- Criar: `scripts/seed-bible.ts`, `package.json` script `seed:bible`

**DoD**:
- `select count(*) from bible_verses where version = 'ARC'` ≈ 31.000 versículos (66 livros).
- Re-rodar o seed → 0 inserções, 0 erros.

**Testes** (`tests/integration/db/bible-seed.test.ts`):
- `select * from bible_verses where book='João' and chapter=3 and verse=16` retorna texto correto.
- FTS: `to_tsquery('portuguese', 'amor')` retorna múltiplos resultados.

**Checklist manual**:
- [ ] `select count(*) from bible_verses` ≈ 31.000.
- [ ] Query FTS no SQL Editor funciona.

---

### ✅ Task 2.5 — Bootstrap do admin

**Objetivo**: garantir que existe pelo menos 1 usuário com `role='admin'` no banco novo.

**Escopo**:
- Criar `scripts/bootstrap-admin.ts` que:
  - Recebe email do admin via env (`INITIAL_ADMIN_EMAIL`).
  - Cria usuário no Supabase Auth se não existir (com senha temporária).
  - Cria/atualiza profile com `role='admin'`, `status='approved'`.
  - Imprime credenciais no terminal.
- Documentar no README como rodar.

**Arquivos**:
- Criar: `scripts/bootstrap-admin.ts`, `package.json` script `seed:admin`

**DoD**:
- Após rodar, `select * from profiles where role='admin'` retorna 1 linha.
- Login com as credenciais geradas funciona.

**Testes** (`tests/integration/db/bootstrap-admin.test.ts`):
- Roda script → admin existe.
- Re-rodar → não duplica.

**Checklist manual**:
- [ ] Login no app com email do admin.
- [ ] `is_admin()` retorna `true` numa query autenticada.

---

## ✅ Sprint 3 — Services Compartilhados

**Objetivo**: refatorar a camada de serviços base, sem fallbacks hardcoded de service_role e com interface limpa.

### ✅ Task 3.1 — Supabase clients refatorados

**Objetivo**: ter `createClient` (anon, RLS) e `createServiceClient` (admin, server-only) sem fallbacks hardcoded.

**Escopo**:
- Reescrever `src/shared/services/supabase/supabase.{client,server}.ts` lendo de `config/env`.
- Remover toda key hardcoded.
- Tipar com `Database` (gerar tipos via `generate_typescript_types` do MCP) → salvar em `src/shared/services/supabase/database.types.ts`.
- Atualizar imports em todo o projeto.

**Arquivos**:
- Editar: `src/shared/services/supabase/*.ts`
- Criar: `src/shared/services/supabase/database.types.ts`

**DoD**:
- Nenhum literal `eyJhbGc...` no projeto (`grep -r "eyJhbGc" src` vazio).
- App roda local com `.env.local`.

**Testes** (`tests/unit/services/supabase.test.ts`):
- `createClient()` retorna instância do `SupabaseClient`.
- `createServiceClient()` chamado em ambiente sem service_role → joga `IntegrationError`.

**Checklist manual**:
- [ ] App carrega com env válida.
- [ ] App falha cedo com env inválida (vê task 1.2).

---

### ✅ Task 3.2 — AI Service Layer

**Objetivo**: interface única para OpenAI e Anthropic com tracking automático.

**Escopo**:
- Criar `src/shared/services/ai/ai.service.ts` com interface `generate(opts)`:
  ```ts
  interface AIGenerateOpts {
    provider: 'openai' | 'anthropic';
    model: string;
    feature: AiFeature;
    userId?: string;
    messages: { role: 'system'|'user'|'assistant'; content: string }[];
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'json_object' | 'text';
  }
  ```
- Implementar `openai.provider.ts` e `anthropic.provider.ts`.
- Implementar `tracking.ts` com `trackAiUsage()` e `trackSectionInteraction()` (ambos fire-and-forget, persistem em `ai_usage` e `user_metrics`).
- A função `generate` chama o provider, mede `duration_ms`, dispara tracking e retorna `{ content, usage }`.

**Arquivos**:
- Criar: `src/shared/services/ai/{ai.service,openai.provider,anthropic.provider,tracking}.ts`

**DoD**:
- Build verde, tipos completos.
- Funcionamento manual: chamar `generate({ provider:'openai', ... })` retorna conteúdo.

**Testes** (`tests/unit/services/ai.test.ts`):
- Mock `fetch` (OpenAI) → retorna conteúdo correto, dispara tracking.
- Mock SDK Anthropic → idem.
- Erro de rede → joga `IntegrationError`.

**Testes integration** (`tests/integration/services/ai.int.test.ts`):
- Chamada real (com small token budget) ao OpenAI e ao Anthropic — opt-in via env.

**Checklist manual**:
- [ ] Página de teste temporária chama `generate` e mostra resultado.
- [ ] `select * from ai_usage` cresce em 1 linha por chamada.

---

### ✅ Task 3.3 — Email Service (Resend)

**Objetivo**: centralizar envio de emails com templates organizados.

**Escopo**:
- Criar `src/shared/services/email/email.service.ts` com `send({ to, subject, template, data })`.
- Criar `src/shared/services/email/templates/{newUser,approval,rejection}.ts` (HTML + função renderiza com `data`).
- Migrar templates existentes de `src/lib/email/client.ts`.
- Lazy-init: se `RESEND_API_KEY` ausente, `send` é no-op com log de warning.

**Arquivos**:
- Criar: `src/shared/services/email/{email.service.ts,templates/*.ts}`
- Deletar: `src/lib/email/client.ts` (após migrar imports)

**DoD**:
- `email.service.send()` com env válido → email chega na caixa de teste.
- Sem env → no-op com log.

**Testes** (`tests/unit/services/email.test.ts`):
- Mock Resend → `send()` retorna `ok` e formata template.
- Sem `RESEND_API_KEY` → retorna `{ skipped: true }`.

**Checklist manual**:
- [ ] Disparar `send({ template: 'approval', ... })` para email pessoal → chega.

---

### ✅ Task 3.4 — Rate Limit Service

**Objetivo**: substituir Map em memória por persistência em DB.

**Escopo**:
- Criar `src/shared/services/rate-limit/rate-limit.service.ts` com `checkAndIncrement(bucket, max, windowMs)`.
- Implementação: usa `rate_limits` table com `unique(bucket, reset_at)` + `upsert` + count.
- Retorna `{ allowed: boolean, remaining: number, resetAt: Date }`.
- Helper `withRateLimit(bucket, opts, fn)` para wrap de route handlers.

**Arquivos**:
- Criar: `src/shared/services/rate-limit/rate-limit.service.ts`

**DoD**:
- Chamadas dentro do limite retornam `allowed: true`.
- Acima do limite retornam `allowed: false`.
- Window expira → contador zera.

**Testes** (`tests/integration/services/rate-limit.int.test.ts`):
- Loop de 25 chamadas com `max=20, windowMs=60000` → 20 `true`, 5 `false`.
- Após `windowMs` virtualmente avançado → `true` de novo.

**Checklist manual**:
- [ ] Chamar 21x `withRateLimit` numa rota de teste → 21º recebe 429.

---

## ✅ Sprint 4 — Feature Auth

**Objetivo**: feature `auth` completa com fluxo `pending → approved` e service-role helpers server-side.

### ✅ Task 4.1 — auth.service + schemas zod

**Objetivo**: serviço de autenticação com todas operações tipadas.

**Escopo**:
- Criar `src/features/auth/services/auth.service.ts` com:
  - `signIn({ email, password })`, `signInWithGoogle({ redirectTo })`, `signOut()`
  - `signUp({ email, password, fullName })` que chama `/api/auth/register-direct`
  - `requestPasswordReset({ email })`, `resetPassword({ password, token })`
- Criar `src/features/auth/services/profile.service.ts` com:
  - `getProfile(userId)`, `updateProfile(input)`, `getMyProfile()`
- Criar `src/features/auth/schemas/auth.schema.ts` com zod schemas de cada input.
- Criar `src/features/auth/types.ts` com tipos derivados.

**Arquivos**:
- Criar: `src/features/auth/{services/*,schemas/*,types.ts,index.ts}`

**DoD**:
- Tipos exportados no barrel.
- Schemas validam corretamente exemplos válidos e inválidos.

**Testes** (`tests/unit/features/auth/auth.service.test.ts`):
- Mock supabase client → todas as operações chamam o método correto.
- Schemas zod aceitam válidos, rejeitam inválidos.

**Checklist manual**: —

---

### ✅ Task 4.2 — Hooks de auth

**Objetivo**: hooks `useAuth`, `useSignIn`, `useSignUp`, `useRequireApproval`.

**Escopo**:
- `useAuth()`: retorna `{ user, profile, loading }`. Subscribe a `onAuthStateChange`.
- `useSignIn()`: `{ submit({email,password}), loading, error }` redireciona pra `/home`.
- `useSignUp()`: idem para registro com login automático.
- `useSignOut()`: limpa sessão e redireciona pra `/login`.
- `useRequireApproval()`: redireciona se `status !== 'approved'`.

**Arquivos**:
- Criar: `src/features/auth/hooks/{useAuth,useSignIn,useSignUp,useSignOut,useRequireApproval}.ts`

**DoD**:
- Hooks tipados, sem warnings de eslint-react-hooks.

**Testes** (`tests/unit/features/auth/hooks.test.tsx`):
- `useSignIn` com mock service: estado loading muda corretamente; sucesso navega; erro popula `error`.
- `useAuth` reage a `onAuthStateChange`.

**Checklist manual**: —

---

### ✅ Task 4.3 — Componentes de auth

**Objetivo**: forms shadcn-based (`react-hook-form` + zod).

**Escopo**:
- Criar `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `PendingApprovalCard`.
- Cada form usa `Form` do shadcn (`react-hook-form` + `@hookform/resolvers/zod`).
- Migrar páginas `(auth)/login,register,forgot-password,reset-password,pending-approval` para usar esses componentes.

**Arquivos**:
- Criar: `src/features/auth/components/{LoginForm,RegisterForm,ForgotPasswordForm,ResetPasswordForm,PendingApprovalCard}.tsx`
- Editar: `src/app/(auth)/{login,register,forgot-password,reset-password,pending-approval}/page.tsx`

**DoD**:
- Login funciona com email/senha.
- Registro cria conta `pending`.
- Visual mantém identidade gold/wine.

**Testes** (`tests/unit/features/auth/components.test.tsx`):
- `LoginForm`: validação client-side.
- `RegisterForm`: aceita inputs válidos.

**E2E** (`tests/e2e/auth.spec.ts`):
- Cadastro → aparece em `/pending-approval` → admin aprova → login redireciona pra `/home`.
- **Nota**: a UI de admin só vem na Sprint 8. Neste E2E, "admin aprova" é feito via helper de teste em `tests/fixtures/admin.ts` que chama `service_role` direto no Supabase (`update profiles set status='approved' where id=...`). Sprint 8 substitui pelo fluxo real via UI.

**Checklist manual**:
- [ ] Cadastrar usuário novo → vê tela de pending.
- [ ] Helper de teste aprova → user faz login → vai pra home.
- [ ] Login com Google funciona.

---

### ✅ Task 4.4 — OAuth callback + register-direct API

**Objetivo**: refatorar `/auth/callback` e `/api/auth/register-direct` para usar services novos.

**Escopo**:
- `app/auth/callback/route.ts`: usa `auth.service` server-side (chamada interna), cria profile com `pending` se novo.
- `api/auth/register-direct/route.ts`: usa `createServiceClient` + `email.service.send({ template: 'newUser' })` para avisar admin (a notificação atual chama `/api/notify/new-user` separadamente — pode unificar ou manter; manter por simplicidade).
- Remover lógica duplicada.

**Arquivos**:
- Editar: `src/app/auth/callback/route.ts`
- Editar: `src/app/api/auth/register-direct/route.ts`

**DoD**:
- Cadastro via Google: cria `profile` com `status='pending'` na primeira vez.
- Cadastro via email/senha: idem.

**Testes** (E2E `tests/e2e/auth.spec.ts` — extender):
- OAuth callback simulado (mock provider) → profile criado.
- Register-direct com email duplicado → 400.

**Checklist manual**:
- [ ] Logar com Google novo → vai pra `/pending-approval`.
- [ ] Email do admin chega no inbox.

---

### ✅ Task 4.5 — Server-side helpers de auth

**Objetivo**: helpers para usar em layouts e route handlers.

**Escopo**:
- Criar `src/shared/services/auth/server.ts`:
  - `getServerUser()`, `getServerProfile()`
  - `requireAuth()`, `requireApproved()`, `requireAdmin()` — cada um retorna ou lança `redirect()` (em RSC) / `NextResponse.json` (em route handler).
- Refatorar `src/app/(app)/layout.tsx` para usar `requireApproved()`.
- Refatorar `src/app/admin/layout.tsx` para usar `requireAdmin()` server-side (move guard do `AdminShell` para o layout).

**Arquivos**:
- Criar: `src/shared/services/auth/server.ts`
- Editar: `src/app/(app)/layout.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/AdminShell.tsx` (perde guard, vira só shell visual)

**DoD**:
- Acessar `/admin` sem ser admin → redireciona server-side (não vê flash de UI).
- `/(app)/*` redireciona pending para `/pending-approval` no servidor.

**Testes** (E2E):
- Listar admin como user comum → 403/redirect server-side, sem flash.
- User pending → vai direto pra pending-approval, sem flash de home.

**Checklist manual**:
- [ ] Logar como user comum, abrir aba `/admin` → redireciona instantâneo (sem flash de página).
- [ ] DevTools Network: nenhuma chamada para `/admin/*` interna.

---

## Sprint 5 — Devocional + Kairo

**Objetivo**: features Devocional e Kairo completas, com cron diário e tracking.

### ✅ Task 5.1 — Feature Devocional

**Objetivo**: feature completa para devocional do dia + geração interativa.

**Escopo**:
- `src/features/devocional/services/devotional.service.ts`:
  - `getToday()`, `getRecent(limit)`, `generateInteractive({ tipo, tema })`.
- Hooks: `useTodayDevotional`, `useRecentDevotionals`, `useGenerateDevotional`.
- Componentes: `DevotionalCard`, `DevotionalGenerator`, `DevotionalList`.
- Migrar `src/app/(app)/devocional/page.tsx` para usar a feature.
- Refatorar `src/app/api/ai/devocional/interativo/route.ts` para usar `ai.service`.

**Arquivos**:
- Criar: feature inteira em `src/features/devocional/`
- Editar: rotas

**DoD**:
- Página `/devocional` renderiza devocional do dia + form de geração.
- Geração interativa retorna JSON do schema esperado.
- Tracking em `ai_usage` cresce.

**Testes**:
- Unit (`devotional.service.test.ts`): mock supabase.
- Integration (`devotional.service.int.test.ts`): banco real, lê devocional do dia.
- E2E (`tests/e2e/devocional.spec.ts`): home → devocional → gerar interativo.

**Checklist manual**:
- [ ] Devocional do dia aparece na home e em `/devocional`.
- [ ] Gerar por tema retorna conteúdo formatado.

---

### ✅ Task 5.2 — Cron diário do devocional (Anthropic)

**Objetivo**: refatorar `/api/ai/devocional/generate` para usar `ai.service` (Anthropic) e ser idempotente.

**Escopo**:
- Mover lógica para `devotional.service.generateAndPersistDaily()`.
- Plano de leitura: criar `data/plan.ts` da feature copiando `BIBLE_PLAN` do código atual (PRD Apêndice F).
- Prompt: criar `prompts/devotional.system.ts` copiando `buildDevotionalPrompt` do código atual (PRD Apêndice F).
- Route handler: valida `Bearer CRON_SECRET`, chama service, retorna report.
- Garantir UNIQUE(date) impede duplicata mesmo com retentativas.
- **Atualizar `vercel.json`**: cron muda de `/api/devocional/generate` para `/api/ai/devocional/generate`.

**Arquivos**:
- Editar: `src/app/api/ai/devocional/generate/route.ts`, `vercel.json`
- Criar: `src/features/devocional/services/{plan.ts,devotional.service.ts}` (extender)

**DoD**:
- Chamar manualmente com `Authorization: Bearer ${CRON_SECRET}` cria devocional do dia se não existir, ou retorna 200 com `{ message: 'already exists' }`.

**Testes**:
- Integration: simular 2 chamadas no mesmo dia → segunda retorna `already exists`.

**Checklist manual**:
- [ ] `curl -X POST .../api/ai/devocional/generate -H 'Authorization: Bearer X'` → cria devocional.
- [ ] Re-chamar → 200 sem duplicata.

---

### ✅ Task 5.3 — Feature Kairo

**Objetivo**: chat Kairo com prompt em arquivo separado e service via `ai.service`.

**Escopo**:
- `src/features/kairo/prompts/kairo.system.ts` exporta `KAIRO_SYSTEM_PROMPT` — **copiar verbatim** do código atual conforme PRD Apêndice F.
- `kairo.service.sendMessage(messages)`: chama `ai.service.generate({ provider: 'openai', model: 'gpt-4o-mini', feature: 'kairo' })`.
- Hook `useKairoChat` gerencia histórico em estado.
- Componentes: `KairoChat`, `KairoBubble`, `KairoHeader` (substituem inline na page).
- Refatorar `src/app/(app)/dr-edson/page.tsx` para usar a feature (mantendo a tab "Sobre & Contato").
- Refatorar `src/app/api/ai/kairo/route.ts` para usar service + `withRateLimit`.

**Arquivos**:
- Criar: `src/features/kairo/{components,hooks,services,prompts}/*`
- Editar: rota e page

**DoD**:
- Chat funciona end-to-end.
- Rate limit aplicado: 20 msg/min/user (via tabela `rate_limits`).

**Testes**:
- Unit: mock `ai.service` → response correto.
- E2E (`tests/e2e/kairo.spec.ts`): user envia mensagem → recebe resposta.

**Checklist manual**:
- [ ] Chat Kairo responde em pt-BR com tom pastoral.
- [ ] 21ª mensagem dentro de 1 min → `429` com mensagem amigável.

---

### ✅ Task 5.4 — Tracking centralizado

**Objetivo**: garantir que toda chamada de IA registra em `ai_usage` e atualiza `user_metrics`.

**Escopo**:
- `tracking.ts` (já criado em 3.2) é chamado por `ai.service.generate` automaticamente quando `userId` é passado.
- Auditar todas as chamadas de IA no projeto e garantir que passem `userId` + `feature`.
- Painel `/admin/metricas` deve mostrar dados reais (será refeito em Sprint 8).

**Arquivos**:
- Editar: vários services de IA das features.

**DoD**:
- Cada chamada de IA cria 1 linha em `ai_usage` e incrementa contador correto em `user_metrics`.

**Testes**:
- Integration: chamar Kairo 3x → 3 linhas em `ai_usage`, `user_metrics.kairo_interactions = 3` para o user do dia.

**Checklist manual**:
- [ ] Após uso, ver `select * from ai_usage order by created_at desc limit 10`.
- [ ] `select * from user_metrics where user_id=...` mostra contadores.

---

## ✅ Sprint 6 — Bíblia + Estudo + Teologia + Exegese

**Objetivo**: Bíblia migrada para Postgres com FTS + 3 features de IA bíblica.

### ✅ Task 6.1 — bible.service com FTS

**Objetivo**: serviço da Bíblia que lê de `bible_verses`.

**Escopo**:
- `src/features/biblia/services/bible.service.ts` com:
  - `getChapter(version, book, chapter)` — retorna `{ verses: [...], totalVerses }`.
  - `searchVerses(query, opts)` — usa `websearch_to_tsquery('portuguese', query)` + ranking + `unaccent`. Retorna até 25 resultados com `headline` (snippet).
  - `getCrossReferences(verse)` — chama `ai.service` para sugerir refs e cruza com banco.
  - `toggleFavorite(userId, verseId)`.
- Tipos em `types.ts`.

**Arquivos**:
- Criar: feature inteira em `src/features/biblia/services,types,data`

**DoD**:
- Service funciona com banco populado.
- Busca por "amor" retorna versículos relevantes ordenados.

**Testes**:
- Integration (`bible.service.int.test.ts`): banco real, query FTS retorna resultados esperados.

**Checklist manual**:
- [ ] No SQL Editor: `select * from bible_verses where text_search @@ websearch_to_tsquery('portuguese', 'amor')` retorna múltiplos.

---

### ✅ Task 6.2 — BibleReader + BibleSearch (componentes)

**Objetivo**: leitor + busca usando shadcn.

**Escopo**:
- Componentes: `BibleReader`, `BibleSearch`, `VerseCard`, `VersionSelector`, `CrossReferences`.
- Hooks: `useBibleChapter`, `useBibleSearch`, `useCrossReferences`.
- Migrar `src/app/(app)/biblia/page.tsx` para compor a feature.
- Refatorar `src/app/api/biblia/texto/route.ts` para usar `bible.service` (não mais `fs.readFileSync`).

**Arquivos**:
- Criar: componentes/hooks da feature
- Editar: `src/app/(app)/biblia/page.tsx`, `src/app/api/biblia/texto/route.ts`

**DoD**:
- Selecionar livro/capítulo → versículos carregam.
- Busca funciona (sem chamar IA).
- Speech synthesis nativa funciona (mantida).

**Testes**:
- Unit: mock service.
- E2E (`tests/e2e/biblia.spec.ts`): busca "amor" → resultado; abre cap. → versículos aparecem.

**Checklist manual**:
- [ ] `/biblia` carrega João 3.
- [ ] Busca por palavra acentuada (ex: "céu") funciona.

---

### ✅ Task 6.3 — Estudo + Teologia + Exegese (3 features estruturadas)

**Objetivo**: cada uma vira feature isolada com mesmo padrão.

**Escopo** (por feature):
- `src/features/{estudo,teologia,exegese}/`:
  - `services/<nome>.service.ts` com `generate(input)` chamando `ai.service`.
  - `prompts/<nome>.system.ts` — copiar prompt verbatim do código atual (PRD Apêndice F).
  - `hooks/use<Nome>.ts`.
  - `components/<Nome>Form.tsx` + `<Nome>Result.tsx`.
- Refatorar páginas e rotas API existentes para usar features.

**Arquivos**:
- Criar: 3 features + suas rotas refatoradas

**DoD**:
- Cada uma gera JSON estruturado conforme PRD §8.6/§8.7/§8.8.

**Testes**:
- Unit: 3 services, mock `ai.service`.
- E2E: gera estudo de João 3 → renderiza estrutura.

**Checklist manual**:
- [ ] `/estudo` gera guia de João 3.
- [ ] `/teologia` gera análise teológica.
- [ ] `/exegese` gera exegese de versículo.

---

### ✅ Task 6.4 — Cross-references por IA + favoritos com FK

**Objetivo**: `getCrossReferences` produzindo sugestões reais; favoritos referenciando `bible_verses.id`.

**Escopo**:
- `bible.service.getCrossReferences(verse)`: pede à IA até 5 refs, depois faz JOIN com `bible_verses` para validar e enriquecer.
- Refatorar `/api/ai/biblia/referencias/route.ts` para usar service.
- Component `CrossReferences` mostra cards.
- Migrar tabela `favorites` para usar `verse_id` (já feito em migration 003 — task aqui é integrar UI).
- Adicionar botão "Favoritar" em `VerseCard` que chama `toggleFavorite`.

**Arquivos**:
- Editar: `bible.service.ts`, `/api/ai/biblia/referencias/route.ts`, `VerseCard.tsx`

**DoD**:
- Cross-refs aparecem ao tocar versículo.
- Favoritar e desfavoritar persistem.

**Testes**:
- Integration: refs IA cruzadas com banco.
- Unit: `toggleFavorite` adiciona/remove.

**Checklist manual**:
- [ ] Tocar João 3:16 → vê 3-5 refs com texto completo.
- [ ] Favoritar e ir em `/perfil` → contador `Versículos Favoritos` cresce.

---

### ✅ Task 6.5 — Limpeza do JSON local da Bíblia

**Objetivo**: remover dependência de `public/bible/*.json` no código.

**Escopo**:
- Confirmar que nenhum import lê `fs.readFileSync` em route handlers.
- Manter os JSONs em `public/bible/` apenas como histórico (ou mover para `legacy/`).
- Remover o BOOK_FILE_MAP antigo do `api/biblia/texto/route.ts`.

**Arquivos**:
- Editar/deletar: `src/app/api/biblia/texto/route.ts` (já refatorado em 6.2), `public/bible/` opcional move

**DoD**:
- `grep -r "readFileSync" src/` não retorna nada relacionado a bíblia.
- Build OK.

**Testes**:
- E2E suite passa sem dependência de arquivos.

**Checklist manual**:
- [ ] Renomear `public/bible/` para `public/_bible_legacy/` → app continua funcionando.

---

## Sprint 7 — Oração + Comunidade + Homenagens + Eventos + Agenda

**Objetivo**: features sociais e de eventos refatoradas.

### Task 7.1 — Feature Oração

**Objetivo**: mural + form usando services.

**Escopo**:
- `src/features/oracao/services/prayer.service.ts`: `listPublic`, `create`, `updateStatus`.
- Hooks: `usePublicPrayers`, `useCreatePrayer`.
- Componentes: `PrayerCard`, `PrayerForm`, `PrayerList`.
- Migrar página `/oracao`.

**DoD**: criar pedido público → aparece no mural; pedido privado → não aparece para outros.

**Testes**:
- Unit: service.
- Integration: RLS bloqueia leitura privada.
- E2E (`tests/e2e/oracao.spec.ts`): criar e listar.

**Checklist manual**:
- [ ] User A cria pedido público → User B vê.
- [ ] User A cria privado → User B não vê.

---

### Task 7.2 — Feature Comunidade (testemunhos)

**Objetivo**: feed + filtro + form de submissão.

**Escopo**:
- `src/features/comunidade/services/testimony.service.ts`: `listApproved(type?)`, `submit(input)`, `approve(id)` (admin).
- Hooks: `useTestimonies`, `useSubmitTestimony`.
- Componentes: `TestimonyCard`, `TestimonyFilter`, `TestimonyForm`.
- Migrar página `/comunidade`.

**DoD**: feed mostra `approved=true`; submit cria `approved=false`.

**Testes**: unit + integration + E2E (filtros).

**Checklist manual**:
- [ ] Submeter testemunho → não aparece (pending).
- [ ] Admin aprova (em sprint 8 ou via SQL temporário) → aparece.

---

### Task 7.3 — Feature Homenagens (com upload + IA reescrita)

**Objetivo**: feed + form completo.

**Escopo**:
- `src/features/homenagens/services/homenagem.service.ts`: `listApproved`, `submit(input, files)`, `rewriteIfTooLong(text)`.
- Upload de fotos para `public-assets/homenagens/{userId}/...`.
- Hook `useHomenagemForm` gerencia upload + reescrita IA.
- Componentes: `HomenagemCard`, `HomenagemForm`, `HomenagemFeed`.
- Migrar páginas `/homenagens` e `/homenagens/nova`.
- Prompt de reescrita: criar `prompts/rewrite.system.ts` copiando do código atual (PRD Apêndice F).
- Migrar homenagem hardcoded da Lisley para o banco (seed `supabase/seed/homenagens-seed.sql`, conteúdo conforme PRD Apêndice F).

**DoD**:
- Submeter com texto >2000 chars → IA reescreve antes de salvar.
- Upload de 2 fotos persiste no Storage.

**Testes**:
- Unit + integration.
- E2E: criar homenagem com 1 foto.

**Checklist manual**:
- [ ] Form aceita 2 fotos, mostra preview.
- [ ] Texto >2000: IA reescreve e salva versão reduzida.
- [ ] Lisley aparece no feed (seed).

---

### Task 7.4 — Feature Eventos (DB + Google Calendar)

**Objetivo**: lista combinada do banco + Calendar API.

**Escopo**:
- `src/features/eventos/services/event.service.ts`: `listUpcoming(limit)`, `listFromGoogleCalendar(limit)`.
- Hook `useUpcomingEvents` faz merge dos dois.
- Componentes: `EventCard`, `EventList`.
- Migrar `/eventos`.
- Refatorar `src/lib/calendar/client.ts` → `src/shared/services/calendar/calendar.service.ts`.

**DoD**:
- Eventos do banco + do Google Calendar aparecem combinados.
- Botão "Adicionar à minha agenda" gera URL Google Calendar Template.

**Testes**: unit (service), integration (Google Calendar mock), E2E (visualização).

**Checklist manual**:
- [ ] `/eventos` lista próximos eventos.
- [ ] Calendar API retorna lista (testar com refresh token válido).

---

### Task 7.5 — Feature Agenda (pessoal)

**Objetivo**: CRUD da agenda pessoal com Salmo aleatório.

**Escopo**:
- `src/features/agenda/services/personal-calendar.service.ts`: CRUD de `calendar_events`.
- `data/psalms.ts` com os 10 Salmos do código atual (PRD Apêndice F — `PSALMS_FOR_EVENTS`).
- Hook `usePersonalEvents`.
- Componentes: `CalendarView` (mês), `EventForm`, `EventCard`.
- Migrar `/agenda`.

**DoD**:
- Criar evento anexa Salmo aleatório.
- Calendário visual mês mostra eventos.

**Testes**: unit + E2E (criar evento, ver no mês).

**Checklist manual**:
- [ ] Criar evento → ver no mês com Salmo.
- [ ] Editar e deletar.

---

## Sprint 8 — Admin + Aprovações + Métricas + Healthcheck

**Objetivo**: painel admin completo, server-gated, sem OpenClaw.

### Task 8.1 — Layout admin server-gated

**Objetivo**: gate real server-side, sem flash.

**Escopo**:
- `src/app/admin/layout.tsx`: chama `requireAdmin()` (criado em 4.5) no Server Component.
- `AdminShell.tsx` perde a checagem client-side, vira só shell visual.
- Remover botão/link OpenClaw do shell e do dashboard.
- Remover rota `app/(app)/openclaw/page.tsx`.

**Arquivos**:
- Editar: `src/app/admin/layout.tsx`, `src/app/admin/AdminShell.tsx`, `src/app/admin/page.tsx`
- Deletar: `src/app/(app)/openclaw/page.tsx`

**DoD**:
- User comum em `/admin` → redirect server-side, sem flash.
- Nenhuma referência a OpenClaw no app.

**Testes**: E2E gate.

**Checklist manual**:
- [ ] Logar não-admin → `/admin` instantâneo redirect.
- [ ] `grep -r "openclaw" src/` vazio (case-insensitive).

---

### Task 8.2 — Admin Users + Approvals

**Objetivo**: lista de usuários com filtros e ações; fila de aprovação.

**Escopo**:
- `src/features/admin/users/services/admin-user.service.ts`:
  - `list({ filter, search })`, `approve(id)`, `reject(id)`, `ban(id)`, `delete(id)`, `setRole(id, role)`.
- Páginas: `/admin/usuarios`, `/admin/aprovacoes`.
- Componentes: `UserTable`, `UserActions`, `ApprovalQueue`.
- Após aprovar, dispara email via `email.service` (template `approval`).

**DoD**:
- Aprovar usuário → muda status no banco + envia email.
- Banir usuário → muda status; usuário é deslogado na próxima request (RLS bloqueia).

**Testes**: unit + integration (RLS) + E2E.

**Checklist manual**:
- [ ] Lista paginada e filtrada por status.
- [ ] Aprovar → email chega + user pode entrar.

---

### Task 8.3 — Admin Stats + Métricas

**Objetivo**: dashboard com KPIs reais.

**Escopo**:
- `src/features/admin/stats/services/stats.service.ts`:
  - `getOverview()` → `{ totalUsers, onlineNow, activeToday, totalMinutes, totalDevotionals, openPrayers, totalEvents, homenagensPendentes }`.
  - `getUserStats(userId)` → métricas detalhadas para drill-down.
- Refatorar `/api/admin/stats/route.ts` para chamar service.
- Página `/admin` (dashboard) usa hook `useAdminStats`.
- Página `/admin/metricas` mostra gráficos com `recharts` (já dep instalada).

**DoD**: KPIs vêm do banco real e batem com queries manuais.

**Testes**: integration de service com seed de teste.

**Checklist manual**:
- [ ] Dashboard mostra números corretos.
- [ ] Métricas: gráfico de uso por seção dos últimos 30 dias.

---

### Task 8.4 — Admin Content (devocionais + eventos)

**Objetivo**: CRUD admin de conteúdo gerado pela equipe.

**Escopo**:
- Sub-feature `admin/content/devotionals`:
  - service: `list`, `create`, `update`, `delete`, `regenerateDaily`.
  - page `/admin/conteudo` aba "Devocionais".
- Sub-feature `admin/content/events`:
  - service: `list`, `create`, `update`, `delete`.
  - page `/admin/eventos`.
- Páginas estáticas (`/admin/legendarios`, `/admin/igreja`) ficam **fora do escopo desta sprint** — entram no backlog (são páginas institucionais sem CMS necessário agora).

**Arquivos**: `src/features/admin/content/{devotionals,events}/...`

**DoD**:
- Editar devocional do dia → muda na home.
- CRUD de eventos funciona end-to-end.

**Testes**: unit + integration + E2E (editar devocional → home reflete).

**Checklist manual**:
- [ ] Editar devocional do dia: muda na home.
- [ ] Criar evento: aparece em `/eventos` para usuários aprovados.

---

### Task 8.4b — Admin Moderation (testemunhos + homenagens)

**Objetivo**: filas de moderação.

**Escopo**:
- Sub-feature `admin/moderation/testimonies`:
  - service: `listPending`, `approve(id)`, `reject(id)`.
  - page `/admin/comunidade` (fila de testemunhos pendentes).
- Sub-feature `admin/moderation/homenagens`:
  - service: `listPending`, `approve(id)`, `reject(id)`.
  - page `/admin/homenagens`.
- Após aprovar homenagem ou testemunho, dispara email de notificação (template `content-approved`).

**Arquivos**: `src/features/admin/moderation/{testimonies,homenagens}/...`

**DoD**:
- Aprovar testemunho → aparece em `/comunidade`.
- Aprovar homenagem → aparece em `/homenagens`.
- Rejeitar registra timestamp e remove do feed (mantém no banco para auditoria).

**Testes**: unit + integration (RLS) + E2E (aprovar → aparece publicamente).

**Checklist manual**:
- [ ] Aprovar testemunho: aparece em `/comunidade`.
- [ ] Aprovar homenagem: aparece em `/homenagens`.

---

### Task 8.5 — Admin Healthcheck (UI + service)

**Objetivo**: refatorar `/api/admin/healthcheck` para a feature `admin/healthcheck` e ter UI usável.

**Escopo**:
- Mover lógica para `src/features/admin/healthcheck/services/healthcheck.service.ts`.
- Route handler `/api/admin/healthcheck/route.ts` chama service + valida `Bearer CRON_SECRET`.
- Página `/admin/healthcheck` mostra último report + botão "Rodar agora" (chama route).
- Logs em `healthcheck_logs` listados.

**DoD**:
- Cron a cada 6h roda e persiste log.
- UI mostra histórico + último status.

**Testes**: integration (banco), E2E (visualização da UI).

**Checklist manual**:
- [ ] Página `/admin/healthcheck` mostra status atual e logs.
- [ ] Botão "Rodar agora" cria nova entrada.

---

## Sprint 9 — Integrações Externas

**Objetivo**: refatorar integrações para usar service layer e remover acoplamentos.

### Task 9.1 — WhatsApp (refator do bot)

**Objetivo**: bot do WhatsApp em service layer com intents desacoplados.

**Escopo**:
- `src/shared/services/whatsapp/whatsapp.service.ts`: `sendMessage`, `sendTemplate`, `formatPhone`.
- `src/shared/services/whatsapp/bot/index.ts`: roteador de intents.
- `bot/intents/{ajuda,devocional,versiculo,eventos,oracao,agendar}.ts`: cada intent é uma função pura.
- Refatorar `src/app/api/whatsapp/route.ts` para validar webhook e chamar `bot.handle(message)`.
- Intent `agendar` usa `ai.service` (Anthropic Haiku) para parsing.

**DoD**: enviar `oi` no WhatsApp recebe menu; `agendar reunião sexta 20h` cria evento no Google Calendar.

**Testes**: unit por intent (mock service), integration (mock fetch da Meta API).

**Checklist manual**:
- [ ] Webhook configurado → todos os 5 comandos respondem corretamente.

---

### Task 9.2 — Google Calendar refatorado

**Objetivo**: service simplificado, sem leak de tipos.

**Escopo**:
- `src/shared/services/calendar/calendar.service.ts` com `listUpcoming`, `createEvent`, `addToUserCalendar` (refresh token do user, opcional).
- Tipos exportados.
- Cache de 5min na leitura de eventos compartilhados (`next: { revalidate: 300 }`).

**DoD**: `eventos` carrega lista combinada em <1s.

**Testes**: integration (com refresh token válido em env).

**Checklist manual**:
- [ ] `/eventos` mostra eventos do calendário compartilhado.

---

### Task 9.3 — Email templates centralizados

**Objetivo**: já feito em 3.3, aqui só cobertura final.

**Escopo**:
- Auditar todos os emails do sistema: novo cadastro, aprovação, rejeição, recuperação senha (Supabase nativo).
- Criar templates faltantes: `welcome` (após aprovação), `prayer-answered` (futuro — opcional, fica no backlog se não couber).

**DoD**: todos os fluxos do app que disparam email usam `email.service`.

**Testes**: unit por template (snapshot HTML), integration (envio real opt-in).

**Checklist manual**:
- [ ] Cada fluxo dispara email correto.

---

### Task 9.4 — Web Push (subscribe)

**Objetivo**: estrutura de push pronta para uso futuro (sem ainda enviar campanhas).

**Escopo**:
- `src/shared/services/push/push.service.ts`: `subscribeUser(subscription)`, `sendNotification(userId, payload)`.
- API `app/api/push/subscribe/route.ts`: salva em `push_subscriptions`.
- Hook `usePushSubscription` para registrar service worker.
- Service Worker mínimo em `public/sw.js`.
- **Não disparar** notificações automáticas nesta sprint — apenas estrutura.

**DoD**: registrar push gera linha em `push_subscriptions`.

**Testes**: integration de subscribe.

**Checklist manual**:
- [ ] Aceitar permissão de push → `select * from push_subscriptions where user_id=...` mostra registro.

---

## Sprint 10 — Hardening + Deploy

**Objetivo**: deixar pronto para produção.

### Task 10.1 — Remover service_role hardcoded e secrets do `vercel.json`

**Objetivo**: zero secret no repo.

**Escopo**:
- Auditar `grep -r "eyJhbGc\|sk-\|re_\|whsec_" src/ supabase/ scripts/ vercel.json` → tudo deve ser `process.env.*` ou `env.*`.
- Editar `vercel.json` removendo bloco `env` com chaves.
- Mover secrets para Vercel Project Settings.
- README documenta procedimento.

**DoD**: grep limpo, build verde, deploy preview funciona.

**Testes**: smoke E2E em preview.

**Checklist manual**:
- [ ] `git diff` mostra remoção das chaves.
- [ ] Vercel Project Settings tem todas as vars necessárias.

---

### Task 10.2 — Auditoria via Supabase Advisors

**Objetivo**: corrigir todos os warnings de segurança e performance.

**Escopo**:
- Rodar `get_advisors(security)` e `get_advisors(performance)` via MCP.
- Corrigir cada item:
  - Tabelas sem RLS → habilitar.
  - Policies com `using(true)` para non-service → revisar.
  - Índices faltando em FKs → criar.
  - `SECURITY DEFINER` sem `set search_path` → adicionar.

**DoD**: ambos advisors retornam zero items críticos.

**Testes**: snapshot do output dos advisors antes/depois.

**Checklist manual**:
- [ ] Print do advisor "limpo".

---

### Task 10.3 — Lighthouse + a11y básico

**Objetivo**: scores razoáveis nas páginas principais.

**Escopo**:
- Rodar Lighthouse em `/home`, `/devocional`, `/biblia`, `/dr-edson`.
- Corrigir top 5 issues por página.
- Adicionar `alt` em imagens, `aria-label` onde faltar, contraste em modo claro.
- Garantir build não tem `Image` com `unoptimized` desnecessário.

**DoD**: Lighthouse Performance ≥ 80, A11y ≥ 90, Best Practices ≥ 90 nas 4 páginas.

**Testes**: Playwright + `@axe-core/playwright` em E2E.

**Checklist manual**:
- [ ] DevTools Lighthouse: scores documentados em `docs/LIGHTHOUSE.md`.

---

### Task 10.4 — E2E completo dos fluxos críticos

**Objetivo**: garantir que os 6 fluxos do PRD §12.3 estão cobertos.

**Escopo**:
- Reler `tests/e2e/*.spec.ts` e completar:
  1. Cadastro → pending → admin aprova → login → home.
  2. Devocional do dia visível.
  3. Kairo: enviar mensagem.
  4. Bíblia: livro/capítulo + busca + favoritar.
  5. Oração: criar e listar.
  6. Admin: login admin + aprovar + métricas.
- Configurar Playwright para rodar contra ambiente de preview (Vercel).

**DoD**: `npm run test:e2e` passa 100% dos 6 fluxos em chromium e mobile.

**Testes**: o próprio E2E.

**Checklist manual**:
- [ ] Run completo verde local + CI.

---

### Task 10.5 — Limpeza de código legado

**Objetivo**: deletar tudo de `src/lib/` antigo e arquivos órfãos da v1.

**Escopo**:
- Deletar pastas legadas (devem estar vazias após migrações das sprints anteriores):
  - `src/lib/ai/`, `src/lib/email/`, `src/lib/calendar/`, `src/lib/whatsapp/`, `src/lib/metrics/`, `src/lib/supabase/`
  - `src/components/ui/MobileNav.tsx` (legado, não usado).
  - `src/types/database.ts` (substituído por `database.types.ts` gerado).
- Mover `public/bible/` → `public/_legacy_bible/` (ou deletar se confirmado que ninguém depende).
- Remover scripts Python obsoletos em `supabase/migrations/*.py` que rodavam contra o banco antigo.
- Remover `src/app/(app)/openclaw/page.tsx` se ainda existir (deve ter sido feito em 8.1).
- Limpar `package.json` de dependências não usadas (`pg` se não usado em scripts).

**Arquivos**:
- Deletar: vários listados acima
- Editar: `package.json` (remover deps órfãs)

**DoD**:
- `grep -r "from '@/lib/" src/` retorna vazio.
- `grep -ri "openclaw" src/` retorna vazio.
- `grep -ri "MobileNav" src/` retorna vazio.
- Build verde após limpeza.

**Testes**:
- E2E suite continua passando.

**Checklist manual**:
- [ ] `ls src/lib/` mostra apenas pastas/arquivos esperados (ou vazio).
- [ ] `npm run build` sem warnings de import não resolvido.

---

## Critérios de "Sprint Concluída"

Antes de iniciar a próxima sprint, **todos** os itens abaixo devem estar feitos:

- [ ] **Todas as tasks** da sprint têm DoD verde.
- [ ] **Todos os testes** (unit + integration + E2E aplicáveis) passando.
- [ ] **Todos os checklists manuais** das tasks marcados.
- [ ] `npm run lint && npm run build` passa sem warnings.
- [ ] Migrations da sprint aplicadas no banco e refletidas em `supabase/migrations/`.
- [ ] Sem regressão visível em features de sprints anteriores (smoke E2E global).
- [ ] PR aberto e descrição lista as tasks completadas.

---

**Fim do SPRINTS.**
Para detalhes de qualquer feature, schema ou padrão, ver [`PRD.md`](./PRD.md).
