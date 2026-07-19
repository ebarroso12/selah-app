import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminOrForbidden } from "@/shared/services/auth/server";
import { aiBudgetAdminService } from "@/features/admin/services/ai-budget-admin.service";
import { getBudgetSettings, _resetSettingsCacheForTests } from "@/shared/services/ai-budget";

export const dynamic = "force-dynamic";

const schema = z.object({
  defaultBudgetBrl: z.number().min(0).optional(),
  resetPeriod: z.enum(["monthly", "weekly"]).optional(),
  usdToBrl: z.number().positive().optional(),
  pricing: z.record(z.string(), z.object({
    input: z.number().min(0),
    output: z.number().min(0),
  })).optional(),
});

export async function GET() {
  const auth = await requireAdminOrForbidden();
  if (auth instanceof NextResponse) return auth;
  const settings = await getBudgetSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const auth = await requireAdminOrForbidden();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  await aiBudgetAdminService.updateSettings(parsed.data);
  _resetSettingsCacheForTests();
  return NextResponse.json({ success: true });
}
