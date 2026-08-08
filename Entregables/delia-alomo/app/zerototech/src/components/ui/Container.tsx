import type { ElementType, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ContainerProps {
  children?: ReactNode;
  className?: string;
  /** Elemento HTML a renderizar. Por defecto `div`. */
  as?: ElementType;
}

/**
 * Define el ancho máximo y el padding lateral responsive del contenido.
 * Cualquier sección nueva debería envolver su contenido con este
 * componente en vez de repetir clases de ancho/padding.
 */
export function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </Tag>
  );
}
