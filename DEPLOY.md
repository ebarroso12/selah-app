# SELAH — Guia de Deploy

## Pré-requisitos

- Conta Supabase (supabase.com)
- Conta Vercel (vercel.com) — conectada ao GitHub
- Conta Meta Developers (meta.com/developers) — para WhatsApp
- Google Cloud Console — para Calendar API
- Conta Resend (resend.com) — para emails
- Domínio (ex: selah.app)

---

## 1. Supabase

1. Criar novo projeto em supabase.com
2. Copiar: Project URL e anon key (Settings > API)
3. Copiar: service_role key (Settings > API — manter secreta)
4. Abrir SQL Editor e colar todo o conteúdo de `supabase/migrations/001_initial_schema.sql`
5. Executar a migration
6. Ativar Google OAuth: Authentication > Providers > Google
   - Inserir Client ID e Client Secret do Google Cloud Console
   - Redirect URL: https://SEU_PROJETO.supabase.co/auth/v1/callback

---

## 2. Google Cloud Console

1. Criar projeto em console.cloud.google.com
2. Ativar APIs: Google Calendar API + Google People API
3. Criar credenciais OAuth 2.0 (tipo: Web application)
   - Authorized redirect URIs: https://SEU_PROJETO.supabase.co/auth/v1/callback
4. Copiar Client ID e Client Secret
5. Gerar Refresh Token via OAuth2 Playground:
   - Acessar developers.google.com/oauthplayground
   - Configurar com seu Client ID/Secret
   - Selecionar escopo: https://www.googleapis.com/auth/calendar
   - Fazer authorize + trocar por tokens
   - Copiar o refresh_token

---

## 3. Meta WhatsApp Business

1. Criar app em developers.facebook.com > tipo: Business
2. Adicionar produto: WhatsApp
3. Criar número de telefone de teste (ou usar número real aprovado)
4. Copiar: Phone Number ID e Token temporário (ou permanente)
5. Configurar webhook após deploy do Vercel:
   - URL: https://SEU_DOMINIO.vercel.app/api/whatsapp
   - Verify Token: o valor de WHATSAPP_VERIFY_TOKEN (ex: selah-webhook-prod)
   - Campos a assinar: messages

---

## 4. Resend

1. Criar conta em resend.com
2. Adicionar e verificar o domínio do remetente
3. Copiar API Key
4. Atualizar RESEND_FROM_EMAIL com o email verificado

---

## 5. Web Push (VAPID Keys)

Gerar as chaves no terminal do projeto:

```bash
cd C:\Users\e-bar\selah
npx web-push generate-vapid-keys
```

Copiar VAPID Public Key e VAPID Private Key.

---

## 6. Vercel Deploy

1. Acessar vercel.com > New Project
2. Importar repositório: ebarroso12/selah-app
3. Framework: Next.js (detectado automaticamente)
4. Adicionar todas as variáveis de ambiente (ver .env.local.example):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=
NEXT_PUBLIC_APP_URL=https://SEU_DOMINIO.vercel.app
ADMIN_EMAIL=edson.barroso@gmail.com
CRON_SECRET=
```

5. Deploy
6. Configurar domínio personalizado (Settings > Domains)

---

## 7. Cron Job — Devocional Diário

No painel do Vercel > Settings > Cron Jobs:
- URL: /api/devocional/generate
- Método: POST
- Header: Authorization: Bearer {CRON_SECRET}
- Schedule: 0 5 * * * (todo dia às 05h horário UTC = 02h Brasília)

---

## 8. Supabase — URL de Callback do Auth

Em Supabase > Authentication > URL Configuration:
- Site URL: https://SEU_DOMINIO.vercel.app
- Redirect URLs: https://SEU_DOMINIO.vercel.app/auth/callback

---

## Checklist Final

- [ ] Migration SQL executada no Supabase
- [ ] Google OAuth ativo no Supabase
- [ ] Variáveis de ambiente no Vercel
- [ ] Deploy bem-sucedido no Vercel
- [ ] Domínio configurado
- [ ] Webhook WhatsApp apontando para o domínio real
- [ ] Cron job configurado para devocional
- [ ] Login testado com email/senha e Google
- [ ] Cadastro testado — email chegando com status pendente
- [ ] Admin aprovando primeiro usuário
- [ ] Devocional gerado manualmente (POST /api/devocional/generate)
