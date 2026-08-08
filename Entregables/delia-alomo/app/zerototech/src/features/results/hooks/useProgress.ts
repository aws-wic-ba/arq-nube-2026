import { useState, useCallback, useEffect } from "react";
import type { QuizResult } from "@/features/discovery/types";
import type { PersistedProgress } from "../types";

const STORAGE_KEY = "zerototech_progress";

/**
 * Lee el progreso guardado en LocalStorage.
 */
function loadProgress(): PersistedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedProgress;
      return {
        quizResult: parsed.quizResult ?? null,
        completedNodes: Array.isArray(parsed.completedNodes) ? parsed.completedNodes : [],
        totalXP: typeof parsed.totalXP === "number" ? parsed.totalXP : 0,
      };
    }
  } catch {
    // Si hay error en el parse, empezamos limpio
  }
  return { quizResult: null, completedNodes: [], totalXP: 0 };
}

/**
 * Guarda el progreso en LocalStorage.
 */
function saveProgress(progress: PersistedProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Silently fail if storage is full or unavailable
  }
}

/**
 * Hook para manejar el progreso del usuario con persistencia en LocalStorage.
 *
 * Guarda:
 * - Resultado del quiz (categoría ganadora + puntajes)
 * - Nodos completados del roadmap
 * - XP total acumulado
 *
 * Si el usuario recarga la página, recupera todo automáticamente.
 */
export function useProgress() {
  const [progress, setProgress] = useState<PersistedProgress>(loadProgress);

  // Persiste cada vez que cambia el estado
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  /** Guarda el resultado del quiz */
  const setQuizResult = useCallback((result: QuizResult) => {
    setProgress((prev) => ({ ...prev, quizResult: result }));
  }, []);

  /** Marca un nodo como completado y suma su XP */
  const completeNode = useCallback((nodeId: string, xp: number) => {
    setProgress((prev) => {
      if (prev.completedNodes.includes(nodeId)) return prev;
      return {
        ...prev,
        completedNodes: [...prev.completedNodes, nodeId],
        totalXP: prev.totalXP + xp,
      };
    });
  }, []);

  /** Verifica si un nodo ya fue completado */
  const isNodeCompleted = useCallback(
    (nodeId: string) => progress.completedNodes.includes(nodeId),
    [progress.completedNodes]
  );

  /** Reinicia todo el progreso */
  const resetProgress = useCallback(() => {
    const fresh: PersistedProgress = { quizResult: null, completedNodes: [], totalXP: 0 };
    setProgress(fresh);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    quizResult: progress.quizResult,
    completedNodes: progress.completedNodes,
    totalXP: progress.totalXP,
    setQuizResult,
    completeNode,
    isNodeCompleted,
    resetProgress,
  };
}
