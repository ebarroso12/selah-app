import { requireAdminOrPermissioned } from "@/shared/services/auth/server";
import { aiBudgetAdminService } from "@/features/admin/services/ai-budget-admin.service";
import { getBudgetSettings } from "@/shared/services/ai-budget";
import { BudgetOverviewCards } from "./components/BudgetOverviewCards";
import { BudgetSettingsCard } from "./components/BudgetSettingsCard";
import { UserBudgetTable } from "./components/UserBudgetTable";

export const dynamic = "force-dynamic";

export default async function AIBudgetPage() {
  await requireAdminOrPermissioned();

  const [overview, users, settings] = await Promise.all([
    aiBudgetAdminService.getOverviewStats(),
    aiBudgetAdminService.listUserBudgets(),
    getBudgetSettings(),
  ]);

  const periodLabel = new Date(overview.periodStart).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <p
          className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
        >
          {periodLabel}
        </p>
        <h1 className="text-2xl">Orçamento de IA</h1>
      </div>

      <BudgetOverviewCards overview={overview} />
      <BudgetSettingsCard settings={settings} />
      <UserBudgetTable rows={users} defaultBudgetBrl={settings.defaultBudgetBrl} />
    </div>
  );
}
