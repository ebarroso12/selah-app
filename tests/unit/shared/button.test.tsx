/**
 * Smoke test — Button component
 * Verifica variantes SELAH: gold, wine, heal e as padrão do shadcn.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/shared/components/ui/button";

describe("Button", () => {
  it("renderiza com texto", () => {
    render(<Button>Orar</Button>);
    expect(screen.getByRole("button", { name: "Orar" })).toBeInTheDocument();
  });

  it("variante gold tem classe bg-[var(--gold)]", () => {
    render(<Button variant="gold">Gold</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-[var(--gold)]");
  });

  it("variante wine tem classe bg-[var(--wine)]", () => {
    render(<Button variant="wine">Wine</Button>);
    expect(screen.getByRole("button").className).toContain("bg-[var(--wine)]");
  });

  it("variante heal tem classe bg-[var(--heal)]", () => {
    render(<Button variant="heal">Heal</Button>);
    expect(screen.getByRole("button").className).toContain("bg-[var(--heal)]");
  });

  it("fica desabilitado com prop disabled", () => {
    render(<Button disabled>Desabilitado</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("size icon aplica dimensões corretas", () => {
    render(<Button size="icon" aria-label="icon-btn">★</Button>);
    expect(screen.getByRole("button").className).toContain("h-9 w-9");
  });

  it("asChild renderiza como link quando passado", () => {
    render(
      <Button asChild>
        <a href="/home">Ir para home</a>
      </Button>
    );
    expect(screen.getByRole("link", { name: "Ir para home" })).toBeInTheDocument();
  });
});
