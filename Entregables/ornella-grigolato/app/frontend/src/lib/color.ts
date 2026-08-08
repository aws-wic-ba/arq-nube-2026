/**
 * Tinte translúcido a partir de un color de la asociación.
 */
export const tint = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`;
