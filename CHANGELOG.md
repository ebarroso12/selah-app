# CHANGELOG — SELAH App

Todas as mudanças notáveis neste projeto são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [1.14] — 2026-07-19

### Dr. Edson Barroso: logo, texto, avaliação Google e vídeo + botão flutuante de atualização

#### Perfil do Dr. Edson aprimorado
- Logo oficial em `public/parceiros/edson-barroso.png` substituído por versão de
  alta resolução (antes era um recorte de screenshot de baixa qualidade).
- Texto de apresentação do Dr. Edson totalmente reescrito com mais autoridade e
  persuasão em `src/features/parceiros/data/partners.ts` (conteúdo real, sem
  invenção), com nova área de atuação "Medicina de Alta Performance".
- Novos campos opcionais na interface `Partner`: `googleReviewUrl` (link de
  avaliação no Google) e `video` (`{ url, thumbnail, caption }`).
- Nova thumbnail `public/parceiros/edson-barroso-reel-thumb.jpg` do reel mais
  viral do Instagram.

#### Subpágina do parceiro
- `src/app/(app)/parceiros/[slug]/page.tsx` renderiza um card de vídeo clicável
  que abre o reel no Instagram, e um botão "Avaliar no Google" quando os
  respectivos campos existem.

#### Botão flutuante de atualização
- Novo componente `src/shared/components/layout/UpdateBanner.tsx` — botão
  flutuante de atualização visível para todos os usuários (inclusive admin) em
  qualquer tela.
- Montado globalmente em `src/app/(app)/layout.tsx`.

---

## [1.13] — 2026-07-19

### Dr. Edson Barroso adicionado como parceiro principal

#### Novo parceiro em destaque
- Nova entrada `edson-barroso` no INÍCIO do array `partners`
  (`src/features/parceiros/data/partners.ts`), aparecendo antes de
  Oliveira & Aguilar e Dra. Claudia Starling na listagem de `/parceiros`.
  Conteúdo institucional real do Dr. Edson Barroso — psiquiatra, idealizador
  do SELAH — extraído do site oficial, sem invenção.
- Logo oficial em `public/parceiros/edson-barroso.png`.

#### Ajuste de contrato
- Campo `email` da interface `Partner` agora é opcional (este parceiro não
  divulga e-mail público).
- Renderização do e-mail na subpágina do parceiro
  (`src/app/(app)/parceiros/[slug]/page.tsx`) passou a ser condicional.

---

## [1.12] — 2026-07-19

### Página "Propósito Social" com primeira causa social

#### Nova página de causas sociais
- Nova rota `src/app/(app)/proposito-social/page.tsx` apresentando a(s) causa(s)
  social(is) apoiada(s) pelo app: história da fundadora, missão, urgência,
  contatos e CTAs de voluntariado.
- Dados da primeira causa em `src/features/proposito-social/data/causes.ts` —
  Instituto Princesa Rivânia, ONG de combate à violência doméstica e ao
  feminicídio (conteúdo real extraído do site oficial, sem invenção).
- Logo oficial em `public/proposito-social/princesa-rivania.png`.

#### Navegação
- Novo item "Propósito Social" no menu principal (`Sidebar.tsx`), fora da
  seção "Casa de Oração".
- Novo item "Propósito Social" na grade do menu mobile (`MenuModal.tsx`).

---

## [1.11] — 2026-07-19

### Página de Parceiros reestruturada + segundo parceiro

#### Índice de parceiros + subpágina por parceiro
- `src/app/(app)/parceiros/page.tsx` deixou de empilhar os cards completos e
  passou a ser um índice com grade de miniaturas — cada miniatura linka para a
  subpágina de detalhe do respectivo parceiro.
- Nova rota dinâmica `src/app/(app)/parceiros/[slug]/page.tsx` — subpágina de
  detalhe por parceiro, mantendo a estrutura rica original (apresentação, áreas
  de atuação e canais de contato).

