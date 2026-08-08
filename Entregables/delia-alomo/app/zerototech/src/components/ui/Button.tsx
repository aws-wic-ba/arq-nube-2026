import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3 font-display font-semibold text-sm sm:text-base transition-transform duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-route text-white shadow-soft hover:brightness-105",
  secondary: "bg-violet-light text-ink hover:bg-violet-light/70",
  ghost: "bg-transparent text-ink hover:bg-canvas-soft",
};

/**
 * Botón base de la app. Todas las llamadas a la acción deberían usar
 * este componente para mantener la misma forma, tipografía y estados.
 */
export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={cn(baseStyles, variantStyles[variant], className)} {...props} />;
}
