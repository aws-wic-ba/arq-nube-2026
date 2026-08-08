import type { ITCategory } from "@/features/discovery/types";

/**
 * Fundación u organización que ofrece formación/becas.
 */
export interface FoundationData {
  id: string;
  name: string;
  description: string;
  programs: string;
  audience: string;
  isFree: boolean;
  url: string;
  /** Categorías IT relacionadas para personalización */
  relatedCategories: ITCategory[];
}

/**
 * Evento tecnológico.
 */
export interface EventData {
  id: string;
  name: string;
  description: string;
  topics: string[];
  audience: string;
  frequency: string;
  url: string;
  relatedCategories: ITCategory[];
}
