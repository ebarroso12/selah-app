import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--gold-bg)] text-[var(--gold)] border-[var(--gold)]",
        secondary:
          "border-transparent bg-[var(--bg-2)] text-[var(--text-muted)]",
        destructive:
          "border-transparent bg-red-500/10 text-[var(--danger)] border-red-500/20",
        outline:
          "border-[var(--border)] text-[var(--text-muted)] bg-transparent",
        gold:
          "border-[var(--gold)] bg-[var(--gold-bg)] text-[var(--gold)]",
        wine:
          "border-[var(--wine-border)] bg-[var(--wine-bg)] text-[var(--wine-light)]",
        heal:
          "border-[var(--heal-border)] bg-[var(--heal-bg)] text-[var(--heal-light)]",
        success:
          "border-transparent bg-green-500/10 text-[var(--success)] border-green-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
