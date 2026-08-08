import { RotateCcw, Map } from "lucide-react";
import type { QuizResult } from "@/features/discovery/types";
import { getRoadmapForCategory } from "./data/roadmaps";
import { ProfileCard, RoadmapSection, XPBar } from "./components";

interface ResultsPageProps {
  result: QuizResult;
  totalXP: number;
  isNodeCompleted: (nodeId: string) => boolean;
  onMarkCompleted: (nodeId: string, xp: number) => void;
  onReset: () => void;
}

export function ResultsPage({ result, totalXP, isNodeCompleted, onMarkCompleted, onReset }: ResultsPageProps) {
  const roadmap = getRoadmapForCategory(result.winner);

  return (
    <section id="discovery-test" className="mx-auto max-w-2xl px-6 py-22" aria-label="Resultado y roadmap">
      <ProfileCard roadmap={roadmap} />
      <div className="mt-8"><XPBar totalXP={totalXP} /></div>

      <div className="mt-18 mb-10 text-center animate-fade-up-2">
        <div className="mb-4 inline-flex h-13 w-13 items-center justify-center rounded-xl bg-surface-hover">
          <Map className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <h2 className="font-display text-title text-text">Tu ruta de aprendizaje</h2>
        <p className="mt-2 text-body text-text-muted">Avanzá a tu ritmo. Cada nodo suma experiencia.</p>
      </div>

      <RoadmapSection phases={roadmap.phases} isNodeCompleted={isNodeCompleted} onMarkCompleted={onMarkCompleted} />

      <div className="mt-22 flex justify-center">
        <button type="button" onClick={onReset}
          className="group inline-flex items-center gap-2.5 rounded-full border border-border px-6 py-3 text-small text-text-muted transition-all duration-150 hover:border-primary/40 hover:text-text hover:shadow-soft">
          <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180" aria-hidden="true" />
          Volver a hacer el test
        </button>
      </div>
    </section>
  );
}