#### Segundo parceiro: Dra. Claudia Starling
- Dados institucionais reais extraídos do site oficial adicionados em
  `src/features/parceiros/data/partners.ts` (sem invenção).
- Logo em `public/parceiros/claudia-starling.png`.

#### Skill de automação
- Nova skill de projeto `.claude/skills/adicionar-parceiro/SKILL.md`
  documentando o processo repetível de adicionar novos parceiros.

---

## [1.10] — 2026-07-19

### Evento em destaque: TOP 1782 · Track 3 Colinas

#### Bloco "Próximo Evento" na página Legendários
- Novo bloco em `src/app/(app)/legendarios/page.tsx` promovendo o evento
  **TOP 1782 · Track 3 Colinas**, com descrição real do evento e as 3 etapas.
- Contagem regressiva ao vivo (client-side) até a data do evento.
- Botões de ação: Garantir Vaga, Instagram e Grupo do WhatsApp.

#### Componente reutilizável de contagem regressiva
- Novo `src/shared/components/ui/CountdownTimer.tsx` — componente genérico
  client-side de contagem regressiva, reutilizável em qualquer página.

---

## [1.9] — 2026-07-19

### Página de Parceiros do Selah

#### Nova seção "Parceiros"
- Nova página `src/app/(app)/parceiros/page.tsx` que lista os parceiros do
  projeto: logo clicável (link para o site oficial do parceiro), apresentação
  institucional, áreas de atuação e canais de contato.
- Fonte de dados em `src/features/parceiros/data/partners.ts` — todo o conteúdo
  institucional é real, extraído do site oficial de cada parceiro (sem invenção).

#### Primeiro parceiro: Oliveira & Aguilar Advocacia
- Escritório de advocacia liderado pela Dra. Aline de Oliveira Pinto e Aguilar,
  especializado em Direito Previdenciário (Franca-SP e Ribeirão Preto-SP).
- Logo em `public/parceiros/oliveira-aguilar.png`.

#### Navegação
- Novo item "Parceiros" na `Sidebar.tsx` (desktop) e na grade do
  `MenuModal.tsx` (menu mobile).

---

## [1.8] — 2026-07-19

### Rebrand cobre (lote 3): ícones PWA, navegação, instalação e emblema

#### Ícones do PWA regerados a partir da marca
- Novos `public/icon.png`, `icon-192.png`, `icon-512.png`, `apple-icon.png` e
  `src/app/favicon.ico`, gerados a partir do master `marca/icon-master-1024.png`
  (adicionado ao repositório de assets da marca), substituindo os ícones da
  identidade anterior.

#### Limpeza do dourado-latão legado na navegação
- Resíduos de `#c9a227` / `rgba(201,168,76,x)` migrados para o cobre novo em
  `Sidebar.tsx`, `BottomNav.tsx` e `MenuModal.tsx` — componentes de layout
  compartilhado que não haviam sido cobertos nas rodadas anteriores.

#### Instalação do PWA
- Novo hook `useInstallPrompt.ts` e botão "Instalar o SELAH no celular"
  (prompt nativo no Android/Chrome) com instrução manual para o iOS Safari,
  integrados no `MenuModal.tsx`.

#### Emblema da marca + relógio/clima
- `SelahLogo.tsx`: emblema circular com variantes clara/escura pré-compostas
  (`public/logo-badge-light.png` / `logo-badge-dark.png`), com troca automática
  por CSS conforme o tema (regras `.selah-logo-light` / `.selah-logo-dark` em
  `globals.css`).
- `ClockWeather.tsx`: relógio + temperatura de Franca-SP via Open-Meteo
  (sem chave de API).
- Integrados na `Sidebar`, na tela `bem-vindo` e nos 5 componentes de auth
  (Login, Registro, Esqueci a senha, Redefinir senha, Aguardando aprovação).

---

## [1.6] — 2026-07-19

### Correções pós-auditoria: testes, cron do devocional

