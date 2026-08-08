import { clsx, type ClassValue } from "clsx";

/**
 * Combina clases condicionalmente. Wrapper fino sobre `clsx` para
 * tener un único punto de entrada si más adelante se agrega
 * tailwind-merge u otra lógica de resolución de conflictos.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}
