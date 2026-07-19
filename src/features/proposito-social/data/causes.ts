export interface Cause {
  slug: string;
  name: string;
  tagline: string;
  logo: string;
  logoBg: string;
  url: string;
  hook: string;
  founderStory: string[];
  mission: string[];
  services: string[];
  urgency: string[];
  specialNote?: string;
  contacts: {
    phones: string[];
    whatsapp: { label: string; url: string };
    email: string;
    address?: { line: string; mapsUrl: string };
    social: { label: string; url: string }[];
    actions: { label: string; url: string }[];
  };
}

/** Causas sociais que o Selah escolhe caminhar ao lado. Todo o conteúdo vem
 * do site oficial de cada causa — não invente números, datas ou fatos que
 * não estejam confirmados na fonte. */
export const causes: Cause[] = [
  {
    slug: "instituto-princesa-rivania",
    name: "Instituto Princesa Rivânia",
    tagline: "Resgatando mulheres do ciclo da violência doméstica",
    logo: "/proposito-social/princesa-rivania.png",
    logoBg: "#3B1E52",
    url: "https://institutoprincesarivania.ong.br/",
    hook:
      "No Brasil, uma mulher é vítima de feminicídio a cada poucas horas. Muitas sobrevivem — mas carregam para sempre as marcas físicas e emocionais da violência que quase as matou. O Instituto Princesa Rivânia existe para que essas mulheres não precisem carregar essa marca sozinhas, e para que menos famílias precisem enterrar uma filha, uma irmã, uma mãe.",
    founderStory: [
      "O Instituto nasceu da dor da Dra. Claudia Starling, que perdeu sua irmã Rivânia — descrita por quem a conheceu como uma mulher \"linda, alegre e feliz\", formada em odontologia e direito, com mestrado — vítima de feminicídio cometido pelo próprio marido.",
      "Segundo a fundadora, foi em um sonho que Rivânia pediu à irmã que ajudasse outras mulheres a não terem o mesmo destino. Foi esse pedido — e essa dor transformada em propósito — que deu origem ao Instituto Princesa Rivânia: uma forma de fazer com que a história de Rivânia salve outras vidas.",
    ],
    mission: [
      "O Instituto resgata mulheres do ciclo de violência doméstica e familiar — incluindo sobreviventes de tentativa de feminicídio — através de tratamento gratuito de reconstrução facial, apoio emocional e psicológico. Também atua na raiz do problema, com os Grupos Reflexivos: um programa de transformação comportamental para agressores, com 24 encontros semanais entre palestras e ciclos de reflexão.",
    ],
    services: [
      "Reconstrução facial gratuita",
      "Apoio psicológico especializado",
      "Apoio psiquiátrico",
      "Assistência social e jurídica",
      "Grupos Reflexivos para agressores",
    ],
    urgency: [
      "Os casos de feminicídio continuam crescendo no Brasil. Cada mulher atendida pelo Instituto é uma vida que recupera a própria identidade, a própria confiança, e a chance de recomeçar. Cada agressor que passa pelos Grupos Reflexivos é um ciclo de violência com chance real de ser interrompido antes de fazer mais vítimas.",
      "Esse trabalho só continua de pé com quem decide não olhar pra outro lado — como voluntário, parceiro, ou simplesmente divulgando essa causa para quem pode estar precisando dela agora.",
    ],
    specialNote:
      "O Dr. Edson Barroso, idealizador do SELAH, é o médico diretor da área de saúde mental do Instituto Princesa Rivânia — cuidando da parte psiquiátrica do acompanhamento oferecido às mulheres atendidas pelo projeto.",
    contacts: {
      phones: ["(31) 99636-1330", "(31) 99104-4300"],
      whatsapp: { label: "Falar no WhatsApp", url: "https://wa.me/5531996361330" },
      email: "contato@institutoprincesarivania.ong.br",
      address: {
        line: "Av. do Contorno, 4747, 13º andar, sala 1302, Ed. Lifecenter, Bairro Funcionários, Belo Horizonte/MG",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+do+Contorno,+4747,+Belo+Horizonte-MG",
      },
      social: [{ label: "Instagram", url: "https://www.instagram.com/institutoprincesarivania/" }],
      actions: [
        { label: "Seja Voluntário ou Parceiro", url: "https://docs.google.com/forms/d/e/1FAIpQLSdVUC-Ijqop-O88cFNnRWRT0DnBIHFJOUAboa3KbsdvKQsBHA/viewform" },
      ],
    },
  },
];
