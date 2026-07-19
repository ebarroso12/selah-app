/// <reference types="vitest/globals" />
/**
 * Arquivo de setup global para o Vitest.
 * Carregado antes de cada suíte de testes via vitest.config.ts → setupFiles.
 */
import "@testing-library/jest-dom";

// Polyfill para APIs do browser que o JSDOM não implementa
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Silencia console.error em testes (uncomment se quiser ver)
// beforeEach(() => { vi.spyOn(console, 'error').mockImplementation(() => {}); });
// afterEach(() => { vi.restoreAllMocks(); });