#### Testes (269/269 passando, eram 264/269)
- `LoginForm`: 3 testes usavam `getByLabelText(/senha/i)` sem âncora, colidindo
  com o aria-label do botão de olho ("Mostrar/Ocultar senha"). Corrigido para
  `/^senha/i`, mesmo padrão já usado nos testes do RegisterForm.
- `useRequireApproval`: hook e teste testavam um redirecionamento para
  `/pending-approval` que não reflete mais a regra de negócio atual
  ("usuários são criados já aprovados", conforme `requireApproved` server-side).
  JSDoc do hook e teste atualizados; adicionado teste de redirecionamento
  para status `banned`.
- `ai.test.ts`: mock do Supabase client não implementava `.in()`/`.upsert()`,
  usados por `ai-budget/settings.ts` e `budget.service.ts`. Mock completado.

#### Cron do devocional diário
- `CRON_SECRET` nunca tinha sido configurado (perdido na recriação do projeto
  Vercel) — o cron de `/api/ai/devocional/generate` sempre retornava 401 e
  nenhum devocional era gerado. Gerado novo secret, configurado na Vercel;
  cron diário (05h UTC) volta a funcionar a partir de hoje.
- Devocional do dia 19/07/2026 gerado manualmente para validar o fluxo
  ("Caminhos de Vida e Sabedoria" — Salmos 1:1-6).

---

## [1.5] — 2026-07-19

### Correção crítica: leitura e busca da Bíblia estavam bloqueadas

Auditoria profunda encontrou que a tela Bíblia (Leitura e Busca) retornava
sempre 0 versículos em produção desde a recriação do banco, apesar dos
124.417 versículos estarem corretamente no banco.

**Causa raiz:** `bible_verses` usa um client Supabase sem sessão
(`createUniversalClient`, anon key, sem JWT de usuário) por design — mas a
policy de RLS criada exigia `is_approved()`/`is_admin()`, que dependem de
`auth.uid()` (sempre `NULL` nesse client). Resultado: toda leitura era
bloqueada silenciosamente pelo RLS, sem erro visível na tela.

**Correção:** `bible_verses` agora tem leitura pública (`for select using
(true)`) — é conteúdo bíblico, sem necessidade de aprovação para ler.
Escrita continua restrita a admin. Migration `005_fix_bible_verses_public_read.sql`.

Confirmado corrigido em produção: leitura de capítulos e busca full-text
(RPC `search_bible_verses`) voltaram a funcionar normalmente.

### Outras correções da auditoria
- Removida variável não utilizada (`adminActive`) em `BottomNav.tsx`

---

## [1.4] — 2026-07-19

### Lojinha editável pelo admin + amostras bíblicas

- Destaques da Lojinha trocados por livros bíblicos reais da loja: Bíblia de Estudo
  Desafios de Todo Homem, Mulheres com Deus — 365 Dias de Fé, Plenitude (Camila
  Saraiva Vieira) e Deuses Falsos (Timothy Keller)
- Novo painel **Admin → Lojinha** (`/admin/lojinha`): adicionar, remover, reordenar
  e editar produtos (nome, preço, desconto, vendidos, link, imagem) sem precisar de código
- Produtos agora vêm de `app_settings` (banco) com fallback para os padrões acima
- Nova permissão granular `manage_lojinha`
- Rotas `GET/POST/DELETE /api/admin/lojinha`

---

## [1.3] — 2026-07-18

### Lojinha

- Nova aba **Lojinha** (`/lojinha`) — vitrine da coleção Collshp/Shopee do Dr. Edson
- Hero dourado com versículo (Oséias 4:6) e CTA para a loja completa
- Grid de produtos em destaque com imagem, preço, badge de desconto e vendas
- Selo de compra segura pela Shopee
- Item "Lojinha" adicionado à grade do Menu

---

## [1.2] — 2026-07-18

### Sistema de atualização no menu + tema claro espiritual

