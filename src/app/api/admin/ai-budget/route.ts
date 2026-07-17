import { NextResponse } from "next/server";
import { requireAdminOrForbidden } from "@/shared/services/auth/server";
import { aiBudgetAdminService } from "@/features/admin/services/ai-budget-admin.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminOrForbidden();
  if (auth instanceof NextResponse) return auth;

  const [overview, users] = await Promise.all([
    aiBudgetAdminService.getOverviewStats(),
    aiBudgetAdminService.listUserBudgets(),
  ]);
  return NextResponse.json({ overview, users });
}
