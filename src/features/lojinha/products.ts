/**
 * Lojinha — tipos e produtos padrão da vitrine.
 *
 * Os destaques editados pelo admin ficam em app_settings (key: lojinha_products).
 * Esta lista é o fallback quando nada foi personalizado ainda.
 */

export const STORE_URL = "https://collshp.com/dredsonbarroso?view=storefront";
export const LOJINHA_SETTING_KEY = "lojinha_products";

export interface LojinhaProduct {
  name: string;
  price: string;      // ex: "R$ 42,90"
  discount: string;   // ex: "-11%" ("" = sem desconto)
  sold: string;       // ex: "744 vendidos" ("" = não mostrar)
  image: string;      // URL da imagem do produto
  link: string;       // URL do produto ("" = usa a lojinha completa)
}

export const DEFAULT_PRODUCTS: LojinhaProduct[] = [
  {
    name: "Bíblia de Estudo Desafios de Todo Homem",
    price: "R$ 161,22",
    discount: "-5%",
    sold: "32 vendidos",
    image: "https://down-br.img.susercontent.com/file/sg-11134201-7rdvd-mci51hwumz4kc0_tn.webp",
    link: "",
  },
  {
    name: "Mulheres com Deus — 365 Dias de Fé",
    price: "R$ 21,80",
    discount: "-45%",
    sold: "100mil+ vendidos",
    image: "https://down-br.img.susercontent.com/file/sg-11134201-7rdxz-mc9mb2wz7xjld0_tn.webp",
    link: "",
  },
  {
    name: "Plenitude — Camila Saraiva Vieira",
    price: "R$ 68,90",
    discount: "-33%",
    sold: "39 vendidos",
    image: "https://down-br.img.susercontent.com/file/br-11134207-81z1k-mi1wsxrs1gxu3a_tn.webp",
    link: "",
  },
  {
    name: "Deuses Falsos — Timothy Keller",
    price: "R$ 42,90",
    discount: "",
    sold: "744 vendidos",
    image: "https://down-br.img.susercontent.com/file/024b30037f95766ae98840a9d82cdd48_tn.webp",
    link: "",
  },
];

/** Valida a estrutura de um array de produtos vindo do banco/formulário. */
export function isValidProductList(value: unknown): value is LojinhaProduct[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 12) return false;
  return value.every(
    (p) =>
      p && typeof p === "object" &&
      typeof (p as LojinhaProduct).name === "string" && (p as LojinhaProduct).name.trim().length > 0 &&
      typeof (p as LojinhaProduct).price === "string" &&
      typeof (p as LojinhaProduct).discount === "string" &&
      typeof (p as LojinhaProduct).sold === "string" &&
      typeof (p as LojinhaProduct).image === "string" && (p as LojinhaProduct).image.startsWith("http") &&
      typeof (p as LojinhaProduct).link === "string"
  );
}
