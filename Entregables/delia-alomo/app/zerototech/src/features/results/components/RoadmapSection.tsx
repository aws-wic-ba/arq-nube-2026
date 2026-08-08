import { cn } from "@/utils/cn";
import type { RoadmapPhase } from "../types";
import { RoadmapNodeCard } from "./RoadmapNodeCard";

interface RoadmapSectionProps {
  phases: RoadmapPhase[];
  isNodeCompleted: (nodeId: string) => boolean;
  onMarkCompleted: (nodeId: string, xp: number) => void;
}

export function RoadmapSection({ phases, isNodeCompleted, onMarkCompleted }: RoadmapSectionProps) {
  return (
    <div className="space-y-12">
      {phases.map((phase, idx) => {
        const done = phase.nodes.filter((n) => isNodeCompleted(n.id)).length;
        const total = phase.nodes.length;
        const complete = done === total;

        return (
          <div key={phase.id} className="animate-fade-up" style={{ animationDelay: `${idx * 80}ms` }}>
            <div className="mb-5 flex items-center gap-4">
              <div className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl text-small font-bold",
                complete ? "bg-accent text-background shadow-glow-accent" : "bg-surface-raised text-primary"
              )}>
                {phase.phase}
              </div>
              <h3 className="flex-1 font-display text-title-sm text-text">{phase.title}</h3>
              <span className={cn(
                "rounded-full px-3 py-1 text-caption font-bold",
                complete ? "bg-aqua-glow text-accent" : "bg-surface-raised text-text-muted"
              )}>
                {done}/{total}
              </span>
            </div>
            <div className="relative space-y-3 ml-5 pl-8">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-violet/30 via-aqua/20 to-transparent" aria-hidden="true" />
              {phase.nodes.map((node) => (
                <div key={node.id} className="relative">
                  <div className={cn(
                    "absolute -left-8 top-6 h-3 w-3 rounded-full border-2 border-background transition-all",
                    isNodeCompleted(node.id) ? "bg-aqua shadow-glow-aqua" : "bg-surface-raised"
                  )} aria-hidden="true" />
                  <RoadmapNodeCard node={node} isCompleted={isNodeCompleted(node.id)} onMarkCompleted={onMarkCompleted} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
