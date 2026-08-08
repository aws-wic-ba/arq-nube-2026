import type { ITCategory, QuizResult } from "@/features/discovery/types";

/**
 * Un recurso recomendado dentro de un nodo del roadmap.
 */
export interface RoadmapResource {
  title: string;
  url: string;
  type: "video" | "artículo" | "curso" | "herramienta";
}

/**
 * Un nodo individual del roadmap (un tema o habilidad a aprender).
 */
export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  xp: number;
  resources: RoadmapResource[];
}

/**
 * Una fase del roadmap que agrupa nodos relacionados.
 */
export interface RoadmapPhase {
  id: string;
  phase: number;
  title: string;
  emoji: string;
  nodes: RoadmapNode[];
}

/**
 * Datos completos del roadmap para una categoría IT.
 */
export interface RoadmapData {
  category: ITCategory;
  roleName: string;
  roleEmoji: string;
  motivationalMessage: string;
  phases: RoadmapPhase[];
}

/**
 * Estado persistido en LocalStorage.
 */
export interface PersistedProgress {
  quizResult: QuizResult | null;
  completedNodes: string[];
  totalXP: number;
}

/**
 * Niveles del sistema de XP.
 */
export interface XPLevel {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
}
