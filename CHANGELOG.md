# CHANGELOG — SELAH App

Todas as mudanças notáveis neste projeto são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

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