#### Atualização de versão (novo)
- `src/config/version.ts` — fonte única da versão do app (esquema v1.0 → v1.9 → v2.0)
- Rota `/api/version` — informa a versão do último deploy (sem cache)
- Hook `useAppUpdate` — compara versão do bundle com a do servidor (ao abrir, ao voltar ao app e a cada 5 min)
- Menu mostra botão dourado "Atualizar para vX.Y" quando há versão nova; toque limpa caches e recarrega
- Ponto dourado pulsante no botão Menu da barra inferior quando há atualização
- Rodapé do menu mostra a versão atual dinamicamente

#### Tema e layout
- Tema claro (creme espiritual, estilo Glorify) agora é o padrão; escuro continua disponível no toggle
- Paleta clara refinada com contraste reforçado (textos escuros, bordas definidas)
- Aura de luz dourada no topo do fundo (dark e light)
- Menu flutuante mobile redesenhado: Kairo como botão central em destaque (com brilho "respirando"), Devocional fixo na barra
- Botão de mostrar/ocultar senha (olho) em todos os campos de senha (`PasswordInput`)

#### Infraestrutura
- Banco Supabase recriado do zero (projeto "selaah") com schema completo, RLS e 124.417 versículos bíblicos
- Migrations-espelho completas versionadas em `supabase/migrations/`

---

## [1.0.1] — 2026-05-02

### Melhorias de UX — Homenagens em destaque na Home

#### Home
- Card **Homenagens** adicionado ao grid principal de destaque (ao lado de Kairo, Legendários e Devocional)
- Grid 2×2 no mobile, 4 colunas no desktop — todos os 4 módulos principais visíveis imediatamente
- Banner extra de Homenagens abaixo do Devocional para reforço visual no mobile
- Identidade visual roxa/violeta para Homenagens (diferente dos outros módulos)
- Badge NOVO no card e banner de Homenagens

#### Banco de Dados
- Migration `005_homenagens.sql` criada com tabela `homenagens`, RLS e políticas de acesso

---

## [1.0.0] — 2026-05-02

### Lançamento público — Versão inicial estável

#### Autenticação
- Login com email/senha
- Login com Google OAuth
- Cadastro direto (sem aprovação manual) com login automático após registro
- Recuperação de senha via link por email (Forgot Password)
- Campos obrigatórios no cadastro: nome, email, telefone, data de nascimento, senha
- Campos opcionais: WhatsApp, LinkedIn, Instagram, cidade/estado, igreja, gênero, Legendário

#### Módulos do App
- **Devocional** — devocional diário com IA
- **Kairo** — assistente de IA pastoral (Dr. Edson Barroso)
- **Bíblia** — estudo bíblico com IA
- **Teologia** — aprofundamento teológico com IA
- **Exegese** — exegese bíblica com IA
- **Oração** — registro e comunidade de oração
- **Comunidade** — feed da comunidade SELAH
- **Legendários** — página do movimento com logo oficial laranja
- **Igreja** — Casa de Oração de Franca com pastores e Instagram
- **Homenagens** — seção de homenagens às famílias dos Legendários

#### Homenagens
- Formulário completo: quem homenageia (nome + Instagram + número Legendário), homenageado (nome + parentesco + Instagram), upload de até 2 fotos, seleção de foto de capa
- Validação de 2.000 caracteres com IA (OpenAI) para reescrita pastoral caso ultrapasse o limite
- Primeira homenagem: Lisley Barroso — por Dr. Edson Barroso (Legendário #203460)

#### Painel Admin Master
- Alertas de novos cadastros (últimas 48h)
- Métricas por usuário: tempo de uso, tokens gastos por IA, interações por seção
- Acesso exclusivo ao administrador master

#### Visual
- Widget Legendários na Home: todo laranja, logo oficial (bandeira com homem)
- Cores laranja em toda a seção Legendários
- Responsivo: mobile (390px) e desktop

---

## Versões futuras
- v1.1.0 — Notificações push, integração WhatsApp
- v1.2.0 — Gamificação, ranking de Legendários
- v2.0.0 — App nativo (React Native)
