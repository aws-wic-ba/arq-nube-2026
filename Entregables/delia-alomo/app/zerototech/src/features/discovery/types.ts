/**
 * Categorías IT posibles como resultado del test.
 */
export type ITCategory =
  | "soporte"
  | "cloud"
  | "ciberseguridad"
  | "ux-ui"
  | "desarrollo";

/**
 * Una opción de respuesta dentro de una pregunta del quiz.
 */
export interface QuizOption {
  id: string;
  text: string;
  /** Nombre del ícono de Lucide (se mapea dinámicamente) */
  icon: string;
  /** Categoría a la que suma puntos esta opción */
  category: ITCategory;
}

/**
 * Una pregunta del quiz con sus opciones.
 */
export interface QuizQuestion {
  id: number;
  question: string;
  /** Subtítulo empático opcional */
  hint?: string;
  options: QuizOption[];
}

/**
 * Estado del quiz: respuestas seleccionadas por pregunta.
 */
export interface QuizState {
  currentStep: number;
  answers: Record<number, ITCategory>;
}

/**
 * Resultado final con la categoría ganadora y los puntajes.
 */
export interface QuizResult {
  winner: ITCategory;
  scores: Record<ITCategory, number>;
}
