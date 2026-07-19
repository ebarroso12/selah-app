# AI Budget Module

Controle de gasto de IA por usuário com reset semanal/mensal.

## Como funciona

Cada chamada a `generateAI` (em `shared/services/ai/ai.service.ts`) passa por:

1. `checkBudget(userId)` — bloqueante. Se admin, passa. Se usuário estourou o limite, lança `BudgetExceededError` (HTTP 402).
2. `debitBudget(userId, usage, model)` — fire-and-forget. Calcula custo via tabela de preços + taxa USD→BRL e incrementa a wallet (`ai_budgets`).

## Schema

- `ai_budgets` (cache de estado por usuário+janela)
- `profiles.ai_budget_brl` (override individual, null = usa default)
- `app_settings`: `ai_default_budget_brl`, `ai_reset_period`, `ai_usd_to_brl`, `ai_pricing_usd`

## Configurar

No admin (`/admin/ai-budget`):
- **Default global**: `ai_default_budget_brl`
- **Período**: `ai_reset_period` (monthly | weekly)
- **Taxa câmbio**: `ai_usd_to_brl`
- **Preços OpenAI**: `ai_pricing_usd` (JSON)

## Não-objetivos

- Não consulta billing real da OpenAI
- Sem limite por feature (é global por usuário)
- Sem degradação automática (bloqueio simples)
