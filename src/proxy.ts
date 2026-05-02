import { NextResponse, type NextRequest } from "next/server";

// Middleware simplificado — autenticação feita no lado do cliente
// Remove dependência das env vars do Supabase no servidor
export async function proxy(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|icon-192.png|icon-512.png|apple-icon.png|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
