# CHANGELOG — SELAH App

Todas as mudanças notáveis neste projeto são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

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
