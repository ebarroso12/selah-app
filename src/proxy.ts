import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Email do administrador master — hardcoded como fallback de segurança
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "edson.barroso@gmail.com";

// Credenciais do Supabase SELAH — hardcoded como fallback quando env vars não estão no Vercel
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://urmhuxluepexyycptflr.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjY1OTksImV4cCI6MjA5MzIwMjU5OX0.xkJe3vAe8ofuDm5E81ZwksXBqz9N1TLrwf0KkalFYHo";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/preview",
  "/api/admin/setup-users",
];
const ADMIN_PATHS = ["/admin"];
const AUTH_CALLBACK = "/auth/callback";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

  // Proteção de rota admin — apenas o email admin tem acesso
  if (user && isAdminPath) {
    if (user.email !== ADMIN_EMAIL) {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|icon-192.png|icon-512.png|apple-icon.png|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
