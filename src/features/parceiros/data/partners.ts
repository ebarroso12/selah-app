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
    email: string;
    addresses: { label: string; line: string; mapsUrl: string }[];
    hours: string;
    social: { label: string; url: string }[];
  };
}

/** Parceiros do projeto Selah. Todo o conteúdo institucional vem do site
 * oficial de cada parceiro — não invente ou infira dados que não estejam lá. */
export const partners: Partner[] = [
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
];
