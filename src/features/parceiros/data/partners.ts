export interface Partner {
  slug: string;
  name: string;
  tagline: string;
  logo: string;
  url: string;
  summary: string[];
  areas: string[];
  contacts: {
    phones: string[];
    whatsapp: { label: string; url: string };
    email?: string;
    addresses: { label: string; line: string; mapsUrl: string }[];
    hours: string;
    social: { label: string; url: string }[];
  };
}

/** Parceiros do projeto Selah. Todo o conteúdo institucional vem do site
 * oficial de cada parceiro — não invente ou infira dados que não estejam lá. */
export const partners: Partner[] = [
  {
    slug: "edson-barroso",
    name: "Dr. Edson Barroso",
    tagline: "Saúde mental com olhar humano e integrativo",
    logo: "/parceiros/edson-barroso.png",
    url: "https://www.dredsonbarroso.com.br/",
    summary: [
      "O Dr. Edson Barroso, idealizador do SELAH, é psiquiatra pós-graduado em Saúde Mental e Medicina Integrativa, com sólida formação em Saúde Mental Adulto e Infantil, TDAH, Transtorno do Espectro Autista (TEA), Burnout e uso medicinal de Canabidiol. Sua abordagem une ciência e sensibilidade para investigar as raízes do sofrimento psíquico — não só tratar o sintoma que aparece, mas entender o que, no corpo e na história de vida de cada pessoa, sustenta aquela dor.",
      "Cuidar da mente é também cuidar da vida espiritual: é difícil orar, servir, amar e sonhar quando o corpo e a mente vivem em exaustão silenciosa. Por isso o acompanhamento vai além da consulta — é um verdadeiro plano de medicina de alta performance, com exames laboratoriais que avaliam vitaminas, hormônios, minerais, colesterol e glicemia, porque corpo e mente devem caminhar em harmonia para que exista saúde real.",
      "Muitos adultos carregam décadas de TDAH ou traços de autismo nunca diagnosticados — e passaram a vida sendo chamados de difíceis, dispersos ou frios, sem nunca saber o motivo real. Casamentos se desgastam e terminam por dores que ninguém sabe nomear. É para essas histórias — as que não cabem numa consulta de 15 minutos — que existe esse cuidado: profundo, ético e humano, para quem finalmente precisa ser ouvido de verdade.",
    ],
    areas: [
      "Saúde Mental Adulto",
      "Saúde Mental Infantil",
      "TDAH",
      "TEA (Autismo)",
      "Burnout",
      "Canabidiol Medicinal",
      "Compulsão Alimentar",
    ],
    contacts: {
      phones: ["(16) 99312-0938"],
      whatsapp: { label: "Agendar Consulta no WhatsApp", url: "https://wa.me/5516993120938" },
      addresses: [
        {
          label: "Consultório — Franca/SP",
          line: "Edifício Santa Maria — R. Paulo César Pachêco, 470, Sala 403, São José, Franca-SP, 14401-283",
          mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Paulo+C%C3%A9sar+Pach%C3%AAco,+470,+Franca-SP",
        },
      ],
      hours: "Presencial em Franca-SP e atendimento online para todo o Brasil",
      social: [
        { label: "Instagram", url: "https://www.instagram.com/dredsonbarroso/" },
      ],
    },
  },
  {
    slug: "oliveira-aguilar",
    name: "Oliveira & Aguilar Advocacia",
    tagline: "Soluções Jurídicas Integradas",
    logo: "/parceiros/oliveira-aguilar.png",
    url: "https://www.advocaciaalineoliveira.com.br/",
    summary: [
      "A Oliveira & Aguilar (A. de O. P. e Aguilar Sociedade Individual de Advocacia) é liderada pela Dra. Aline de Oliveira Pinto e Aguilar, formada em Direito em 2003 e com mais de 16 anos de atuação especializada em Direito Previdenciário.",
      "Vinda de família humilde de lavradores, a Dra. Aline começou a advogar em 2004 dividindo despesas com outros profissionais. Em 2013 conquistou sede própria em Franca-SP, e em 2021 abriu a primeira filial, em Ribeirão Preto-SP — hoje conta com equipe especializada em múltiplas áreas do Direito.",
      "O propósito do escritório é resumido na própria frase que guia o trabalho: \"cada benefício concedido é uma família protegida\". Além da atuação jurídica, a Dra. Aline também dedica parte do seu tempo à educação jurídica, com palestras, mentorias e cursos.",
    ],
    areas: [
      "Previdenciário (INSS e Regimes Próprios)",
      "Trabalhista",
      "Família",
      "Cível",
      "Consumidor",
      "Acidentário / Indenizações",
    ],
    contacts: {
      phones: ["(16) 3721-7940", "(16) 99208-4825", "(16) 99352-8888"],
      whatsapp: { label: "Falar no WhatsApp", url: "https://api.whatsapp.com/send?phone=5516993528888&text=" },
      email: "comercial@advocaciaalineoliveira.com.br",
      addresses: [
        {
          label: "Matriz — Franca/SP",
          line: "R. Couto Magalhães, 2073, Centro, Franca-SP",
          mapsUrl: "https://www.google.com/maps/place/R.+Couto+Magalh%C3%A3es,+2073+-+Centro,+Franca+-+SP,+14400-020/",
        },
        {
          label: "Filial — Ribeirão Preto/SP",
          line: "R. Amador Bueno, 687, Centro, Ribeirão Preto-SP",
          mapsUrl: "https://www.google.com/maps/place/R.+Amador+Bueno,+687+-+Centro,+Ribeir%C3%A3o+Preto+-+SP,+14010-070/",
        },
      ],
      hours: "Segunda a sexta, 08:30 às 18:00",
      social: [
        { label: "Instagram", url: "https://www.instagram.com/alineoliveiraadvocacia/" },
        { label: "Facebook", url: "https://www.facebook.com/alineoliveiraadvocacia/" },
        { label: "YouTube", url: "https://www.youtube.com/channel/UCpvD5JL1bOiC8sWQW8ozc7g" },
        { label: "TikTok", url: "https://www.tiktok.com/@alineoliveiraadvocacia" },
      ],
    },
  },
  {
    slug: "claudia-starling",
    name: "Dra. Claudia Starling",
    tagline: "Realce a sua beleza natural",
    logo: "/parceiros/claudia-starling.png",
    url: "https://draclaudiastarling.com.br/",
    summary: [
      "A Dra. Claudia Starling é PhD e Doutora em Odontologia (concentração em Ortodontia), Mestre em Ortodontia e especialista em Ortopedia e Ortodontia pela Terapia Bioprogressiva de Ricketts. Tem qualificação em Harmonização Orofacial pela Universidade de Harvard, em Odontologia Sistêmica e em Halitose pela ABHA.",
      "Credenciada Invisalign pela Pensilvânia (Filadélfia, EUA), é reconhecida como a primeira Invisalign Doctor do Brasil. Atua com harmonização facial, Invisalign, tratamento de halitose, modulação hormonal, implantes e procedimentos não invasivos, sempre com abordagem personalizada — resumida no seu lema \"Harmonizar é se amar\".",
      "Além da atuação clínica, a Dra. Claudia dedica parte do seu trabalho ao projeto social \"Princesa Rivânia\", que resgata mulheres do ciclo de violência doméstica através de reconstrução facial gratuita.",
    ],
    areas: [
      "Harmonização Facial",
      "Invisalign",
      "Odontologia",
      "Halitose",
      "Modulação Hormonal",
      "Implantes",
    ],
    contacts: {
      phones: [
        "(31) 9 9636-1330 — Belo Horizonte",
        "(31) 9 9651-1330 — São Paulo",
        "(31) 9 9651-1330 — Fortaleza",
        "(33) 3271-7229 — Governador Valadares",
        "(33) 9 9157-9632 — Governador Valadares",
      ],
      whatsapp: { label: "Falar no WhatsApp", url: "https://wa.me/5531996361330" },
      email: "draclaudiastarlingphd@gmail.com",
      addresses: [
        {
          label: "Belo Horizonte/MG",
          line: "Ed. Lifecenter — Av. do Contorno, 4747, 13º andar, sala 1302, Bairro Serra",
          mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+do+Contorno,+4747,+Belo+Horizonte-MG",
        },
        {
          label: "Governador Valadares/MG",
          line: "R. Barão do Rio Branco, 461, salas 207/208, Ed. Rio Branco Centro",
          mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Bar%C3%A3o+do+Rio+Branco,+461,+Governador+Valadares-MG",
        },
      ],
      hours: "Todos os dias, 8h às 22h",
      social: [
        { label: "Instagram", url: "https://www.instagram.com/draclaudiastarling/" },
        { label: "Facebook", url: "https://www.facebook.com/claudia.starling" },
      ],
    },
  },
];
