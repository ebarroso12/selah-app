/**
 * Next.js Proxy (anteriormente "Middleware") — proteção de rotas do SELAH App.
 * Renomeado em Next.js 16: arquivo proxy.ts, função exportada "proxy".
 *
 * Responsabilidades:
 * 1. Refresh das cookies de sessão do Supabase SSR (obrigatório)
 * 2. Rotas `/(app)/*`  → requer autenticado (banidos/rejeitados são deslogados)
 * 3. Rotas `/admin/*`  → requer role = 'admin' OU ter pelo menos uma permissão
 * 4. Rotas `/(auth)/*` → redireciona para /home se já autenticado
 * 5. `/auth/callback`, `/convite/*`, `/preview/*` → sempre públicas
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Helpers de rota
// ---------------------------------------------------------------------------

/** Rotas sempre acessíveis, sem autenticação */
const PUBLIC_PREFIXES = [
  "/auth/callback",
  "/preview",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/convite",
  "/api",
];

/** Rotas exclusivas de administrador */
const ADMIN_PREFIXES = ["/admin"];

/** Rotas de autenticação (redirecionar p/ /home se já logado) */
const AUTH_ONLY_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

// ---------------------------------------------------------------------------
// Middleware principal
// ---------------------------------------------------------------------------

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Inicializa resposta — será atualizada com cookies de sessão
  let supabaseResponse = NextResponse.next({ request });

  // Cria cliente Supabase para middleware (lê/escreve cookies via request/response)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Propaga cookies novos para o request (necessário para SSR)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Reconstrói a resposta com os cookies atualizados
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: usar getUser() (não getSession()) para verificação segura server-side.
  // Isso também refresca o token automaticamente se necessário.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── 1. Rota pública → passa direto ──────────────────────────────────────
  if (matchesPrefix(pathname, PUBLIC_PREFIXES)) {
    // Usuário já autenticado tentando acessar login/register → redireciona
    if (user && matchesPrefix(pathname, AUTH_ONLY_PREFIXES)) {
      return redirectTo(request, "/home");
    }
    return supabaseResponse;
  }

  // ── 2. Não autenticado → login ───────────────────────────────────────────
  if (!user) {
    return redirectTo(request, "/login");
  }

  // ── 3. Rotas de admin → role=admin OU permissões ───────────────────────
  if (matchesPrefix(pathname, ADMIN_PREFIXES)) {
    const profile = await getProfileGuardData(supabase, user.id);
    if (profile?.status === "banned" || profile?.status === "rejected") {
      await supabase.auth.signOut();
      return redirectTo(request, "/login");
    }
    const hasAccess =
      profile?.role === "admin" || (profile?.permissions?.length ?? 0) > 0;
    if (!hasAccess) {
      return redirectTo(request, "/home");
    }
    return supabaseResponse;
  }

  // ── 4. Rotas protegidas → bloquear apenas banidos/rejeitados ───────────
  const status = await getProfileStatus(supabase, user.id);

  if (status === "rejected" || status === "banned") {
    await supabase.auth.signOut();
    return redirectTo(request, "/login");
  }

  return supabaseResponse;
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

/**
 * Busca o status do perfil do usuário.
 * Retorna null se a tabela ainda não existir (pré-Sprint 2) — não bloqueia o acesso.
 */
async function getProfileStatus(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<"pending" | "approved" | "rejected" | "banned" | null> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", userId)
      .single();
    return data?.status ?? null;
  } catch {
    // Tabela não existe ainda (pré-migração) → não bloqueia
    return null;
  }
}

/** Lê role + permissions + status para o guard de /admin. */
async function getProfileGuardData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<{ role: string; permissions: string[]; status: string } | null> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("role, permissions, status")
      .eq("id", userId)
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Matcher — exclui assets estáticos e arquivos internos do Next.js
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Aplica o middleware a TODAS as rotas EXCETO:
     * - _next/static  (build artifacts)
     * - _next/image   (image optimization)
     * - favicon e ícones
     * - manifest.json
     * - arquivos com extensão de imagem/fonte
     */
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.png|icon-192\\.png|icon-512\\.png|apple-icon\\.png|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
