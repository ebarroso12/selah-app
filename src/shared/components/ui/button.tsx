import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  // Base classes
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring)]",
  {
    variants: {
      variant: {
        // ── shadcn padrão ────────────────────────────────────────────────────
        default:
          "bg-primary text-primary-foreground shadow hover:opacity-90",
        destructive:
          "bg-destructive text-white shadow-sm hover:opacity-90",
        outline:
          "border border-[var(--border)] bg-transparent shadow-sm hover:bg-[var(--gold-bg)] hover:text-[var(--gold)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:opacity-90",
        ghost:
          "hover:bg-[var(--gold-bg)] hover:text-[var(--gold)]",
        link:
          "text-primary underline-offset-4 hover:underline",

        // ── Tokens SELAH ─────────────────────────────────────────────────────
        /** Dourado — ações primárias (oração, devocional) */
        gold:
          "bg-[var(--gold)] text-[var(--primary-foreground)] font-semibold shadow hover:bg-[var(--gold-light)] active:bg-[var(--gold-dark)]",
        /** Contorno dourado — ações secundárias com destaque */
        "gold-outline":
          "border border-[var(--gold)] bg-transparent text-[var(--gold)] hover:bg-[var(--gold-bg)]",
        /** Vinho — ações apostólicas / administrativas */
        wine:
          "bg-[var(--wine)] text-[var(--secondary-foreground)] font-semibold shadow hover:bg-[var(--wine-light)] active:bg-[var(--wine-dark)]",
        /** Contorno vinho */
        "wine-outline":
          "border border-[var(--wine)] bg-transparent text-[var(--wine)] hover:bg-[var(--wine-bg)]",
        /** Verde cura — ações de confirmação / saúde */
        heal:
          "bg-[var(--heal)] text-[var(--accent-foreground)] font-semibold shadow hover:bg-[var(--heal-light)] active:bg-[var(--heal-dark)]",
        /** Contorno cura */
        "heal-outline":
          "border border-[var(--heal)] bg-transparent text-[var(--heal)] hover:bg-[var(--heal-bg)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm:      "h-8 rounded-md px-3 text-xs",
        lg:      "h-10 rounded-md px-8",
        xl:      "h-12 rounded-lg px-10 text-base",
        icon:    "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
