/**
 * E2E Smoke Tests — SELAH App
 *
 * Verifica que as rotas principais respondem com status 200
 * e que páginas públicas são acessíveis sem autenticação.
 *
 * Rotas protegidas devem redirecionar para /login.
 */
import { test, expect } from "@playwright/test";

test.describe("Smoke — rotas públicas", () => {
  test("página de login carrega", async ({ page }) => {
    await page.goto("/login");
    // Redireciona ou renderiza a página de login
    await expect(page).toHaveURL(/login/);
    // Página deve ter um título ou formulário
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("página de registro carrega", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL(/register/);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("página de recuperação de senha carrega", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page).toHaveURL(/forgot-password/);
    await expect(page.locator("body")).not.toBeEmpty();
  });
});

test.describe("Smoke — proteção de rotas", () => {
  test("rota /home redireciona para /login sem autenticação", async ({ page }) => {
    await page.goto("/home");
    // O proxy (middleware) deve redirecionar para /login
    await expect(page).toHaveURL(/login/);
  });

  test("rota /admin redireciona para /login sem autenticação", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/login/);
  });

  test("rota /biblia redireciona para /login sem autenticação", async ({ page }) => {
    await page.goto("/biblia");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Smoke — health da aplicação", () => {
  test("página raiz não retorna erro 500", async ({ page }) => {
    const response = await page.goto("/");
    // Aceita 200 (landing) ou 302 (redirect para login)
    expect([200, 302, 301]).toContain(response?.status() ?? 200);
  });

  test("rota /preview carrega sem autenticação", async ({ page }) => {
    const response = await page.goto("/preview");
    expect(response?.status()).not.toBe(500);
  });
});
