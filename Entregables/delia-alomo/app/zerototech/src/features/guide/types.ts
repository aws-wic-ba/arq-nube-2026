import type { ITCategory } from "@/features/discovery/types";

/**
 * Datos de un rol IT — información estructurada y útil.
 */
export interface RoleCardData {
  id: string;
  category: ITCategory;
  roleName: string;
  emoji: string;
  /** Qué hace este rol */
  whatTheyDo: string;
  /** Qué problemas resuelve */
  problemsSolved: string;
  /** Tecnologías que utiliza */
  technologies: string[];
  /** Habilidades recomendadas */
  skills: string[];
  /** Nivel de entrada */
  entryLevel: string;
  /** Cómo seguir aprendiendo */
  howToLearn: string;
  /** Empresas donde suele trabajar */
  companies: string[];
}

/**
 * Término del glosario / traductor de jerga.
 */
export interface GlossaryTermData {
  id: string;
  term: string;
  definition: string;
  categories: ITCategory[];
}
