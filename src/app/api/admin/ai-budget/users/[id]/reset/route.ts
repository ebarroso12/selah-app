import { NextResponse } from "next/server";
import { requireAdminOrForbidden } from "@/shared/services/auth/server";
import { aiBudgetAdminService } from "@/features/admin/services/ai-budget-admin.service";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrForbidden();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  await aiBudgetAdminService.resetUserBudget(id);
  return NextResponse.json({ success: true });
}
