-- Migration 010: CMS content tables (partners, social_causes, legendarios_featured_event)
-- Torna editável pelo painel admin o conteúdo hoje hardcoded em:
--   src/features/parceiros/data/partners.ts
--   src/features/proposito-social/data/causes.ts
--   bloco "Próximo Evento" em src/app/(app)/legendarios/page.tsx
-- Segue o padrão de RLS de 004_rls_storage_seeds.sql:
--   <tabela>_public_read  → public.is_approved() or public.is_admin()
--   <tabela>_admin_all    → public.is_admin()

-- ── PARTNERS ──────────────────────────────────────────────
create table public.partners (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  name                text not null,
  tagline             text not null default '',
  logo_url            text not null default '',
  website_url         text not null default '',
  summary             text[] not null default '{}',
  areas               text[] not null default '{}',
  google_review_url   text,
  video_url           text,
  video_thumbnail_url text,
  video_caption       text,
  contacts            jsonb not null default '{}'::jsonb,
  sort_order          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── SOCIAL CAUSES ─────────────────────────────────────────
create table public.social_causes (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  tagline        text not null default '',
  logo_url       text not null default '',
  logo_bg        text not null default '#3B1E52',
  website_url    text not null default '',
  hook           text not null default '',
  founder_story  text[] not null default '{}',
  mission        text[] not null default '{}',
  services       text[] not null default '{}',
  urgency        text[] not null default '{}',
  special_note   text,
  contacts       jsonb not null default '{}'::jsonb,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── LEGENDÁRIOS FEATURED EVENT ────────────────────────────
create table public.legendarios_featured_event (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null default '',
  date_range         text not null default '',
  target_date        timestamptz,
  description        text not null default '',
  steps              jsonb not null default '[]'::jsonb,
  motto              text not null default '',
  payment_url        text,
  instagram_url      text,
  whatsapp_group_url text,
  official_site_url  text,
  is_active          boolean not null default true,
  updated_at         timestamptz not null default now()
);

-- ── RLS ───────────────────────────────────────────────────
alter table public.partners                  enable row level security;
alter table public.social_causes             enable row level security;
alter table public.legendarios_featured_event enable row level security;

create policy "partners_public_read" on public.partners
  for select using (public.is_approved() or public.is_admin());
create policy "partners_admin_all" on public.partners
  for all using (public.is_admin());

create policy "social_causes_public_read" on public.social_causes
  for select using (public.is_approved() or public.is_admin());
create policy "social_causes_admin_all" on public.social_causes
  for all using (public.is_admin());

create policy "legendarios_featured_event_public_read" on public.legendarios_featured_event
  for select using (public.is_approved() or public.is_admin());
create policy "legendarios_featured_event_admin_all" on public.legendarios_featured_event
  for all using (public.is_admin());

-- ── SEED: partners (conteúdo migrado de partners.ts) ──────
insert into public.partners
  (slug, name, tagline, logo_url, website_url, summary, areas, google_review_url,
   video_url, video_thumbnail_url, video_caption, contacts, sort_order)
values
(
  'edson-barroso',
  'Dr. Edson Barroso',
  'Saúde mental com olhar humano e integrativo',
  '/parceiros/edson-barroso.png',
  'https://www.dredsonbarroso.com.br/',
  ARRAY[
    'Existe uma diferença enorme entre tratar o sintoma e tratar a causa. O Dr. Edson Barroso, idealizador do SELAH, é médico psiquiatra pós-graduado em Saúde Mental e Medicina Integrativa, com formação sólida em TDAH, Transtorno do Espectro Autista (TEA), Burnout e uso medicinal de Canabidiol — e construiu sua prática recusando a pergunta rápida e a receita genérica. Antes de qualquer diagnóstico, ele investiga: exames laboratoriais completos avaliando vitaminas, hormônios, minerais, colesterol e glicemia, porque corpo e mente caminham juntos, e não existe saúde mental real sem entender o corpo que a sustenta.',
    'É esse o princípio da Medicina de Alta Performance que ele pratica: não uma consulta isolada, mas um plano de acompanhamento contínuo — com metas claras, reavaliação constante e ajuste fino de cada detalhe que o seu corpo e a sua mente realmente precisam para funcionar no melhor nível possível, não apenas sobreviver ao dia.',
    'Há uma dimensão que a medicina tradicional costuma ignorar: a espiritual. É quase impossível orar com profundidade, servir com alegria ou amar com presença quando a mente vive em exaustão silenciosa. Cuidar da saúde mental é também cuidar da capacidade de viver a fé — por isso esse cuidado nasce de dentro do próprio SELAH.',
    'Muitos adultos passaram a vida inteira sendo chamados de difíceis, dispersos ou frios — sem nunca saber que carregavam TDAH ou traços de autismo nunca diagnosticados. Casamentos se desgastam e terminam por dores que ninguém sabe nomear, silêncios que ninguém consegue explicar. Se essa história parece com a sua, ou com a de alguém que você ama, o primeiro passo é simples: alguém finalmente ouvir de verdade.'
  ]::text[],
  ARRAY[
    'Saúde Mental Adulto','Saúde Mental Infantil','TDAH','TEA (Autismo)','Burnout',
    'Medicina de Alta Performance','Canabidiol Medicinal','Compulsão Alimentar'
  ]::text[],
  'https://g.page/r/CQjM3735Wd8QEAE/review',
  'https://www.instagram.com/reel/DXC8GN-kYOb/',
  '/parceiros/edson-barroso-reel-thumb.jpg',
  'O vídeo que mais viralizou — mais de 50 mil curtidas',
  '{"phones":["(16) 99312-0938"],"whatsapp":{"label":"Agendar Consulta no WhatsApp","url":"https://wa.me/5516993120938"},"addresses":[{"label":"Consultório — Franca/SP","line":"Edifício Santa Maria — R. Paulo César Pachêco, 470, Sala 403, São José, Franca-SP, 14401-283","mapsUrl":"https://www.google.com/maps/search/?api=1&query=R.+Paulo+C%C3%A9sar+Pach%C3%AAco,+470,+Franca-SP"}],"hours":"Presencial em Franca-SP e atendimento online para todo o Brasil","social":[{"label":"Instagram","url":"https://www.instagram.com/dredsonbarroso/"}]}'::jsonb,
  0
),
(
  'oliveira-aguilar',
  'Oliveira & Aguilar Advocacia',
  'Soluções Jurídicas Integradas',
  '/parceiros/oliveira-aguilar.png',
  'https://www.advocaciaalineoliveira.com.br/',
  ARRAY[
    'A Oliveira & Aguilar (A. de O. P. e Aguilar Sociedade Individual de Advocacia) é liderada pela Dra. Aline de Oliveira Pinto e Aguilar, formada em Direito em 2003 e com mais de 16 anos de atuação especializada em Direito Previdenciário.',
    'Vinda de família humilde de lavradores, a Dra. Aline começou a advogar em 2004 dividindo despesas com outros profissionais. Em 2013 conquistou sede própria em Franca-SP, e em 2021 abriu a primeira filial, em Ribeirão Preto-SP — hoje conta com equipe especializada em múltiplas áreas do Direito.',
    'O propósito do escritório é resumido na própria frase que guia o trabalho: "cada benefício concedido é uma família protegida". Além da atuação jurídica, a Dra. Aline também dedica parte do seu tempo à educação jurídica, com palestras, mentorias e cursos.'
  ]::text[],
  ARRAY[
    'Previdenciário (INSS e Regimes Próprios)','Trabalhista','Família','Cível','Consumidor',
    'Acidentário / Indenizações'
  ]::text[],
  null, null, null, null,
  '{"phones":["(16) 3721-7940","(16) 99208-4825","(16) 99352-8888"],"whatsapp":{"label":"Falar no WhatsApp","url":"https://api.whatsapp.com/send?phone=5516993528888&text="},"email":"comercial@advocaciaalineoliveira.com.br","addresses":[{"label":"Matriz — Franca/SP","line":"R. Couto Magalhães, 2073, Centro, Franca-SP","mapsUrl":"https://www.google.com/maps/place/R.+Couto+Magalh%C3%A3es,+2073+-+Centro,+Franca+-+SP,+14400-020/"},{"label":"Filial — Ribeirão Preto/SP","line":"R. Amador Bueno, 687, Centro, Ribeirão Preto-SP","mapsUrl":"https://www.google.com/maps/place/R.+Amador+Bueno,+687+-+Centro,+Ribeir%C3%A3o+Preto+-+SP,+14010-070/"}],"hours":"Segunda a sexta, 08:30 às 18:00","social":[{"label":"Instagram","url":"https://www.instagram.com/alineoliveiraadvocacia/"},{"label":"Facebook","url":"https://www.facebook.com/alineoliveiraadvocacia/"},{"label":"YouTube","url":"https://www.youtube.com/channel/UCpvD5JL1bOiC8sWQW8ozc7g"},{"label":"TikTok","url":"https://www.tiktok.com/@alineoliveiraadvocacia"}]}'::jsonb,
  1
),
(
  'claudia-starling',
  'Dra. Claudia Starling',
  'Realce a sua beleza natural',
  '/parceiros/claudia-starling.png',
  'https://draclaudiastarling.com.br/',
  ARRAY[
    'A Dra. Claudia Starling é PhD e Doutora em Odontologia (concentração em Ortodontia), Mestre em Ortodontia e especialista em Ortopedia e Ortodontia pela Terapia Bioprogressiva de Ricketts. Tem qualificação em Harmonização Orofacial pela Universidade de Harvard, em Odontologia Sistêmica e em Halitose pela ABHA.',
    'Credenciada Invisalign pela Pensilvânia (Filadélfia, EUA), é reconhecida como a primeira Invisalign Doctor do Brasil. Atua com harmonização facial, Invisalign, tratamento de halitose, modulação hormonal, implantes e procedimentos não invasivos, sempre com abordagem personalizada — resumida no seu lema "Harmonizar é se amar".',
    'Além da atuação clínica, a Dra. Claudia dedica parte do seu trabalho ao projeto social "Princesa Rivânia", que resgata mulheres do ciclo de violência doméstica através de reconstrução facial gratuita.'
  ]::text[],
  ARRAY[
    'Harmonização Facial','Invisalign','Odontologia','Halitose','Modulação Hormonal','Implantes'
  ]::text[],
  null, null, null, null,
  '{"phones":["(31) 9 9636-1330 — Belo Horizonte","(31) 9 9651-1330 — São Paulo","(31) 9 9651-1330 — Fortaleza","(33) 3271-7229 — Governador Valadares","(33) 9 9157-9632 — Governador Valadares"],"whatsapp":{"label":"Falar no WhatsApp","url":"https://wa.me/5531996361330"},"email":"draclaudiastarlingphd@gmail.com","addresses":[{"label":"Belo Horizonte/MG","line":"Ed. Lifecenter — Av. do Contorno, 4747, 13º andar, sala 1302, Bairro Serra","mapsUrl":"https://www.google.com/maps/search/?api=1&query=Av.+do+Contorno,+4747,+Belo+Horizonte-MG"},{"label":"Governador Valadares/MG","line":"R. Barão do Rio Branco, 461, salas 207/208, Ed. Rio Branco Centro","mapsUrl":"https://www.google.com/maps/search/?api=1&query=R.+Bar%C3%A3o+do+Rio+Branco,+461,+Governador+Valadares-MG"}],"hours":"Todos os dias, 8h às 22h","social":[{"label":"Instagram","url":"https://www.instagram.com/draclaudiastarling/"},{"label":"Facebook","url":"https://www.facebook.com/claudia.starling"}]}'::jsonb,
  2
)
on conflict (slug) do nothing;

-- ── SEED: social_causes (conteúdo migrado de causes.ts) ───
insert into public.social_causes
  (slug, name, tagline, logo_url, logo_bg, website_url, hook, founder_story, mission,
   services, urgency, special_note, contacts, sort_order)
values
(
  'instituto-princesa-rivania',
  'Instituto Princesa Rivânia',
  'Resgatando mulheres do ciclo da violência doméstica',
  '/proposito-social/princesa-rivania.png',
  '#3B1E52',
  'https://institutoprincesarivania.ong.br/',
  'No Brasil, uma mulher é vítima de feminicídio a cada poucas horas. Muitas sobrevivem — mas carregam para sempre as marcas físicas e emocionais da violência que quase as matou. O Instituto Princesa Rivânia existe para que essas mulheres não precisem carregar essa marca sozinhas, e para que menos famílias precisem enterrar uma filha, uma irmã, uma mãe.',
  ARRAY[
    'O Instituto nasceu da dor da Dra. Claudia Starling, que perdeu sua irmã Rivânia — descrita por quem a conheceu como uma mulher "linda, alegre e feliz", formada em odontologia e direito, com mestrado — vítima de feminicídio cometido pelo próprio marido.',
    'Segundo a fundadora, foi em um sonho que Rivânia pediu à irmã que ajudasse outras mulheres a não terem o mesmo destino. Foi esse pedido — e essa dor transformada em propósito — que deu origem ao Instituto Princesa Rivânia: uma forma de fazer com que a história de Rivânia salve outras vidas.'
  ]::text[],
  ARRAY[
    'O Instituto resgata mulheres do ciclo de violência doméstica e familiar — incluindo sobreviventes de tentativa de feminicídio — através de tratamento gratuito de reconstrução facial, apoio emocional e psicológico. Também atua na raiz do problema, com os Grupos Reflexivos: um programa de transformação comportamental para agressores, com 24 encontros semanais entre palestras e ciclos de reflexão.'
  ]::text[],
  ARRAY[
    'Reconstrução facial gratuita','Apoio psicológico especializado','Apoio psiquiátrico',
    'Assistência social e jurídica','Grupos Reflexivos para agressores'
  ]::text[],
  ARRAY[
    'Os casos de feminicídio continuam crescendo no Brasil. Cada mulher atendida pelo Instituto é uma vida que recupera a própria identidade, a própria confiança, e a chance de recomeçar. Cada agressor que passa pelos Grupos Reflexivos é um ciclo de violência com chance real de ser interrompido antes de fazer mais vítimas.',
    'Esse trabalho só continua de pé com quem decide não olhar pra outro lado — como voluntário, parceiro, ou simplesmente divulgando essa causa para quem pode estar precisando dela agora.'
  ]::text[],
  'O Dr. Edson Barroso, idealizador do SELAH, é o médico diretor da área de saúde mental do Instituto Princesa Rivânia — cuidando da parte psiquiátrica do acompanhamento oferecido às mulheres atendidas pelo projeto.',
  '{"phones":["(31) 99636-1330","(31) 99104-4300"],"whatsapp":{"label":"Falar no WhatsApp","url":"https://wa.me/5531996361330"},"email":"contato@institutoprincesarivania.ong.br","address":{"line":"Av. do Contorno, 4747, 13º andar, sala 1302, Ed. Lifecenter, Bairro Funcionários, Belo Horizonte/MG","mapsUrl":"https://www.google.com/maps/search/?api=1&query=Av.+do+Contorno,+4747,+Belo+Horizonte-MG"},"social":[{"label":"Instagram","url":"https://www.instagram.com/institutoprincesarivania/"}],"actions":[{"label":"Seja Voluntário ou Parceiro","url":"https://docs.google.com/forms/d/e/1FAIpQLSdVUC-Ijqop-O88cFNnRWRT0DnBIHFJOUAboa3KbsdvKQsBHA/viewform"}]}'::jsonb,
  0
)
on conflict (slug) do nothing;

-- ── SEED: legendarios_featured_event (bloco "Próximo Evento") ──
insert into public.legendarios_featured_event
  (title, date_range, target_date, description, steps, motto,
   payment_url, instagram_url, whatsapp_group_url, official_site_url, is_active)
select
  'TOP 1782 · Track 3 Colinas',
  '27 a 30 de agosto de 2026 · 72 horas de imersão',
  '2026-08-27T08:00:00-03:00'::timestamptz,
  'Uma imersão de 72 horas que combina natureza, desafios físicos, confronto espiritual e transformação real — com um propósito claro: devolver o herói a cada família.',
  '[{"title":"Confrontação","description":"Tira da passividade e da zona de conforto."},{"title":"Desafio","description":"Chama a sua melhor versão."},{"title":"Propósito","description":"No topo, encontra Jesus."}]'::jsonb,
  'AHU — Amor · Honra · Unidade',
  'https://ticketandgo.com.br/legendarios-top-1782-track-3-colinas?id=6ba864f0-6579-48ca-83d6-ba4b16dfcaab',
  'https://www.instagram.com/legendarios3colinas',
  'https://chat.whatsapp.com/LkfTncbrJAfAPutDtjay8L?mode=ems_copy_t',
  'https://www.legendarios3colinas.com.br/',
  true
where not exists (select 1 from public.legendarios_featured_event);
