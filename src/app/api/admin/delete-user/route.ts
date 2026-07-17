import { NextResponse } from "next/server";
import { adminService } from "@/features/admin/services/admin.service";
import { requireAdminOrForbidden } from "@/shared/services/auth/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdminOrForbidden();
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "userId obrigatório." }, { status: 400 });
    }

    await adminService.deleteUser(userId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao deletar usuário.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
