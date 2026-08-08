/**
 * Datos de una empresa tecnológica.
 */
export interface CompanyData {
  id: string;
  name: string;
  /** URL del logo (o placeholder) */
  logoUrl?: string;
  /** Breve historia */
  history: string;
  /** A qué se dedica */
  focus: string;
  /** Cultura */
  culture: string;
  /** Tecnologías principales */
  technologies: string[];
  /** Roles que suele contratar */
  hiringRoles: string[];
  /** Programas para estudiantes */
  studentPrograms?: string;
  /** Dato curioso */
  funFact: string;
  /** URL para conocer más */
  url: string;
  /** Grupo: argentina | internacional */
  group: "argentina" | "internacional";
}
