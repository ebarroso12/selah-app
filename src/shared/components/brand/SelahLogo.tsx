import Image from "next/image";

interface SelahLogoProps {
  size?: number;
  className?: string;
  /**
   * "auto" troca sozinho entre o badge claro/escuro conforme o tema ativo
   * (via CSS, sem flicker de hidratação). "dark" força o badge escuro —
   * use em contextos que são sempre escuros (Sidebar, MenuModal).
   */
  variant?: "auto" | "dark" | "light";
}

const badgeStyle = { border: "1px solid var(--nav-border)", boxShadow: "0 2px 10px var(--gold-glow)" };

/** Emblema circular da marca (pomba + livro em cobre), pré-composto sobre um
 * fundo sólido que combina com o contexto — evita halo de recorte transparente. */
export function SelahLogo({ size = 48, className = "", variant = "auto" }: SelahLogoProps) {
  if (variant === "dark") {
    return (
      <Image src="/logo-badge-dark.png" alt="SELAH" width={size} height={size}
        className={`rounded-full ${className}`} style={badgeStyle} />
    );
  }
  if (variant === "light") {
    return (
      <Image src="/logo-badge-light.png" alt="SELAH" width={size} height={size}
        className={`rounded-full ${className}`} style={badgeStyle} />
    );
  }
  // auto: renderiza os dois e o CSS (mesma classe .light do tema) decide qual aparece
  return (
    <span className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }}>
      <Image src="/logo-badge-dark.png" alt="SELAH" width={size} height={size}
        className="selah-logo-dark rounded-full absolute inset-0" style={badgeStyle} />
      <Image src="/logo-badge-light.png" alt="SELAH" width={size} height={size}
        className="selah-logo-light rounded-full absolute inset-0" style={badgeStyle} />
    </span>
  );
}
