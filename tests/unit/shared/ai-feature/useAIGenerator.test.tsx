/**
 * useAIGenerator.test.tsx
 * Kit compartilhado de IA bíblica — hook genérico para chamar rota de IA.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { useAIGenerator } from "@/shared/ai-feature/useAIGenerator";

interface Input {
  texto: string;
}
interface Result {
  titulo: string;
}

const cfg = { endpoint: "/api/test", errorMessage: "Erro padrão" };

describe("useAIGenerator", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("estado inicial: result=null, loading=false, error=null", () => {
    const { result } = renderHook(() => useAIGenerator<Input, Result>(cfg));
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("generate faz POST para endpoint com input no body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ titulo: "ok" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAIGenerator<Input, Result>(cfg));
    await act(async () => {
      await result.current.generate({ texto: "hello" });
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: "hello" }),
    });
  });

  it("durante o fetch loading=true; após sucesso result preenchido e loading=false", async () => {
    let resolveFetch!: (v: unknown) => void;
    const fetchPromise = new Promise((res) => {
      resolveFetch = res;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(fetchPromise),
    );

    const { result } = renderHook(() => useAIGenerator<Input, Result>(cfg));

    let generatePromise!: Promise<void>;
    act(() => {
      generatePromise = result.current.generate({ texto: "x" });
    });

    await waitFor(() => expect(result.current.loading).toBe(true));

    await act(async () => {
      resolveFetch({ json: async () => ({ titulo: "Final" }) });
      await generatePromise;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.result).toEqual({ titulo: "Final" });
    expect(result.current.error).toBeNull();
  });

  it("quando json.error existe, error preenchido com a mensagem", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ error: "Limite excedido" }),
      }),
    );

    const { result } = renderHook(() => useAIGenerator<Input, Result>(cfg));
    await act(async () => {
      await result.current.generate({ texto: "x" });
    });

    expect(result.current.error).toBe("Limite excedido");
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("quando fetch lança, error usa config.errorMessage", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue("network down"), // não-Error
    );

    const { result } = renderHook(() => useAIGenerator<Input, Result>(cfg));
    await act(async () => {
      await result.current.generate({ texto: "x" });
    });

    expect(result.current.error).toBe("Erro padrão");
    expect(result.current.loading).toBe(false);
  });

  it("clear() reseta result e error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ titulo: "ok" }),
      }),
    );

    const { result } = renderHook(() => useAIGenerator<Input, Result>(cfg));
    await act(async () => {
      await result.current.generate({ texto: "x" });
    });
    expect(result.current.result).toEqual({ titulo: "ok" });

    act(() => {
      result.current.clear();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
