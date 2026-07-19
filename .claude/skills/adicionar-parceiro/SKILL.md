---
name: adicionar-parceiro
description: Adiciona um novo parceiro à página /parceiros do Selah App — busca dados reais do site oficial do parceiro, baixa/trata o logo, e cria a entrada de dados sem precisar tocar nas páginas (o index e a subpágina de detalhe já são data-driven). Use quando o usuário pedir para adicionar/cadastrar um novo parceiro, patrocinador ou apoiador do app.
---

# Adicionar Parceiro ao Selah

A página de parceiros é **100% data-driven**: `src/app/(app)/parceiros/page.tsx` (grade de
miniaturas) e `src/app/(app)/parceiros/[slug]/page.tsx` (subpágina de detalhe, com apresentação,
áreas de atuação e contatos) leem direto de `src/features/parceiros/data/partners.ts`. Pra
adicionar um parceiro novo, **normalmente você só precisa editar esse arquivo de dados** — nenhuma
página precisa mudar.

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
uma segunda chamada de `WebFetch` em subpáginas prováveis (`/sobre`, `/quem-somos`, `/contato`) ou
repita com um prompt mais específico focado no que faltou.

## Passo 2 — Conseguir o logo

Duas origens possíveis:

**(a) Usuário anexou uma imagem** (ex: arquivo em Downloads) — leia com `Read`, confirme fundo
(branco sólido, transparente, etc.), e recorte a margem excessiva com `sharp`:

```js
const sharp = require("sharp");
sharp(origem)
  .trim({ threshold: 15 })      // remove a margem sólida ao redor
  .resize({ width: 640 })
  .png()
  .toFile(`public/parceiros/${slug}.png`);
```

Rode o script a partir da raiz do projeto (`node script.js` com `cwd` em `C:\selahedson-main`) pra
o `require("sharp")` resolver — não rode de fora do projeto. Depois de rodar, DELETE qualquer
script temporário criado (não deixar lixo no repo).

**(b) URL de logo encontrada no `WebFetch`** — baixe direto:

```bash
curl -sL "<url-do-logo>" -o public/parceiros/<slug>.png
```

Sempre confira o resultado com `Read` antes de seguir (visualizar a imagem), e cheque metadados
(`sharp(...).metadata()`) se precisar confirmar transparência/dimensões.

**Não redesenhe nem recolore a marca do parceiro** (diferente do logo do próprio Selah) — a marca é
deles, use como está. Se o fundo da logo brigar muito com o tema, ela já é exibida sobre um cartão
claro neutro (`#F7F5F1`) tanto na miniatura quanto na subpágina — isso resolve a maioria dos casos.

## Passo 3 — Adicionar a entrada em `partners.ts`

Siga a interface `Partner` já definida no arquivo e o mesmo tom de voz dos parceiros existentes:
2–3 parágrafos de apresentação (quem é, credenciais/história, propósito/diferencial — terminando
se possível numa frase-lema real do parceiro), lista de áreas de atuação como badges curtos, e o
bloco de contatos completo com todos os campos que você conseguiu confirmar no Passo 1. Campos sem
dado real confirmado devem ser omitidos (ex: se não achar YouTube, não coloque o array vazio nem
invente o link — só não inclua esse item em `social`).

`slug` deve ser um kebab-case curto e estável (não muda depois, pois vira a URL
`/parceiros/<slug>`).

## Passo 4 — Validar e publicar

1. `npx tsc --noEmit` — precisa ficar limpo.
2. Confirme visualmente (dev server local ou, se preferir testar já publicado, delegar push e
   revisar em produção) que a miniatura e a subpágina renderizam bem.
3. Commit + push é feito pelo agente `aiox-devops` (padrão do projeto — `git push` é exclusivo
   dele). Peça pra ele também fazer o bump de versão (`src/config/version.ts`, `package.json`,
   `CHANGELOG.md`) igual às entregas anteriores, pra acionar o botão de atualizar do PWA.

## Quando o layout PRECISA mudar

Só mexa em `page.tsx` ou `[slug]/page.tsx` se o pedido for sobre a APRESENTAÇÃO (ex: mudar de grade
2 colunas pra lista, adicionar uma seção nova tipo depoimentos) — não pra simplesmente cadastrar
mais um parceiro.
