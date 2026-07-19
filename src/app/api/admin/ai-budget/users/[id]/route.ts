import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminOrForbidden } from "@/shared/services/auth/server";
import { aiBudgetAdminService } from "@/features/admin/services/ai-budget-admin.service";

export const dynamic = "force-dynamic";

const schema = z.object({ limitBrl: z.number().min(0).nullable() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrForbidden();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  await aiBudgetAdminService.setUserLimit(id, parsed.data.limitBrl);
  return NextResponse.json({ success: true });
}
