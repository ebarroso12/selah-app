---
name: adicionar-parceiro
description: Adiciona um novo parceiro à página /parceiros do Selah App — busca dados reais do site oficial do parceiro, trata o logo, e cadastra a entrada pelo painel admin (ou direto na tabela public.partners no Supabase). Use quando o usuário pedir para adicionar/cadastrar um novo parceiro, patrocinador ou apoiador do app.
---

# Adicionar Parceiro ao Selah

**MUDANÇA IMPORTANTE (2026-07):** o conteúdo dos parceiros **não fica mais em arquivo TypeScript**.
Foi migrado para a tabela `public.partners` no Supabase (migration `010_cms_content_tables.sql`).
As páginas `src/app/(app)/parceiros/page.tsx` e `.../[slug]/page.tsx` agora leem do banco via
`getPartners()` / `getPartnerBySlug()` em `src/features/parceiros/data/partners.ts` — **você não edita
mais `partners.ts` para cadastrar um parceiro**. O cadastro é feito por uma destas vias:

1. **Painel admin (preferencial para o dono do produto):** `/admin/parceiros` — formulário completo
   com nome, tagline, upload de logo, site, áreas, parágrafos de apresentação, avaliação Google,
   vídeo, contatos, reordenação (▲▼) e exclusão. Inclui um botão **"✨ Melhorar com IA"** ao lado da
   apresentação que gera/reescreve o texto (a partir de notas brutas reais, sem inventar fatos).
2. **Direto no banco (quando um agente cadastra):** inserir uma linha em `public.partners` via SQL/
   Supabase, respeitando o schema abaixo.

## Passo 1 — Coletar informações reais (nunca inventar)

Regra de ouro do projeto (Article IV — No Invention): todo dado sobre o parceiro tem que vir do
site oficial dele ou de material que o usuário forneceu diretamente. Se uma informação não estiver
disponível (ex: endereço, ano, preço), **não preencha com suposição** — omita o campo ou pergunte
ao usuário.

Use `WebFetch` na URL oficial do parceiro com um prompt parecido com este:

```
Extraia todas as informações reais disponíveis nesta página sobre: nome completo (pessoa ou
empresa), especialidade/área de atuação, formação/história/apresentação institucional,
missão/propósito declarado, diferenciais, e TODOS os dados de contato: telefone(s), WhatsApp,
e-mail, endereço(s) físico(s) completos, links de redes sociais (Instagram, Facebook, YouTube,
TikTok, LinkedIn), horário de atendimento. Cite o mais literalmente possível. Também diga se
existe uma imagem de logo no cabeçalho da página e sua URL completa (src da tag img).
```

Se a primeira busca não trouxer bio dos fundadores/sócios ou detalhes de contato completos, tente
uma segunda chamada de `WebFetch` em subpáginas prováveis (`/sobre`, `/quem-somos`, `/contato`).

## Passo 2 — Conseguir o logo

No painel admin, o próprio formulário faz upload do logo (botão "Enviar logo" → `/api/admin/upload`,
que salva no bucket `selah-images` e devolve a URL pública). Se você (agente) for tratar o logo por
fora, pode usar `sharp` para recortar a margem e subir a imagem, ou reaproveitar um caminho local em
`public/parceiros/<slug>.png`. **Não redesenhe nem recolore a marca do parceiro** — a marca é deles.
O logo é sempre exibido sobre um cartão claro neutro (`#F7F5F1`), o que resolve a maioria dos casos
de contraste. Depois de rodar qualquer script `sharp`/`node` temporário, **apague o arquivo** (não
deixar lixo no repo).

## Passo 3 — Cadastrar

### Via painel admin (recomendado)
Vá em `/admin/parceiros` → "+ Novo Parceiro", preencha os campos e salve. Use o botão de IA para
gerar a apresentação a partir das notas reais coletadas no Passo 1 (o prompt da IA também é editável
por lá). A ordem na página é controlada pelos botões ▲▼ (campo `sort_order`).

### Via banco (schema da tabela `public.partners`)
| Coluna | Tipo | Observação |
|--------|------|-----------|
| `slug` | text (unique) | kebab-case curto e estável — vira a URL `/parceiros/<slug>` |
| `name` | text | |
| `tagline` | text | |
| `logo_url` | text | caminho local (`/parceiros/...`) ou URL do storage |
| `website_url` | text | |
| `summary` | text[] | 3–4 parágrafos de apresentação |
| `areas` | text[] | áreas de atuação (badges) |
| `google_review_url` | text (nullable) | |
| `video_url` / `video_thumbnail_url` / `video_caption` | text (nullable) | vídeo em destaque |
| `contacts` | jsonb | `{ phones[], whatsapp{label,url}, email?, addresses[{label,line,mapsUrl}], hours, social[{label,url}] }` |
| `sort_order` | integer | menor = aparece primeiro |

Mantenha o mesmo tom de voz dos parceiros existentes (apresentação profunda e persuasiva) e omita
campos sem dado real confirmado. `slug` não muda depois de criado.

## Passo 4 — Validar e publicar

1. `npx tsc --noEmit` — precisa ficar limpo (só necessário se você mexeu em código; cadastro puro
   pelo admin/banco não altera código).
2. Confirme visualmente que a miniatura e a subpágina renderizam bem.
3. Commit + push é feito pelo agente `aiox-devops` (padrão do projeto — `git push` é exclusivo dele).

## Quando o layout PRECISA mudar

Só mexa em `page.tsx` ou `[slug]/page.tsx` se o pedido for sobre a APRESENTAÇÃO (ex: mudar de grade
2 colunas pra lista, adicionar uma seção nova) — não pra simplesmente cadastrar mais um parceiro.
Para mudar o mapeamento de campos DB→interface, edite `src/features/parceiros/data/partners.ts`.
