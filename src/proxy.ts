import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Email do administrador master — hardcoded como fallback de segurança
// Se a variável de ambiente ADMIN_EMAIL não estiver configurada no Vercel,
// usa o email padrão do Dr. Edson para garantir acesso ao painel admin
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "edson.barroso@gmail.com";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/preview",
];
const ADMIN_PATHS = ["/admin"];
const PENDING_PATH = "/pending-approval";
const AUTH_CALLBACK = "/auth/callback";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Garante que as variáveis de ambiente essenciais existem
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[middleware] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas");
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANTE: getUser() valida o token com o servidor Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Permite sempre o callback de OAuth
  if (pathname.startsWith(AUTH_CALLBACK)) {
    return supabaseResponse;
  }

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isPendingPath = pathname.startsWith(PENDING_PATH);

  // Não autenticado → redireciona para login (exceto rotas públicas)
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Autenticado + rota pública → redireciona para home
  if (user && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  if (user) {
    // Proteção de rota admin — apenas o email admin tem acesso
    if (isAdminPath) {
      if (user.email !== ADMIN_EMAIL) {
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    // Verifica status do perfil — apenas bloqueia rejected e banned
    // Usuários pending ou sem perfil entram direto (acesso aberto)
    if (!isPendingPath) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .maybeSingle();

      if (profile && (profile.status === "rejected" || profile.status === "banned")) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("error", profile.status);
        url.searchParams.set("signout", "1");
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|icon-192.png|icon-512.png|apple-icon.png|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
