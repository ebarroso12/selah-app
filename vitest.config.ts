/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Ambiente JSDOM para testes de componentes e hooks
    environment: "jsdom",
    // Carrega matchers do @testing-library/jest-dom automaticamente
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    // Padrões de arquivos de teste
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "tests/unit/**/*.{test,spec}.{ts,tsx}",
      "tests/integration/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: [
      "node_modules",
      "tests/e2e/**",
      ".next",
    ],
    // Cobertura com @vitest/coverage-v8
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      // Mínimos por camada (PRD §12)
      thresholds: {
        "src/shared/services/**": { statements: 90, branches: 90, functions: 90, lines: 90 },
        "src/features/**/services/**": { statements: 90, branches: 90, functions: 90, lines: 90 },
        "src/shared/hooks/**": { statements: 80, branches: 80, functions: 80, lines: 80 },
        "src/features/**/hooks/**": { statements: 80, branches: 80, functions: 80, lines: 80 },
        "src/shared/lib/**": { statements: 100, branches: 100, functions: 100, lines: 100 },
        "src/shared/components/**": { statements: 60, branches: 60, functions: 60, lines: 60 },
      },
      // Excluir arquivos que não precisam de cobertura
      exclude: [
        "node_modules/**",
        ".next/**",
        "tests/**",
        "**/*.d.ts",
        "**/*.config.{ts,js}",
        "**/index.ts",
        "src/app/**",        // pages e layouts (E2E)
        "src/config/env.ts", // validação de boot
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
