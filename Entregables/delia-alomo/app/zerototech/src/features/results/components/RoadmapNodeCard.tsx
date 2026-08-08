import { useState } from "react";
import { ChevronDown, ExternalLink, CheckCircle2, BookOpen, Video, Wrench, GraduationCap } from "lucide-react";
import { cn } from "@/utils/cn";
import type { RoadmapNode, RoadmapResource } from "../types";

const resourceIconMap: Record<RoadmapResource["type"], typeof BookOpen> = {
  "artículo": BookOpen, video: Video, curso: GraduationCap, herramienta: Wrench,
};

interface RoadmapNodeCardProps {
  node: RoadmapNode;
  isCompleted: boolean;
  onMarkCompleted: (nodeId: string, xp: number) => void;
}

export function RoadmapNodeCard({ node, isCompleted, onMarkCompleted }: RoadmapNodeCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(
      "rounded-xl border-2 transition-all duration-150",
      isCompleted ? "border-aqua/40 bg-aqua-glow shadow-glow-aqua" : "glass-card border-border hover:shadow-hover hover:-translate-y-1"
    )}>
      <button type="button" onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 p-5 text-left" aria-expanded={open}>
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-caption font-bold",
          isCompleted ? "bg-accent text-background" : "bg-surface-raised text-text-muted"
        )}>
          {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-small">{node.xp}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn("text-body font-semibold", isCompleted ? "text-aqua" : "text-text")}>{node.title}</h4>
          <p className="text-caption text-text-muted">{isCompleted ? "Completado" : `+${node.xp} XP`}</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-text-muted transition-transform duration-150", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <div className="animate-fade-in border-t border-border px-5 pb-6 pt-4">
          <p className="mb-5 text-small text-text-muted leading-relaxed">{node.description}</p>
          <div className="mb-5 space-y-2">
            <p className="text-caption font-semibold uppercase tracking-wider text-text-muted">Recursos</p>
            {node.resources.map((r, i) => {
              const Icon = resourceIconMap[r.type] ?? BookOpen;
              return (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-surface-hover">
                  <Icon className="h-4 w-4 shrink-0 text-primary group-hover:text-accent" aria-hidden="true" />
                  <span className="flex-1 text-small text-text-muted group-hover:text-text">{r.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100" aria-hidden="true" />
                </a>
              );
            })}
          </div>
          {!isCompleted && (
            <button type="button" onClick={() => onMarkCompleted(node.id, node.xp)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-small font-semibold text-background shadow-glow-accent transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Marcar como Aprendido
            </button>
          )}
        </div>
      )}
    </div>
  );
}
