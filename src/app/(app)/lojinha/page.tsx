export const dynamic = "force-dynamic";
import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import {
  DEFAULT_PRODUCTS,
  LOJINHA_SETTING_KEY,
  STORE_URL,
  isValidProductList,
  type LojinhaProduct,
} from "@/features/lojinha/products";

export const metadata = { title: "Lojinha" };

async function getProducts(): Promise<LojinhaProduct[]> {
  try {
    const supabase = await createServiceClient();
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", LOJINHA_SETTING_KEY)
      .maybeSingle();
    if (data?.value) {
      const parsed = JSON.parse(data.value);
      if (isValidProductList(parsed)) return parsed;
    }
  } catch { /* fallback abaixo */ }
  return DEFAULT_PRODUCTS;
}

function IconExternal() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

export default async function LojinhaPage() {
  const products = await getProducts();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div>
        <p className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Leitura &amp; Crescimento
        </p>
        <h1 className="text-2xl">Lojinha</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Livros escolhidos a dedo pelo Dr. Edson para nutrir mente e espírito
        </p>
      </div>

      {/* Hero — convite à lojinha */}
      <a
        href={STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl p-6 sm:p-8 transition-all hover:scale-[1.01] active:scale-[0.99]"
        style={{
          textDecoration: "none",
          background: "linear-gradient(135deg, var(--gold-bg) 0%, var(--bg-card) 60%)",
          border: "1px solid var(--gold-glow)",
          boxShadow: "0 4px 24px var(--gold-glow)",
        }}
      >
        <div className="flex items-center gap-5">
          <div
            className="hidden sm:flex w-16 h-16 rounded-2xl items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #E2C464 0%, #C9A84C 55%, #A07830 100%)",
              boxShadow: "0 4px 16px var(--gold-glow)",
            }}
          >
            {/* Livro aberto */}
            <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#0C1221" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs tracking-widest uppercase mb-1"
              style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
              Coleção do Dr. Edson
            </p>
            <p className="text-lg font-bold" style={{ fontFamily: "var(--font-cinzel)", color: "var(--gold)" }}>
              Conhecimento que transforma
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              &ldquo;O meu povo perece por falta de conhecimento&rdquo; — Oséias 4:6
            </p>
          </div>
          <span
            className="hidden sm:flex items-center gap-1.5 text-xs px-4 py-2 rounded-full shrink-0"
            style={{
              background: "var(--gold)",
              color: "var(--bg-card)",
              fontFamily: "var(--font-cinzel)",
              letterSpacing: "0.05em",
              fontWeight: 700,
            }}
          >
            Visitar <IconExternal />
          </span>
        </div>
      </a>

      {/* Produtos em destaque */}
      <div>
        <p className="text-xs tracking-widest uppercase mb-4"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Destaques
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <a
              key={p.name}
              href={p.link || STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="card overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col"
              style={{ textDecoration: "none" }}
            >
              <div className="relative" style={{ background: "var(--bg-2)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
                {p.discount && (
                  <span
                    className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: "var(--wine)", color: "#F5F2EB" }}
                  >
                    {p.discount}
                  </span>
                )}
              </div>
              <div className="p-3 flex flex-col gap-1 flex-1">
                <p className="text-xs leading-snug font-semibold flex-1" style={{ color: "var(--text)" }}>
                  {p.name}
                </p>
                <p className="text-base font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}>
                  {p.price}
                </p>
                {p.sold && (
                  <p style={{ fontSize: "0.65rem", color: "var(--text-subtle)" }}>{p.sold}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* CTA final */}
      <a
        href={STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary w-full flex items-center justify-center gap-2"
        style={{ textDecoration: "none" }}
      >
        Ver a lojinha completa <IconExternal />
      </a>

      {/* Confiança */}
      <div className="card p-4 flex items-start gap-3">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--heal)" strokeWidth={1.8} className="shrink-0 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Compra 100% segura pela Shopee — pagamento, entrega e garantia processados
          diretamente pela plataforma. Os preços podem variar conforme promoções da loja.
        </p>
      </div>
    </div>
  );
}
