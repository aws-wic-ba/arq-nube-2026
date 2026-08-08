/**
 * Datos de una comunidad tecnológica.
 */
export interface CommunityData {
  id: string;
  name: string;
  /** Qué ofrece */
  description: string;
  /** Tipo de actividades */
  activities: string[];
  /** Para quién es */
  audience: string;
  /** URL principal */
  url: string;
  /** Color de acento para la tarjeta */
  accent: "mint" | "lavender" | "peach";
}
