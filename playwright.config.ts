import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright — configuração E2E para o SELAH App.
 * 3 projetos de browser: Chromium, Firefox, WebKit (Mobile Safari).
 *
 * Variável de ambiente:
 *   BASE_URL  — URL base (default: http://localhost:3000)
 *   CI        — quando true, usa apenas Chromium para economizar tempo
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const isCI = !!process.env.CI;

export default defineConfig({
  // Diretório onde ficam os testes E2E
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",

  // Timeout global por teste (30s local, 60s em CI)
  timeout: isCI ? 60_000 : 30_000,

  // Retries automáticos apenas em CI
  retries: isCI ? 2 : 0,

  // Paralelismo
  fullyParallel: true,
  workers: isCI ? 2 : undefined,

  // Relatórios
  reporter: isCI
    ? [["github"], ["html", { outputFolder: "playwright-report" }]]
    : [["html", { outputFolder: "playwright-report", open: "never" }], ["list"]],

  // Configurações compartilhadas por todos os projetos
  use: {
    baseURL: BASE_URL,
    // Captura screenshot e trace em falha
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
    // Locale PT-BR
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  },

  // Sobe o servidor Next.js antes dos testes (se não estiver rodando)
  webServer: {
    command: "npm run build && npm run start",
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },

  projects: [
    // Chromium — principal
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Firefox — apenas se não for CI (economiza tempo)
    ...(!isCI
      ? [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
          },
        ]
      : []),
    // Mobile Safari (WebKit) — simula iPhone
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
    },
  ],

  // Pasta para artefatos (screenshots, traces, vídeos)
  outputDir: "playwright-results",
});
